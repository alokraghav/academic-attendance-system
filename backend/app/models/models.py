import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, Integer, Boolean, ForeignKey, Date, DateTime, Text, Enum, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student") # admin, faculty, student
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("Student", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("Faculty", back_populates="profile", uselist=False, cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    courses = relationship("Course", back_populates="department")
    students = relationship("Student", back_populates="department")
    faculty_members = relationship("Faculty", back_populates="department")


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    total_semesters = Column(Integer, default=6, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    department = relationship("Department", back_populates="courses")
    semesters = relationship("Semester", back_populates="course")
    subjects = relationship("Subject", back_populates="course")
    students = relationship("Student", back_populates="course")


class Semester(Base):
    __tablename__ = "semesters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    semester_number = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=False) # e.g. "2026-2027"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    course = relationship("Course", back_populates="semesters")
    subjects = relationship("Subject", back_populates="semester")
    students = relationship("Student", back_populates="current_semester")

    __table_args__ = (
        UniqueConstraint('course_id', 'semester_number', 'academic_year', name='uq_course_semester_year'),
    )


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    designation = Column(String(100), default="Assistant Professor")
    qualification = Column(String(100), nullable=True)
    joining_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("Profile", back_populates="faculty_profile")
    department = relationship("Department", back_populates="faculty_members")
    faculty_subjects = relationship("FacultySubject", back_populates="faculty")
    class_sessions = relationship("ClassSession", back_populates="faculty")


class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, nullable=False, index=True)
    registration_number = Column(String(50), unique=True, nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    current_semester_id = Column(String(36), ForeignKey("semesters.id", ondelete="SET NULL"), nullable=True)
    batch_year = Column(String(20), nullable=False) # e.g. "2024-2027"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("Profile", back_populates="student_profile")
    department = relationship("Department", back_populates="students")
    course = relationship("Course", back_populates="students")
    current_semester = relationship("Semester", back_populates="students")
    enrollments = relationship("Enrollment", back_populates="student")
    attendance_records = relationship("Attendance", back_populates="student")
    leave_applications = relationship("LeaveApplication", back_populates="student")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    semester_id = Column(String(36), ForeignKey("semesters.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    subject_type = Column(String(20), default="theory") # theory, practical
    credits = Column(Integer, default=4)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    course = relationship("Course", back_populates="subjects")
    semester = relationship("Semester", back_populates="subjects")
    faculty_assignments = relationship("FacultySubject", back_populates="subject")
    enrollments = relationship("Enrollment", back_populates="subject")
    class_sessions = relationship("ClassSession", back_populates="subject")


class FacultySubject(Base):
    __tablename__ = "faculty_subjects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    faculty_id = Column(String(36), ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    academic_year = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    faculty = relationship("Faculty", back_populates="faculty_subjects")
    subject = relationship("Subject", back_populates="faculty_assignments")

    __table_args__ = (
        UniqueConstraint('faculty_id', 'subject_id', 'academic_year', name='uq_faculty_subject_year'),
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    semester_id = Column(String(36), ForeignKey("semesters.id", ondelete="CASCADE"), nullable=False)
    academic_year = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="enrollments")
    subject = relationship("Subject", back_populates="enrollments")

    __table_args__ = (
        UniqueConstraint('student_id', 'subject_id', 'academic_year', name='uq_student_subject_year'),
    )


class ClassSession(Base):
    __tablename__ = "class_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    faculty_id = Column(String(36), ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False)
    session_date = Column(Date, nullable=False, index=True)
    session_time = Column(String(50), nullable=False) # e.g. "09:00 - 10:00 AM"
    topic = Column(String(255), nullable=True)
    session_type = Column(String(50), default="regular") # regular, extra, lab
    status = Column(String(50), default="completed") # scheduled, completed, cancelled
    created_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    subject = relationship("Subject", back_populates="class_sessions")
    faculty = relationship("Faculty", back_populates="class_sessions")
    attendance_records = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('subject_id', 'session_date', 'session_time', name='uq_session_subject_date_time'),
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("class_sessions.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False) # present, absent
    marked_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    modified_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    session = relationship("ClassSession", back_populates="attendance_records")
    student = relationship("Student", back_populates="attendance_records")

    __table_args__ = (
        UniqueConstraint('session_id', 'student_id', name='uq_session_student_attendance'),
        Index('ix_attendance_student_session', 'student_id', 'session_id'),
    )


class LeaveApplication(Base):
    __tablename__ = "leave_applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    leave_type = Column(String(50), nullable=False) # medical, academic, personal, emergency
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    document_url = Column(String(500), nullable=True)
    status = Column(String(20), default="pending", nullable=False) # pending, approved, rejected
    reviewed_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    review_remarks = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="leave_applications")
    reviewer = relationship("Profile", foreign_keys=[reviewed_by])
