
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

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
        
        print("Migrating database for 'role' column...")

        # 1. Create the user_role ENUM type if it doesn't exist
        try:
            print("Creating user_role type...")
            cursor.execute("CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');")
        except psycopg2.errors.DuplicateObject:
             print("Type 'user_role' already exists. Skipping.")
        except Exception as e:
             print(f"Error creating type (might be harmless if exists): {e}")

        # 2. Add the role column to users table
        try:
            print("Adding role column to users table...")
            # We set a default to prevent null issues for existing users
            cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'candidate';")
            print("Column 'role' added successfully.")
        except Exception as e:
            print(f"Error adding column: {e}")

        print("Migration finished.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
