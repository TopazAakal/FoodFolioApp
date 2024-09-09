# pylint: disable=C0303 relative-beyond-top-level trailing-whitespace no-member unused-argument missing-module-docstring broad-exception-caught trailing-whitespace line-too-long missing-function-docstring
import json
import re
from bs4 import BeautifulSoup  # pylint: disable=import-error
from general import get_site, clean_json, get_recipe_url_jSON

def handle_adikosh(url):     
    xpaths = {
        "title": ['//h2[contains(@class, "md-title")]//text()'],
        "recipe": ['//div[contains(@class, "adn ads")]//p//text()'],
    }
    return get_recipe_url_jSON(url, xpaths)


def handle_anat_elisha(url):
    xpaths = {
        "title": ['//h1[contains(@class, "post_title entry-title")]//text()'],
        "recipe": ['//div[contains(@class, "post_content post_content_single entry-content")]//p/text()'],
    }
    recipe = get_recipe_url_jSON(url, xpaths)
    recipe['recipe'] = re.sub(r'.?\\u2028', ' ', str(recipe['recipe']))
    recipe['recipe'] = re.sub(r'.?\\u200.', ' ', str(recipe['recipe']))
    
    return recipe

def handle_elita_ofek(url):
    xpaths = {
        "title": ['//h1[contains(@class, "wd-entities-title title post-title")]//text()'],
        "ingredients": ['//p[contains(@class, "recipetxt")]//text()'],
        "instructions": ['//ul[contains(@class, "slides")]//following-sibling::p//text()'],
    }
    return get_recipe_url_jSON(url, xpaths)


def handle_hashulchan(url):
    xpaths = {
        "title": ['//h1[contains(@class,"headline")]//text()'],
        "ingredients": ['//div[contains(@class,"ingridients")]//span[1]//text()'],
        "instructions": ['//div[contains(@class,"stage")]//p//text()'],
    }
    return get_recipe_url_jSON(url, xpaths)
    
    
def handle_kobi_edri(url):
    xpaths={ 
        "title": ["//h1[contains(@class, 'elementor-heading-title')]//text()"],
        "ingredients": ['//div[contains(@class, "jet-table__cell-content")]//*//text()','//div[contains(@class, "jet-listing-dynamic-field__inline-wrap") ]/*//text()'],
        "instructions": ['//div[contains(@data-id, "b905d15")]//p//text()', '//div[contains(@data-id, "a3b9abe")]//p//text()','//div[contains(@data-id, "b905d15")]//li//text()'],
    }
    recipe = get_recipe_url_jSON(url, xpaths)
    recipe['ingredients'] = re.sub(r'.?\\xa0', ' ', str(recipe['ingredients']))
    recipe['instructions'] = re.sub(r'.?\\xa0', ' ', str(recipe['instructions']))
    return recipe
   

def handle_krutit(url): 
    xpaths={
        "title": ["//div[@class='pf-content']/h3//text()"],
        "recipe": ["//div[@class='pf-content']//text()","//div[@class='pf-content']/h3//following-sibling::p//text()"]
    }
    return get_recipe_url_jSON(url, xpaths)
    
    
def handle_liza_panelim(url):
    xpaths = {
        "title": ['//div[contains(@data-id, "08a341d")]//h2/text()'],
        "recipe": ['//div[contains(@data-id, "315f54f")]//p//text()'],
    }
    return get_recipe_url_jSON(url, xpaths)


def handle_ron_yohananov(url):
    xpaths ={
        'title': ["//*[contains(@class, 'blog-post-title-font blog-post-title-color')]//text()"],
        'recipe': ['//div[contains(@data-id,"content-viewer")]//text()','//*[contains(@class, "zKS-7")]//text()','//div[contains(@data-breakout,"normal")]//span//text()', '//*[contains(@class, "-Priw")]//text()']
    }
    recipe = get_recipe_url_jSON(url, xpaths)
    recipe['recipe'] = re.sub(r'\\xa0', ' ', str(recipe['recipe']))
    return recipe
    


def handle_10dakot(url):
    xpaths = {
        "title":['//h1[contains(@class, "banner_resipe__title")]//text()'],
        "recipe":['//div[contains(@class, "resipes__content")]//p//text()'],
    }
    recipe = get_recipe_url_jSON(url, xpaths)
    recipe['recipe'] = re.sub(r'\\xa0', ' ', str(recipe['recipe']))
    return recipe


def handle_foody(url):
    try:
        soup = BeautifulSoup(get_site(url), 'html.parser')
        script_content = soup.select_one("#recipe-schema").get_text()
        recipe_json = json.loads(script_content)
        
        recipe = {
            "title": clean_json(recipe_json["name"]),
            "ingredients": [clean_json(ingredient) for ingredient in recipe_json["recipeIngredient"]],
            "instructions": clean_json( recipe_json["recipeInstructions"]),
        }

        return recipe
    
    except Exception as e:
        print(f"Error parsing data: {e}")
        return None
    