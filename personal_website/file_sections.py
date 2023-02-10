from dataclasses import dataclass
from typing import Optional
from string_processing import str_to_key_value_pair
from abc import ABC, abstractmethod


class FileSection(ABC):
    lines: list[str]

    @abstractmethod
    def __str__(self) -> str:
        ...


@dataclass
class Header(FileSection):
    lines: list[str]
    start_str: Optional[str]
    end_str: str
    key_value_sep: str

    def __str__(self) -> str:
        lines = []

        if self.start_str is not None:
            lines += self.start_str + '\n'

        lines += [f'{line}\n' for line in self.lines]
        lines += self.end_str

        return ''.join(lines)

    def get_data(self) -> dict[str, Optional[str]]:
        '''
        Generate a dictionary of keys and values from each line of the header.
        '''
        output_dict = {}

        for line in self.lines:
            match str_to_key_value_pair(line, sep=self.key_value_sep):
                case (str(k), str(v)):
                    output_dict[k] = v
                case (str(k), None):
                    output_dict[k] = ''
                case _:
                    continue

        return output_dict


@dataclass
class Body(FileSection):
    lines: list[str]

    def __str__(self) -> str:
        return ''.join(self.lines)
