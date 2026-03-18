import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Star,
  MapPin,
  CheckCircle,
  Award,
  Phone,
  Shield,
  Clock,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MOCK_PROFESSIONALS } from "@/mocks/data";
import { ProfessionalType, PROFESSIONAL_TYPE_LABELS } from "@/types";

const TYPE_FILTERS: { label: string; value: ProfessionalType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Surveyors", value: "surveyor" },
  { label: "Lawyers", value: "lawyer" },
  { label: "Inspectors", value: "inspector" },
];

export default function ProfessionalsScreen() {
  const [activeFilter, setActiveFilter] = useState<ProfessionalType | "all">(
    "all"
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return MOCK_PROFESSIONALS;
    return MOCK_PROFESSIONALS.filter((p) => p.type === activeFilter);
  }, [activeFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MOCK_PROFESSIONALS.length };
    MOCK_PROFESSIONALS.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return counts;
  }, []);

  const availableCount = MOCK_PROFESSIONALS.filter((p) => p.available).length;
  const avgRating = (
    MOCK_PROFESSIONALS.reduce((sum, p) => sum + p.rating, 0) /
    MOCK_PROFESSIONALS.length
  ).toFixed(1);
  const totalVerified = MOCK_PROFESSIONALS.reduce(
    (sum, p) => sum + p.completedVerifications,
    0
  );

  const handleContact = useCallback((name: string) => {
    console.log(`[ProfessionalsScreen] Contact: ${name}`);
    Alert.alert(
      "Contact Professional",
      `Would you like to contact ${name}? They will be notified and respond within 24 hours.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Request", style: "default" },
      ]
    );
  }, []);

  const handleHire = useCallback((name: string) => {
    console.log(`[ProfessionalsScreen] Hire: ${name}`);
    Alert.alert(
      "Hire Professional",
      `${name} will be assigned to your next verification request. Proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Hire", style: "default" },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              Verified professionals for your land verification needs in Abuja
              FCT. All experts are licensed and background-checked.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{availableCount}</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avgRating}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalVerified}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
            </View>

            <FlatList
              horizontal
              data={TYPE_FILTERS}
              keyExtractor={(item) => item.value}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilter === item.value && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === item.value &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {item.label} ({typeCounts[item.value] ?? 0})
                  </Text>
                </TouchableOpacity>
              )}
            />

            <Text style={styles.resultCount}>
              {filtered.length} professional{filtered.length !== 1 ? "s" : ""}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.proAvatar}>
                <Text style={styles.proInitials}>
                  {item.name
                    .split(" ")
                    .slice(-2)
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.proHeaderInfo}>
                <View style={styles.proNameRow}>
                  <Text style={styles.proName}>{item.name}</Text>
                  {item.available && (
                    <View style={styles.availableBadge}>
                      <View style={styles.availableDot} />
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  )}
                  {!item.available && (
                    <View style={styles.busyBadge}>
                      <Clock size={10} color={Colors.textTertiary} />
                      <Text style={styles.busyText}>Busy</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.proLicense}>{item.license}</Text>
              </View>
            </View>

            <View style={styles.proTypeBadge}>
              <Award size={12} color={Colors.primary} />
              <Text style={styles.proTypeText}>
                {PROFESSIONAL_TYPE_LABELS[item.type]}
              </Text>
            </View>

            <Text style={styles.proSpecialization}>
              {item.specialization}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <Star size={14} color={Colors.gold} />
                <Text style={styles.footerValue}>{item.rating}</Text>
              </View>
              <View style={styles.footerItem}>
                <CheckCircle size={14} color={Colors.success} />
                <Text style={styles.footerValue}>
                  {item.completedVerifications} verified
                </Text>
              </View>
              <View style={styles.footerItem}>
                <MapPin size={14} color={Colors.textTertiary} />
                <Text style={styles.footerValue}>{item.location}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact(item.name)}
                activeOpacity={0.7}
              >
                <Phone size={14} color={Colors.primary} />
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.hireButton,
                  !item.available && styles.hireButtonDisabled,
                ]}
                onPress={() => item.available && handleHire(item.name)}
                activeOpacity={item.available ? 0.7 : 1}
              >
                <Shield size={14} color={item.available ? Colors.white : Colors.textTertiary} />
                <Text
                  style={[
                    styles.hireButtonText,
                    !item.available && styles.hireButtonTextDisabled,
                  ]}
                >
                  {item.available ? "Hire Now" : "Unavailable"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Shield size={32} color={Colors.border} />
            <Text style={styles.emptyText}>No professionals found</Text>
            <Text style={styles.emptySub}>Try changing the filter</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: "500" as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  filterList: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  resultCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  proAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  proInitials: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.primary,
  },
  proHeaderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  proNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  proName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.success + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  availableText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  busyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  busyText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  proLicense: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  proTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  proTypeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  proSpecialization: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 14,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  hireButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  hireButtonDisabled: {
    backgroundColor: Colors.border,
  },
  hireButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  hireButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
