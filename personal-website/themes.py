from dataclasses import dataclass, fields
from string_processing import case_to_camel_case, link_text_from_markdown


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
    
    def convert_tag_links_to_text(self) -> None:
        '''Convert markdown based links into the link text.'''
        for i, tag in enumerate(self.tags):
            match link_text_from_markdown(tag):
                case [str(match), *_]:
                    self.tags[i] = match


@dataclass
class TerminalThemeMetaDataZettle(TerminalThemeMetaData):
    '''Params that the Terminal theme uses with additional Zettlecasten params.'''
    zettle_id: str
    zettle_tags: list[str]
