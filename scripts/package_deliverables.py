import os
import shutil

SOURCE_DIR = r"D:\antigravity project\alok raghav"
DEST_FOLDER = r"D:\16-11-26 things\academic-attendance-system"
DEST_ZIP = r"D:\16-11-26 things\smart_academic_attendance_system_source_code"

if os.path.exists(DEST_FOLDER):
    shutil.rmtree(DEST_FOLDER, ignore_errors=True)

print("Copying clean source code...")
shutil.copytree(
    SOURCE_DIR,
    DEST_FOLDER,
    dirs_exist_ok=True,
    ignore=shutil.ignore_patterns(
        "node_modules", "venv", ".next", ".git", "__pycache__", ".pytest_cache", "*.pyc", "*.log"
    )
)

print("Creating portable ZIP archive...")
shutil.make_archive(DEST_ZIP, "zip", DEST_FOLDER)
print("Deliverables successfully packaged in D:\\16-11-26 things!")
