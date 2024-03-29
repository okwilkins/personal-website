from enum import StrEnum, auto


class TerminalThemeField(StrEnum):
    TITLE = auto()
    DATE = auto()
    AUTHOR = auto()
    AUTHOR_TWITTER = auto()
    COVER = auto()
    TAGS = auto()
    KEYWORDS = auto()
    DESCRIPTION = auto()
    SHOW_FULL_CONTENT = auto()
    READING_TIME = auto()
    HIDE_COMMENTS = auto()
    KATEX = auto()
    TOC = auto()

    @staticmethod
    def get_str_fields():
        return [
            TerminalThemeField.TITLE,
            TerminalThemeField.DATE,
            TerminalThemeField.AUTHOR,
            TerminalThemeField.AUTHOR_TWITTER,
            TerminalThemeField.COVER,
            TerminalThemeField.DESCRIPTION
        ]

    @staticmethod
    def get_bool_fields():
        return [
            TerminalThemeField.SHOW_FULL_CONTENT,
            TerminalThemeField.READING_TIME,
            TerminalThemeField.HIDE_COMMENTS,
            TerminalThemeField.KATEX,
            TerminalThemeField.TOC
        ]

    @staticmethod
    def get_list_fields():
        return [
            TerminalThemeZettleField.TAGS,
            TerminalThemeZettleField.KEYWORDS
        ]


class TerminalThemeZettleField(StrEnum):
    TITLE = auto()
    DATE = auto()
    AUTHOR = auto()
    AUTHOR_TWITTER = auto()
    COVER = auto()
    TAGS = auto()
    KEYWORDS = auto()
    DESCRIPTION = auto()
    SHOW_FULL_CONTENT = auto()
    READING_TIME = auto()
    HIDE_COMMENTS = auto()
    KATEX = auto()
    TOC = auto()
    ZETTELCASTEN_INDEX = auto()
    ZETTELCASTEN_TAGS = auto()
    SEQUENCE = auto()

    @staticmethod
    def get_str_fields():
        return [
            TerminalThemeZettleField.TITLE,
            TerminalThemeZettleField.DATE,
            TerminalThemeZettleField.AUTHOR,
            TerminalThemeZettleField.AUTHOR_TWITTER,
            TerminalThemeZettleField.COVER,
            TerminalThemeZettleField.DESCRIPTION,
            TerminalThemeZettleField.ZETTELCASTEN_INDEX
        ]

    @staticmethod
    def get_bool_fields():
        return [
            TerminalThemeZettleField.SHOW_FULL_CONTENT,
            TerminalThemeZettleField.READING_TIME,
            TerminalThemeZettleField.HIDE_COMMENTS,
            TerminalThemeZettleField.KATEX,
            TerminalThemeZettleField.TOC
        ]

    @staticmethod
    def get_list_fields():
        return [
            TerminalThemeZettleField.TAGS,
            TerminalThemeZettleField.KEYWORDS,
            TerminalThemeZettleField.ZETTELCASTEN_TAGS,
            TerminalThemeZettleField.SEQUENCE
        ]
