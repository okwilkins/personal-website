[![Generate Static HTML](https://github.com/okwilkins/personal-website/actions/workflows/gen-static-html.yml/badge.svg)](https://github.com/okwilkins/personal-website/actions/workflows/gen-static-html.yml)
[![Obsidian Export](https://github.com/okwilkins/personal-website/actions/workflows/obsidian-export.yml/badge.svg)](https://github.com/okwilkins/personal-website/actions/workflows/obsidian-export.yml)
[![Python Tests](https://github.com/okwilkins/personal-website/actions/workflows/python-tests.yml/badge.svg)](https://github.com/okwilkins/personal-website/actions/workflows/python-tests.yml)
[![Website shields.io](https://img.shields.io/website-up-down-brightgreen-red/http/shields.io.svg)](http://okwilkins.dev/)


# Personal Website

[![made-with-Hugo](https://img.shields.io/badge/Made%20with-Hugo-yellow.svg)](https://gohugo.io/)
[![made-with-python](https://img.shields.io/badge/Made%20with-Python-blue.svg)](https://www.python.org/)
[![made-with-Markdown](https://img.shields.io/badge/Made%20with-Markdown-purple.svg)](http://commonmark.org)
[![PyPI pyversions](https://img.shields.io/badge/python-v3.11-blue)](https://www.python.org/)

Welcome to my personal website repo that houses the [content](./content/), [processing](./personal_website/) and [workflows](./.github/workflows/) for [okwilkins.dev](https://www.okwilkins.dev/). All content is written in [Markdown](http://commonmark.org) and using [Hugo](https://gohugo.io/), the Markdown is converted into static HTML. The static HTML for my website can be [found here](https://github.com/okwilkins/okwilkins.github.io).

On a daily schedule, the Markdown files found in my [Zettelcasten](https://zettelkasten.de/posts/overview/) based notes system are processed via [Obsidan Export](https://github.com/zoni/obsidian-export) and brought into this repo. Please take a look at this [repository for more information](https://github.com/okwilkins/knowledge-system).

Python is also used to process the headers of my notes, so that they will work with Hugo. I went a bit overboard with the over engineering, see [here](./personal_website/tests/) and [here](./personal_website/file_section_factories.py)!

## Running the Website

1. [Install Hugo](https://gohugo.io/overview/installing/)
2. Clone this repository

```bash
git clone https://github.com/okwilkins/personal-website.git
cd personal-webite
```

3. Run Hugo

```bash
hugo server --destination public
```

## Exporting Obsidian Notes to Hugo

This project uses [Obsdian Export](https://github.com/zoni/obsidian-export) to export the notes that can be seen in the `content/knowledge-system/` directory. The `.export-ignore` file controls which files will be ignored during the export, for more, please [read here](https://github.com/zoni/obsidian-export#ignoring-files).

## Python Installation

This project uses Conda to manage Python dependencies. For the fastest way of obtaining conda, install [Miniconda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html). After installation, to install the dependencies, run this command in the root directory of the project:

```
conda env update environment.yml --prune
```
