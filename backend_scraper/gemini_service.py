import os
import re
from typing import List
import google.generativeai as genai
from dotenv import load_dotenv
import io
from PIL import Image

class GeminiService:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_search_queries(self, prompt: str) -> List[str]:
        """
        Generate multiple search queries from a natural language prompt using Gemini API.
        
        Args:
            prompt (str): Natural language prompt from user
            
        Returns:
            List[str]: List of generated search queries
        """
        # Construct a prompt that instructs Gemini to generate search queries
        system_prompt = """
        You are an expert AI Fashion Stylist and E-commerce Search Specialist for Meesho, catering to the modern Indian market. Your mission is to translate a user's fashion request into 3-5 highly specific, short, and effective search queries that will yield the best product results.

        ---

        ### CORE DIRECTIVES

        1.  **Analyze User Intent**: First, identify the core purpose of the request. Is it for a specific **occasion** (e.g., wedding, office, casual), a **styling query** (e.g., "what goes with..."), or a general **trend exploration**?

        2.  **The Complementary Rule (Crucial!)**: If the user asks for items that "go with," "match," or "complement" something they already have (e.g., "what to wear with blue jeans"), your queries **MUST NOT** include the original item. Focus *exclusively* on generating queries for matching tops, bottoms, accessories, footwear, or layers.

        3.  **Keyword Alchemy**: Combine keywords from the following categories to create powerful, targeted queries. Aim for a `[Adjective/Trend] + [Item Type]` structure.

            * **2025 Trend & Silhouette Keywords**: `oversized`, `crop`, `high-waisted`, `palazzo`, `co-ord set`, `bodycon`, `flowy`, `asymmetric`, `wide-leg`, `A-line`, `sharara`.
            * **Fabric & Pattern Keywords**: `chikankari`, `bandhani`, `linen`, `satin`, `organza`, `ribbed knit`, `tie-dye`, `floral print`.
            * **Style & Vibe Keywords**: `minimalist`, `boho`, `ethnic`, `indo-western`, `festive`, `formal`.
            * **Accessory Keywords**: `oxidized jewellery`, `statement earrings`, `chunky sneakers`, `crossbody bag`, `juttis`, `nude heels`.

        4.  **Smart Color Theory**: Apply color harmony principles to suggest complementary items.
            * **For Earth Tones (beige, brown, olive)**: Pair with cream, rust, or gold.
            * **For Pastels (mint, lavender, blush)**: Pair with white, silver, or other pastels.
            * **For Bold Colors (royal blue, emerald green)**: Pair with neutrals (black, white) or contrasting brights (orange, pink).

        5.  **Query Syntax & Keyword Rules**:
            * **Length**: Queries must be short, ideally 2-4 words.
            * **Focus**: Be product-focused. Think like a user typing into a search bar.
            * **Contextual Gender**: This is a critical rule.
                * **ADD a gender keyword** (e.g., `women`, `men's`) for apparel that is commonly unisex or ambiguous.
                    * **Examples**: `t-shirt`, `jeans`, `shirt`, `jacket`, `blazer`, `sweatshirt`, `joggers`.
                    * **Correct Query**: `oversized t-shirt women`
                * **DO NOT ADD a gender keyword** for apparel that is inherently gender-specific in the Indian market.
                    * **Examples**: `kurti`, `saree`, `lehenga`, `dress`, `blouse`, `dupatta`.
                    * **Correct Query**: `chikankari kurti` (NOT `chikankari kurti for women`)
            * **Exclusions**: Avoid filler words like "for", "stylish", "beautiful", "new".

        ---

        ### OUTPUT FORMAT

        **Return ONLY a valid Python list of strings, and nothing else.**
        Format: `["query1", "query2", "query3", "query4"]`

        ---

        ### EXAMPLES

        **Input**: "what goes with a red kurti"
        **Output**: `["black palazzo pants", "gold dupatta", "nude heels", "oxidized jhumkas"]`

        **Input**: "give me a trendy office outfit"
        **Output**: `["oversized blazer women", "high waisted trousers", "satin crop top", "minimalist accessories"]`

        **Input**: "complement blue jeans styling"
        **Output**: `["white crop top", "oversized denim jacket", "chunky sneakers women", "crossbody bag"]`

        **Input**: "festive ethnic modern look for diwali"
        **Output**: `["indo western co-ord set", "palazzo pants ethnic", "oxidized choker", "embroidered dupatta"]`

        **Input**: "what colors match with yellow dress"
        **Output**: `["navy blue accessories", "brown belt bag", "white block heels", "denim jacket"]`
        """
        
        full_prompt = f"{system_prompt}\nInput: {prompt}\nOutput:"
        
        try:
            response = self.model.generate_content(full_prompt)
            # Extract the list from the response
            response_text = response.text.strip()
            print("Raw Response Text:", response_text)
            
            # Clean up the response to remove markdown code blocks and extra text
            cleaned_text = response_text
            
            # Remove markdown code blocks
            if "```python" in cleaned_text:
                start_marker = "```python"
                end_marker = "```"
                start_idx = cleaned_text.find(start_marker) + len(start_marker)
                end_idx = cleaned_text.find(end_marker, start_idx)
                if end_idx != -1:
                    cleaned_text = cleaned_text[start_idx:end_idx].strip()
            elif "```" in cleaned_text:
                # Handle generic code blocks
                start_idx = cleaned_text.find("```")
                end_idx = cleaned_text.find("```", start_idx + 3)
                if start_idx != -1 and end_idx != -1:
                    cleaned_text = cleaned_text[start_idx + 3:end_idx].strip()
            
            # Find the list pattern in the response
            list_pattern = r'\[([^\[\]]*(?:"[^"]*"[^\[\]]*)*)\]'
            match = re.search(list_pattern, cleaned_text)
            
            if match:
                list_content = match.group(0)
                print("Found list pattern:", list_content)
                
                # Safely evaluate the string as a Python list
                try:
                    queries = eval(list_content)
                    if isinstance(queries, list) and all(isinstance(q, str) for q in queries):
                        # Filter out empty queries and ensure they're reasonable
                        valid_queries = [q.strip() for q in queries if q.strip() and len(q.strip()) > 1]
                        if valid_queries:
                            print("Successfully parsed queries:", valid_queries)
                            return valid_queries[:5]  # Limit to 5 queries max
                except (SyntaxError, NameError, ValueError) as e:
                    print(f"Error evaluating list: {e}")
            
            print("Cleaned Response Text:", cleaned_text)
            
            # Fallback: try to extract quoted strings
            quoted_strings = re.findall(r'"([^"]+)"', cleaned_text)
            if quoted_strings:
                print("Using fallback quoted strings:", quoted_strings)
                return quoted_strings[:5]
                
            # Final fallback
            print("All parsing failed, using original prompt as fallback")
            return [prompt]
            
        except Exception as e:
            print(f"Error generating queries with Gemini: {e}")
            # Smart fallback: generate basic search queries from the prompt
            return self._generate_fallback_queries(prompt)

    def _generate_fallback_queries(self, prompt: str) -> List[str]:
        """
        Generate fallback search queries when Gemini API fails.
        
        Args:
            prompt (str): Original user prompt
            
        Returns:
            List[str]: List of fallback search queries
        """
        prompt_lower = prompt.lower().strip()
        
        # Common mappings for Indian e-commerce with 2025 fashion trends
        fallback_mapping = {
            # Festive & Traditional
            'diwali': ['festive kurti set', 'ethnic co-ord set', 'embroidered dupatta', 'traditional jewelry'],
            'wedding': ['lehenga choli', 'anarkali suit', 'bridal accessories', 'heavy dupatta'],
            'ethnic': ['indo western kurti', 'palazzo suit set', 'ethnic jacket', 'oxidized jewelry'],
            'festive': ['festive crop top', 'ethnic palazzo', 'embellished kurti', 'statement earrings'],
            
            # Modern & Trendy
            'trendy': ['oversized shirt women', 'crop top set', 'high waisted jeans', 'chunky sneakers'],
            'modern': ['co-ord set women', 'bodycon dress', 'oversized blazer women', 'minimalist jewelry'],
            'stylish': ['asymmetric top', 'wide leg pants', 'statement bag', 'layered necklace'],
            
            # Occasion-based
            'office': ['formal blazer women', 'high waisted trousers', 'office kurti', 'minimalist watch'],
            'casual': ['oversized tshirt women', 'mom jeans', 'canvas sneakers', 'crossbody bag'],
            'party': ['bodycon dress', 'metallic top', 'heeled sandals', 'statement jewelry'],
            'date': ['flowy midi dress', 'denim jacket women', 'ankle boots', 'delicate jewelry'],
            
            # Seasonal
            'summer': ['cotton crop top', 'linen pants', 'strappy sandals', 'sun hat'],
            'winter': ['oversized sweater', 'high waisted jeans', 'ankle boots', 'layered necklace'],
            'monsoon': ['waterproof jacket women', 'quick dry pants', 'rain boots', 'umbrella'],
            
            # Color-based complementary
            'red': ['black palazzo', 'nude accessories', 'gold jewelry', 'white dupatta'],
            'blue': ['white crop top', 'brown belt', 'gold accessories', 'beige bag'],
            'yellow': ['navy accessories', 'brown sandals', 'coral jewelry', 'denim jacket'],
            'green': ['beige palazzo', 'gold jewelry', 'nude heels', 'cream dupatta'],
            'pink': ['grey accessories', 'silver jewelry', 'white sneakers', 'denim shirt'],
            'black': ['colorful accessories', 'gold jewelry', 'bright bag', 'statement earrings'],
            'white': ['bold accessories', 'colorful bag', 'statement jewelry', 'bright sandals'],
            
            # Styling requests
            'complement': ['matching accessories', 'coordinating colors', 'layering pieces', 'statement jewelry'],
            'goes with': ['matching bottoms', 'coordinating tops', 'complementary accessories', 'styling pieces'],
            'match': ['coordinating pieces', 'color matching', 'style complement', 'fashion accessories']
        }
        
        # Check for keywords in the prompt
        for keyword, queries in fallback_mapping.items():
            if keyword in prompt_lower:
                print(f"Using fallback queries for keyword '{keyword}': {queries}")
                return queries
        
        # If no keywords match, try to extract meaningful words and apply fashion logic
        words = prompt_lower.split()
        meaningful_words = [w for w in words if len(w) > 2 and w not in ['give', 'me', 'a', 'an', 'the', 'for', 'some', 'any', 'what', 'with', 'goes', 'complement']]
        
        # Check if it's a complementary styling request
        styling_keywords = ['complement', 'goes', 'match', 'with', 'pair', 'style']
        is_styling_request = any(keyword in prompt_lower for keyword in styling_keywords)
        
        if meaningful_words:
            fallback_queries = []
            
            if is_styling_request:
                # For styling requests, focus on complementary items
                for word in meaningful_words[:2]:
                    if word in ['kurti', 'dress', 'top']:
                        fallback_queries.extend(['palazzo pants', 'dupatta', 'accessories'])
                    elif word in ['jeans', 'pants', 'trousers']:
                        fallback_queries.extend(['crop top', 'oversized shirt women', 'blazer women'])
                    elif word in ['saree', 'lehenga']:
                        fallback_queries.extend(['matching blouse', 'jewelry set', 'clutch bag'])
                    else:
                        fallback_queries.extend([f'{word} accessories', f'matching {word}', f'{word} styling'])
            else:
                # Regular search for the items themselves with trendy keywords
                for word in meaningful_words[:3]:
                    fallback_queries.append(f'trendy {word}')
                    if word in ['shirt', 'tshirt', 'top', 'blazer', 'jacket']:
                         fallback_queries.append(f'oversized {word} women')
                    else:
                         fallback_queries.append(f'{word} set')
            
            if fallback_queries:
                print(f"Generated fashion-aware fallback queries: {fallback_queries[:4]}")
                return fallback_queries[:4]
        
        # Ultimate fashionable fallback
        print("Using ultimate trendy fallback queries")
        return ['oversized shirt women', 'crop top set', 'palazzo pants', 'statement accessories']

    def _extract_queries_from_response(self, response_text: str) -> List[str]:
        """
        Extract search queries from Gemini's response text.
        
        Args:
            response_text (str): Raw response from Gemini API
            
        Returns:
            List[str]: Extracted and validated queries
        """
        try:
            # Clean up the response to remove markdown code blocks and extra text
            cleaned_text = response_text
            
            # Remove markdown code blocks
            if "```python" in cleaned_text:
                start_marker = "```python"
                end_marker = "```"
                start_idx = cleaned_text.find(start_marker) + len(start_marker)
                end_idx = cleaned_text.find(end_marker, start_idx)
                if end_idx != -1:
                    cleaned_text = cleaned_text[start_idx:end_idx].strip()
            elif "```" in cleaned_text:
                # Handle generic code blocks
                start_idx = cleaned_text.find("```")
                end_idx = cleaned_text.find("```", start_idx + 3)
                if start_idx != -1 and end_idx != -1:
                    cleaned_text = cleaned_text[start_idx + 3:end_idx].strip()
            
            # Find the list pattern in the response
            list_pattern = r'\[([^\[\]]*(?:"[^"]*"[^\[\]]*)*)\]'
            match = re.search(list_pattern, cleaned_text)
            
            if match:
                list_content = match.group(0)
                print("Found list pattern:", list_content)
                
                # Safely evaluate the string as a Python list
                try:
                    queries = eval(list_content)
                    if isinstance(queries, list) and all(isinstance(q, str) for q in queries):
                        # Filter out empty queries and ensure they're reasonable
                        valid_queries = [q.strip() for q in queries if q.strip() and len(q.strip()) > 1]
                        if valid_queries:
                            print("Successfully parsed queries:", valid_queries)
                            return valid_queries[:5]  # Limit to 5 queries max
                except (SyntaxError, NameError, ValueError) as e:
                    print(f"Error evaluating list: {e}")
            
            print("Cleaned Response Text:", cleaned_text)
            
            # Fallback: try to extract quoted strings
            quoted_strings = re.findall(r'"([^"]+)"', cleaned_text)
            if quoted_strings:
                print("Using fallback quoted strings:", quoted_strings)
                return quoted_strings[:5]
                
            # Return empty list to trigger fallback
            return []
            
        except Exception as e:
            print(f"Error extracting queries: {e}")
            return []

    def process_results(self, all_results: List[dict]) -> dict:
        """
        Process and merge results from multiple search queries.
        
        Args:
            all_results (List[dict]): List of results from each search query
            
        Returns:
            dict: Merged and processed results with deduplication
        """
        # Remove duplicates using multiple criteria for better deduplication
        seen_products = set()
        unique_results = []
        
        for result in all_results:
            # Create composite key for deduplication
            product_url = result.get('url', '').strip()
            product_title = result.get('title', '').strip().lower()
            
            # Use URL as primary key, fall back to title if URL not available
            product_key = product_url if product_url else product_title
            
            if product_key and product_key not in seen_products:
                seen_products.add(product_key)
                unique_results.append(result)
        
        # Sort by price (ascending) if price information is available
        try:
            unique_results.sort(key=lambda x: float(x.get('price', '0').replace('₹', '').replace(',', '').strip()) if x.get('price') else float('inf'))
        except (ValueError, AttributeError):
            # If sorting by price fails, keep original order
            pass
        
        return {
            "total": len(unique_results),
            "unique_from": len(all_results),
            "results": unique_results
        }

    def analyze_image_and_generate_queries(self, image_data: bytes, text_prompt: str = "") -> List[str]:
        """
        Analyze an uploaded image using Gemini's vision capabilities and generate fashion search queries.
        
        Args:
            image_data (bytes): Raw image data
            text_prompt (str): Optional additional text context from user
            
        Returns:
            List[str]: List of generated search queries based on image analysis
        """
        try:
            # Convert image data to PIL Image for Gemini
            image = Image.open(io.BytesIO(image_data))
            
            # Create vision prompt for fashion analysis
            vision_prompt = f"""
            You are an expert AI Fashion Stylist analyzing this image. Your task is to generate 3-5 specific search queries for an Indian e-commerce platform (Meesho) based on what you see and the user's request.

            ANALYSIS GUIDELINES:
            1. **Understand User Intent**: Read the user's text prompt carefully to understand what they want
            2. **Analyze the Image**: Look at clothing items, colors, patterns, styles, and occasion level
            3. **Respond Appropriately**: 
               - If they want "something to wear WITH this" → suggest complementary items
               - If they want "something LIKE this" → suggest similar items
               - If they want "alternatives to this" → suggest different options in same category
               - If no specific request → use your fashion expertise to decide

            SMART RESPONSE CATEGORIES:
            - **Complementary Items**: Bottoms, tops, layers, accessories, footwear that complete the look
            - **Similar Items**: Same category items with similar style, color, or vibe
            - **Alternative Styles**: Different takes on the same item category
            - **Complete Outfit**: Full styling suggestions if requested

            QUERY GENERATION RULES:
            - Each query should be 2-4 words maximum
            - Focus on specific items that match the user's intent
            - Include relevant style descriptors (formal, casual, ethnic, trendy)
            - Consider Indian fashion preferences (kurtis, palazzo, ethnic wear, indo-western)
            - Think about colors, patterns, and occasion appropriateness

            USER REQUEST: "{text_prompt if text_prompt else 'Find fashion items based on this image'}"

            EXAMPLES OF SMART RESPONSES:
            - "something to wear with this shirt" → ["black trousers", "brown belt", "formal shoes", "minimalist watch"]
            - "similar shirt like this" → ["cotton casual shirt", "striped button shirt", "solid color shirt", "linen shirt"]
            - "complete this outfit" → ["matching pants", "coordinating jacket", "appropriate shoes", "suitable accessories"]
            - "ethnic version of this" → ["kurti similar style", "ethnic palazzo", "dupatta matching", "traditional jewelry"]

            Analyze the image and user request, then provide exactly 3-5 search queries in this format:
            ["query1", "query2", "query3", "query4"]
            """

            # Use Gemini's vision model
            response = self.model.generate_content([vision_prompt, image])
            response_text = response.text.strip()
            
            print(f"Image Analysis Response: {response_text}")
            
            # Extract queries from response
            queries = self._extract_queries_from_response(response_text)
            
            if not queries:
                # Fallback queries if extraction fails
                fallback_queries = [
                    "trendy kurti women",
                    "palazzo pants",
                    "ethnic accessories",
                    "casual wear women"
                ]
                print(f"Using fallback queries for image search: {fallback_queries}")
                return fallback_queries
            
            print(f"Extracted image-based queries: {queries}")
            return queries
            
        except Exception as e:
            print(f"Error in image analysis: {e}")
            # Return fallback fashion queries
            fallback_queries = [
                "women fashion trending",
                "ethnic wear kurti",
                "casual outfit women",
                "accessories jewelry"
            ]
            print(f"Error fallback queries: {fallback_queries}")
            return fallback_queries