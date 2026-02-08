/** Types matching backend lecture API responses (backend/app/schemas.py) */

export interface Lecture {
  id: string;
  class_id: string;
  date: string;
  student_id: string;
  class_name?: string | null;
  professor?: string | null;
  school?: string | null;
  class_time?: string | null;
}

export interface LectureDetailsResponse {
  lecture: Lecture;
  concepts: unknown[];
  videos: unknown[];
  simulations: unknown[];
  transcripts: unknown[];
}

export interface LectureSearchResponse {
  results: LectureDetailsResponse[];
}
