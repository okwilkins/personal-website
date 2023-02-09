from dataclasses import dataclass, fields, field
from string_processing import case_to_camel_case


@dataclass
class TerminalThemeMetaData:
    '''Params that the Terminal theme uses.'''
    title: str = ""
    date: str = ""
    author: str = ""
    author_twitter: str = ""
    cover: str = ""
    tags: list[str] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)
    description: str = ""
    show_full_content: bool = False
    reading_time: bool = False
    hide_comments: bool = False

    def __iter__(self):
        for field in fields(self):
            yield case_to_camel_case(field.name, '_'), getattr(self, field.name)


@dataclass
class TerminalThemeMetaDataZettle(TerminalThemeMetaData):
    '''Params that the Terminal theme uses with additional Zettlecasten params.'''
    zettelcasten_index: str = ""
    zettelcasten_tags: list[str] = field(default_factory=list)
    sequence: list[str] = field(default_factory=list)
