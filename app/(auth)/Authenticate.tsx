import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
// @ts-ignore
import Icon from 'react-native-vector-icons/Ionicons';

const Authenticate = () => {
  const router = useRouter();

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={require('../../assets/images/trans_logo.png')}
          className="w-180 h-180 mb-8"
          resizeMode="contain"
        />

        <View className="bg-white bg-opacity-80 shadow-lg rounded-xl p-8 w-full max-w-md">
          <Text className="text-4xl text-gray-800 font-psemibold text-center">
            Welcome to
          </Text>
          <Text className="text-4xl text-gray-800 font-psemibold mb-4 text-center">
            Medicare AI!
          </Text>
          <Text className="text-base text-gray-600 mb-6 text-center">
            Please log in or register to continue.
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-lg flex-1 mr-2 flex-row justify-center items-center"
              onPress={() => router.push('/LoginScreen')}
            >
              <Icon name="log-in-outline" size={20} color="#fff" className="mr-2" />
              <Text className="text-white text-center font-medium">Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-500 px-6 py-3 rounded-lg flex-1 ml-2 flex-row justify-center items-center"
              onPress={() => router.push('/RegisterScreen')}
            >
              <Icon name="person-add-outline" size={20} color="#fff" className="mr-2" />
              <Text className="text-white text-center font-medium">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Authenticate;
