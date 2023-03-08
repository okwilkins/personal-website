from glob import glob
from file_sections import Header
from file_section_factories import HeaderFactory
from themes import TerminalThemeZettleField
from string_processing import case_to_camel_case
from pathlib import Path
from ast import literal_eval
import json


def get_links(header: Header) -> list[str]:
    # Convert keys to snake_case
    file_header_data = header.get_data()

    links = []
    keys = [
        case_to_camel_case(str(TerminalThemeZettleField.ZETTELCASTEN_TAGS), sep='_'),
        case_to_camel_case(str(TerminalThemeZettleField.SEQUENCE), sep='_')
    ]

    for key in keys:
        key_links = file_header_data.get(str(key))

        if key_links is not None:
            key_links = literal_eval(key_links)
        else:
            key_links = []

        for link in key_links:
            links.append(link)
    
    return links


def main(path: str) -> None:
    # Read in file
    with open(path, 'r') as f:
        file_lines = f.readlines()

    file_lines = [line.strip() for line in file_lines]

    header = HeaderFactory.get_section(
        lines=file_lines,
        header_start_str='+++',
        header_end_str='+++',
        key_value_sep=' = '
    )

    links = get_links(header)
    links = [link.lower() for link in links]

    return {
        'id': Path(path).stem.lower(),
        'description': Path(path).stem,
        'links': set(links)
    }


if __name__ == '__main__':
    folders = ['map-of-content', 'slip-box']
    data = {'nodes': [], 'links': []}
    groups = [
        Path(file).stem.lower()
        for file in glob(f'./content/knowledge-system/map-of-content/*.md')
    ]

    files = []
    node_size = {}

    for folder in folders:
        for file in glob(f'./content/knowledge-system/{folder}/*.md'):
            files.append(file)

    for file in files:
        file_data = main(path=file)
        group = None

        if file_data['id'] in groups:
            group = file_data['id']

        for link in file_data['links']:
            data['links'].append({
                'source': file_data['id'],
                'target': link
            })

            if (link in groups) and (group is None):
                group = link
            
            if link in node_size:
                node_size[link] += 1
            else:
                node_size[link] = 0

        data['nodes'].append({
            'id': file_data['id'],
            'description': file_data['description'],
            'group': group
        })
    
    for node in data['nodes']:
        if node['id'] not in node_size:
            node_size[node['id']] = 0
    
    max_node_size = max(node_size.values())
    
    for node in data['nodes']:
        # +1 as if the size is 0, it will have a size of 1
        size = (node_size[node['id']] + 1) / max_node_size
        
        # Clamp value
        if size < 0.1:
            size = 0.1

        node['node_size'] = size

    
    with open('static/graph-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
