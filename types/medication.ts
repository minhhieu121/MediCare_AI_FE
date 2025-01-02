// types/medication.ts
export interface MedicationSchedule {
  time: string;
  notes: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  schedule: MedicationSchedule[];
}

export interface DaySchedule {
  date: string; // Định dạng YYYY-MM-DD
  dayOfWeek: string; // Tên ngày trong tuần, ví dụ: Monday, Tuesday,...
  medications: Medication[];
}

export interface WeekSchedule {
  week: string; // Ví dụ: "Week 1"
  data: DaySchedule[];
}

