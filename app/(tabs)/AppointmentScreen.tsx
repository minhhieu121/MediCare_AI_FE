// import { LinearGradient } from "expo-linear-gradient";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   Keyboard,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Icon from "react-native-vector-icons/Ionicons";
// // @ts-ignore
// import FloatingChatbotButton from "@/components/FloatingChatbotButton"; // Import mock data
// import HospitalItem from "@/components/HospitalItem";
// import { useAuth } from "@/context/AuthContext";
// import { Hospital } from "@/types/appointment";
// import { debounce } from "lodash";

// const AppointmentScreen = () => {
//   const { token } = useAuth();
//   const [hospitals, setHospitals] = useState<Hospital[]>([]);
//   const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [skip, setSkip] = useState<number>(0);
//   const [limit] = useState<number>(20); // You can adjust the limit as needed
//   const [hasMore, setHasMore] = useState<boolean>(true);

//   const fetchHospitals = async () => {
//     if (!hasMore) return; // No more data to fetch
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${process.env.EXPO_PUBLIC_API_URL}/api/hospitals?skip=${skip}&limit=${limit}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error fetching hospitals: ${response.statusText}`);
//       }

//       const data: Hospital[] = await response.json();

//       if (data.length < limit) {
//         setHasMore(false); // No more data available
//       }

//       setHospitals((prevHospitals) => [...prevHospitals, ...data]);
//       setFilteredHospitals((prevHospitals) => [...prevHospitals, ...data]);
//       setSkip((prevSkip) => prevSkip + limit);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "An error occurred while fetching hospitals.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial fetch
//   useEffect(() => {
//     fetchHospitals();
//   }, []);

//   // Debounced search to optimize performance
//   const handleSearch = useCallback(
//     debounce((query: string) => {
//       if (query.trim() === "") {
//         setFilteredHospitals(hospitals);
//       } else {
//         const filtered = hospitals.filter((hospital) =>
//           hospital.hospital_name.toLowerCase().includes(query.toLowerCase())
//         );
//         setFilteredHospitals(filtered);
//       }
//     }, 300),
//     [hospitals]
//   );

//   const onChangeSearch = (text: string) => {
//     setSearchQuery(text);
//     handleSearch(text);
//   };

//   const handleRetry = () => {
//     fetchHospitals();
//   };

//   const renderItem = ({ item }: { item: Hospital }) => (
//     <HospitalItem hospital={item} />
//   );

//   const keyExtractor = (item: Hospital) => item.hospital_id?.toString() || "";

//   const handleEndReached = () => {
//     if (!loading && hasMore) {
//       fetchHospitals();
//     }
//   };

//   return (
//     <LinearGradient
//       colors={["rgb(26,139,255)", "#cbf7ff", "#ffffff"]}
//       style={{ flex: 1 }}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 0, y: 1 }}
//     >
//       <SafeAreaView className="flex-1 w-full">
//         {/* Search Bar */}
//         <View className="px-4 py-2 shadow">
//           <View className="flex-row items-center bg-white rounded-lg p-4">
//             <Icon name="search-outline" size={20} color="#666" />
//             <TextInput
//               placeholder="Search hospitals..."
//               value={searchQuery}
//               onChangeText={onChangeSearch}
//               className="ml-2 flex-1 text-gray-700 font-pmedium"
//               returnKeyType="search"
//               onSubmitEditing={Keyboard.dismiss}
//             />
//             {searchQuery !== "" && (
//               <TouchableOpacity
//                 onPress={() => {
//                   setSearchQuery("");
//                   setFilteredHospitals(hospitals);
//                 }}
//               >
//                 <Icon name="close-circle" size={20} color="#666" />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         {/* Hospital List */}
//         <View className="flex-1 px-4 pt-2">
//           {loading && hospitals.length === 0 ? (
//             <View className="flex-1 items-center justify-center">
//               <ActivityIndicator size="large" color="#1e90ff" />
//             </View>
//           ) : error ? (
//             <View className="flex-1 items-center justify-center">
//               <Text className="text-red-500 text-lg mb-4">{error}</Text>
//               <TouchableOpacity
//                 onPress={handleRetry}
//                 className="mt-4 bg-blue-500 px-4 py-2 rounded-md"
//               >
//                 <Text className="text-white">Retry</Text>
//               </TouchableOpacity>
//             </View>
//           ) : filteredHospitals.length === 0 ? (
//             <View className="flex-1 items-center justify-center">
//               <Text className="text-gray-600 text-lg">No hospitals found.</Text>
//             </View>
//           ) : (
//             <FlatList
//               data={filteredHospitals}
//               renderItem={renderItem}
//               keyExtractor={keyExtractor}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingBottom: 20 }}
//               className="flex-1 bg-transparent"
//               onEndReached={handleEndReached}
//               onEndReachedThreshold={0.5}
//               ListFooterComponent={
//                 loading && hasMore ? (
//                   <View className="py-4">
//                     <ActivityIndicator size="small" color="#1e90ff" />
//                   </View>
//                 ) : (
//                   <View className="h-20" />
//                 )
//               }
//             />
//           )}
//         </View>
//         {/* <FloatingChatbotButton chatbotId={2} /> */}
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default AppointmentScreen;

import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bladder,
  Cardiogram,
  ChildCognition,
  Colon,
  Eye,
  Kidneys,
  Liver,
  Lungs,
} from "healthicons-react-native";
import { router } from "expo-router";

const healthData = [
  {
    icon: <Kidneys width={40} height={40} color="#2F51D7" />,
    label: "Kidneys",
  },
  { icon: <Eye width={40} height={40} color="#2F51D7" />, label: "Eye" },
  {
    icon: <ChildCognition width={40} height={40} color="#2F51D7" />,
    label: "Brain",
  },
  { icon: <Liver width={40} height={40} color={"#2F51D7"} />, label: "Liver" }, // Placeholder icon
  { icon: <Lungs width={40} height={40} color="#2F51D7" />, label: "Lungs" },
  {
    icon: <Cardiogram width={40} height={40} color={"#2F51D7"} />,
    label: "Heart",
  },
  {
    icon: <Colon width={40} height={40} color={"#2F51D7"} />,
    label: "Intestine",
  }, // Placeholder icon
  {
    icon: <Bladder width={40} height={40} color={"#2F51D7"} />,
    label: "Bladder",
  },
];

const surgeries = [
  {
    discount: "60% off",
    title: "Gall Bladder Surgery",
    description: "Removal of the gallbladder due to the deposit of stone",
    oldPrice: "$1469",
    newPrice: "$947",
    bgColor: "bg-pink-100",
    textColor: "bg-pink-500",
  },
  {
    discount: "34% off",
    title: "Fat Lipoma Surgery",
    description: "Fat-based tissue lump that grows just beneath",
    oldPrice: "$169",
    newPrice: "$1476",
    bgColor: "bg-green-100",
    textColor: "bg-green-500",
  },
];

const orthopedicSpecials = [
  {
    title: "Shin Joint Pain",
    icon: "walk-outline", // Placeholder icon
  },
  {
    title: "Bone Fracture",
    icon: "body-outline", // Placeholder icon
  },
  {
    title: "Wrist Fracture",
    icon: "hand-left-outline", // Placeholder icon
  },
];

const AppointmentScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text className="text-black text-lg font-psemibold">All Symptoms</Text>
        <Ionicons name="search-outline" size={24} color="white" />
      </View>
      <View className="bg-slate-100 py-1"></View>

      {/* Common Health Section */}
      <ScrollView className="flex-1">
        <View className="py-3 px-5">
          <View className="bg-pink-50 rounded-xl p-5">
            <Text className="text-xl font-psemibold text-gray-800 mb-1">
              Book appointment an expert surgeon
            </Text>
            <Text className="text-gray-500 text-sm mb-3 font-pmedium">
              Treat common symptoms with specialist
            </Text>
            <View className="flex-row flex-wrap justify-between ">
              {healthData.map((item, index) => (
                <View key={index} className="items-center w-1/4 mb-4">
                  <TouchableOpacity
                    className="w-20 h-20 rounded-full bg-white border border-pink-200 items-center justify-center"
                    onPress={() => {
                      router.push(`/SpecialtyDetails/${item.label}`);
                    }}
                  >
                    {item.icon}
                  </TouchableOpacity>
                  <Text className="text-sm font-pmedium text-gray-700 mt-1 capitalize">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className="bg-slate-100 py-1"></View>

        {/* Surgeries We Cover Section */}
        <View className="py-3 px-5">
          <Text className="text-xl font-psemibold text-gray-800 mb-3">
            Surgeries we cover
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 pb-6 overflow-hidden"
        >
          {surgeries.map((surgery, index) => (
            <View
              key={index}
              className={`mr-4 p-5 rounded-lg shadow ${surgery.bgColor} w-60`}
            >
              <Text
                className={`text-white px-2 py-1 rounded-full self-start text-xs ${surgery.textColor}`}
              >
                {surgery.discount}
              </Text>
              <Text className="text-lg font-pbold text-gray-800 mt-2">
                {surgery.title}
              </Text>
              <Text className="text-gray-600 text-sm">
                {surgery.description}
              </Text>
              <Text className="text-gray-400 line-through mt-1">
                {surgery.oldPrice}
              </Text>
              <Text className="text-2xl font-psemibold text-gray-800">
                {surgery.newPrice}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View className="bg-slate-100 py-1"></View>

        {/* Orthopedist Specials Section */}
        <View className="px-6 py-5 bg-white">
          {/* Tiêu đề */}
          <Text className="text-xl font-psemibold text-gray-800 mb-4">
            Orthopedist Specials
          </Text>

          {/* Danh sách mục */}
          <View className="space-y-4">
            {orthopedicSpecials.map((item, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between bg-[#f2f3f7] rounded-2xl p-5 shadow-sm mb-3"
                style={{ height: 80, borderRadius: 20 }}
              >
                <Text className="text-lg font-semibold text-indigo-950">
                  {item.title}
                </Text>
                <View className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <Ionicons name={item.icon} size={40} color="#6B7280" />
                </View>
              </View>
            ))}
          </View>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentScreen;
