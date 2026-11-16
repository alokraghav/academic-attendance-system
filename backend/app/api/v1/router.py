from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    dashboard,
    students,
    faculty,
    academics,
    attendance,
    leave,
    reports,
    users
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(students.router)
api_router.include_router(faculty.router)
api_router.include_router(academics.router)
api_router.include_router(attendance.router)
api_router.include_router(leave.router)
api_router.include_router(reports.router)
api_router.include_router(users.router)
