import React, {useState} from 'react';
import {Text, TextInput, TouchableOpacity, View, Image} from "react-native";
import {icons} from "../constants"
import Icon from "react-native-vector-icons/Ionicons";

export type FormFieldProps = {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
      <View className={`space-y-2 ${otherStyles}`}>
        <Text className="text-base text-gray-900 font-pmedium">
          {title}
        </Text>
        <View
            className="border-2 border-stone-600 w-full h-16 px-4 bg-white rounded-2xl focus:border-stone-700 flex flex-row items-center">
          <TextInput
              className="flex-1 font-psemibold text-base"
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#7B7B8B"
              onChangeText={handleChangeText}
              secureTextEntry={(title === "Password" || title === "Password (required)" || title === "Re-enter password (required)") && !showPassword}
              autoCapitalize='none'
              {...props}
          />

          {(title === "Password" || title === "Password (required)" || title === "Re-enter password (required)") && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                    source={!showPassword ? icons.eye : icons.eyeHide}
                    className="w-6 h-6"
                    resizeMode="contain"
                />
              </TouchableOpacity>
          )}
        </View>
      </View>
  );
};

export default FormField;
