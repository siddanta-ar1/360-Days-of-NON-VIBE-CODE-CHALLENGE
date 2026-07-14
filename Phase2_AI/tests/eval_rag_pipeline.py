# tests/eval_rag_pipeline.py
import json
import asyncio
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# 1. THE JUDGE'S PROMPT
# We strictly define the evaluation criteria and force a JSON schema output
EVALUATOR_SYSTEM_PROMPT = """You are an impartial, strict Evaluation AI. 
Your job is to evaluate if an AI Agent's answer is FAITHFUL to the retrieved context.
Faithfulness means the answer is derived STRICTLY from the provided context. 
If the answer contains any claims, numbers, or facts not present in the context (a hallucination), it is unfaithful.

You must return a JSON object with this exact schema:
{
    "faithfulness_score": int, // 1 if faithful, 0 if unfaithful (hallucinated)
    "reasoning": str // A brief explanation of why it passed or failed
}
"""

async def evaluate_faithfulness(question: str, context: str, agent_answer: str) -> dict:
    """Passes the test data to the Judge LLM to compute a semantic score."""
    
    evaluation_prompt = f"""
    QUESTION: {question}
    RETRIEVED CONTEXT: {context}
    AGENT'S ANSWER: {agent_answer}
    
    Evaluate the FAITHFULNESS of the Agent's answer to the Context.
    """
    
    # 2. TRIGGER THE JUDGE
    response = await client.chat.completions.create(
        model="gpt-4o",
        temperature=0.0, # Zero creativity for strict, reproducible grading
        response_format={ "type": "json_object" },
        messages=[
            {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
            {"role": "user", "content": evaluation_prompt}
        ]
    )
    
    # 3. PARSE THE SCORE
    result = json.loads(response.choices[0].message.content)
    return result

async def run_test_suite():
    print("🧪 Initiating LLM-as-a-Judge Evaluation Pipeline...")
    
    # 4. DEFINE THE TEST CASES
    test_cases = [
        {
            "id": "TC-01-PASS",
            "question": "What are the two branches of calculus?",
            "context": "Calculus has two main branches: differential calculus and integral calculus.",
            "agent_answer": "The two branches are differential and integral calculus." # Perfect
        },
        {
            "id": "TC-02-FAIL-HALLUCINATION",
            "question": "Who invented calculus?",
            "context": "Calculus is the mathematical study of continuous change.",
            "agent_answer": "Calculus is the study of continuous change, invented by Isaac Newton and Gottfried Wilhelm Leibniz." # Hallucinated (True, but not in context)
        }
    ]
    
    passed = 0
    
    for case in test_cases:
        print(f"\nRunning {case['id']}...")
        eval_result = await evaluate_faithfulness(
            case["question"], case["context"], case["agent_answer"]
        )
        
        score = eval_result["faithfulness_score"]
        reason = eval_result["reasoning"]
        
        if score == 1:
            print(f" PASS: {reason}")
            passed += 1
        else:
            print(f" FAIL (Hallucination Detected): {reason}")
            
    print(f"\n Test Suite Complete: {passed}/{len(test_cases)} Passed.")
    
    # Exit with a 1 (Error) if any tests fail, which is required to stop CI/CD pipelines
    if passed < len(test_cases):
        exit(1)

if __name__ == "__main__":
    asyncio.run(run_test_suite())