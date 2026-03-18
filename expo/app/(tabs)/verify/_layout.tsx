import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function VerifyLayout() {
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
        options={{ title: "New Verification" }}
      />
    </Stack>
  );
}
