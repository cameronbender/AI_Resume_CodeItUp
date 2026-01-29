
from fastapi.testclient import TestClient
from main import app
import os
from dotenv import load_dotenv

# Load env vars manually just in case
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

client = TestClient(app)

def test_signup_endpoint():
    payload = {
        "username": "api_test_user_v1",
        "email": "api_test_v1@example.com",
        "password": "password123",
        "role": "candidate"
    }
    
    # Clean up before test
    import psycopg2
    try:
        conn = psycopg2.connect(
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD'),
            host=os.getenv('PGHOST'),
            port=os.getenv('PGPORT'),
            database=os.getenv('PGDATABASE')
        )
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE email = %s", (payload['email'],))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Cleanup failed (might be fine): {e}")

    print("Sending POST /api/auth/signup request...")
    response = client.post("/api/auth/signup", json=payload)
    
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response JSON: {response.json()}")
    except Exception as e:
        print(f"Could not parse JSON: {e}")
        print(f"Raw Text: {response.text}")

if __name__ == "__main__":
    test_signup_endpoint()
