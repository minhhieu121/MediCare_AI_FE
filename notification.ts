// utils/notification.ts
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';

export const requestNotificationPermissions = async () => {
  let status;
  if (Platform.OS === 'ios') {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    status = existingStatus;
    if (existingStatus !== 'granted') {
      const { status: newStatus } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      status = newStatus;
    }
  } else {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    status = existingStatus;
    if (existingStatus !== 'granted') {
      const { status: newStatus } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      status = newStatus;
    }
  }

  if (status !== 'granted') {
    alert('Bạn cần cấp quyền thông báo để ứng dụng có thể nhắc nhở bạn uống thuốc.');
    return false;
  }

  return true;
};


export const scheduleNotification = async (medicationName: string, dosage: string, time: string, notes: string) => {
  // Phân tách thời gian
  const [hourMinute, meridiem] = time.split(' ');
  let [hour, minute] = hourMinute.split(':').map(Number);

  // Chuyển đổi sang định dạng 24 giờ
  if (meridiem.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (meridiem.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }

  // Tạo trigger thời gian
  const trigger = new Date();
  trigger.setHours(hour);
  trigger.setMinutes(minute);
  trigger.setSeconds(0);

  // Nếu thời gian đã qua trong ngày, lên lịch cho ngày hôm sau
  if (trigger < new Date()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Nhắc nhở uống thuốc: ${medicationName}`,
      body: `Liều lượng: ${dosage}. Ghi chú: ${notes}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
};
