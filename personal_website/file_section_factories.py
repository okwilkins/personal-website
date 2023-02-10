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
    def get_section(
        lines: list[str],
        header_start_str: str,
        header_end_str: str,
        key_value_sep: str
    ) -> Header:
        header_lines = HeaderFactory._extract_section(lines, header_end_str)

        return Header(
            lines=header_lines,
            start_str=header_start_str,
            end_str=header_end_str,
            key_value_sep=key_value_sep
        )

    @staticmethod
    def _extract_section(lines: list[str], header_end_str: str) -> list[str]:
        '''
        Returns the list of strings that represent a file.

        Params:
            lines: The lines of text to scan through.
            header_end_str: The string that indicates the end of a header.
        '''
        header_lines = []

        for line in lines:
            if header_end_str in line:
                break
            
            header_lines.append(line)

        return header_lines


class BodyFactory(FileSectionFactory):
    @staticmethod
    def get_section(lines: list[str], body_start_str: str) -> Body:
        lines = BodyFactory._extract_section(lines=lines, body_start_str=body_start_str)
        return Body(lines=lines)

    @staticmethod
    def _extract_section(lines: list[str], body_start_str: str) -> list[str]:
        '''
        Returns the list of strings that represent the body of a file.

        Params:
            lines: The lines of text to scan through.
            body_start_str: The string that indicates the start of a body.
        '''
        line_num = 0

        for line in lines:
            if body_start_str in line:
                line_num += 1
                break
            
            line_num += 1
        
        return lines[line_num:]
