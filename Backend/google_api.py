# pylint: disable=no-member unused-argument missing-module-docstring broad-exception-caught trailing-whitespace line-too-long missing-function-docstring
import json
import base64
import os
import re
from google.cloud import vision
import google.generativeai as genai

def get_json_recipe_gemini(text):
    nlp_key = os.environ['API_KEY']
    department  = ['פירות וירקות', "בשר ועוף", "דגים", "תבלינים", "מוצרי חלב וביצים", "ממרחים",
                   "קפה ותה", "ממתקים", "אלכוהול", "שימורים" ,"לחם" ,"אחר"]
    unit = [ 'מיליליטר', 'ליטר', 'מיליגרם', 'גרם', 'קילוגרם', 'כוס', 'כף', 'כפית', 'יחידה', 'קורט']    
    try:
        if len(text) > 0:
            genai.configure(api_key=nlp_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(f""" 
            Write the following recipe in a JSON format. 
            1. Clean the ingredients and steps from descriptions and unnecessary information.
            2. If there are any abbreviations, such as תפוא, or as unit abbreviations, write the full expression (e.g., תפוח אדמה). 
            4. Keep it in Hebrew. 
            5. Use decimal representation for fractions. 
            6. drop unicode if there are any.
            
            The JSON should have the following fields:
            - title: <str> (if there isn't a title, suggest a short title based on the recipe)
            - instructions: (key (int): val (str)) keep it in the order of the recipe.
            - totalTime: sum the times in the instructions and add 10 דקות  (if there is no times specified, write 0 דקות)
            - Ingredients: with the following fields:
                - name: <str> (only edible ingredients)
                - department: {department}
                - quantity: <float>  (if there is no quantity, write 1)
                - unit: {unit}
            
            {text} """)
            result =  response.text
            
        if len(result) == 0:
            result = "No text detected in the image"
        else:
            json_string = re.sub(r'^```json', '', result).strip()
            result = re.sub(r'```$', '', json_string).strip()
        return result

    except Exception as e:
        # print("Error occurred: " + json.dumps(contet_response))  # Log the error response
        return Exception(f'Error: {str(e)}')
        

def detect_text(image_data):
    image_bytes = base64.b64decode(image_data)
    response = 'Google vison API response Error'
    try:
        # Call Google Vision API
        image = vision.Image(content=image_bytes)
        client = vision.ImageAnnotatorClient()
        response = client.text_detection(image=image)
        texts = response.text_annotations
        if len(texts) > 0:
            detected_text = texts[0].description
        else:
            detected_text = ""
    

        return detected_text
    
    except Exception as e:
        print("Error occurred: " + json.dumps(response), ensure_ascii=False)  # Log the error response
        return Exception(f'Error: {str(e)}')
