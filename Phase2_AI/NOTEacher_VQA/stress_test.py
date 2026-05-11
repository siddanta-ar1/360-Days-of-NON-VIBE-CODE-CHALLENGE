import concurrent.futures
import io
import time

import requests
from PIL import Image

print("Initializing NOTEacher stress test protocol...")

API_URL = "http://127.0.0.1:8000/ask"
CONCURRENT_USERS = 50


def generate_fake_image():
    img = Image.new("RGB", (224, 224), color="red")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, formate="JPEG")
    img_byte_arr.seek(0)
    return img_byte_arr


def fire_request(user_id):
    start_time = time.time()
    fake_img_bytes = generate_fake_image()

    files = {"image": ("test.jpg", fake_img_bytes, "image/jpeg")}
    data = {"question": f"User {user_id} asks: Solve for x"}

    try:
        response = requests.post(API_URL, files=files, data=data)
        latency = (time.time() - start_time) * 1000

        if response.status_code == 200:
            return {"status": "success", "latency": latency, "user": user_id}
        else:
            return {
                "status": "failed",
                "latency": latency,
                "error": f"HTTP {response.status_code}",
            }
    except Exception as e:
        return {"status": "failed", "latency": 0, "error": str(e)}


def run_stress_test():
    print(f"Firing {CONCURRENT_USERS} simultaneous requests at {API_URL}...")
    start_test = time.time()
    results = []

    with concurrent.futures.ThreadPoolExecutor(
        max_workers=CONCURRENT_USERS
    ) as executor:
        futures = [
            executor.submit(fire_request, i) for i in range(1, CONCURRENT_USERS + 1)
        ]

        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    total_time = time.time() - start_test

    successes = [r for r in results if r["status"] == "success"]
    failures = [r for r in results if r["status"] == "failed"]

    avg_latency = (
        sum(r["latency"] for r in successes) / len(successes) if successes else 0
    )
    max_latency = max([r["latency"] for r in successes]) if successes else 0

    print("\n --- Stress test results ---")
    print(f"Total time: {total_time:.2f} seconds")
    print(f"Total Requests: {CONCURRENT_USERS}")
    print(f"Successful: {len(successes)}")
    print(f"Failed: {len(failures)}")
    print(f"Average Latency: {avg_latency:.2f} ms")
    print(f"Max Latency (Worst User Experience): {max_latency:.2f} ms")

    if len(failures) > 0:
        print("\n Server overload detected. Review errors:")
        print(failures[0]["error"])


if __name__ == "__main__":
    run_stress_test()
