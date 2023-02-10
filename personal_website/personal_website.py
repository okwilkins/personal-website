from typing import Optional
from string_processing import (
    snake_case_str,
    zettle_id_to_datetime,
    link_text_from_markdown,
    str_to_list,
    remove_empty_strs,
    gen_header_line,
    gen_header_string
)
from themes import TerminalThemeMetaDataZettle
from dataclasses import fields
from files import HeaderFile
from file_section_factories import HeaderFactory, BodyFactory


def main(file: HeaderFile) -> None:
    FIELDS = [_field.name for _field in fields(TerminalThemeMetaDataZettle)]

    file_header_data = file.header.get_formatted_data(
        func=snake_case_str,
        sep=' ',
        mask=FIELDS
    )

    for key in ['tags', 'keywords', 'zettelcasten_tags', 'sequence']:
        if key in file_header_data:
            file_header_data[key] = str_to_list(file_header_data[key], ', ')
            file_header_data[key] = remove_empty_strs(file_header_data[key])
            file_header_data[key] = [
                link_text_from_markdown(value)[0]
                for value in file_header_data[key]
            ]
    
    t = TerminalThemeMetaDataZettle(**file_header_data)
    t.date = zettle_id_to_datetime(t.zettelcasten_index)

    new_header_lines = []

    for key, value in dict(t).items():
        new_header_lines.append(gen_header_line(key, value))

    header = gen_header_string(header_lines=new_header_lines)
    print(file.sections_to_str())


if __name__ == '__main__':
    # Read in file
    with open('../content/knowledge-system/slip-box/Adverb.md', 'r') as f:
        file_lines = f.readlines()

    header=HeaderFactory.get_section(
        lines=file_lines,
        header_start_str=None,
        header_end_str='---',
        key_value_sep=':'
    )

    body=BodyFactory.get_section(
        lines=file_lines,
        body_start_str='---'
    )
    main(file=HeaderFile(header=header, body=body))
