import re

print("Initializing NOTEacher ReAct Core Engine...")

def execute_tool(tool_name, tool_input):
    if tool_name == "Search":
        print(f" [Scrapping Web for: {tool_input}]")
        return "Wikipedia was founded in the year 2001"
    elif tool_name == "REPL":
        print(f" [Exercuting Code: {tool_input}]")
        import math
        if "sqrt(2001)" in tool_input:
            return str(math.sqrt(2001))
    return "Tool not found or failed."

def react_loop(user_prompt):
    print(f"\n User Question: '{user_prompt}'")
    print("="*50)

    mock_llm_generations = [
        "Thought: I need to find the year Wikipedia was founded. I will use the Search tool.\nAction: Search[Year Wikipedia was founded]",
        "Thought: The year is 2001. Now I need to calculate the square root of 2001. I will use the REPL tool.\nAction: REPL[import math; print(math.sqrt(2001))]",
        "Thought: The square root is roughly 44.73. I have solved the problem.\nFinal Answer: The square root of the year Wikipedia was founded is 44.73."
    ]

    max_turns = 5
    turn = 0

    while turn < max_turns:
        print(f"--- ReAct Turn {turn+1} ---")

        ai_output = mock_llm_generations[turn]
        print(f"AI:\n{ai_output}")

        if "Final Answer" in ai_output:
            print("\n ReAct Loop Terminated Successfully.")
            break

        action_match = re.search(r"Action:\s*(\w+)\[(.+)\]", ai_output)

        if action_match:
            tool_name = action_match.group(1)
            tool_input = action_match.group(2)
            print("System Intercept:")
            observation = execute_tool(tool_name, tool_input)
            print(f"Observation: {observation}")

        else:
            print("System Error: AI failed to format action correctly.")
            break

        turn += 1

    if turn == max_turns:
        react_loop("What is the square root of the year Wikipedia was founded?")