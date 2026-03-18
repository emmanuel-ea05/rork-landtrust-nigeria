import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MapPin, FileText, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { VerificationRequest } from "@/types";
import StatusBadge from "./StatusBadge";

interface VerificationCardProps {
  verification: VerificationRequest;
  onPress: () => void;
}

export default function VerificationCard({ verification, onPress }: VerificationCardProps) {
  const dateStr = new Date(verification.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`verification-card-${verification.id}`}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.plotNumber}>{verification.plotNumber}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.textTertiary} />
            <Text style={styles.district}>
              {verification.district}, {verification.state}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={Colors.textTertiary} />
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <StatusBadge status={verification.status} />
        <View style={styles.footerRight}>
          <FileText size={12} color={Colors.textTertiary} />
          <Text style={styles.docCount}>{verification.documents.length} docs</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
      </View>

      {verification.sellerName ? (
        <Text style={styles.seller}>Seller: {verification.sellerName}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  plotNumber: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  district: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  docCount: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  date: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 8,
  },
  seller: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
  },
});
