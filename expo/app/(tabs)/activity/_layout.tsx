import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function ActivityLayout() {
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
        options={{ title: "My Verifications" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Verification Details" }}
      />
    </Stack>
  );
}
