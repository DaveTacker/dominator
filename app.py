from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
import os
import redis
import hashlib
import json
import logging
from datetime import datetime
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per day", "10 per hour"]
)

# Load environment variables
DEFAULT_OPENAI_API_URL = os.getenv('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
DEFAULT_MODEL_NAME = os.getenv('MODEL_NAME', 'gpt-3.5-turbo')

# Set up Redis connection
redis_client = redis.from_url(REDIS_URL)

def get_cache_key(dom, model):
    return hashlib.md5(f"{dom}{model}".encode()).hexdigest()

def analyze_dom_with_chatgpt(dom, api_url, api_key, model):
    cache_key = get_cache_key(dom, model)
    cached_result = redis_client.get(cache_key)
    
    if cached_result:
        logger.info(f"Cache hit for key: {cache_key}")
        return json.loads(cached_result)

    soup = BeautifulSoup(dom, 'html.parser')
    
    scripts = soup.find_all('script')
    iframes = soup.find_all('iframe')
    forms = soup.find_all('form')
    
    prompt = f"""Analyze the following web page elements for potential security issues or interesting features:

Scripts: {len(scripts)}
iframes: {len(iframes)}
Forms: {len(forms)}

Page title: {soup.title.string if soup.title else 'No title'}

Please provide a brief analysis of potential security concerns or interesting aspects of this web page. Use a friendly, humorous, and technical tone in your response. Limit your response to 3-4 sentences."""

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    data = {
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 150,
        'stream': False
    }
    
    try:
        response = requests.post(api_url, headers=headers, json=data, timeout=60)
        response.raise_for_status()

        # OpenAI API response format
        if 'choices' in response.json():
            analysis = response.json()['choices'][0]['message']['content']
        else:
            analysis = response.json()

        # Save analysis to a JSON log file
        timestamp = datetime.now().strftime("%Y-%m-%d")
        log_file = f"analysis_{timestamp}-log.json"
        
        with open(log_file, 'a') as f:
            json.dump(analysis, f)
            f.write('\n')
        
        # Cache the result
        redis_client.setex(cache_key, 3600, json.dumps(analysis))  # Cache for 1 hour
        
        return analysis
    except requests.RequestException as e:
        logger.error(f"Error in ChatGPT API call: {str(e)}")
        # return "Sorry, I couldn't analyze the page at the moment. My circuits are a bit overloaded!"
        return str(e)

@app.route('/analyze', methods=['POST'])
@limiter.limit("5 per minute")  # Add a per-route rate limit
def analyze():
    data = request.json
    dom = data.get('dom')
    if not dom:
        logger.warning("No DOM provided in request")
        return jsonify({"error": "No DOM provided. DOMinator needs a DOM to dominate!"}), 400

    api_url = request.headers.get('X-API-Url', DEFAULT_OPENAI_API_URL)
    api_key = request.headers.get('X-API-Key')
    model = request.headers.get('X-Model', DEFAULT_MODEL_NAME)

    # if not api_key:
    #     logger.warning("No API key provided")
    #     return jsonify({"error": "No superhero ID (API key) provided. DOMinator needs your secret identity!"}), 400

    try:
        analysis = analyze_dom_with_chatgpt(dom, api_url, api_key, model)
        return jsonify({"analysis": analysis})
    except Exception as e:
        logger.exception("Unexpected error during analysis")
        return jsonify({"error": "Oops! DOMinator stumbled. Even superheroes have off days!"}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    logger.warning(f"Rate limit exceeded: {e.description}")
    return jsonify({"error": "Whoa there, speedy! DOMinator needs a breather. Even superheroes need to catch their breath!"}), 429

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
