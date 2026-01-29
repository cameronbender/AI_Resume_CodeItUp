
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

def check_schema():
    try:
        conn = psycopg2.connect(
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD'),
            host=os.getenv('PGHOST'),
            port=os.getenv('PGPORT'),
            database=os.getenv('PGDATABASE')
        )
        cursor = conn.cursor()
        
        print("Checking 'users' table columns:")
        cursor.execute("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'users';")
        columns = cursor.fetchall()
        for col in columns:
            print(col)
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
