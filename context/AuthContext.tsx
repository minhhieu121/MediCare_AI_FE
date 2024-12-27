import React, { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextProps {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ AsyncStorage khi ứng dụng khởi động
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("@user");
        if (userData) {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem("@user", JSON.stringify(userData));
    } catch (error) {
      console.log("Error saving user data:", error);
    }
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    try {
      await AsyncStorage.removeItem("@user");
    } catch (error) {
      console.log("Error removing user data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
