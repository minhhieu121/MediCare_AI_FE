// data/medicationData.ts
import { format, addDays } from 'date-fns';
import { WeekSchedule } from '@/types/medication';

// Danh sách các loại thuốc
const medicationsList = [
  {
    id: 1,
    name: "Paracetamol",
    dosage: "500mg",
    schedule: [
      { time: "08:00 AM", notes: "Trước ăn sáng" },
      { time: "08:00 PM", notes: "Sau ăn tối" },
    ],
  },
  {
    id: 2,
    name: "Amoxicillin",
    dosage: "250mg",
    schedule: [
      { time: "08:00 AM", notes: "Sau khi ăn" },
      { time: "09:00 PM", notes: "Trước khi đi ngủ" },
    ],
  },
  {
    id: 3,
    name: "Ibuprofen",
    dosage: "200mg",
    schedule: [
      { time: "08:00 AM", notes: "Trước ăn sáng" },
      { time: "07:00 PM", notes: "Sau ăn tối" },
    ],
  },
  {
    id: 4,
    name: "Vitamin D",
    dosage: "1000 IU",
    schedule: [
      { time: "10:00 AM", notes: "Sau bữa trưa" },
    ],
  },
  {
    id: 5,
    name: "asdf",
    dosage: "500mg",
    schedule: [
      { time: "08:00 AM", notes: "Trước ăn sáng" },
      { time: "08:00 PM", notes: "Sau ăn tối" },
    ],
  },
  {
    id: 6,
    name: "asdgf",
    dosage: "250mg",
    schedule: [
      { time: "08:00 AM", notes: "Sau khi ăn" },
      { time: "09:00 PM", notes: "Trước khi đi ngủ" },
    ],
  },
  {
    id: 7,
    name: "sfhg",
    dosage: "200mg",
    schedule: [
      { time: "08:00 AM", notes: "Trước ăn sáng" },
      { time: "07:00 PM", notes: "Sau ăn tối" },
    ],
  },
  {
    id: 8,
    name: "fgf",
    dosage: "1000 IU",
    schedule: [
      { time: "10:00 AM", notes: "Sau bữa trưa" },
    ],
  },
  // Thêm các loại thuốc khác nếu cần
];

// Hàm tạo lịch uống thuốc cho 8 tuần bắt đầu từ một ngày cụ thể
export const generateMedicationSchedule = (startDate: string, numberOfWeeks: number): WeekSchedule[] => {
  const schedule: WeekSchedule[] = [];
  const start = new Date(startDate);

  for (let week = 0; week < numberOfWeeks; week++) {
    const weekData: WeekSchedule = {
      week: `Tuần ${week + 1}`,
      data: [],
    };

    for (let day = 0; day < 7; day++) {
      const currentDate = addDays(start, week * 7 + day);
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = format(currentDate, 'EEEE', { locale: undefined }); // Tùy chỉnh locale nếu cần

      // Tạo danh sách thuốc khác nhau cho mỗi ngày để đa dạng hóa
      let dailyMedications: { id: number; name: string; dosage: string; schedule: { time: string; notes: string; }[]; }[] = [];

      switch (dayOfWeek) {
        case 'Monday':
          dailyMedications = [medicationsList[0], medicationsList[1], medicationsList[4]];
          break;
        case 'Tuesday':
          dailyMedications = [medicationsList[0], medicationsList[2], medicationsList[4]];
          break;
        case 'Wednesday':
          dailyMedications = [...medicationsList];
          break;
        case 'Thursday':
          dailyMedications = [medicationsList[0], medicationsList[2], medicationsList[3]];
          break;
        case 'Friday':
          dailyMedications = [medicationsList[1]];
          break;
        case 'Saturday':
          dailyMedications = [medicationsList[0], medicationsList[1], medicationsList[2]];
          break;
        case 'Sunday':
          dailyMedications = []; // Ngày nghỉ, không có thuốc
          break;
        default:
          dailyMedications = [];
      }

      weekData.data.push({
        date: formattedDate,
        dayOfWeek,
        medications: dailyMedications,
      });
    }

    schedule.push(weekData);
  }

  return schedule;
};

// Tạo dữ liệu mẫu cho 8 tuần bắt đầu từ ngày 2024-05-01
export const medicationSchedule = generateMedicationSchedule('2024-12-31', 8);
