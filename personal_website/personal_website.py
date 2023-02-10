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
from files import HeaderFileFactory


def main() -> None:
    FIELDS = [_field.name for _field in fields(TerminalThemeMetaDataZettle)]
    
    # Read in file
    with open('../content/knowledge-system/slip-box/Adverb.md', 'r') as f:
        file_lines = f.readlines()

    file = HeaderFileFactory.get_file(
        lines=file_lines,
        header_end_string='---',
        key_value_pair_sep=':'
    )

    file_header_data = {
        snake_case_str(key, ' '): value
        for key, value in file.header.get_data().items()
        if snake_case_str(key, ' ') in FIELDS
    }
    
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
    print(header + ''.join(file.body))


if __name__ == '__main__':
    main()
