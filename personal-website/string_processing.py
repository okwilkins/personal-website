from typing import Optional
from datetime import datetime


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
    sep: str,
    list_sep: Optional[str] = None
) -> Optional[tuple[str, Optional[str]]]:
    '''
    Converts a string to a key-value pair. The key must be a string and contain no
    numerical or special characters. These key value pairs are intended to work
    with Hugo.

    Params:
        string: The input string to be converted.
        sep: The string that seperates the key-value pair.
        list_sep: (Optional) The seperator that seperates each value if a list is
        being supplied.

    Example:
        string = Zettelcasten Index: 20230129211820, serpator = :\s
        returns: ('Zettelcasten Index', '20230129211820')
    '''
    if sep not in string:
        return None

    split_text = string.split(sep, 1)
    key = split_text[0].strip()
    value = split_text[1].strip()

    value = None if value == '' else value

    if (list_sep is not None) and (list_sep in value):
        value = value.split(list_sep)

    return key, value


def str_to_list(string: str, sep: str) -> list[str]:
    '''
    Whilst ast.literal_eval exists, it cannot handle a string like:
    [Language](Language.md), [Bulgarian](Bulgarian.md)
    This is because there are no quotes around each element.

    If the seperator is not in the string the this wil return the orginal
    string.
    '''
    if sep not in string:
        return string

    return [*string.split(sep)]


def zettle_id_to_datetime(zettle_id: str) -> str:
    '''
    Converts a Zettlecasten ID into a date time that will work with Hugo.

    Example:
        20230129211820 -> 2023-01-29T21:18:20
    '''
    return (
        datetime.strptime(zettle_id, '%Y%m%d%H%M%S')
        .strftime('%Y-%m-%dT%H:%M:%S')
    )


def case_to_camel_case(string: str, sep: str = ' ') -> str:
    '''Converts text into camelCase.'''
    first, *others = string.split(sep)
    return ''.join([first.lower(), *map(str.title, others)])


def gen_header_string(
    header_args: dict[str, any],
    convert_key_to_camel_case: bool = False
) -> str:
    '''Generates the header to Hugo markdown files.'''
    header_lines = ['+++']

    for key, value in header_args.items():
        if convert_key_to_camel_case:
            key = case_to_camel_case(key, ' ')
        
        match value:
            case str():
                value = str_to_list(str(value), ', ')

        match value:
            case str() | int() | float():
                header_lines.append(f'{key} = "{value}"')
            case bool():
                header_lines.append(f'{key} = {str(value).lower()}')
            case list():
                value = [f'"{v}"' for v in value]
                header_lines.append(f'{key} = [{", ".join(value)}]')
            case _:
                raise NotImplementedError

    header_lines.append('+++')
    return '\n'.join(header_lines)
