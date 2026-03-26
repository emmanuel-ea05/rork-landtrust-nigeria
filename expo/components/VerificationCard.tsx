import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MapPin, ChevronRight, ShieldCheck, Tag } from "lucide-react-native";
import Colors from "@/constants/colors";
import { VerificationRequest, TIER_LABELS } from "@/types";
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
          <View style={styles.tierBadge}>
            <Tag size={10} color={Colors.primary} />
            <Text style={styles.tierText}>{TIER_LABELS[verification.tier]}</Text>
          </View>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
      </View>

      {verification.sellerName ? (
        <Text style={styles.seller}>Seller: {verification.sellerName}</Text>
      ) : null}

      {verification.report?.trustSignals && (
        <View style={styles.trustRow}>
          <ShieldCheck size={12} color={Colors.primary} />
          <Text style={styles.trustText}>
            Verified by {verification.report.trustSignals.verifiedBy}
          </Text>
          {verification.report.trustSignals.backedByLawyer && (
            <Text style={styles.trustLawyer}>
              • {verification.report.trustSignals.backedByLawyer}
            </Text>
          )}
        </View>
      )}
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
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexWrap: "wrap",
  },
  trustText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  trustLawyer: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
});
