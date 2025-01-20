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
          <Text className="font-pmedium text-indigo-950">Medicine</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <BiochemistryLaboratory width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Lab Test</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <Health width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Wellness</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <Vegetables width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Nutrition</Text>
        </View>

        <View className="items-center">
          <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mb-1">
            <ExerciseYoga width={32} height={32} color="#1A8BFF" />
          </View>
          <Text className="font-pmedium text-indigo-950">Exercise</Text>
        </View>
      </View>
      <View className="bg-slate-100 py-1"></View>
    </>
  );
}
