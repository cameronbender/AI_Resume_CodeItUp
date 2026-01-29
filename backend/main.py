import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import Optional

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # The frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Pydantic Models
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "candidate"  # "candidate" or "recruiter"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    mmr_score: int
    current_tier: str

def get_db_connection():
    try:
        conn = psycopg2.connect(
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD'),
            host=os.getenv('PGHOST'),
            port=os.getenv('PGPORT'),
            database=os.getenv('PGDATABASE'),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

@app.get("/")
def read_root():
    return {"message": "Gauntlet.io API is running"}

# Auth Endpoints
@app.post("/api/auth/signup", response_model=UserResponse)
def signup(user: UserSignup):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE email = %s OR username = %s", (user.email, user.username))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create user
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id, username, email, role, mmr_score, current_tier
        """, (user.username, user.email, hashed_password, user.role))
        
        new_user = cursor.fetchone()
        conn.commit()
        
        return dict(new_user)
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        cursor.close()
        conn.close()

@app.post("/api/auth/login", response_model=UserResponse)
def login(user_credentials: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (user_credentials.email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Credentials"
            )
            
        if not verify_password(user_credentials.password, user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Credentials"
            )
            
        return {
            "user_id": str(user['user_id']),
            "username": user['username'],
            "email": user['email'],
            "role": user['role'],
            "mmr_score": user['mmr_score'],
            "current_tier": user['current_tier']
        }
        
    finally:
        cursor.close()
        conn.close()

@app.get("/api/jobs")
def get_jobs(page: int = 1, limit: int = 20):
    conn = get_db_connection()
    cursor = conn.cursor()
    offset = (page - 1) * limit
    try:
        # Get total count
        cursor.execute("SELECT count(*) FROM jobs WHERE is_active = TRUE")
        total = cursor.fetchone()['count']

        # Get paginated data
        cursor.execute("""
            SELECT job_id, company_name, job_title, description, weights, is_active, source_file, owner_id, created_at 
            FROM jobs 
            WHERE is_active = TRUE 
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        jobs = cursor.fetchall()
        
        return {
            "data": [dict(row) for row in jobs],
            "total": total,
            "page": page,
            "limit": limit
        }
    finally:
        cursor.close()
        conn.close()

@app.get("/api/leaderboard")
def get_leaderboard(page: int = 1, limit: int = 20, search: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    offset = (page - 1) * limit
    
    # Enforce limit of 500 total results
    max_total = 500
    
    try:
        # Build query parts
        base_query = "FROM global_leaderboard WHERE global_rank <= 500"
        params = []
        
        if search:
            base_query += " AND username ILIKE %s"
            params.append(f"%{search}%")
            
        # Get total count (capped at 500)
        cursor.execute(f"SELECT count(*) {base_query}", tuple(params))
        total = cursor.fetchone()['count']
        
        # Get data
        query = f"SELECT * {base_query} ORDER BY global_rank ASC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, tuple(params))
        leaderboard = cursor.fetchall()
        
        return {
            "data": [dict(row) for row in leaderboard],
            "total": total,
            "page": page,
            "limit": limit
        }
    finally:
        cursor.close()
        conn.close()

@app.get("/api/users/{username}")
def get_user(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(user)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    # Run on port 3000
    uvicorn.run(app, host="0.0.0.0", port=3000)
