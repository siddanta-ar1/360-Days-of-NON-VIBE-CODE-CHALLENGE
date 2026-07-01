# master_agent.py (The Agentic Loop)
async def generate_agentic_response(messages: list):
    # FIRST PASS: Ask the LLM to think
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=AGENT_TOOLS,
        tool_choice="auto", # Let the AI decide if a tool is needed
    )
    
    response_message = response.choices[0].message
    
    # 2. THE INTERCEPT
    # Check if the LLM decided it needs to use a tool
    tool_calls = response_message.tool_calls
    
    if tool_calls:
        # Append the AI's tool request to the memory
        messages.append(response_message)
        
        # 3. THE EXECUTION
        for tool_call in tool_calls:
            if tool_call.function.name == "safe_math_eval":
                # Parse the JSON arguments provided by the AI
                args = json.loads(tool_call.function.arguments)
                
                # RUN THE LOCAL PYTHON CODE
                computation_result = safe_math_eval(args["expression"])
                
                # Append the deterministic result back to the conversation
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": "safe_math_eval",
                    "content": computation_result,
                })
        
        # 4. THE SYNTHESIS (SECOND PASS)
        # Send the conversation back to the LLM so it can read the computation result
        final_response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        return final_response.choices[0].message.content
        
    else:
        # No tools needed, just return the standard text response
        return response_message.content