import React from "react";
import {Redirect, Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {AuthContext} from "@/context/AuthContext";
import {useContext} from "react";

const ChatLayout = () => {
  const {isLoggedIn} = useContext(AuthContext);

  if (isLoggedIn) return <Redirect href="../(tabs)/HomeScreen.tsx"/>;

  return (
      <>
        <Stack>
          <Stack.Screen
              name="ChatbotScreen"
              options={{
                headerShown: false,
              }}
          />
        </Stack>
        <StatusBar backgroundColor="#161622" style="light"/>
      </>
  );
};

export default ChatLayout;
