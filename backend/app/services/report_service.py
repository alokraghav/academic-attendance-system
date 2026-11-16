import io
from typing import List, Dict, Any, Optional
import pandas as pd
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

class ReportService:
    @staticmethod
    def _style_excel(writer, sheet_name: str, title: str):
        """
        Applies a professional university ERP styling to the Excel sheet using openpyxl.
        Light theme styling: #4267A9 headers, subtle borders, auto column widths.
        """
        workbook = writer.book
        worksheet = writer.sheets[sheet_name]

        # Insert title row at top
        worksheet.insert_rows(1, amount=2)
        worksheet["A1"] = title.upper()
        worksheet["A1"].font = Font(name="Calibri", size=14, bold=True, color="20242C")
        worksheet["A2"] = "Generated from Smart Academic Attendance & Leave Management System"
        worksheet["A2"].font = Font(name="Calibri", size=9, italic=True, color="747B87")

        # Table header is row 3
        header_fill = PatternFill(start_color="4267A9", end_color="4267A9", fill_type="solid")
        header_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
        thin_border = Border(
            left=Side(style="thin", color="E5E7EB"),
            right=Side(style="thin", color="E5E7EB"),
            top=Side(style="thin", color="E5E7EB"),
            bottom=Side(style="thin", color="E5E7EB")
        )

        for col in range(1, worksheet.max_column + 1):
            cell = worksheet.cell(row=3, column=col)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")

        # Style data rows and auto-fit columns
        for row in range(4, worksheet.max_row + 1):
            for col in range(1, worksheet.max_column + 1):
                cell = worksheet.cell(row=row, column=col)
                cell.font = Font(name="Calibri", size=10, color="20242C")
                cell.border = thin_border
                if isinstance(cell.value, (int, float)):
                    cell.alignment = Alignment(horizontal="right")
                else:
                    cell.alignment = Alignment(horizontal="left")

        # Auto-adjust column width
        for col in worksheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                # ignore top title rows for width estimation
                if cell.row in [1, 2]:
                    continue
                val_str = str(cell.value or "")
                if len(val_str) > max_len:
                    max_len = len(val_str)
            worksheet.column_dimensions[col_letter].width = max(max_len + 4, 12)

    @classmethod
    def generate_excel(cls, data: List[Dict[str, Any]], title: str, sheet_name: str = "Report") -> bytes:
        """
        Generates formatted Excel report bytes from Python dictionaries.
        """
        output = io.BytesIO()
        df = pd.DataFrame(data) if data else pd.DataFrame([{"Message": "No records found"}])
        
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name=sheet_name)
            cls._style_excel(writer, sheet_name=sheet_name, title=title)
            
        output.seek(0)
        return output.getvalue()

    @classmethod
    def generate_csv(cls, data: List[Dict[str, Any]]) -> str:
        """
        Generates CSV string from Python dictionaries.
        """
        if not data:
            return "Message\nNo records found\n"
        df = pd.DataFrame(data)
        return df.to_csv(index=False)
