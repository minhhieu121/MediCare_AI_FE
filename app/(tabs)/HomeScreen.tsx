import React, { useState } from "react";
import {
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import RecentReportsView from "@/components/RecentReportsView";
import HomeHeader from "@/components/HomeHeader";
import HomeSearchBar from "@/components/HomeSearchBar";
import HomeDateAndAppointment from "@/components/HomeDateAndAppointment";
import HomeAISugg from "@/components/HomeAISugg";
import HomeBooking from "@/components/HomeBooking";
import HomeBlogs from "@/components/HomeBlogs";


const HomeScreen = () => {
  const router = useRouter();
  // Hàm điều hướng
  const handleNavigate = (screen: string) => {
    // router.push(`/${screen}`);
    console.log("Đi đến màn hình:", screen);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <HomeHeader />
      {/* Search bar */}
      <HomeSearchBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ngày và Bản đồ */}
        <HomeDateAndAppointment />
        {/* Danh mục (Medicine, Lab Test, v.v.) */}
        <HomeAISugg />
        <HomeBooking />
        <HomeBlogs />
        <RecentReportsView />
        {/* Khoảng trống cuối */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
