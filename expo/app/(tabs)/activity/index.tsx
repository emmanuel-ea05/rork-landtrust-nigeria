import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Filter } from "lucide-react-native";
import Colors from "@/constants/colors";
import { VerificationStatus } from "@/types";
import { MOCK_VERIFICATIONS } from "@/mocks/data";
import VerificationCard from "@/components/VerificationCard";

const FILTER_OPTIONS: { label: string; value: VerificationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "In Review", value: "under_review" },
  { label: "Survey", value: "survey_check" },
  { label: "Legal", value: "legal_review" },
  { label: "Inspection", value: "field_inspection" },
  { label: "Completed", value: "completed" },
  { label: "Flagged", value: "flagged" },
];

export default function ActivityScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<VerificationStatus | "all">("all");

  const filteredVerifications = useMemo(() => {
    if (activeFilter === "all") return MOCK_VERIFICATIONS;
    return MOCK_VERIFICATIONS.filter((v) => v.status === activeFilter);
  }, [activeFilter]);

  const handleViewCase = useCallback(
    (id: string) => {
      router.push(`/(tabs)/activity/${id}`);
    },
    [router]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Filter size={16} color={Colors.textSecondary} />
          <Text style={styles.filterLabel}>Filter by status</Text>
        </View>
        <FlatList
          horizontal
          data={FILTER_OPTIONS}
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
                  activeFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        <Text style={styles.resultCount}>
          {filteredVerifications.length} verification
          {filteredVerifications.length !== 1 ? "s" : ""}
        </Text>
      </View>
    ),
    [activeFilter, filteredVerifications.length]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredVerifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VerificationCard
            verification={item}
            onPress={() => handleViewCase(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No verifications found</Text>
            <Text style={styles.emptySubtext}>
              Try changing the filter or start a new verification.
            </Text>
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
  filterSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
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
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});
