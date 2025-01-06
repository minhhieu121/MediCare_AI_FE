import {StyleSheet, Image, Platform, Text, View, Button, TouchableOpacity} from "react-native";

import {Collapsible} from "@/components/Collapsible";
import {ExternalLink} from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {ThemedText} from "@/components/ThemedText";
import {ThemedView} from "@/components/ThemedView";
import {IconSymbol} from "@/components/ui/IconSymbol";
import React, {useContext, useEffect} from "react";
import "../../global.css";
import Icon from "react-native-vector-icons/Ionicons";
import {router} from "expo-router";
import {AuthContext} from "@/context/AuthContext";

export default function HomeScreen() {
  const {token} = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      router.push("/LoginScreen");
    }
  }, [token]);

  return (
      <ParallaxScrollView
          headerBackgroundColor={{light: "#D0D0D0", dark: "#353636"}}
          headerImage={
            <IconSymbol
                size={310}
                color="#808080"
                name="chevron.left.forwardslash.chevron.right"
            />
          }
      >
        <ThemedView>
          <ThemedText type="title">Explore</ThemedText>
        </ThemedView>
        <ThemedText>
          This app includes example code to help you get started.
        </ThemedText>
        <Collapsible title="File-based routing">
          <ThemedText>
            This app has two screens:{" "}
            <ThemedText type="defaultSemiBold">
              app/(tabs)/HomeScreen.tsx
            </ThemedText>{" "}
            and{" "}
            <ThemedText type="defaultSemiBold">
              app/(tabs)/MapScreen.tsx
            </ThemedText>
          </ThemedText>
          <ThemedText>
            The layout file in{" "}
            <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{" "}
            sets up the tab navigator.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/router/introduction">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Android, iOS, and web support">
          <ThemedText>
            You can open this project on Android, iOS, and the web. To open the
            web version, press <ThemedText type="defaultSemiBold">w</ThemedText>{" "}
            in the terminal running this project.
          </ThemedText>
        </Collapsible>
        <Collapsible title="Images">
          <ThemedText>
            For static images, you can use the{" "}
            <ThemedText type="defaultSemiBold">@2x</ThemedText> and{" "}
            <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to
            provide files for different screen densities
          </ThemedText>
          <Image
              source={require("@/assets/images/react-logo.png")}
              style={{alignSelf: "center"}}
          />
          <ExternalLink href="https://reactnative.dev/docs/images">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Custom fonts">
          <ThemedText>
            Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText>{" "}
            to see how to load{" "}
            <ThemedText style={{fontFamily: "SpaceMono"}}>
              custom fonts such as this one.
            </ThemedText>
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Light and dark mode components">
          <ThemedText>
            This template has light and dark mode support. The{" "}
            <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook
            lets you inspect what the user's current color scheme is, and so you
            can adjust UI colors accordingly.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
            <ThemedText type="link">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Animations">
          <ThemedText>
            This template includes an example of an animated component. The{" "}
            <ThemedText type="defaultSemiBold">
              components/HelloWave.tsx
            </ThemedText>{" "}
            component uses the powerful{" "}
            <ThemedText type="defaultSemiBold">
              react-native-reanimated
            </ThemedText>{" "}
            library to create a waving hand animation.
          </ThemedText>
          {Platform.select({
            ios: (
                <ThemedText>
                  The{" "}
                  <ThemedText type="defaultSemiBold">
                    components/ParallaxScrollView.tsx
                  </ThemedText>{" "}
                  component provides a parallax effect for the header image.
                </ThemedText>
            ),
          })}
        </Collapsible>
        <TouchableOpacity
            className="bg-green-500 px-6 py-3 rounded-lg flex-1 ml-2 flex-row justify-center items-center"
            onPress={() => router.push('/ChatbotScreen')}
        >
          <Icon name="person-add-outline" size={20} color="#fff" className="mr-2"/>
          <Text className="text-white text-center font-medium">Register</Text>
        </TouchableOpacity>
      </ParallaxScrollView>
  );
}
