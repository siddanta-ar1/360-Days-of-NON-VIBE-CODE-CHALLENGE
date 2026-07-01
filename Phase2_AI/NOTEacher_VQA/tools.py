# tools.py
import ast
import operator

def safe_math_eval(expression: str) -> str:
    """
    Safely evaluates a mathematical string without using the dangerous eval() function.
    Supports basic arithmetic operators.
    """
    print(f"⚙️ EXECUTING TOOL: safe_math_eval({expression})")
    try:
        # A simple, secure parser for arithmetic (for production, use a library like sympy)
        allowed_operators = {
            ast.Add: operator.add, ast.Sub: operator.sub, 
            ast.Mult: operator.mul, ast.Div: operator.truediv, 
            ast.Pow: operator.pow
        }
        
        def eval_node(node):
            if isinstance(node, ast.Constant):
                return node.value
            elif isinstance(node, ast.BinOp):
                left = eval_node(node.left)
                right = eval_node(node.right)
                return allowed_operators[type(node.op)](left, right)
            else:
                raise ValueError("Unsupported operation")
                
        tree = ast.parse(expression, mode='eval')
        result = eval_node(tree.body)
        return str(result)
        
    except Exception as e:
        return f"Error calculating expression: {str(e)}"