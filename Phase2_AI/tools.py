# tools.py
import io
import base64
import numpy as np
import matplotlib
import sympy as sp

# Force Matplotlib to use a headless backend so it doesn't try to open GUI windows on your Linux server
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def generate_math_plot(expression_str: str) -> str:
    """
    Evaluates an algebraic expression, plots it on a Cartesian plane, 
    and returns a base64 Markdown image string.
    """
    print(f"📈 EXECUTING TOOL: generate_math_plot({expression_str})")
    
    try:
        # 1. PARSE THE MATH SAFELY
        x = sp.Symbol('x')
        # Use sympify to safely convert the string to a mathematical object
        expr = sp.sympify(expression_str)
        
        # Convert the SymPy expression into a fast, executable NumPy function
        f = sp.lambdify(x, expr, "numpy")
        
        # 2. GENERATE THE COORDINATES
        # Create an array of 400 points between -10 and 10 for a smooth curve
        x_vals = np.linspace(-10, 10, 400)
        y_vals = f(x_vals)
        
        # 3. DRAW THE CANVAS
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.plot(x_vals, y_vals, color='#3B82F6', linewidth=2)
        
        # Format the grid to look like a professional math textbook
        ax.axhline(0, color='black', linewidth=1)
        ax.axvline(0, color='black', linewidth=1)
        ax.grid(True, linestyle='--', alpha=0.6)
        ax.set_title(f"$f(x) = {sp.latex(expr)}$")
        
        # 4. BUFFER & ENCODE (Zero Disk I/O)
        buf = io.BytesIO()
        # Save directly to RAM buffer as a high-quality PNG
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        plt.close(fig) # Free the memory!
        
        buf.seek(0)
        base64_img = base64.b64encode(buf.read()).decode('utf-8')
        
        # 5. RETURN MARKDOWN
        # The AI will read this string and pass it directly to the Next.js frontend
        return f"![Generated Plot](data:image/png;base64,{base64_img})"

    except Exception as e:
        return f"Plot generation failed: {str(e)}"