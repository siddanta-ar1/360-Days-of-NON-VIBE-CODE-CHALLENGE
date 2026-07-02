# master_agent.py
import json
from openai import AsyncOpenAI
from agents.swarm_profiles import MATH_AGENT_PROMPT, CODE_AGENT_PROMPT

client = AsyncOpenAI()

# Define the Supervisor's schema for determining handoffs
ROUTER_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "handoff_to_specialist",
            "description": "Routes the user's query to the most capable specialized sub-agent.",
            "parameters": {
                "type": "object",
                "properties": {
                    "target_agent": {
                        "type": "string",
                        "enum": ["math_agent", "code_agent"],
                        "description": "The destination agent profile specializing in the query type."
                    }
                },
                "required": ["target_agent"],
            },
        }
    }
]

async def orchestrate_swarm(user_query: str):
    print(f"📡 Ingress payload received: '{user_query}'")
    
    # Initialize orchestration tracking with the Supervisor Agent
    conversation_history = [
        {"role": "system", "content": "You are the Central Supervisor Router. Analyze the request and delegate to the correct specialist via handoff_to_specialist."},
        {"role": "user", "content": user_query}
    ]

    # 1. EVALUATE INTENT
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=conversation_history,
        tools=ROUTER_TOOLS,
        tool_choice={"type": "function", "function": {"name": "handoff_to_specialist"}} # Force routing valuation
    )

    tool_call = response.choices[0].message.tool_calls[0]
    arguments = json.loads(tool_call.function.arguments)
    target = arguments["target_agent"]

    print(f"🔀 Programmatic Handoff Triggered: -> {target.upper()}")

    # 2. CONTEXT CONTEXT SWITCH & SUB-AGENT INVOKATION
    # We swap the system prompt completely to clear context contamination
    if target == "math_agent":
        conversation_history[0] = {"role": "system", "content": MATH_AGENT_PROMPT}
    elif target == "code_agent":
        conversation_history[0] = {"role": "system", "content": CODE_AGENT_PROMPT}

    # 3. EXECUTE THE WORKLOAD WITH THE SPECIALIST
    final_execution = await client.chat.completions.create(
        model="gpt-4o",
        messages=conversation_history
        # Here you would attach ONLY the specific tools bound to that target sub-agent
    )

    return final_execution.choices[0].message.content