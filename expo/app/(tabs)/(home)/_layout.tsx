import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: "700" as const },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "LandSecure" }}
      />
    </Stack>
  );
}
