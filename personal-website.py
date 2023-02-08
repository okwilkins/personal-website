from dataclasses import dataclass, fields
from datetime import datetime
from typing import Optional
import ast


@dataclass
class TerminalThemeMetaData:
    '''Params that the Terminal theme uses.'''
    title: str
    date: str
    author: str
    author_twitter: str
    cover: str
    tags: list[str]
    keywords: list[str]
    description: str
    show_full_content: bool
    reading_time: bool
    hide_comments: bool

    def __iter__(self):
        for field in fields(self):
            yield convert_snake_case_to_camel_case(field.name), getattr(self, field.name)


@dataclass
class TerminalThemeMetaDataZettle(TerminalThemeMetaData):
    '''Params that the Terminal theme uses with additional Zettlecasten params.'''
    zettle_id: str
    zettle_tags: list[str]


def gen_header_string(
    header_args: dict[str, str | int | bool | list[str | int | bool]]
) -> str:
    '''Generates the header to Hugo markdown files.'''
    header_lines = ['+++']

    for key, value in header_args.items():
        if type(value) in [str, int]:
            header_lines.append(f'{key} = "{value}"')
        elif type(value) == bool:
            header_lines.append(f'{key} = {str(value).lower()}')
        elif type(value) == list:
            value = [f'"{x}"' for x in value]
            header_lines.append(f'{key} = [{", ".join(value)}]')
        else:
            raise NotImplementedError

    header_lines.append('+++')
    return '\n'.join(header_lines)


def convert_snake_case_to_camel_case(string: str) -> str:
    '''Converts text in snake_case into camelCase.'''
    first, *others = string.split('_')
    return ''.join([first.lower(), *map(str.title, others)])


def convert_zettle_id_to_datetime(zettle_id: str) -> str:
    '''
        Converts a Zettlecasten ID into a date time that will work with Hugo.
        Example: 20230129211820 -> 2023-01-29T21:18:20
    '''
    date_time = datetime.strptime(zettle_id, '%Y%m%d%H%M%S')
    return date_time.strftime('%Y-%m-%dT%H:%M:%S')


def text_is_attr_in_class(input: str) -> bool:
    ...


def convert_header_str_to_list(string: str, sep: str) -> list[str]:
    '''Converts a string seperated by a sep to a list of strings.'''
    joined_string = ', '.join([f'"{value}"' for value in string.split(sep)])
    return f'[{joined_string}]'


def convert_str_to_key_value_pair(
    string: str,
    sep: str,
) -> Optional[tuple[str, str]]:
    '''
    Converts a string to a key-value pair. The key must be a string and contain no
    numerical or special characters. These key value pairs are intended to work
    with Hugo.

    Params:
        string: The input string to be converted.
        seperator: The string that seperates the key-value pair.

    Example:
        string = Zettelcasten Index: 20230129211820, serpator = :\s
        returns: ('Zettelcasten Index', '20230129211820')
    '''
    if sep not in string:
        return None

    # TODO: check for string being list via convert_header_str_to_list
    
    split_text = string.split(sep, 1)
    # key = f'"{split_text[0]}"'
    
    # if type(value) in [str, int]:
    #     value = f'"{split_text[1]}"'
    # elif type(value) == bool
    #     value = split_text

    # return ast.literal_eval(f'{{"{split_text[0]}": {split_text[1]}}}')
    return (split_text[0], split_text[1])


def main() -> None:
    # with open('./content/knowledge-system/slip-box/Definite Article.md', 'r') as f:
    #     print(f.readlines())

    t = TerminalThemeMetaDataZettle(
        title="20230129211820",
        date="2023-01-29T21:18:20",
        author="",
        author_twitter="",
        cover="",
        tags=[],
        keywords=[],
        description="",
        show_full_content=False,
        reading_time=False,
        hide_comments=False,
        zettle_id="20230129211820",
        zettle_tags=["Language", "Bulgarian", "Article", "Definite Article", "Indefinite Article"],
    )
    # print([field.name for field in fields(type(t))])
    # print(gen_header_string(dict(t)))

    print(convert_header_str_to_list('[Language](Language.md), [Bulgarian](Bulgarian.md), *Article*, [Definite Article](Definite%20Article.md), [Indefinite Article](Indefinite%20Article.md)', ': '))


if __name__ == '__main__':
    main()
