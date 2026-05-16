export type PctoRequestStatus = 'sent' | 'under-review' | 'approved' | 'rejected';

export interface PctoRequest {
  id: string;
  studentName: string;
  studentSurname: string;
  email: string;
  city: string;
  postalCode: string;
  school: string;
  classYear: '3' | '4' | '5';
  studyProgram: string;
  startDate: string;
  endDate: string;
  motivation: string;
  status: PctoRequestStatus;
  createdAt: string;
}
