import math
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.models import (
    Attendance, ClassSession, Student, Subject, Enrollment, Profile, Course, Department
)

def calculate_percentage(attended_classes: int, total_classes: int) -> float:
    """
    Formula: Attendance Percentage = (Attended Classes / Total Conducted Classes) * 100
    Handles division by zero.
    Rounds to 2 decimal places.
    """
    if total_classes <= 0:
        return 0.0
    percentage = (attended_classes / total_classes) * 100.0
    return round(percentage, 2)


def is_defaulter(attendance_percentage: float) -> bool:
    """
    DEF AULTER RULE:
    Attendance below 75% = Defaulter (True)
    Exactly 75.00% = Not a defaulter (False)
    Examples:
      74.99% -> True
      75.00% -> False
      80.00% -> False
    """
    return round(attendance_percentage, 2) < 75.00


def calculate_required_classes(attended_classes: int, total_classes: int, target_percentage: float = 75.0) -> int:
    """
    Calculates the minimum additional consecutive classes a student must attend 
    to achieve the target percentage (75.0%).
    Formula:
      (attended + x) / (total + x) >= target/100
      attended + x >= 0.75 * (total + x)
      0.25 * x >= 0.75 * total - attended
      x >= (0.75 * total - attended) / 0.25
    If already >= 75.0% or total is 0, returns 0.
    """
    if total_classes <= 0:
        return 0
    current_pct = calculate_percentage(attended_classes, total_classes)
    if not is_defaulter(current_pct):
        return 0
    
    # Calculate required additional classes
    needed = (0.75 * total_classes - attended_classes) / 0.25
    return max(0, math.ceil(needed))


class AttendanceService:
    @staticmethod
    def get_student_subject_attendance(db: Session, student_id: str, subject_id: str) -> Dict[str, Any]:
        """
        Computes completed class sessions for the subject, attended classes for the student,
        percentage, defaulter status, and required classes to reach 75%.
        Note: Only completed sessions (non-cancelled) are counted.
        Approved leave does not count as attendance.
        """
        # Count total completed sessions for this subject
        total_conducted = (
            db.query(func.count(ClassSession.id))
            .filter(
                ClassSession.subject_id == subject_id,
                ClassSession.status == "completed"
            )
            .scalar() or 0
        )

        # Count attended sessions (status == 'present')
        attended = (
            db.query(func.count(Attendance.id))
            .join(ClassSession, Attendance.session_id == ClassSession.id)
            .filter(
                Attendance.student_id == student_id,
                ClassSession.subject_id == subject_id,
                ClassSession.status == "completed",
                Attendance.status == "present"
            )
            .scalar() or 0
        )

        missed = max(0, total_conducted - attended)
        percentage = calculate_percentage(attended, total_conducted)
        defaulter = is_defaulter(percentage)
        required_classes = calculate_required_classes(attended, total_conducted)

        return {
            "student_id": student_id,
            "subject_id": subject_id,
            "total_conducted": total_conducted,
            "attended": attended,
            "missed": missed,
            "percentage": percentage,
            "is_defaulter": defaulter,
            "required_classes_to_75": required_classes
        }

    @staticmethod
    def get_student_overall_attendance(db: Session, student_id: str) -> Dict[str, Any]:
        """
        Calculates student's overall attendance across all enrolled subjects.
        """
        # Get all enrollments
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
        
        subject_stats = []
        overall_conducted = 0
        overall_attended = 0

        for enr in enrollments:
            sub = db.query(Subject).filter(Subject.id == enr.subject_id).first()
            if not sub:
                continue
            stat = AttendanceService.get_student_subject_attendance(db, student_id, enr.subject_id)
            stat["subject_code"] = sub.code
            stat["subject_name"] = sub.name
            stat["credits"] = sub.credits
            subject_stats.append(stat)
            overall_conducted += stat["total_conducted"]
            overall_attended += stat["attended"]

        overall_missed = max(0, overall_conducted - overall_attended)
        overall_percentage = calculate_percentage(overall_attended, overall_conducted)
        overall_defaulter = is_defaulter(overall_percentage)
        required_classes = calculate_required_classes(overall_attended, overall_conducted)

        return {
            "student_id": student_id,
            "total_conducted": overall_conducted,
            "total_attended": overall_attended,
            "total_missed": overall_missed,
            "overall_percentage": overall_percentage,
            "is_defaulter": overall_defaulter,
            "required_classes_to_75": required_classes,
            "subjects": subject_stats
        }

    @staticmethod
    def get_defaulters_list(db: Session, subject_id: Optional[str] = None, department_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Finds all students with attendance below 75% for a subject or across subjects.
        """
        query = db.query(Student).join(Profile, Student.profile_id == Profile.id)
        if department_id:
            query = query.filter(Student.department_id == department_id)
        students = query.all()

        defaulters = []
        for student in students:
            # If subject_id specified, check for that subject
            if subject_id:
                sub = db.query(Subject).filter(Subject.id == subject_id).first()
                if not sub:
                    continue
                # Check if enrolled
                is_enrolled = db.query(Enrollment).filter(
                    Enrollment.student_id == student.id,
                    Enrollment.subject_id == subject_id
                ).first()
                if not is_enrolled:
                    continue
                stat = AttendanceService.get_student_subject_attendance(db, student.id, subject_id)
                if stat["is_defaulter"] and stat["total_conducted"] > 0:
                    defaulters.append({
                        "student_id": student.id,
                        "student_name": student.profile.full_name,
                        "roll_number": student.roll_number,
                        "registration_number": student.registration_number,
                        "subject_id": subject_id,
                        "subject_code": sub.code,
                        "subject_name": sub.name,
                        "attended_classes": stat["attended"],
                        "total_classes": stat["total_conducted"],
                        "attendance_percentage": stat["percentage"],
                        "additional_classes_needed": stat["required_classes_to_75"]
                    })
            else:
                # Check all enrolled subjects for each student
                enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
                for enr in enrollments:
                    sub = db.query(Subject).filter(Subject.id == enr.subject_id).first()
                    if not sub:
                        continue
                    stat = AttendanceService.get_student_subject_attendance(db, student.id, enr.subject_id)
                    if stat["is_defaulter"] and stat["total_conducted"] > 0:
                        defaulters.append({
                            "student_id": student.id,
                            "student_name": student.profile.full_name,
                            "roll_number": student.roll_number,
                            "registration_number": student.registration_number,
                            "subject_id": enr.subject_id,
                            "subject_code": sub.code,
                            "subject_name": sub.name,
                            "attended_classes": stat["attended"],
                            "total_classes": stat["total_conducted"],
                            "attendance_percentage": stat["percentage"],
                            "additional_classes_needed": stat["required_classes_to_75"]
                        })

        return defaulters
