import ast
import operator

print("Initializing NOTEacher Agentic Tool Router...")

def execute_calculator(equation_string):
    """A safe mathematical evaluaor that the AI can call."""
    print(f"[TOOL ACTIVATED] Calcuator processing: {equation_string}")
    try:
        operators = {ast.Add: operator.add, ast.Sub: operator.sub,
            ast.Mult: operator.mul, ast.Div: operator.truediv}

        node = ast.parse(equation_string, mode='eval').body
        def eval_node(n):
            if isinstance(n, ast.Constant):
                return n.value
            elif isinstance(n, ast.BinOp):
                return operators[type(n.op)](eval_node(n.left), eval_node(n.right))
            raise TypeError("Unsupported operation")
        result = eval_node(node)
        print(f"[TOOL SUCCESS] Result: {result}")
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"

available_tools = {
    "calculator": execute_calculator
}

def agentic_loop(ai_output):
    """
    Simulates the AI's thought process. If the AI outputs a tool command,
    we itercept it, run the tool, and return the result.
    """

    print(f"\n AI Thought: '{ai_output}'")

    if '{"tool"': in ai_output:
    print("Intercepting AI generation...")

    tool_name = "calculator"
    tool_input = "3849 * 9182"

    if tool_name in available_tools:
            tool_result = available_tools[tool_name](tool_input)

            print("\n Feeding result back into the Neural Network...")
            final_ai_response = f"I used my calculator. The exact answer is {tool_result}."
            return final_ai_response
    else:
            return "Total not found."

    else:
    return ai_output

    __name__ == "__main__"
    naive_ai_response = "The answer is 3849 * 9182 is 35, 342, 118."
    print("\n--- SCENARIO 1: NAIVE AI ---")
    print(agentic_loop(naive_ai_response))

    agent_ai_response = f'{"tool": "calculator", "equation": "3849 * 9182"}'
    print("\n--- SCENARIO 2: AGENTIC AI ---")
    print(agentic_loop(agent_ai_response)
