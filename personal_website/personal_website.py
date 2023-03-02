from string_processing import (
    snake_case_str,
    zettle_id_to_datetime,
    link_text_from_markdown,
    str_to_list,
    remove_empty_strs,
    gen_header_line,
    case_to_camel_case
)
from themes import TerminalThemeZettleField
from files import HeaderFile
from file_section_factories import HeaderFactory, BodyFactory
from file_sections import Header, Body
from glob import glob
from pathlib import Path


def main(file: HeaderFile) -> HeaderFile:
    FIELDS = [str(field) for field in TerminalThemeZettleField]
    STR_FIELDS = [str(field) for field in TerminalThemeZettleField.get_str_fields()]
    LIST_FIELDS = [str(field) for field in TerminalThemeZettleField.get_list_fields()]
    BOOL_FIELDS = [str(field) for field in TerminalThemeZettleField.get_bool_fields()]

    file_header_data = file.header.get_data()

    # Convert keys to snake_case
    file_header_data = {
        snake_case_str(key, ' '): value
        for key, value in file_header_data.items()
    }

    if TerminalThemeZettleField.ZETTELCASTEN_INDEX in file_header_data:
        file_header_data[TerminalThemeZettleField.DATE] = zettle_id_to_datetime(
            file_header_data[TerminalThemeZettleField.ZETTELCASTEN_INDEX]
        )

    for field in STR_FIELDS:
        if field not in file_header_data:
            file_header_data[field] = ''
    
    for field in BOOL_FIELDS:
        if field not in file_header_data:
            file_header_data[field] = False

    for field in LIST_FIELDS:
        if field in file_header_data:
            # Extract link text from lists
            file_header_data[field] = ', '.join(link_text_from_markdown(file_header_data[field]))
            # Convert strings that are lists, into lists
            file_header_data[field] = str_to_list(file_header_data[field], ', ')
            # Remove any elements from list fields that are empty
            file_header_data[field] = remove_empty_strs(file_header_data[field])
        else:
            file_header_data[field] = []
    
    # Convert keys to camelCase
    export_data = {}
    camel_case_fields = [case_to_camel_case(field, sep='_') for field in FIELDS]

    for new_field, old_field in zip(camel_case_fields, FIELDS):
        export_data[new_field] = file_header_data[old_field]

    new_header_lines = []

    for key, value in export_data.items():
        new_header_lines.append(gen_header_line(key, value, ' = '))

    new_header = Header(
        lines=new_header_lines,
        start_str='+++',
        end_str='+++',
        key_value_sep=' = '
    )

    new_file = HeaderFile(body=file.body, header=new_header)
    return new_file


def format_file(path: str) -> None:
    # Read in file
    with open(path, 'r') as f:
        file_lines = f.readlines()
    
    file_lines = [line.strip() for line in file_lines]

    header = HeaderFactory.get_section(
        lines=file_lines,
        header_start_str=None,
        header_end_str='---',
        key_value_sep=':'
    )

    body = BodyFactory.get_section(
        lines=file_lines,
        body_start_str='---'
    )
    new_file = main(file=HeaderFile(header=header, body=body))

    if new_file.body.lines == []:
        new_file = HeaderFile(
            Header(
                lines=[],
                start_str='+++',
                end_str='+++',
                key_value_sep=' = '
            ),
            Body(lines=file_lines)
        )
    
    new_file.header.update_line(
        line_string='title = ""',
        value=f'title = "{Path(path).stem.title()}"'
    )

    with open(path, 'w') as f:
        f.writelines(str(new_file))


if __name__ == '__main__':
    # TODO: Maek a CLI interface for all this and fix cohesion issues with main
    folders = [
        'map-of-content',
        'projects',
        'references',
        'slip-box',
    ]
    for folder in folders:
        for file in glob(f'./content/knowledge-system/{folder}/*.md'):
            format_file(file)
