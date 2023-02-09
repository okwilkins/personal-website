import unittest
from personal_website.string_processing import *


class TestStringProcessing(unittest.TestCase):
    '''Test the string processing module.'''

    def test_str_to_hugo_list(self) -> None:
        self.assertEqual(
            str_to_hugo_list('[[Language]], [[Noun]]', ', '),
            '["[[Language]]", "[[Noun]]"]'
        )
        self.assertEqual(
            str_to_hugo_list('[[Language]](language.md), [[Noun]](noun.md)', ', '),
            '["[[Language]](language.md)", "[[Noun]](noun.md)"]'
        )
        self.assertEqual(
            str_to_hugo_list('[[Language]]', ', '),
            '[[Language]]'
        )
        self.assertEqual(
            str_to_hugo_list('[[Language]], [[Noun]]', '-'),
            '[[Language]], [[Noun]]'
        )
        self.assertEqual('', '')
    
    def test_str_to_key_value_pair(self) -> None:
        self.assertEqual(
            str_to_key_value_pair('Zettelcasten Index: 20230129211820', ': '),
            ('Zettelcasten Index', '20230129211820')
        )
        self.assertEqual(
            str_to_key_value_pair('Zettelcasten Index: 20230129211820', ' - '),
            None
        )
        self.assertEqual(
            str_to_key_value_pair('Zettelcasten Index: ', ': '),
            ('Zettelcasten Index', None)
        )
        self.assertEqual(
            str_to_key_value_pair('Zettelcasten Index:  ', ': '),
            ('Zettelcasten Index', None)
        )
    
    def test_str_to_list(self) -> None:
        self.assertEqual(
            str_to_list('[[Language]], [[Noun]]', ', '),
            ["[[Language]]", "[[Noun]]"]
        )
        self.assertEqual(
            str_to_list('[[Language]](language.md), [[Noun]](noun.md)', ', '),
            ["[[Language]](language.md)", "[[Noun]](noun.md)"]
        )
        self.assertEqual(
            str_to_list('[[Language]]', ', '),
            ['[[Language]]']
        )
        self.assertEqual(
            str_to_list('[[Language]], [[Noun]]', ' - '),
            ['[[Language]], [[Noun]]']
        )
        self.assertEqual('', [''])

    def test_remove_empty_strs(self) -> None:
        ...

    def test_zettle_id_to_datetime(self) -> None:
        ...

    def test_case_to_camel_case(self) -> None:
        ...

    def test_gen_header_line(self) -> None:
        ...

    def test_gen_header_string(self) -> None:
        ...

    def test_link_text_from_markdown(self) -> None:
        ...

    def test_snake_case_str(self) -> None:
        ...


if __name__ == '__main__':
    unittest.main()
