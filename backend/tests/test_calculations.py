import pytest
from backend.app.services.attendance_service import (
    calculate_percentage,
    is_defaulter,
    calculate_required_classes
)

def test_calculate_percentage():
    # Regular calculations
    assert calculate_percentage(15, 20) == 75.00
    assert calculate_percentage(14, 20) == 70.00
    assert calculate_percentage(18, 20) == 90.00
    assert calculate_percentage(1, 3) == 33.33
    assert calculate_percentage(2, 3) == 66.67
    
    # Boundary / Zero division
    assert calculate_percentage(0, 0) == 0.0
    assert calculate_percentage(0, 10) == 0.0
    assert calculate_percentage(10, 10) == 100.0


def test_is_defaulter_rule():
    # Exactly matching the prompt specification:
    # 74.99% = Defaulter (True)
    # 75.00% = Not a defaulter (False)
    # 80.00% = Not a defaulter (False)
    assert is_defaulter(74.99) is True
    assert is_defaulter(74.999) is False # rounds to 75.00
    assert is_defaulter(75.00) is False
    assert is_defaulter(75.01) is False
    assert is_defaulter(80.00) is False
    assert is_defaulter(0.0) is True
    assert is_defaulter(70.0) is True


def test_calculate_required_classes():
    # If already >= 75%, 0 classes required
    assert calculate_required_classes(15, 20) == 0 # 75%
    assert calculate_required_classes(18, 20) == 0 # 90%
    assert calculate_required_classes(0, 0) == 0

    # Total = 10, attended = 7 (70%)
    # Needed: (0.75 * 10 - 7) / 0.25 = 0.5 / 0.25 = 2 classes
    # Check: (7 + 2) / (10 + 2) = 9 / 12 = 75.0%
    assert calculate_required_classes(7, 10) == 2

    # Total = 20, attended = 10 (50%)
    # Needed: (0.75 * 20 - 10) / 0.25 = 5 / 0.25 = 20 classes
    # Check: (10 + 20) / (20 + 20) = 30 / 40 = 75.0%
    assert calculate_required_classes(10, 20) == 20

    # Total = 10, attended = 6 (60%)
    # Needed: (0.75 * 10 - 6) / 0.25 = 1.5 / 0.25 = 6 classes
    # Check: (6 + 6) / (10 + 6) = 12 / 16 = 75.0%
    assert calculate_required_classes(6, 10) == 6
