from file_sections import Header, Body
from file_section_factories import HeaderFactory, BodyFactory
from dataclasses import dataclass


@dataclass
class HeaderFile:
    header: Header
    body: Body

    def get_lines():
        return Header.lines + Body.lines


class HeaderFileFactory:
    def get_file(
        lines: list[str],
        header_end_string: str,
        key_value_pair_sep: str
    ) -> HeaderFile:
        header = HeaderFactory.get_section(
            lines=lines,
            header_end_string=header_end_string,
            key_value_pair_sep=key_value_pair_sep
        )
        body = BodyFactory.get_section(
            lines=lines,
            header_end_string=header_end_string
        )
        return HeaderFile(header=header, body=body)
