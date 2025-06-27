#common/realtime.py
import os
import threading
import httpx

# Where the gateway lives
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:9000")
INTERNAL_SECRET = os.getenv("GATEWAY_INTERNAL_SECRET", "dev-secret")

def push_message(user_id: str, payload: dict):
    """
    Persistently fire-and-forget an HTTP POST to the gateway.
    Runs in a background thread to avoid blocking.
    """
    def _send():
        try:
            response = httpx.post(
                f"{GATEWAY_URL}/publish",
                params={"uid": user_id},
                json=payload,
                headers={"secret": INTERNAL_SECRET},
                timeout=5.0
            )
            response.raise_for_status()
        except Exception as e:
            # Log but do not bubble up
            print(f"[realtime] Failed to push message to {user_id}: {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
