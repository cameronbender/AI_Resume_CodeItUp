import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def migrate():
    try:
        conn = psycopg2.connect(
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD'),
            host=os.getenv('PGHOST'),
            port=os.getenv('PGPORT'),
            database=os.getenv('PGDATABASE')
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Checking/Adding resume_data column...")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_data BYTEA;")
        
        print("Checking/Adding resume_filename column...")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_filename VARCHAR(255);")
        
        print("Migration successful: Columns added (if they didn't exist).")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
