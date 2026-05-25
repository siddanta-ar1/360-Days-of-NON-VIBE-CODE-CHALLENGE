print("Initializing NOTEacher Multi-Agent Orchestrator...")

RESEARCHER_PROMPT = """You are a Senior Researcher.
Your only job is to gather accurate facts. Do NOT write code.
Output your findings as a clear, bulleted summary."""

CODER_PROMPT = """You are a Senior Software Engineer.
Your only job is to write Python code based on the research provided to you.
Do NOT search the web. Only write code."""

def simulate_llm_call(system_prompt, user_input):
    print(f"\n[SYSTEM] Booting Agent with Persons:\n{system_prompt[:30]}...\n")

    if "Researcher" in system_prompt:
        print(" Researcher Agent is "thinking"...")
        return "- Current Bitcoin price is roughly $65,000.\n- Standard volatility is 3% daily."

    elif "Software Engineer" in system_prompt:
        print("Coder Agent is "thinking"...")
        return """def check_btc_alert(current_price):
            threshold = 60000
            if current_price < threshold:
                print(f"ALERT: BTC dropped to {current_price}!")
            else:
                print("Price is stable.")"""

def run_digital_company(master_task):
    print(" Manager: Assigning task to the Researcher Agent...")
    research_query = f"Task: {master_task}. Please gather the necessary facts."

    research_report = simulate_llm_call(RESEARCHER_PROMPT, research_query)
    print(f"\n RESEARCH REPORT GENERATED:\n{research_report}")
    print("="*50)

    print(" Manager: Passing the Research Report to the Coder Agent...")
    coder_query = f"Here is the research: \n{research_report}\n\nPlease write the requested script."

    final_code = simulate_llm_call(CODER_PROMPT, coder_query)
    print(f"\n FINAL CODE GENERATED:\n{final_code}")
    print("="*50)

    print("\n Multi-Agent Workflow Complete. The objective has been achieved.")

if __name__ == "__main__":
    task = "Find the current price of Bitcoin and write a Python script to alert me if it drops below 60k."
    run_digital_company(task)
