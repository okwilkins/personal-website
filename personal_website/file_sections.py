from dataclasses import dataclass
from typing import Optional, Callable
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
            lines += self.start_str
        
        lines += self.lines
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

    def get_formatted_data(
        self,
        func: Callable[[str, str], str],
        sep: str,
        mask: Optional[list[str]] = None
    ) -> dict[str, Optional[str]]:
        '''
        Generate a dictionary of keys and values from each line of the header.
        The keys will be formated with the supplied function. The function
        should take in a string and a sep as its arguments.

        Params:
            func: The function to format each key of the data dict. The func
            should take in a string (the one to be formatted) and a seperator.
            sep: The seperator that the funtion will use to split text.
            mask: (Optional) (default = None) mask out any keys that are
            not in the list.
        '''
        data = {
            func(key, sep): value
            for key, value in self.get_data().items()
        }

        if mask is not None:
            data = {key: value for key, value in data.items() if key in mask}

        return data


@dataclass
class Body(FileSection):
    lines: list[str]

    def __str__(self) -> str:
        return ''.join(self.lines)
