from file_sections import FileSection
from dataclasses import dataclass


@dataclass
class HeaderFile:
    header: FileSection
    body: FileSection

    def get_lines(self) -> list[str]:
        return self.header.lines + self.body.lines

    def sections_to_str(self) -> str:
        return str(self.header) + str(self.body)