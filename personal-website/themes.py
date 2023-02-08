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
            yield case_to_camel_case(field.name, '_'), getattr(self, field.name)


@dataclass
class TerminalThemeMetaDataZettle(TerminalThemeMetaData):
    '''Params that the Terminal theme uses with additional Zettlecasten params.'''
    zettle_id: str
    zettle_tags: list[str]