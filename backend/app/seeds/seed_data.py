from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.core.security import get_password_hash
from backend.app.models.models import (
    Profile, Department, Course, Semester, Faculty, Student,
    Subject, FacultySubject, Enrollment, ClassSession, Attendance, LeaveApplication
)

def run_seed():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        admin_check = db.query(Profile).filter(Profile.email == "admin@smartacademic.edu").first()
        if admin_check:
            print("Database already contains seed data. Skipping seed.")
            return

        print("Seeding database with university ERP data...")

        # 1. Admin
        admin_profile = Profile(
            email="admin@smartacademic.edu",
            full_name="Dr. Alok Raghav (Admin)",
            role="admin",
            phone="+91-9876543210",
            hashed_password=get_password_hash("Admin@123"),
            is_active=True
        )
        db.add(admin_profile)

        # 2. Departments
        dept_bca = Department(
            code="BCA",
            name="Department of Computer Applications",
            description="Department offering Undergraduate & Postgraduate Computer Science Degrees."
        )
        dept_it = Department(
            code="IT",
            name="Department of Information Technology",
            description="Department focusing on Applied IT, Cloud Infrastructure and Cyber Security."
        )
        db.add_all([dept_bca, dept_it])
        db.flush()

        # 3. Courses
        course_bca = Course(
            department_id=dept_bca.id,
            code="BCA-3YR",
            name="Bachelor of Computer Applications",
            total_semesters=6
        )
        course_bscit = Course(
            department_id=dept_it.id,
            code="BSCIT-3YR",
            name="B.Sc. in Information Technology",
            total_semesters=6
        )
        db.add_all([course_bca, course_bscit])
        db.flush()

        # 4. Semesters
        sem6 = Semester(
            course_id=course_bca.id,
            semester_number=6,
            academic_year="2026-2027",
            is_active=True
        )
        sem5 = Semester(
            course_id=course_bca.id,
            semester_number=5,
            academic_year="2026-2027",
            is_active=False
        )
        db.add_all([sem6, sem5])
        db.flush()

        # 5. Subjects for BCA Semester 6
        subjects_data = [
            ("BCA601", "Python Full-Stack Web Development", "theory", 4),
            ("BCA602", "Cloud Computing & DevOps", "theory", 4),
            ("BCA603", "Information Security & Cyber Forensics", "theory", 4),
            ("BCA604", "Data Analytics & Machine Learning", "theory", 4),
            ("BCA605", "Major Capstone Project", "practical", 6),
        ]
        subjects = []
        for code, name, stype, creds in subjects_data:
            sub = Subject(
                course_id=course_bca.id,
                semester_id=sem6.id,
                code=code,
                name=name,
                subject_type=stype,
                credits=creds
            )
            db.add(sub)
            subjects.append(sub)
        db.flush()

        # 6. Faculty Profiles & Faculty Records (3 Faculty)
        faculty_info = [
            ("rajesh.sharma@smartacademic.edu", "Dr. Rajesh Sharma", "FAC-CS-001", "Professor & HOD", "Ph.D. in Computer Science", date(2018, 7, 1)),
            ("meenakshi.verma@smartacademic.edu", "Dr. Meenakshi Verma", "FAC-CS-002", "Associate Professor", "Ph.D. in Information Systems", date(2020, 1, 15)),
            ("amit.patel@smartacademic.edu", "Prof. Amit Patel", "FAC-CS-003", "Assistant Professor", "M.Tech in Software Engineering", date(2021, 8, 10)),
        ]
        faculty_records = []
        for email, name, emp_id, desig, qual, jdate in faculty_info:
            prof = Profile(
                email=email,
                full_name=name,
                role="faculty",
                phone="+91-9812345678",
                hashed_password=get_password_hash("Faculty@123"),
                is_active=True
            )
            db.add(prof)
            db.flush()

            fac = Faculty(
                profile_id=prof.id,
                employee_id=emp_id,
                department_id=dept_bca.id,
                designation=desig,
                qualification=qual,
                joining_date=jdate
            )
            db.add(fac)
            faculty_records.append(fac)
        db.flush()

        # Assign Faculty to Subjects
        # Dr. Rajesh -> BCA601, BCA605
        # Dr. Meenakshi -> BCA602, BCA604
        # Prof. Amit -> BCA603
        fac_subs = [
            (faculty_records[0].id, subjects[0].id),
            (faculty_records[0].id, subjects[4].id),
            (faculty_records[1].id, subjects[1].id),
            (faculty_records[1].id, subjects[3].id),
            (faculty_records[2].id, subjects[2].id),
        ]
        for f_id, s_id in fac_subs:
            fs = FacultySubject(
                faculty_id=f_id,
                subject_id=s_id,
                academic_year="2026-2027",
                is_active=True
            )
            db.add(fs)
        db.flush()

        # 7. 25 Fictional Students
        student_names = [
            "Aarav Mehta", "Aditi Sharma", "Alok Kumar", "Ananya Iyer", "Aryan Singh",
            "Bhavya Joshi", "Chirag Nair", "Devansh Gupta", "Diya Malhotra", "Gaurav Sen",
            "Isha Kapoor", "Kabir Roy", "Khushi Agarwal", "Manish Tiwari", "Neha Verma",
            "Pranav Rao", "Pooja Hegde", "Rahul Chawla", "Riya Saxena", "Rohan Das",
            "Siddharth Bhatt", "Simran Gill", "Sneha Kulkarni", "Tanmay Deshmukh", "Yash Chopra"
        ]

        students = []
        for i, name in enumerate(student_names, start=1):
            roll = f"2024BCA{i:03d}"
            reg = f"REG2024BCA{i:04d}"
            email = f"student{i:02d}@smartacademic.edu"
            
            p = Profile(
                email=email,
                full_name=name,
                role="student",
                phone=f"+91-99000{i:05d}",
                hashed_password=get_password_hash("Student@123"),
                is_active=True
            )
            db.add(p)
            db.flush()

            st = Student(
                profile_id=p.id,
                roll_number=roll,
                registration_number=reg,
                department_id=dept_bca.id,
                course_id=course_bca.id,
                current_semester_id=sem6.id,
                batch_year="2024-2027"
            )
            db.add(st)
            students.append(st)
        db.flush()

        # Enroll all 25 students in the 5 subjects of BCA Semester 6
        for st in students:
            for sub in subjects:
                enr = Enrollment(
                    student_id=st.id,
                    subject_id=sub.id,
                    semester_id=sem6.id,
                    academic_year="2026-2027"
                )
                db.add(enr)
        db.flush()

        # 8. Conducted Class Sessions across the last 15 days
        today = date.today()
        sessions = []
        topics_by_sub = {
            subjects[0].id: ["FastAPI REST Endpoints", "SQLAlchemy ORM Mapping", "Pydantic Schema Validation", "JWT Authentication Flow", "Pandas Data Processing"],
            subjects[1].id: ["AWS vs GCP Architecture", "Docker Containerization", "Kubernetes Pod Management", "CI/CD Pipeline Setup", "Serverless Functions"],
            subjects[2].id: ["Symmetric & Asymmetric Encryption", "Network Firewalls", "SQL Injection Prevention", "OWASP Top 10 Vulnerabilities", "Digital Forensics"],
            subjects[3].id: ["Pandas DataFrames", "Data Cleaning Techniques", "Supervised Learning Models", "Model Evaluation Metrics", "Confusion Matrix Analysis"],
            subjects[4].id: ["SRS Review & Schema Design", "Sprint 1 Code Review", "UI/UX Mockup Verification", "Database Migration Testing", "API Integration Session"]
        }

        # Create 15 class sessions across past dates
        session_dates = [today - timedelta(days=k) for k in range(1, 16) if (today - timedelta(days=k)).weekday() < 5] # Weekdays
        
        session_counter = 0
        for s_date in session_dates:
            # 2 sessions per date
            for sub_idx in [0, 1]:
                sub = subjects[sub_idx]
                f_id = faculty_records[0].id if sub_idx == 0 else faculty_records[1].id
                t_list = topics_by_sub[sub.id]
                topic_title = t_list[session_counter % len(t_list)]

                sess = ClassSession(
                    subject_id=sub.id,
                    faculty_id=f_id,
                    session_date=s_date,
                    session_time="09:00 - 10:00 AM" if sub_idx == 0 else "11:15 - 12:15 PM",
                    topic=topic_title,
                    session_type="regular",
                    status="completed",
                    created_by=admin_profile.id
                )
                db.add(sess)
                sessions.append(sess)
            session_counter += 1
        db.flush()

        # 9. Attendance Records
        # Create realistic distribution:
        # Students 1 to 18: high attendance (85% - 100%)
        # Students 19 to 21: borderline attendance (75% - 80%)
        # Students 22 to 25: defaulters (attendance < 75%, e.g., 50% - 65%)
        for sess in sessions:
            for idx, st in enumerate(students):
                # Determine presence
                if idx < 18:
                    # Very high presence (~90%)
                    is_present = (idx + sess.session_date.day) % 8 != 0
                elif idx < 21:
                    # Borderline (~78%)
                    is_present = (idx + sess.session_date.day) % 4 != 0
                else:
                    # Defaulter (< 70%)
                    is_present = (idx + sess.session_date.day) % 3 == 0

                att = Attendance(
                    session_id=sess.id,
                    student_id=st.id,
                    status="present" if is_present else "absent",
                    marked_by=admin_profile.id,
                    modified_by=None,
                    remarks="Regular session" if is_present else "Absent without prior leave",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(att)
        db.flush()

        # 10. Sample Leave Applications
        leaves_data = [
            (students[0].id, "medical", today - timedelta(days=5), today - timedelta(days=3), "High viral fever diagnosed by physician, advised complete bed rest.", "approved", admin_profile.id, "Medical certificate verified. Approved."),
            (students[1].id, "academic", today - timedelta(days=2), today - timedelta(days=1), "Attending Smart India Hackathon zonal round at IIT Delhi.", "approved", faculty_records[0].profile_id, "Official university participation sanctioned."),
            (students[21].id, "personal", today + timedelta(days=1), today + timedelta(days=3), "Attending elder brother's wedding ceremony in home town.", "pending", None, None),
            (students[22].id, "medical", today - timedelta(days=7), today - timedelta(days=6), "Dental surgery with severe toothache.", "approved", faculty_records[1].profile_id, "Doctor prescription attached and verified."),
            (students[23].id, "emergency", today - timedelta(days=10), today - timedelta(days=9), "Family emergency travel.", "rejected", faculty_records[0].profile_id, "Applied after 5 days of absence without prior intimation."),
        ]
        for st_id, ltype, sdate, edate, reason, stat, rev_by, remarks in leaves_data:
            leave = LeaveApplication(
                student_id=st_id,
                leave_type=ltype,
                start_date=sdate,
                end_date=edate,
                reason=reason,
                document_url="https://smartacademic.edu/docs/sample_doc.pdf",
                status=stat,
                reviewed_by=rev_by,
                review_remarks=remarks,
                reviewed_at=datetime.now(timezone.utc) if rev_by else None
            )
            db.add(leave)

        db.commit()
        print("Database successfully seeded with academic dataset!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
