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
  creator_name?: string | null;
  created_at?: number | null;
  updated_at?: number | null;
  chunk_count: number;
}

export interface Class {
  id: string;
  name: string;
  professor: string;
  school: string;
  class_time: string;
  creator_name?: string | null;
  created_at?: number | null;
  updated_at?: number | null;
  lecture_count: number;
}

export interface LectureDetailsResponse {
  lecture: Lecture;
  concepts: unknown[];
  videos: unknown[];
  simulations: unknown[];
  transcripts: unknown[];
  references?: unknown[];
}

export interface LectureSearchResponse {
  results: LectureDetailsResponse[];
}

export interface ClassListResponse {
  classes: Class[];
}

export interface LectureListResponse {
  lectures: Lecture[];
}
