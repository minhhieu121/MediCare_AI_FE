// import React, {useState, useEffect, useContext} from 'react';
// import {View, Text, FlatList, TouchableOpacity} from 'react-native';
// import {Calendar, DateData, LocaleConfig} from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {WeekSchedule, DaySchedule, Medication} from '@/types/medication';
// import {medicationSchedule} from '@/data/medicationData';
// import {parse, format} from 'date-fns';
// import {requestNotificationPermissions, scheduleNotification} from "@/notification";
// import {AuthContext} from "@/context/AuthContext";
// import {router} from "expo-router";

// LocaleConfig.locales['vi'] = {
//   monthNames: [
//     'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
//     'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
//   ],
//   dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
//   dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
//   today: "Hôm nay"
// };
// LocaleConfig.defaultLocale = 'vi';

// const MedicationReminderScreen: React.FC = () => {
//   const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
//   const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
//   const [selectedMedications, setSelectedMedications] = useState<{ [key: string]: boolean }>({});
//   const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
//   const {token} = useContext(AuthContext);

//   useEffect(() => {
//     if (!token) {
//       router.push("/LoginScreen");
//     }
//   }, [token]);
//   function getTodayDate(): string {
//     const today = new Date();
//     return format(today, 'yyyy-MM-dd');
//   }

//   const markMedications = () => {
//     const marks: { [key: string]: any } = {};
//     medicationSchedule.forEach((week) => {
//       week.data.forEach((day) => {
//         if (day.medications.length > 0) {
//           marks[day.date] = {
//             marked: true,
//             dotColor: '#10B981',
//           };
//         }
//       });
//     });
//     marks[selectedDate] = {
//       ...(marks[selectedDate] || {}),
//       selected: true,
//       selectedColor: '#3B82F6',
//     };
//     setMarkedDates(marks);
//   };

//   useEffect(() => {
//     markMedications();
//     const schedule = findDaySchedule(selectedDate);
//     setDaySchedule(schedule || null);
//   }, [selectedDate]);

//   const findDaySchedule = (date: string): DaySchedule | undefined => {
//     for (const week of medicationSchedule) {
//       const day = week.data.find(d => d.date === date);
//       if (day) return day;
//     }
//     return undefined;
//   };

//   const onDayPress = (day: DateData) => {
//     setSelectedDate(day.dateString);
//   };

//   const getMedicationIcon = (medicationName: string) => {
//     switch (medicationName.toLowerCase()) {
//       case 'paracetamol':
//         return <Icon name="medkit" size={20} color="#4B5563"/>;
//       case 'amoxicillin':
//         return <Icon name="bandage" size={20} color="#10B981"/>;
//       case 'ibuprofen':
//         return <Icon name="fast-food" size={20} color="#F59E0B"/>;
//       case 'vitamin d':
//         return <Icon name="nutrition" size={20} color="#3B82F6"/>;
//       default:
//         return <Icon name="cube" size={20} color="#6B7280"/>;
//     }
//   };

//   const toggleMedicationSelection = (id: number) => {
//     setSelectedMedications((prevState) => ({
//       ...prevState,
//       [id]: !prevState[id],
//     }));
//   };

//   const groupMedicationsByTime = (medications: Medication[]): { [key: string]: Medication[] } => {
//     const grouped: { [key: string]: Medication[] } = {};

//     medications.forEach((med) => {
//       med.schedule.forEach((sched) => {
//         const time = sched.time;
//         if (!grouped[time]) {
//           grouped[time] = [];
//         }
//         grouped[time].push(med);
//       });
//     });

//     return grouped;
//   };

//   const groupedMedications = daySchedule ? groupMedicationsByTime(daySchedule.medications) : {};

//   const sortedTimes = Object.keys(groupedMedications).sort((a, b) => {
//     const parseTime = (time: string) => {
//       const [timePart, meridiem] = time.split(' ');
//       let [hours, minutes] = timePart.split(':').map(Number);
//       if (meridiem === 'PM' && hours !== 12) hours += 12;
//       if (meridiem === 'AM' && hours === 12) hours = 0;
//       return hours * 60 + minutes;
//     };
//     return parseTime(a) - parseTime(b);
//   });

