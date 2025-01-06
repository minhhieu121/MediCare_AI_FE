// types.ts (Create this file in your project for shared types)

export interface Hospital {
  hospital_name: string;
  hospital_address: string;
  hospital_phone: string;
  hospital_email: string;
  hospital_image: string;
  hospital_id: number;
}

export interface Department {
  department_name: string;
  department_location: string;
  hospital_id: number;
  department_id: number;
}

export interface Doctor {
  user_id: number;
  username: string;
  email: string;
  user_type: string;
  fullname: string;
  date_of_birth: string;
  gender: string;
  address: string;
  phone: string;
  profile_image: string;
  doctor_specialty: string;
  doctor_experience: number;
}

export interface AvailableAppointment {
  appointment_day: string; // Format: YYYY-MM-DD
  appointment_shift: number; // Shift hours (e.g., 10 for 10 AM)
  room_id: number;
}

export const groupAppointmentsByDate = (
  appointments: AvailableAppointment[],
): { [date: string]: number[] } => {
  return appointments.reduce(
    (acc, appointment) => {
      const { appointment_day, appointment_shift } = appointment;
      if (!acc[appointment_day]) {
        acc[appointment_day] = [];
      }
      acc[appointment_day].push(appointment_shift);
      return acc;
    },
    {} as { [date: string]: number[] },
  );
};
