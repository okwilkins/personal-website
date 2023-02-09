from typing import Optional
from string_processing import (
    str_to_key_value_pair,
    snake_case_str,
    zettle_id_to_datetime,
    link_text_from_markdown,
    str_to_list
)
from themes import TerminalThemeMetaDataZettle
from dataclasses import fields


def text_is_attr_in_class(input: str) -> bool:
    ...


def dict_from_file(
    path: str,
    header_end_char: str,
    min_num_header_end_chars: int,
    replace_line_end_char: bool = True
) -> dict[str, Optional[str]]:
    '''
    Generate a dictionary of values from a header string at the top of
    markdown files.

    Params:
        path: The file path to the markdown file.
        header_end_char: The charcter that indicates the end of a header.
        min_num_header_end_chars: The minimum number of times the
        header_end_char appears to indicate the end of a header.
        replaceLine_end_char: Replace the \n char with nothing?
    '''
    output_dict = {}

    with open(path, 'r') as f:
        for line in f.readlines():
            if replace_line_end_char:
                line = line.replace('\n', '')
            if line.count(header_end_char) > min_num_header_end_chars:
                break

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
    file_header_data = dict_from_file(
        '../content/knowledge-system/slip-box/Adverb.md',
        header_end_char='-',
        min_num_header_end_chars=2
    )
    file_header_data = {
        snake_case_str(key, ' '): value
        for key, value in file_header_data.items()
        if snake_case_str(key, ' ') in FIELDS
    }
    
    t = TerminalThemeMetaDataZettle(**file_header_data)

    t.date = zettle_id_to_datetime(t.zettelcasten_index)
    
    for _list in [t.tags, t.keywords, t.zettelcasten_tags, t.sequence]:
        if _list:
            _list = str_to_list(_list, ', ')
            _list = [link_text_from_markdown(value)[0] for value in _list]
    print(file_header_data)

    # t = TerminalThemeMetaDataZettle(
    #     title="20230129211820",
    #     date="2023-01-29T21:18:20",
    #     author="",
    #     author_twitter="",
    #     cover="",
    #     tags=['[Language](Language.md)', '[Bulgarian](Bulgarian.md)', '[Verb](Verb.md)'],
    #     keywords=[],
    #     description="",
    #     show_full_content=False,
    #     reading_time=False,
    #     hide_comments=False,
    #     zettelcasten_index="20230129211820",
    #     zettlecasten_tags=["Language", "Bulgarian", "Article", "Definite Article", "Indefinite Article"],
    # )


if __name__ == '__main__':
    main()
