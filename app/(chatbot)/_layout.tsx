import React from "react";
import {Redirect, Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";

const ChatLayout = () => {
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
