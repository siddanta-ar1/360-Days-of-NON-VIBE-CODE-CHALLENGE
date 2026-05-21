import io 
import contextlib
print("Initializing NOTEacher REPL execution environment...")

def execute_python(code_string):
    print(f"[TOOL ACTIVATED] Executing AI-GENERATED Python Script:\n{'-'*40}\n{code_string.strip()}\n{'-'*40}")
    stdout_trap = io.StringIO()

    try:
        with contextlib.redirect_stdout(stdout_trap):
            exec(code_string, {}, {})
        
        output = stdout_trap.getvalue()

        if not output:
            output = "[Executed Successfully, but script did not print() any output.]"
        
        print(f"[TOOL SUCCESS] Standard Output:\n{output.strip()}")
        return output.strip()
    
    except Exception as e:
        error_msg = f"Runtime Error: {str(e)}"
        print(f"[Tool Failed] {error_msg}]")
        return error_msg
    

if __name__ == "__main__":

    ai_generated_script = """

    def fibonacci(n):
        sequence = [0, 1]
        while len(sequence) < n:
            sequence.append(sequence[-1] + sequence[-2])
        return sequence
    print(fibonacci(10))
        """
    print("\n--- Scenario: agentic code execution ---")
    
    print("Ai thought: 'This requires an algorithm. I will write and run a Python scriptl ")
    repl_output = execute_python(ai_generated_script)

    print(f"\n Injecting REPL output into Neural Network context...")
    final_ai_response =f"I ran the algorithm. The first 10 Fibonacci numbers are: {repl_output}."
    
print(f"\n Final AI Answer: {final_ai_response}")