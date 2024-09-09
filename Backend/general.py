# pylint: disable=C0303 trailing-whitespace no-member unused-argument missing-module-docstring broad-exception-caught trailing-whitespace line-too-long missing-function-docstring

import re
from urllib.parse import urlparse
import requests
from lxml import html

def get_site(url):
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        } 
    try:
        response = requests.get(url,  headers=headers, timeout=20)
        response.raise_for_status()  # Raise HTTPError for bad responses
        html_content = response.content
        return html_content
    
    except requests.RequestException as e:
        print(f'Error fetching data from {url}: {e}')
        return None

def get_domain_name(url):
    parsed_url = urlparse(url)
    domain_name = parsed_url.netloc
    return domain_name

def parse_recipe(parsed_html, xpaths):
    for xpath in xpaths: 
        text = parsed_html.xpath(str(xpath))
        if len(text) > 0:
            break    
    return text

def clean_json(data):
    # Remove HTML entities
    data = re.sub(r'&#8211;', '-', data)  # Replace with dash
    data = re.sub(r'&#8217;', "'", data)  # Replace with apostrophe

    # Remove caption tags and their content
    data = re.sub(r'.?\[caption[^\]]*\].*?\[ ?caption\]', '', data, flags=re.DOTALL)


    # Remove non-breaking spaces and excessive whitespace
    data = re.sub(r'\xa0', ' ', data)  # Replace non-breaking spaces with normal space
    data = re.sub(r'\s+', ' ', data).strip()  # Remove excessive spaces

    return data

def remove_inner_quotes(text):
     if not isinstance(text, str):
        # If text is not a string, try to convert it to a string
        try:
            text = str(text)
             # Remove single quotes inside words
            text = re.sub(r'\b(\w+)\'(\w+)\b', r'\1\2', text)
            
            # Remove double quotes inside words
            text = re.sub(r'\b(\w+)"(\w+)\b', r'\1\2', text)
            return text
        except:
            # If conversion fails, return an empty string or handle the error as appropriate
            return text
   

def get_recipe_url_jSON(url, xpaths):
    parsed_html= html.fromstring(get_site(url))
    
    if xpaths.get("recipe"):
        recipe_dict = {
            "title": parse_recipe(parsed_html, xpaths.get("title"))[0].strip(),
            "recipe":remove_inner_quotes(parse_recipe(parsed_html,  xpaths.get("recipe"))),
        }

        
        return recipe_dict
    else:
        recipe_dict = {
            "title": parse_recipe(parsed_html, xpaths.get("title"))[0].strip(),
            "ingredients": remove_inner_quotes(parse_recipe(parsed_html, xpaths.get("ingredients"))),
            "instructions": remove_inner_quotes(parse_recipe(parsed_html, xpaths.get("instructions"))),
        }
        return recipe_dict
        