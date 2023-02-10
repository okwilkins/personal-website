from abc import ABC, abstractmethod
from file_sections import FileSection, Header, Body


class FileSectionFactory(ABC):
    @abstractmethod
    def get_section() -> FileSection:
        ...
    
    @abstractmethod
    def _extract_section() -> FileSection:
        ...


class HeaderFactory(FileSectionFactory):
    @staticmethod
    def get_section(lines: list[str], header_end_string: str, key_value_pair_sep: str) -> Header:
        header_lines = HeaderFactory._extract_section(lines, header_end_string)

        return Header(
            lines=header_lines,
            end_string=header_end_string,
            key_value_pair_sep=key_value_pair_sep
        )

    @staticmethod
    def _extract_section(lines: list[str], header_end_string: str) -> list[str]:
        '''
        Returns the list of strings that represent a file.

        Params:
            lines: The lines of text to scan through.
            header_end_char: The charcter that indicates the end of a header.
        '''
        header_lines = []

        for line in lines:
            if line == header_end_string:
                break
            
            header_lines.append(line)

        return header_lines


class BodyFactory(FileSectionFactory):
    @staticmethod
    def get_section(lines: list[str], header_end_string: str) -> Body:
        return BodyFactory._extract_section(lines=lines, header_end_string=header_end_string)

    @staticmethod
    def _extract_section(lines: list[str], header_end_string: str) -> list[str]:
            '''
            Returns the list of strings that represent the body of a file.

            Params:
                lines: The lines of text to scan through.
                header_end_char: The charcter that indicates the end of a header.
                min_num_header_end_chars: The minimum number of times the
                header_end_char appears to indicate the end of a header.
            '''
            line_num = 0

            for line in lines:
                if line == header_end_string:
                    line_num += 1
                    break
                
                line_num += 1
            
            return lines[line_num:]
