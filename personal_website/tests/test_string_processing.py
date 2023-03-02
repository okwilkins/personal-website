import unittest
from personal_website.string_processing import (
    link_text_from_markdown,
    case_to_camel_case,
    gen_header_line,
    remove_empty_strs,
    snake_case_str,
    str_to_hugo_list,
    str_to_list,
    str_to_key_value_pair,
    zettle_id_to_datetime
)


class TestStringProcessing(unittest.TestCase):
    '''Test the string processing module.'''

    def test_str_to_hugo_list(self) -> None:
        self.assertEqual(
            str_to_hugo_list('[[Language]], [[Noun]]', ', '),
            '["[[Language]]", "[[Noun]]"]'
        )
        self.assertEqual(
            str_to_hugo_list('[Language](language.md), [Noun](noun.md)', ', '),
            '["[Language](language.md)", "[Noun](noun.md)"]'
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
        self.assertEqual(
            str_to_key_value_pair('Zettelcasten Index: 20230129211820', ''),
            None
        )

    def test_str_to_list(self) -> None:
        self.assertEqual(
            str_to_list('[[Language]], [[Noun]]', ', '),
            ["[[Language]]", "[[Noun]]"]
        )
        self.assertEqual(
            str_to_list('[Language](language.md), [Noun](noun.md)', ', '),
            ["[Language](language.md)", "[Noun](noun.md)"]
        )
        self.assertEqual(
            str_to_list('[[Language]]', ', '),
            ['[[Language]]']
        )
        self.assertEqual(
            str_to_list('[[Language]], [[Noun]]', ' - '),
            ['[[Language]], [[Noun]]']
        )
        self.assertEqual(str_to_list('', ', '), [''])
        self.assertEqual(
            str_to_list('[[Language]], [[Noun]]', ''),
            ["[[Language]], [[Noun]]"]
        )
        self.assertEqual(
            str_to_list('[Numeral Plural](Numeral%20Plural.md)', ', '),
            ["[Numeral Plural](Numeral%20Plural.md)"]
        )

    def test_remove_empty_strs(self) -> None:
        self.assertEqual(
            remove_empty_strs(['']),
            []
        )
        self.assertEqual(
            remove_empty_strs(['[[Language]]', '[[Noun]]']),
            ['[[Language]]', '[[Noun]]']
        )
        self.assertEqual(
            remove_empty_strs(['[[Language]]', '[[Noun]]', '']),
            ['[[Language]]', '[[Noun]]']
        )
        self.assertEqual(
            remove_empty_strs(['[[Language]]', '', '']),
            ['[[Language]]']
        )

    def test_zettle_id_to_datetime(self) -> None:
        self.assertEqual(
            zettle_id_to_datetime('20230129211820'),
            '2023-01-29T21:18:20'
        )
        self.assertEqual(
            zettle_id_to_datetime('19970201211820'),
            '1997-02-01T21:18:20'
        )
        self.assertEqual(
            zettle_id_to_datetime('19600201211820'),
            '1960-02-01T21:18:20'
        )
        self.assertEqual(
            zettle_id_to_datetime('2023012921182'),
            '2023-01-29T21:18:02'
        )
        self.assertEqual(
            zettle_id_to_datetime('20230129213905-a1'),
            '2023-01-29T21:39:05'
        )
        self.assertEqual(
            zettle_id_to_datetime('202301292118201'),
            '2023-01-29T21:18:20'
        )
        with self.assertRaises(ValueError):
            zettle_id_to_datetime('')
        with self.assertRaises(ValueError):
            zettle_id_to_datetime('202300292118201')

    def test_case_to_camel_case(self) -> None:
        self.assertEqual(
            case_to_camel_case('snake_case', '_'),
            'snakeCase'
        )
        self.assertEqual(
            case_to_camel_case('snake_case', ' '),
            'snake_case'
        )
        self.assertEqual(
            case_to_camel_case('snake_case', ''),
            'snake_case'
        )
        self.assertEqual(
            case_to_camel_case('""', '_'),
            '""'
        )

    def test_gen_header_line(self) -> None:
        self.assertEqual(
            gen_header_line('title', 'Noun', ' = '),
            'title = "Noun"'
        )
        self.assertEqual(
            gen_header_line('title', '', ' = '),
            'title = ""'
        )
        self.assertEqual(
            gen_header_line('title', 1, ' = '),
            'title = "1"'
        )
        self.assertEqual(
            gen_header_line('title', 1.2, ' = '),
            'title = "1.2"'
        )
        self.assertEqual(
            gen_header_line('showComments', True, ' = '),
            'showComments = true'
        )
        self.assertEqual(
            gen_header_line('showComments', False, ' = '),
            'showComments = false'
        )
        self.assertEqual(
            gen_header_line('showComments', ['Language', 'Noun'], ' = '),
            'showComments = ["Language", "Noun"]'
        )
        self.assertEqual(
            gen_header_line('showComments', [], ' = '),
            'showComments = []'
        )
        self.assertEqual(
            gen_header_line('showComments', [], ': '),
            'showComments: []'
        )
        self.assertEqual(
            gen_header_line('showComments', [], ''),
            'showComments[]'
        )
        with self.assertRaises(NotImplementedError):
            self.assertEqual(gen_header_line('title', (1, 2, 3), ' = '))

    def test_link_text_from_markdown(self) -> None:
        self.assertEqual(
            link_text_from_markdown('[Language](Language.md)'),
            ['Language']
        )
        self.assertEqual(
            link_text_from_markdown('[Language](Language.md) [Noun](Noun.md)'),
            ['Language', 'Noun']
        )
        self.assertEqual(
            link_text_from_markdown('[Numeral Plural](Numeral%20Plural.md)'),
            ['Numeral Plural']
        )
        self.assertEqual(
            link_text_from_markdown('Hello world!'),
            []
        )
        self.assertEqual(
            link_text_from_markdown(''),
            []
        )

    def test_snake_case_str(self) -> None:
        self.assertEqual(
            snake_case_str('Show Comments', ' '),
            'show_comments'
        )
        self.assertEqual(
            snake_case_str('Show-Comments', '-'),
            'show_comments'
        )
        self.assertEqual(
            snake_case_str('test', ' '),
            'test'
        )
        self.assertEqual(
            snake_case_str('test', ''),
            'test'
        )
        self.assertEqual(
            snake_case_str('""', ' '),
            '""'
        )
        self.assertEqual(
            snake_case_str('', ' '),
            ''
        )


if __name__ == '__main__':
    unittest.main()
