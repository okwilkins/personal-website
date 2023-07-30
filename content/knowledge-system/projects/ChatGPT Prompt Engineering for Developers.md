## Introduction

* two types of LLMs
  * base llm
    * predicts next word
    * based on text training data
    * Examples:
      * One upon a time, there was a uncorn........ "that lived in a magical forest with all her unicorn friends"
      * What is the cpatial of France?..... "What is France's largest city? What is France's population"
        * This is an issue
        * Happens because these could be valid autocompletion, from pop quiz
  * instruction tuned llm
    * In contrast, tries to follow instructions 
    * Fine-tune on instruciton and good attempts at following htose instructions
      * Much more likely to get: What is the captial of France?.... "The captial of France is Paris."
    * This fine-tuning is called RLHF: Reinforcement Learning with Human Feedback
      * Better able to follow instructions
    * Recommended to use this
    * OpenAI and co are making these models safer and more aligned

## Guidelines

### 1. Write clear and spesific instructions

* clear does not equal short

#### Tactic 1: Use delimiters to clearly indicat distict parts of the input

Delimiters could be:
- `` ``` ``
- `"""`
- `<>`
- `<tag> </tag>`
- `:`

````python
text = f"""
You should express what you want a model to do by \ 
providing instructions that are as clear and \ 
specific as you can possibly make them. \ 
This will guide the model towards the desired output, \ 
and reduce the chances of receiving irrelevant \ 
or incorrect responses. Don't confuse writing a \ 
clear prompt with writing a short prompt. \ 
In many cases, longer prompts provide more clarity \ 
and context for the model, which can lead to \ 
more detailed and relevant outputs.
"""
prompt = f"""
Summarize the text delimited by triple hyphens \ 
into a single sentence.
---{text}---
"""
````

* This can help with prompt injections too

#### Tactic 2: Ask for a struction output

* JSON or HTML

````python
prompt = f"""
Generate a list of three made-up book titles along \ 
with their authors and genres. 
Provide them in JSON format with the following keys: 
book_id, title, author, genre.
"""
````

#### Tactic 3: Check wheter conditions are satisfied

* Check assumption required to do the task

````python
text_1 = f"""
Making a cup of tea is easy! First, you need to get some \ 
water boiling. While that's happening, \ 
grab a cup and put a tea bag in it. Once the water is \ 
hot enough, just pour it over the tea bag. \ 
Let it sit for a bit so the tea can steep. After a \ 
few minutes, take out the tea bag. If you \ 
like, you can add some sugar or milk to taste. \ 
And that's it! You've got yourself a delicious \ 
cup of tea to enjoy.
"""
prompt = f"""
You will be provided with text delimited by triple quotes. 
If it contains a sequence of instructions, \ 
re-write those instructions in the following format:

Step 1 - ...
Step 2 - …
…
Step N - …

If the text does not contain a sequence of instructions, \ 
then simply write \"No steps provided.\"

\"\"\"{text_1}\"\"\"
"""
response = get_completion(prompt)
print("Completion for Text 1:")
print(response)
````

````
Completion for Text 1:
Step 1 - Get some water boiling.
Step 2 - Grab a cup and put a tea bag in it.
Step 3 - Once the water is hot enough, pour it over the tea bag.
Step 4 - Let it sit for a bit so the tea can steep.
Step 5 - After a few minutes, take out the tea bag.
Step 6 - Add some sugar or milk to taste.
Step 7 - Enjoy your delicious cup of tea!
````

vs

````python
text_2 = f"""
The sun is shining brightly today, and the birds are \
singing. It's a beautiful day to go for a \ 
walk in the park. The flowers are blooming, and the \ 
trees are swaying gently in the breeze. People \ 
are out and about, enjoying the lovely weather. \ 
Some are having picnics, while others are playing \ 
games or simply relaxing on the grass. It's a \ 
perfect day to spend time outdoors and appreciate the \ 
beauty of nature.
"""
prompt = f"""
You will be provided with text delimited by triple quotes. 
If it contains a sequence of instructions, \ 
re-write those instructions in the following format:

Step 1 - ...
Step 2 - …
…
Step N - …

If the text does not contain a sequence of instructions, \ 
then simply write \"No steps provided.\"

\"\"\"{text_2}\"\"\"
"""
response = get_completion(prompt)
print("Completion for Text 2:")
print(response)
````

````
Completion for Text 2:
No steps provided.
````

#### Tactic 4: Few-shot prompting

* Give successful examples of completing tasks

````python
prompt = f"""
Your task is to answer in a consistent style.

<child>: Teach me about patience.

<grandparent>: The river that carves the deepest \ 
valley flows from a modest spring; the \ 
grandest symphony originates from a single note; \ 
the most intricate tapestry begins with a solitary thread.

<child>: Teach me about resilience.
"""
````

### 2. Give time for the model to think

* if the model is creating reasoning errors by rushing to an incorrect conclusion
* try reframing the query to request a chain or series of relevant reasoning
* Another way to think about it:
  * If you give the model a task that is too complex for it to do in a short amount of time/words
  * It may make up a guess that is incorrect

#### Tactic 1: Specify the steps required to complete a task

````python
prompt_2 = f"""
Your task is to perform the following actions: 
1 - Summarize the following text delimited by 
  <> with 1 sentence.
