# 1. THE BASE IMAGE
# We use a 'slim' Debian Linux image pre-loaded with Python 3.11 to keep the file size tiny
FROM python:3.11-slim

# 2. SYSTEM DEPENDENCIES
# Neural networks often require underlying C++ build tools that don't come with slim Python
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 3. THE WORKING DIRECTORY
# We create a folder inside the container's isolated file system
WORKDIR /app

# 4. CACHE OPTIMIZATION
# Copy ONLY the requirements file first. If your code changes but your dependencies don't, 
# Docker will instantly skip the heavy pip install step!
COPY requirements.txt .

# 5. INSTALL PYTHON PACKAGES
# We use --no-cache-dir to prevent pip from saving downloaded zip files, keeping the container light
RUN pip install --no-cache-dir -r requirements.txt

# 6. COPY THE APPLICATION CODE
# Now copy the rest of your Python scripts, ONNX models, and tests into the /app directory
COPY . .

# 7. EXPOSE THE PORT
# Tell the container's internal firewall to allow traffic on port 8000
EXPOSE 8000

# 8. THE BOOT COMMAND
# When the container is turned on, run the FastAPI Uvicorn server
CMD ["uvicorn", "master_agent:app", "--host", "0.0.0.0", "--port", "8000"]