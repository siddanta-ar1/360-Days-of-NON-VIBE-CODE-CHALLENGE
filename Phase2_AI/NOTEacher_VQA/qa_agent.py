print("Initializing NOTEacher Automated QA Department...")

CODER_PROMPT = "You are a Junior Developer. Write Python Code."

JUDGE_PROMPT = """You are a Principal Software Engineer acting as a strict Code Reviewer.
Analyze the provided code against these criteria:
1. Syntax correctness
2. Edge case handling
3. Best practices (e.g., no hardcoded secrets)

If the code is flawed, explain exactly why, and end your response with the word: [FAIL]
If the code is production-ready, say 'Looks good' and end your response with the word: [PASS]"""


def simulate_llm(persona, prompt):
    """Simulates the AI generations for this specific test scenario."""

    if "Junior Developer" in persona:
        if "RETRY 1" in prompt:
            # The Coder fixed the bug!
            return "def divide(a, b):\n    if b == 0:\n        return 'Error'\n    return a / b"
        else:
            # The Coder writes a naive, broken function on the first try
            return "def divide(a, b):\n    return a / b"

    elif "Code Reviewer" in persona:
        # The Judge evaluates the code
        if "if b == 0" in prompt:
            return "The edge case is handled. Syntax is correct. [PASS]"
        else:
            return "You did not handle division by zero. If b is 0, the program will crash. [FAIL]"


def automated_code_review(task):
    print(f" Task: '{task}'")

    print("\n Coder Agent is drafting the initial code...")
    current_code = simulate_llm(CODER_PROMPT, task)
    print(f"Draft 1:\n{current_code}\n")

    max_retries = 3
    attempt = 0

    while attempt < max_retries:
        print("Passing draft to the QA Judge Agent...")
        evaluation = simulate_llm(JUDGE_PROMPT, f"Evaluate this code:\n{current_code}")
        print(f"📋 Judge's Verdict: {evaluation}")

        if "[PASS]" in evaluation:
            print("\n Code Approved! Deploying to User.")
            return current_code
        elif "[FAIL]" in evaluation:
            print("Code Rejected! Sending critique back to the Coder for revision...")
            retry_prompt = f"RETRY 1: Your previous code failed review. Fix it based on this feedback:\n{evaluation}"

            print("\n Coder Agent is revising the code...")
            current_code = simulate_llm(CODER_PROMPT, retry_prompt)
            print(f"Draft {attempt + 2}: \n{current_code}\n")

        attempt += 1
    print("\n QA Loop Failed. Code could not pass review after max retires.")
    return None


if __name__ == "__main__":
    automated_code_review("Write a Python function to divide two numbers.")