//   const renderTimeSlot = ({item}: { item: string }) => {
//     const medicationsAtTime = groupedMedications[item];
//     return (
//         <View key={item} className="mb-6">
//           <View className="flex-row items-center mb-4">
//             <Icon name="time-outline" size={24} color="#3B82F6"/>
//             <Text className="ml-3 text-2xl font-psemibold text-gray-800">{item}</Text>
//           </View>
//           {medicationsAtTime.map((medication) => (
//               <TouchableOpacity key={medication.id}
//                                 className="mb-4 p-4 bg-white rounded-lg flex-row items-center shadow-custom-light"
//                                 onPress={() => toggleMedicationSelection(medication.id)}
//                                 activeOpacity={0.5}
//               >
//                 {getMedicationIcon(medication.name)}
//                 <View className="ml-4 flex-1">
//                   <Text className="text-lg font-psemibold">{medication.name} ({medication.dosage})</Text>
//                   {medication.schedule
//                       .filter(schedule => schedule.time === item)
//                       .map((schedule, schedIndex) => (
//                           <Text key={schedIndex} className="mt-1 text-sm text-gray-600">{schedule.notes}</Text>
//                       ))}
//                 </View>
//                 {selectedMedications[medication.id] && (
//                     <Icon name="checkmark-circle" size={24} color="#10B981"/>
//                 )}
//               </TouchableOpacity>
//           ))}
//         </View>
//     );
//   };

//   const registerNotifications = async () => {
//     const hasPermission = await requestNotificationPermissions();
//     if (!hasPermission) return;

//     if (daySchedule && daySchedule.medications.length > 0) {
//       daySchedule.medications.forEach((med) => {
//         med.schedule.forEach((sched) => {
//           scheduleNotification(med.name, med.dosage, sched.time, sched.notes);
//         });
//       });
//     }
//   };

//   useEffect(() => {
//     registerNotifications();
//   }, [daySchedule]);

//   return (
//       <FlatList
//           data={sortedTimes}
//           renderItem={renderTimeSlot}
//           keyExtractor={(item) => item}
//           className="flex-1 bg-sky-50 px-6 mb-24"
//           ListHeaderComponent={
//             <View className="pt-20 px-6">
//               <Text className="text-3xl font-pbold mb-6 text-center">Medication Reminder</Text>
//               <Calendar
//                   onDayPress={onDayPress}
//                   markedDates={{
//                     ...markedDates,
//                     [selectedDate]: {
//                       ...(markedDates[selectedDate] || {}),
//                       selected: true,
//                       selectedColor: '#3B82F6', // Màu xanh dương cho ngày được chọn
//                       selectedTextColor: '#ffffff', // Màu trắng cho chữ ngày được chọn
//                     },
//                   }}
//                   theme={{
//                     selectedDayBackgroundColor: '#3B82F6',
//                     todayTextColor: '#10B981',
//                     dotColor: '#10B981',
//                     selectedDotColor: '#ffffff',
//                     arrowColor: '#3B82F6',
//                     monthTextColor: '#1F2937',
//                     dayTextColor: '#374151',
//                     textDayFontFamily: 'Poppins_400Regular',
//                     textMonthFontFamily: 'Poppins_700Bold',
//                     textDayHeaderFontFamily: 'Poppins_500Medium',
//                     textDayFontWeight: '400',
//                     textMonthFontWeight: '700',
//                     textDayHeaderFontWeight: '500',
//                     textDayFontSize: 16,
//                     textMonthFontSize: 18,
//                     textDayHeaderFontSize: 14,
//                     todayFontWeight: '600',
//                   }}
//                   style={{
//                     borderRadius: 12,
//                     elevation: 5,
//                     shadowColor: '#000',
//                     shadowOpacity: 0.1,
//                     shadowRadius: 10,
//                     backgroundColor: '#ffffff',
//                     marginBottom: 20,
//                   }}
//                   // Đảm bảo Calendar mặc định hiển thị ngày hiện tại
//                   current={selectedDate}
//                   minDate={getTodayDate()}
//                   firstDay={1} // Bắt đầu tuần từ thứ Hai
//                   // Bật markType để hỗ trợ nhiều dấu
//                   markType={'dot'}
//               />
//             </View>
//           }
//           ListEmptyComponent={
//             <Text className="text-md font-plight italic text-gray-500 text-center">
//               Không có thuốc cần uống hôm nay.
//             </Text>
//           }
//           contentContainerStyle={{paddingBottom: 20}}
//       />
//   );
// };

// export default MedicationReminderScreen;
