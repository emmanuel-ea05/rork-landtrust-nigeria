import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { VerificationStatus, STATUS_LABELS } from "@/types";

const STATUS_COLORS: Record<VerificationStatus, string> = {
  submitted: Colors.statusSubmitted,
  under_review: Colors.statusReview,
  survey_check: Colors.statusSurvey,
  legal_review: Colors.statusLegal,
  field_inspection: Colors.statusInspection,
  completed: Colors.statusCompleted,
  flagged: Colors.statusFlagged,
};

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: "small" | "medium";
}

export default function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const isSmall = size === "small";

  return (
    <View style={[styles.badge, { backgroundColor: color + "18" }, isSmall && styles.badgeSmall]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, isSmall && styles.textSmall]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  textSmall: {
    fontSize: 11,
  },
});
