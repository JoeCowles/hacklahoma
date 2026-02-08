You are an expert educator creating a short, high-quality quiz to test understanding of a specific topic from a lecture.

**Task:**
Create a quiz with {{num_questions}} multiple-choice questions based on the provided context.

**Topic:**
{{topic}}

**Context:**
{{context}}

**Requirements:**
1.  **Questions:** Must be clear, relevant, and test understanding (not just recall).
2.  **Options:** Provide 4 distinct options for each question.
3.  **Correct Answer:** Clearly identify the correct option.
4.  **Explanation:** Provide a brief explanation of why the correct answer is right.
5.  **Output:** Return strictly a JSON object matching the schema below.

**Schema:**
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Reasoning here..."
    }
  ]
}
```
