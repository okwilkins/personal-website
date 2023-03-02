from file_sections import FileSection
from dataclasses import dataclass


@dataclass
class HeaderFile:
    header: FileSection
    body: FileSection

    def __str__(self) -> str:
        return str(self.header) + str(self.body)

    @property
    def lines(self) -> list[str]:
        return (
            [self.header.start_str]
            + self.header.lines
            + [self.header.end_str]
            + self.body.lines
        )
