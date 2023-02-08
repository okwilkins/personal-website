from typing import Optional
from string_processing import str_to_key_value_pair, gen_header_string
from themes import TerminalThemeMetaDataZettle


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
    # print(
    #     gen_header_string(
    #         dict_from_file(
    #             '../content/knowledge-system/slip-box/Definite Article.md',
    #             header_end_char='-',
    #             min_num_header_end_chars=2
    #         ),
    #         convert_key_to_camel_case=True
    #     )
    # )

    t = TerminalThemeMetaDataZettle(
        title="20230129211820",
        date="2023-01-29T21:18:20",
        author="",
        author_twitter="",
        cover="",
        tags=['[Language](Language.md)', '[Bulgarian](Bulgarian.md)', '[Verb](Verb.md)'],
        keywords=[],
        description="",
        show_full_content=False,
        reading_time=False,
        hide_comments=False,
        zettle_id="20230129211820",
        zettle_tags=["Language", "Bulgarian", "Article", "Definite Article", "Indefinite Article"],
    )

    t.convert_tag_links_to_text()
    print(t.tags)


if __name__ == '__main__':
    main()
