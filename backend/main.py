import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

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
def get_leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM global_leaderboard")
        leaderboard = cursor.fetchall()
        return [dict(row) for row in leaderboard]
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
