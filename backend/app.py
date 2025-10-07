from fastapi import FastAPI
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="InsightX - Jobs API")

# Connect to your PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    database="insightx",
    user="postgres",
    password="anuj",  # Replace with your PostgreSQL password
    cursor_factory=RealDictCursor
)
cur = conn.cursor()

# GET all jobs or filter by skill/company
@app.get("/jobs")
def get_jobs(skill: str = None, company: str = None):
    query = "SELECT * FROM jobs"
    params = []
    if skill:
        query += " WHERE skills ILIKE %s"
        params.append(f"%{skill}%")
    elif company:
        query += " WHERE company ILIKE %s"
        params.append(f"%{company}%")
    query += ";"
    cur.execute(query, params)
    return cur.fetchall()

# POST a new job
@app.post("/jobs")
def add_job(title: str, company: str, skills: str, salary_range: str, location: str):
    cur.execute(
        "INSERT INTO jobs (title, company, skills, salary_range, location) VALUES (%s,%s,%s,%s,%s) RETURNING id;",
        (title, company, skills, salary_range, location)
    )
    conn.commit()
    new_id = cur.fetchone()["id"]
    return {"message": "Job added", "id": new_id}
