import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

// ---------------------------------------------------
// Constants
// ---------------------------------------------------
const API_BASE_URL = "http://127.0.0.1:8000"; // Update to your actual server IP / domain
const AUTH_TOKEN_KEY = 'access_token';

// ---------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------
interface User {
  user_id: number;
  email: string;
  fullname?: string;
  user_type?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (signUpData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  isLoggedIn: boolean;
  isExpired: (token: string) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Example sign-up data structure:
export interface SignUpData {
  username: string;
  email: string;
  password: string;
  fullname: string;
  date_of_birth: string;  // or Date object
  gender: string;         // must match your GenderEnum if necessary
  user_type: string;      // 'PATIENT' or 'DOCTOR'
  address: string;
  phone: string;
  profile_image?: string | null;
  doctor_specialty?: string;    // required if user_type === 'DOCTOR'
  doctor_experience?: number;   // required if user_type === 'DOCTOR'
}

// ---------------------------------------------------
// AuthContext
// ---------------------------------------------------
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({children}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Derive isLoggedIn from whether we have a token
  const isLoggedIn = !!token;

  useEffect(() => {
    // On mount, try to load token & user from storage
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          // Optionally, fetch user data from server or decode token
          const userData = await fetchUserData(storedToken);
          console.log("Loaded user data:", userData);
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.warn("Failed to load token from storage", error);
      } finally {
        setLoading(false);
      }
    };
    loadStorageData();
  }, []);

  // ---------------------------------------------------
  // Helper function to fetch user data
  // ---------------------------------------------------
  const fetchUserData = async (jwtToken: string): Promise<User | null> => {
    try {
      // If you have an endpoint to get user data from the token,
      // you can replace this with your actual endpoint, for example:

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user data. Status: ${response.status}`,
        );
      }
      return await response.json();

      // For demonstration, just returning a dummy user if the token is not null
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // ---------------------------------------------------
  // signIn (using fetch)
  // ---------------------------------------------------
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = { email, password };

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Could be 401 (Unauthorized) or other errors
        throw new Error(`Login failed with status: ${response.status}`);
      }

      // Parse JSON
      const responseData = await response.json();
      const {
        access_token,
        user_id,
        email: userEmail,
        fullname,
        user_type,
      } = responseData;

      // Save token in state & async storage
      setToken(access_token);
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, access_token);

      // Set user info
      console.log("Logged in user:", responseData);
      setUser({
        user_id,
        email: userEmail,
        fullname,
        user_type,
      });
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // signUp (using fetch)
  // ---------------------------------------------------
  const signUp = async (signUpData: SignUpData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });

      if (!response.ok) {
        throw new Error(`Sign-up failed with status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log("Sign-up successful:", responseData);

      // Typically, after sign-up, you might auto-signin or navigate to login
      // e.g. await signIn(signUpData.email, signUpData.password);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // signOut
  // ---------------------------------------------------
  const signOut = async () => {
    setLoading(true);
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (token: string) => {
    if (!token) return true;
    try {
      const decodedToken: { exp?: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp !== undefined && decodedToken.exp < currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };

  // ---------------------------------------------------
  // Provide the context
  // ---------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        isLoggedIn,
        isExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------
// useAuth Hook
// ---------------------------------------------------
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
