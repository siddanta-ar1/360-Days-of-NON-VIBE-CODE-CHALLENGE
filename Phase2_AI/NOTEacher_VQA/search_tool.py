import json
import re
import urllib.parse
import urllib.request

print("Initializing NOTEacher Web Search Module...")


def execute_search(query):
    print(f"[Tool Activated] Scraping the web for: 'query'")
    try:
        safe_query = urllib.parse.quote(query)
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={safe_query}&utf8=&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "NOTEacher_Agent/1.0"})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())

        results = data["query"]["search"]
        if not results:
            return "Search yielded no results. Try a diffrent query."

        clean_snippet = re.sub("<[^<]+>", "", results[0]["snippet"])
        extracted_knowledge = (
            f"Top Web Result ({results[0]['title']}): {clean_snippet}..."
        )

        print(f" [Tool Success] Live Data Retrieved!")
        return extracted_knowledge
    except Exception as e:
        return f"Search Error: {str(e)}"


if __name__ == "__main__":
    agent_query = "Who discovered penicillin and in what year?"
    print("\n--- Scenario: Agentic Web Search ---")

    print(f'AI thought : \'{{"tool": "search", "query": "{agent_query}"}}\'')
    print("Intercepting AI generation. Accessign live internet...")
    live_web_data = execute_search(agent_query)

    print("\n Injecting scraped knowledge into Neural Network context...")
    final_ai_response = f"Based on my live web search, {live_web_data}"
    print(f"\n Final AI Answer: {final_ai_response}")
