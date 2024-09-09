# pylint: disable=no-member unused-argument missing-module-docstring broad-exception-caught trailing-whitespace line-too-long missing-function-docstring
import json
from google_api import detect_text, get_json_recipe_gemini
from url_handlers import handle_url

def lambda_handler(event, context):
    result = None
    try:
        if 'image_data' in event:
            image_data = event['image_data']
            # Decode the base64 image      
            result = get_json_recipe_gemini(detect_text(image_data))
                            
        elif 'URL' in event:
            url = event['URL']
            result = get_json_recipe_gemini(handle_url(url))
            
        print("Sending response: " + json.dumps(result, ensure_ascii=False))  # Log the outgoing response
        return {
            'statusCode': 200,
            'body': json.dumps({"result": result}, ensure_ascii=False),
            'headers': {
                'Content-Type': 'application/json; charset=utf-8',   
            }
        }
    except Exception as e:
        print("Error occurred: " + str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'headers': {
                'Content-Type': 'application/json; charset=utf-8',   
            }
        }
