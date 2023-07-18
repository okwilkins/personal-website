+++
title = "My Work"
toc = true
+++

## Maeving: 2023

I currently am working on [Maeving](https://maeving.com/)'s data strategy/engineering and BI. So far I have used Azure to deploy databases to store data from:
- Hubspot
- Shopify
- Meta advertising
- Google analytics

This data is all engineered in using APIs via Azure Synapse. This data has then been visualised via PowerBI, with it being updated daily.

## Laing O'Rourke: 2021 - 2023

At my time at LOR I performed many tasks. These ranged from statical inference for [Sizewell C](https://www.edfenergy.com/energy/nuclear-new-build-projects/sizewell-c), machine learning, software engineering to ML/AI model deployment. The following is a summary of my main works. 

### NLP: SBERT and GPT4
At Laing O'Rourke there are many different departments, including legal and the project bidding. Both of these deal with large documents on a daily basis. As Word is extensively used, I designed code that could extract all paragraphs, headers and their respective locations in documents. This methodology allowed the tabularisation of over 100,000 pages. This enabled any number of NLP applications to interact with this data. To assist these departments, several applications using NLP were devised.

These were:
- Document summerisation:
    - To reduce the numbers of hours spent reading through 1,000s of pages of text

![alt-text](/gpt-summariser.png)

- Categorisation of documents:
    - Readers can quickly find documents that are relevant to them
    - Can find documents that are similar to the ones they are currently reading
- House Styling and Glossary:
    - Writers can enter a piece of text for review
    - The model applies a set of rules
      - As an example: Remove the passive voice to an active voice
- Summarising client requirements

### Finance and Time Series Forecasting

Many of the projects LOR is in charge of constructing are some of the largest in the UK. Because of this financial forecasting is very important. I analysed the financials, rate of progress and staff on over 60 projects, with a combined value of over £1 billon. This combination of data provided never seen before statistical insights. This informed the financial strategy of future projects.

Furthermore, risk modelling provided fiance a model that could flag when projects were forecasted to not reach the intended profit margin. [Darts](https://unit8co.github.io/darts/) and XGBoost were utilised to achieve this. 

### ML/Dev Ops and Python

Good engineering standards were a big concern of mine at LOR. I made sure that all data science capabilities were in check from a ML/dev OPs standpoint. This included:
- Maintenance of Azure Machine Learning and its associated computes, code to run ML pipelines, model deployment and data drift
- Data science templates, to help other in the team have consistent:
  - Python/Conda environments
  - Folder structures
  - Github actions out of the box
- Github maintenance:
  - Making sure Github actions worked across the board
  - Repos were free of sensitive data
  - Pull requests and commits

To further my commitment to good engineering practises, I gave talks and mentored on all things Python. For instance, I gave a company-wide talk to 200 people on why Python should be the next tool people should use to level up their data analysis game. I also spent a number of hours a week mentoring several people in my team on Python over calls and by using tools like [ReviewNB](https://www.reviewnb.com/) (this is a great tool by the way!) in pull requests on Github.

## Faceit: 2020 - 2021

Faceit is a competitive platform for computer games, with more than 18 million users competing in over 20 million game sessions each month. My focus at Faceit was split between Looker, BigQuery, statical inference and machine learning.

### Text Toxicity

Toxicity on Faceit is a large issue. Take a look at the [Faceit subreddit for a near daily reminder of the abuse people receive](https://www.reddit.com/r/FACEITcom/comments/y95up1/fella_was_racist_up_to_the_2nd_round_then_didnt/). I improved upon the prexisting model by using [prospective API](https://perspectiveapi.com/) and random forests in tandem.

### Player Skill Level
I analysed the matches of over 2 million players to create a model to predict what a player's skill level would be over their first few games. This was important in solving [surfing](https://www.dexerto.com/gaming/what-is-smurfing-in-gaming-2015991/). Smurfing was a big problem to a new user's experience on the platform. With player's skill level being predicted earlier, the impact these people had on new players was significantly reduced.

## Liveminds: 2020

Liveminds specialises in behavioural recruitment to find participants for online research. This is powered through advertising using social networks. I worked on managing data and their related pipelines, the analysis of business operations and creating predictive models. I created and deployed a predictive model that has led to a 50% decrease in costs associated with advertising and employee time. Alongside this, I generated many interactive reports. This created a clearer understanding of trends and statistical phenomena within the company.

## Freelance Data Science Work: 2018 - 2020

Whilst at university I was looking for a real-world challenge. I provided tailored and effective solutions to complex problems facing businesses. I achieved this with a mixture of Python, Excel/VBA, PostgreSQL and Linux. I developed multiple long-term relationships with companies. This gave me the confidence to work with big clients and deliver affordable and efficient business solutions to tight deadlines.

## Personal Projects
From time-to-time, I like to stretch my legs a little with some personal projects.

### This Website

This website was originally setup as a means to house my portfolio work but to also act as a portfolio of sorts also. The website is built using Hugh/Go & Javascript with Github actions running (highly over-engineered) Python. The project also processes my [Zettlecasten knowledge system](https://github.com/okwilkins/knowledge-system) daily with Github actions. Any changes to the Markdown files in this [project's repository](https://github.com/okwilkins/personal-website) are automatically deployed to the web.

### Assortments of Learning Repositories

#### [My Personalised Degree](https://github.com/okwilkins/my-degree)

The purpose of [this repo](https://github.com/okwilkins/my-degree) was to iron out flaws in my knowledge for full-stack data science. I learnt many skills including:
- C#
- SOLID principles
- Design patterns
- In depth reading into the major data science machine learning algorithms
- Azure/GCP
- Unit testing
- Management/leadership
- Docker/Github actions

#### [Rust](https://github.com/okwilkins/learning-rust)
