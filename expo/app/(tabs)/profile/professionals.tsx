import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  Star,
  MapPin,
  CheckCircle,
  Award,
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
              Verified professionals for your land verification needs in Abuja.
            </Text>
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
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
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

            <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
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
  contactButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
