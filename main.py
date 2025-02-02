import openpyxl
import json

def process_xlsx_to_json(file_path, output_json_path):
    workbook = openpyxl.load_workbook("./TypesofNumbers.xlsx")
    sheet = workbook.active
    
    quiz_data = []
    
    for row in sheet.iter_rows(min_row=2, values_only=True):  # Skip header row
        question, option1, option2, option3, option4, answer, comments = row
        options = [option1, option2, option3, option4]
        
        correct_index = options.index(answer) if answer in options else -1
        
        question_entry = {
            "type": "text-text",
            "question": question,
            "options": [{"type": "text", "content": opt} for opt in options],
            "correctAnswer": {
                "type": "text",
                "content": answer,
                "index": correct_index,
                "explanation": comments if comments else ""
            },
            "difficulty": "easy",  # Default difficulty
            "topics": ["678b9dc939053772c9f9303b"]  # Can be populated later
        }
        
        quiz_data.append(question_entry)
    
    with open(output_json_path, "w", encoding="utf-8") as json_file:
        json.dump(quiz_data, json_file, indent=2)
    
    return output_json_path

# Example usage
file_path = "quiz_questions.xlsx"
output_json_path = "quiz_data.json"
process_xlsx_to_json(file_path, output_json_path)
print(f"JSON data saved to {output_json_path}")
