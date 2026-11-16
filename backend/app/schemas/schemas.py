from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import date, datetime

# Token & Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Profile
class ProfileBase(BaseModel):
    email: str
    full_name: str
    role: str # admin, faculty, student
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True

class ProfileCreate(ProfileBase):
    password: str

class ProfileOut(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Department
class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Course
class CourseBase(BaseModel):
    department_id: str
    code: str
    name: str
    total_semesters: int = 6

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: str
    created_at: datetime
    department_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Semester
class SemesterBase(BaseModel):
    course_id: str
    semester_number: int
    academic_year: str
    is_active: bool = True

class SemesterCreate(SemesterBase):
    pass

class SemesterOut(SemesterBase):
    id: str
    created_at: datetime
    course_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Subject
class SubjectBase(BaseModel):
    course_id: str
    semester_id: str
    code: str
    name: str
    subject_type: str = "theory"
    credits: int = 4

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: str
    created_at: datetime
    course_code: Optional[str] = None
    semester_number: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

# Faculty
class FacultyCreate(BaseModel):
    email: str
    full_name: str
    password: str
    phone: Optional[str] = None
    employee_id: str
    department_id: Optional[str] = None
    designation: str = "Assistant Professor"
    qualification: Optional[str] = None
    joining_date: Optional[date] = None

class FacultyOut(BaseModel):
    id: str
    profile_id: str
    employee_id: str
    department_id: Optional[str] = None
    designation: str
    qualification: Optional[str] = None
    joining_date: Optional[date] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    department_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Student
class StudentCreate(BaseModel):
    email: str
    full_name: str
    password: str
    phone: Optional[str] = None
    roll_number: str
    registration_number: str
    department_id: Optional[str] = None
    course_id: Optional[str] = None
    current_semester_id: Optional[str] = None
    batch_year: str

class StudentOut(BaseModel):
    id: str
    profile_id: str
    roll_number: str
    registration_number: str
    department_id: Optional[str] = None
    course_id: Optional[str] = None
    current_semester_id: Optional[str] = None
    batch_year: str
    full_name: str
    email: str
    phone: Optional[str] = None
    department_name: Optional[str] = None
    course_name: Optional[str] = None
    semester_number: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Faculty Subject Assignment
class FacultySubjectCreate(BaseModel):
    faculty_id: str
    subject_id: str
    academic_year: str
    is_active: bool = True

class FacultySubjectOut(BaseModel):
    id: str
    faculty_id: str
    subject_id: str
    academic_year: str
    is_active: bool
    faculty_name: Optional[str] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Enrollment
class EnrollmentCreate(BaseModel):
    student_id: str
    subject_id: str
    semester_id: str
    academic_year: str

class EnrollmentOut(BaseModel):
    id: str
    student_id: str
    subject_id: str
    semester_id: str
    academic_year: str
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Class Session
class ClassSessionCreate(BaseModel):
    subject_id: str
    session_date: date
    session_time: str # e.g. "09:00 - 10:00 AM"
    topic: Optional[str] = None
    session_type: str = "regular"
    status: str = "completed"

class ClassSessionOut(BaseModel):
    id: str
    subject_id: str
    faculty_id: str
    session_date: date
    session_time: str
    topic: Optional[str] = None
    session_type: str
    status: str
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    faculty_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Attendance
class AttendanceRecordInput(BaseModel):
    student_id: str
    status: str # "present" or "absent"
    remarks: Optional[str] = None

class AttendanceBatchSubmit(BaseModel):
    session_id: Optional[str] = None
    subject_id: Optional[str] = None
    session_date: Optional[date] = None
    session_time: Optional[str] = None
    topic: Optional[str] = None
    session_type: Optional[str] = "regular"
    records: List[AttendanceRecordInput]

class AttendanceOut(BaseModel):
    id: str
    session_id: str
    student_id: str
    status: str
    remarks: Optional[str] = None
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    marked_by_name: Optional[str] = None
    modified_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Leave Applications
class LeaveApplicationCreate(BaseModel):
    leave_type: str # medical, academic, personal, emergency
    start_date: date
    end_date: date
    reason: str
    document_url: Optional[str] = None

class LeaveApplicationReview(BaseModel):
    status: str # "approved" or "rejected"
    review_remarks: Optional[str] = None

class LeaveApplicationOut(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    document_url: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    reviewer_name: Optional[str] = None
    review_remarks: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Defaulter Item
class DefaulterItem(BaseModel):
    student_id: str
    student_name: str
    roll_number: str
    registration_number: str
    subject_id: str
    subject_code: str
    subject_name: str
    attended_classes: int
    total_classes: int
    attendance_percentage: float
    additional_classes_needed: int
