from typing import Optional
from string_processing import (
    str_to_key_value_pair,
    snake_case_str,
    zettle_id_to_datetime,
    link_text_from_markdown,
    str_to_list,
    remove_empty_strs,
    gen_header_line,
    gen_header_string
)
from themes import TerminalThemeMetaDataZettle
from dataclasses import fields, field


def text_is_attr_in_class(input: str) -> bool:
    ...


def get_file_header_lines(
    lines: list[str],
    header_end_char: str,
    min_num_header_end_chars: int
) -> list[str]:
    '''
    Returns the list of strings that represent the header of a file.

    Params:
        lines: The lines of text to scan through.
        header_end_char: The charcter that indicates the end of a header.
        min_num_header_end_chars: The minimum number of times the
        header_end_char appears to indicate the end of a header.
    '''
    extracted_lines = []

    for line in lines:
        if line.count(header_end_char) >= min_num_header_end_chars:
            break
        
        extracted_lines.append(line)
    
    return extracted_lines


def get_file_body_lines(
    lines: list[str],
    header_end_char: str,
    min_num_header_end_chars: int
) -> list[str]:
    '''
    Returns the list of strings that represent the body of a file.

    Params:
        lines: The lines of text to scan through.
        header_end_char: The charcter that indicates the end of a header.
        min_num_header_end_chars: The minimum number of times the
        header_end_char appears to indicate the end of a header.
    '''
    line_num = 0

    for line in lines:
        if line.count(header_end_char) >= min_num_header_end_chars:
            line_num += 1
            break
        
        line_num += 1
    
    return lines[line_num:]


def dict_from_header_lines(header_lines: list[str]) -> dict[str, Optional[str]]:
    '''
    Generate a dictionary of values for markdown files from a list of header
    strings.
    '''
    output_dict = {}

    for line in header_lines:
        match str_to_key_value_pair(line, sep=':'):
            case (str(k), str(v)):
                output_dict[k] = v
            case (str(k), None):
                output_dict[k] = ''
            case _:
                continue

    return output_dict


def main() -> None:
    FIELDS = [_field.name for _field in fields(TerminalThemeMetaDataZettle)]
    
    # Read in file
    with open('../content/knowledge-system/slip-box/Adverb.md', 'r') as f:
        file_lines = f.readlines()
    
    org_header_lines = get_file_header_lines(
        lines=file_lines,
        header_end_char='---',
        min_num_header_end_chars=1
    )
    body_lines = get_file_body_lines(
        lines=file_lines,
        header_end_char='---',
        min_num_header_end_chars=1
    )
    header_dict = dict_from_header_lines(header_lines=org_header_lines)

    file_header_data = {
        snake_case_str(key, ' '): value
        for key, value in header_dict.items()
        if snake_case_str(key, ' ') in FIELDS
    }
    
    for key in ['tags', 'keywords', 'zettelcasten_tags', 'sequence']:
        if key in file_header_data:
            file_header_data[key] = str_to_list(file_header_data[key], ', ')
            file_header_data[key] = remove_empty_strs(file_header_data[key])
            file_header_data[key] = [link_text_from_markdown(value)[0] for value in file_header_data[key]]
    
    t = TerminalThemeMetaDataZettle(**file_header_data)
    t.date = zettle_id_to_datetime(t.zettelcasten_index)

    new_header_lines = []

    for key, value in dict(t).items():
        new_header_lines.append(gen_header_line(key, value))

    header = gen_header_string(header_lines=new_header_lines)
    print(header + ''.join(body_lines))


if __name__ == '__main__':
    main()
