from dataclasses import dataclass, fields


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


def main() -> None:
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
    print(gen_header_string(dict(t)))


if __name__ == '__main__':
    main()
