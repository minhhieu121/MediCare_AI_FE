import React, { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import "../global.css";

const Page = () => {
  const { isLoggedIn } = useContext(AuthContext);
  if (isLoggedIn) return <Redirect href="/(tabs)/HomeScreen" />;

  return <Redirect href="/(auth)/Authenticate" />;
};

export default Page;
