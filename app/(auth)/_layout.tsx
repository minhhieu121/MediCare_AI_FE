import React from "react";
import {Redirect, Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {AuthContext} from "@/context/AuthContext";
import {useContext} from "react";

const AuthLayout = () => {
  const {isLoggedIn} = useContext(AuthContext);

  if (isLoggedIn) return <Redirect href="../(tabs)/index.tsx"/>;

  return (
      <>
        <Stack>
          <Stack.Screen
              name="LoginScreen"
              options={{
                headerShown: false,
              }}
          />
          <Stack.Screen
              name="RegisterScreen"
              options={{
                headerShown: false,
              }}
          />
        </Stack>

        <StatusBar backgroundColor="#161622" style="light"/>
      </>
  );
};

export default AuthLayout;
