
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    mmr_score: int
    current_tier: str
    has_resume: bool = False

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def test_signup():
    try:
        conn = psycopg2.connect(
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD'),
            host=os.getenv('PGHOST'),
            port=os.getenv('PGPORT'),
            database=os.getenv('PGDATABASE'),
            cursor_factory=RealDictCursor
        )
        cursor = conn.cursor()
        
        username = "testuser_repro_v4"
        email = "test_repro_v4@example.com"
        # Test actual hashing
        print("Hashing password...")
        hashed_password = get_password_hash("password123")
        print(f"Hashed password: {hashed_password[:10]}...")
        role = "candidate"
        
        print(f"Attempting to signup user: {username}, {email}, {role}")
        cursor.execute("DELETE FROM users WHERE email = %s", (email,))
        
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id, username, email, role, mmr_score, current_tier, 
                      (resume_data IS NOT NULL) as has_resume
        """, (username, email, hashed_password, role))
        
        new_user = cursor.fetchone()
        conn.commit()
        print("Raw DB Response:", new_user)
        
        # Simulate Pydantic validation
        validated_user = UserResponse(**new_user)
        print("Pydantic Validation Successful:", validated_user)
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Signup FAILED with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_signup()
