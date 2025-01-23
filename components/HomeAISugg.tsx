import {
  BiochemistryLaboratory,
  ExerciseYoga,
  Health,
  Vegetables,
} from "healthicons-react-native";
import { BioPharma } from "healthicons-react-native";
import { View, Text } from "react-native";

export default function HomeAISugg() {
  return (
    <>
      <View className="flex-row justify-between px-4 mt-2 py-4">
        {/* Mỗi mục là 1 nút */}
        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <BioPharma width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Thuốc</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <BiochemistryLaboratory width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Xét nghiệm</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <Health width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Sức khỏe</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <Vegetables width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Dinh dưỡng</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <ExerciseYoga width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Tập luyện</Text>
        </View>
      </View>
      <View className="bg-slate-100 py-1"></View>
    </>
  );
}
