from dataclasses import dataclass
from typing import Optional
from string_processing import str_to_key_value_pair
from abc import ABC


class FileSection(ABC):
    lines: list[str]


@dataclass
class Header(FileSection):
    lines: list[str]
    end_string: str
    key_value_pair_sep: str

    def get_data(self) -> dict[str, Optional[str]]:
        '''
        Generate a dictionary of values for markdown files from a list of header
        strings.
        '''
        output_dict = {}

        for line in self.lines:
            match str_to_key_value_pair(line, sep=self.key_value_pair_sep):
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