2 - Translate the summary into French.
3 - List each name in the French summary.
4 - Output a json object that contains the 
  following keys: french_summary, num_names.

Use the following format:
Text: <text to summarize>
Summary: <summary>
Translation: <summary translation>
Names: <list of names in Italian summary>
Output JSON: <json with summary and num_names>

Text: <{text}>
"""
response = get_completion(prompt_2)
print("\nCompletion for prompt 2:")
print(response)
````

#### Tactic 2: Instruct the model to work out its own solution before rushing to a conclusion

````python
prompt = f"""
Your task is to determine if the student's solution \
is correct or not.
To solve the problem do the following:
- First, work out your own solution to the problem. 
- Then compare your solution to the student's solution \ 
and evaluate if the student's solution is correct or not. 
Don't decide if the student's solution is correct until 
you have done the problem yourself.

Use the following format:
Question:
---
question here
---
Student's solution:
---
student's solution here
---
Actual solution:
---
steps to work out the solution and your solution here
---
Is the student's solution the same as actual solution \
just calculated:
---
yes or no
---
Student grade:
---
correct or incorrect
---

Question:
---
I'm building a solar power installation and I need help \
working out the financials. 
- Land costs $100 / square foot
- I can buy solar panels for $250 / square foot
- I negotiated a contract for maintenance that will cost \
me a flat $100k per year, and an additional $10 / square \
foot
What is the total cost for the first year of operations \
as a function of the number of square feet.
--- 
Student's solution:
---
Let x be the size of the installation in square feet.
Costs:
1. Land cost: 100x
2. Solar panel cost: 250x
3. Maintenance cost: 100,000 + 100x
Total cost: 100x + 250x + 100,000 + 100x = 450x + 100,000
---
Actual solution:
"""
response = get_completion(prompt)
print(response)
````

### Model Limitations: Hallucinations

````python
prompt = f"""
Tell me about AeroGlide UltraSlim Smart Toothbrush by Boie
"""
````

* Boie is real, the product is not.
* It can make statemnets that sound plausible but are not true
  * It's not good at knowing where the bounds of its knowledge lie

To reduce hallucinations:

* First find relevant info
* Then answer the question based on the relevant information

````python
prompt = f"""
Tell me about AeroGlide UltraSlim Smart Toothbrush by Boie.

Use the following format:

Provide relevent information that lead to the infomation on the toothbrush:
---
Relevent information here
---
Info about the AeroGlide UltraSlim Smart Toothbrush by Boie:
---
AeroGlide UltraSlim Smart Toothbrush by Boie here
---

If there is no relevent information, then simply write: "This is a hallucination." and follow it with the above format.
"""
````

## Iterative Prompt Development

## Summarising

````python
    prompt = f"""
    Your task is to generate a short summary of a product \ 
    review from an ecommerce site to give feed back to the shipping deparment.

    Summarize the review below, delimited by triple \
    backticks in at most 20 words and focusing on any aspects that mention shipping and delivery of the product.

    Review: ---{reviews[i]}---
"""
````

You can generate a summary that is more applicable to one particular group in your business

## Inferring

* Takes a text as input and performs some form of analysis

Can perform:

* sentiment

````python
prompt = f"""
What is the sentiment of the following product review, 
which is delimited with triple backticks?

Give your answer as a single word, either "positive" \
or "negative".

Review text: '''{lamp_review}'''
"""
````

* Identify types of emotions
  * LLMs are pretty god at extracting data from text

````python
prompt = f"""
Identify a list of emotions that the writer of the \
following review is expressing. Include no more than \
five items in the list. Format your answer as a list of \
lower-case words separated by commas.

Review text: '''{lamp_review}'''
"""
````

* Indentify anger

````python
prompt = f"""
Is the writer of the following review expressing anger?\
The review is delimited with triple backticks. \
Give your answer as either yes or no.

Review text: '''{lamp_review}'''
"""
````

* Extract product and company name from customer reviews

````python
prompt = f"""
Identify the following items from the review text: 
- Item purchased by reviewer
- Company that made the item

The review is delimited with triple backticks. \
Format your response as a JSON object with \
"Item" and "Brand" as the keys. 
If the information isn't present, use "unknown" \
as the value.
Make your response as short as possible.
  
Review text: '''{lamp_review}'''
"""
````

* Infer topics

````python
prompt = f"""
Determine five topics that are being discussed in the \
following text, which is delimited by triple backticks.

Make each item one or two words long. 

Format your response as a list of items separated by commas.

Text sample: '''{story}'''
"""
response = get_completion(prompt)
print(response)
````

* Make a news alert for certain topics

````python
topic_list = [
    "nasa", "local government", "engineering", 
    "employee satisfaction", "federal government"
]
prompt = f"""
Determine whether each item in the following list of \
topics is a topic in the text below, which
is delimited with triple backticks.

Give your answer as list with 0 or 1 for each topic.\

List of topics: {", ".join(topic_list)}

Text sample: '''{story}'''
"""
response = get_completion(prompt)
print(response)
````

````
nasa: 1
local government: 0
engineering: 0
employee satisfaction: 1
federal government: 1
````

## Transforming

* LLMs are very good at transforming text
  * Helping speling and grammitcal issues
  * HTML to JSON
  * Tone of the text

## Exapanding

## Conclusion
