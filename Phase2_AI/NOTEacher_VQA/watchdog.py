# watchdog.py
import urllib.request
import urllib.error
import json
import os
import datetime

# 1. CONFIGURATION
# Point this to your live production server
TARGET_URL = "https://noteacher.com/api/health"
# Load the Slack Webhook from the environment securely
SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL")

def send_slack_alert(error_message):
    """Fires a critical alert to the engineering team."""
    timestamp = datetime.datetime.utcnow().isoformat()
    
    payload = {
        "text": " *PRODUCTION OUTAGE DETECTED* ",
        "attachments": [
            {
                "color": "#ff0000",
                "fields": [
                    {"title": "Target", "value": TARGET_URL, "short": True},
                    {"title": "Time (UTC)", "value": timestamp, "short": True},
                    {"title": "Diagnostic", "value": error_message, "short": False}
                ]
            }
        ]
    }
    
    req = urllib.request.Request(SLACK_WEBHOOK, method="POST")
    req.add_header('Content-Type', 'application/json')
    urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8'))
    print("Alert dispatched to Slack.")

def ping_server():
    """Checks the health endpoint with a strict 5-second timeout."""
    print(f"Pinging {TARGET_URL}...")
    try:
        # A 5-second timeout ensures we catch frozen servers, not just dead ones
        response = urllib.request.urlopen(TARGET_URL, timeout=5)
        
        if response.getcode() == 200:
            print(" System Nominal. API is responsive.")
        else:
            send_slack_alert(f"Non-200 Status Code Returned: {response.getcode()}")
            
    except urllib.error.URLError as e:
        send_slack_alert(f"Connection Failed: {str(e.reason)}")
    except TimeoutError:
        send_slack_alert("Request Timed Out (Exceeded 5000ms). Server may be frozen.")
    except Exception as e:
        send_slack_alert(f"Fatal Watchdog Exception: {str(e)}")

if __name__ == "__main__":
    if not SLACK_WEBHOOK:
        print("ERROR: SLACK_WEBHOOK_URL environment variable missing.")
    else:
        ping_server()