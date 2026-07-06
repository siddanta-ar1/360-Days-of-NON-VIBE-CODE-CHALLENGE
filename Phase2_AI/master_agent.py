# master_agent.py (Append to your AGENT_TOOLS array)
{
    "type": "function",
    "function": {
        "name": "generate_math_plot",
        "description": "Generates a visual 2D graph of a mathematical function. Use this whenever the user asks to see a graph, plot, or visual representation of an equation.",
        "parameters": {
            "type": "object",
            "properties": {
                "expression_str": {
                    "type": "string",
                    "description": "The function of x to plot, e.g., 'x**2 - 4' or 'sin(x)'",
                }
            },
            "required": ["expression_str"],
        },
    }
}