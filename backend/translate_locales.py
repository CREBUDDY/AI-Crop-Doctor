import json
import os
import time
from deep_translator import GoogleTranslator

LOCALES_DIR = r"c:\Users\Satyam\Desktop\AI CROP DOCTOR\frontend\src\locales"
EN_FILE = os.path.join(LOCALES_DIR, "en", "translation.json")

# Map folder names to googletrans language codes
LANG_MAP = {
    "bn": "bn", # Bengali
    "gu": "gu", # Gujarati
    "hi": "hi", # Hindi
    "kn": "kn", # Kannada
    "ml": "ml", # Malayalam
    "mr": "mr", # Marathi
    "pa": "pa", # Punjabi
    "ta": "ta", # Tamil
    "te": "te", # Telugu
}

def translate_text(text, dest_lang):
    if not isinstance(text, str):
        return text
    try:
        translated = GoogleTranslator(source='en', target=dest_lang).translate(text)
        return translated
    except Exception as e:
        print(f"Error translating '{text}' to {dest_lang}: {e}")
        return text

def process_dict(en_dict, target_dict, dest_lang):
    for key, value in en_dict.items():
        if isinstance(value, dict):
            if key not in target_dict or not isinstance(target_dict[key], dict):
                target_dict[key] = {}
            process_dict(value, target_dict[key], dest_lang)
        elif isinstance(value, list):
            # Handle array of objects (like FAQ items or Blog posts)
            if key not in target_dict or not isinstance(target_dict[key], list):
                target_dict[key] = []
            
            # Make sure list is the right size
            while len(target_dict[key]) < len(value):
                target_dict[key].append({})
                
            for i, item in enumerate(value):
                if isinstance(item, dict):
                    if not isinstance(target_dict[key][i], dict):
                        target_dict[key][i] = {}
                    process_dict(item, target_dict[key][i], dest_lang)
                elif isinstance(item, str):
                    if len(target_dict[key]) <= i or not isinstance(target_dict[key][i], str) or target_dict[key][i] == "" or target_dict[key][i] == item:
                        print(f"Translating array string: {item}")
                        translated = translate_text(item, dest_lang)
                        if len(target_dict[key]) <= i:
                            target_dict[key].append(translated)
                        else:
                            target_dict[key][i] = translated
        elif isinstance(value, str):
            if key not in target_dict or target_dict[key] == "" or target_dict[key] == value: 
                if key not in target_dict or target_dict[key] == value:
                    print(f"Translating key: {key}")
                    translated = translate_text(value, dest_lang)
                    target_dict[key] = translated
                    time.sleep(0.1) # Be nice to the API
        else:
            if key not in target_dict:
                target_dict[key] = value

def main():
    with open(EN_FILE, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
        
    for locale, lang_code in LANG_MAP.items():
        print(f"--- Processing Locale: {locale} ({lang_code}) ---")
        locale_file = os.path.join(LOCALES_DIR, locale, "translation.json")
        
        target_data = {}
        if os.path.exists(locale_file):
            with open(locale_file, 'r', encoding='utf-8') as f:
                target_data = json.load(f)
                
        process_dict(en_data, target_data, lang_code)
        
        with open(locale_file, 'w', encoding='utf-8') as f:
            json.dump(target_data, f, ensure_ascii=False, indent=2)
            
    print("Translation complete!")

if __name__ == "__main__":
    main()
