
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

def check_defaults():
    try:
        conn = psycopg2.connect(
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD'),
            host=os.getenv('PGHOST'),
            port=os.getenv('PGPORT'),
            database=os.getenv('PGDATABASE')
        )
        cursor = conn.cursor()
        
        print("Checking defaults for 'users' table in 'public' schema:")
        cursor.execute("""
            SELECT column_name, column_default, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public';
        """)
        columns = cursor.fetchall()
        for col in columns:
            print(f"Column: {col[0]}, Default: {col[1]}, Nullable: {col[2]}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_defaults()
