from typing import Optional
from datetime import datetime
import re


def str_to_hugo_list(string: str, sep: str) -> str:
    '''
    Converts a string seperated by a sep to a list that is compatible with Hugo.
    If the seperator is not found in the string, the original string is returned.
    '''
    if sep not in string:
        return string

    joined_string = ', '.join([f'"{value}"' for value in string.split(sep)])
    return f'[{joined_string}]'


def str_to_key_value_pair(
    string: str,
    sep: str
) -> Optional[tuple[str, Optional[str]]]:
    '''
    Converts a string to a key-value pair. The key must be a string and contain no
    numerical or special characters. These key value pairs are intended to work
    with Hugo.

    Params:
        string: The input string to be converted.
        sep: The string that seperates the key-value pair.

    Example:
        string = Zettelcasten Index: 20230129211820, serpator = :\\s
        returns: ('Zettelcasten Index', '20230129211820')
    '''
    if sep not in string or sep == '':
        return None

    split_text = string.split(sep, 1)
    key = split_text[0].strip()
    value = split_text[1].strip()

    value = None if value == '' else value

    return key, value


def str_to_list(string: str, sep: str) -> list[str]:
    '''
    Whilst ast.literal_eval exists, it cannot handle a string like:
    \\[Language\\](Language.md), \\[Bulgarian\\](Bulgarian.md)
    This is because there are no quotes around each element.

    If the seperator is not in the string the this wil return the orginal
    string.
    '''
    if sep not in string or sep == '':
        return [string]

    return [*string.split(sep)]


def remove_empty_strs(strings: list[str]) -> list[str]:
    '''Removes any elements that contain empty '' strings from a list.'''
    new_strings = []

    for string in strings:
        if string != '':
            new_strings.append(string)

    return new_strings


def zettle_id_to_datetime(zettle_id: str) -> str:
    '''
    Converts a Zettlecasten ID into a date time that will work with Hugo.

    Example:
        20230129211820 -> 2023-01-29T21:18:20
    '''
    if len(zettle_id) > 14:
        # Helps with ids like: 20230129213905-a1
        zettle_id = zettle_id[:14]
    return (
        datetime.strptime(zettle_id, '%Y%m%d%H%M%S')
        .strftime('%Y-%m-%dT%H:%M:%S')
    )


def case_to_camel_case(string: str, sep: str = ' ') -> str:
    '''Converts text into camelCase.'''
    if sep == '':
        return string

    first, *others = string.split(sep)
    return ''.join([first.lower(), *map(str.title, others)])


def gen_header_line(key: str, value: any) -> str:
    '''
    Takes in a key value pair and generates a line for the header of Hugo
    markdown files.
    '''
    output_line = ''

    match value:
        # Bool first as bool is a subset of int! It should be first!
        case bool():
            output_line = f'{key} = {str(value).lower()}'
        case str() | int() | float():
            output_line = f'{key} = "{value}"'
        case list():
            value = [f'"{v}"' for v in value]
            output_line = f'{key} = [{", ".join(value)}]'
        case _:
            raise NotImplementedError

    return output_line


def gen_header_string(header_lines: list[str]) -> str:
    '''Generates the header to Hugo markdown files.'''
    header = ['+++']

    for line in header_lines:
        header.append(line)

    header.append('+++')
    return '\n'.join(header)


def link_text_from_markdown(string: str) -> list[str]:
    '''Find all links in a markdown string and extracts the link text.'''
    RE_EXPRESSION = r'\[([^\[\]]+)\]\([^\(\)]*\)'
    return re.findall(RE_EXPRESSION, string)


def snake_case_str(string: str, sep: str) -> str:
    '''Converts a string into snake_case.'''
    string = string.lower()

    if sep == '':
        return string

    return string.replace(sep, '_')
