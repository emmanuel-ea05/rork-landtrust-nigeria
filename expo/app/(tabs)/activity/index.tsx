import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Filter, Shield, ArrowUpDown } from "lucide-react-native";
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

type SortOrder = "newest" | "oldest";

export default function ActivityScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<VerificationStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [refreshing, setRefreshing] = useState(false);

  const filteredVerifications = useMemo(() => {
    let result = activeFilter === "all"
      ? [...MOCK_VERIFICATIONS]
      : MOCK_VERIFICATIONS.filter((v) => v.status === activeFilter);

    result.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [activeFilter, sortOrder]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MOCK_VERIFICATIONS.length };
    MOCK_VERIFICATIONS.forEach((v) => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return counts;
  }, []);

  const handleViewCase = useCallback(
    (id: string) => {
      console.log(`[ActivityScreen] Viewing case: ${id}`);
      router.push(`/(tabs)/activity/${id}`);
    },
    [router]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    console.log("[ActivityScreen] Refreshing...");
    setTimeout(() => {
      setRefreshing(false);
      console.log("[ActivityScreen] Refresh complete");
    }, 1200);
  }, []);

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  }, []);

  const completedCount = MOCK_VERIFICATIONS.filter((v) => v.status === "completed").length;
  const flaggedCount = MOCK_VERIFICATIONS.filter((v) => v.status === "flagged").length;

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{MOCK_VERIFICATIONS.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>{flaggedCount}</Text>
            <Text style={styles.summaryLabel}>Flagged</Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <View style={styles.filterLeft}>
              <Filter size={16} color={Colors.textSecondary} />
              <Text style={styles.filterLabel}>Filter by status</Text>
            </View>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={toggleSort}
              activeOpacity={0.7}
            >
              <ArrowUpDown size={14} color={Colors.textSecondary} />
              <Text style={styles.sortText}>
                {sortOrder === "newest" ? "Newest" : "Oldest"}
              </Text>
            </TouchableOpacity>
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
                  {statusCounts[item.value] !== undefined
                    ? ` (${statusCounts[item.value]})`
                    : ""}
                </Text>
              </TouchableOpacity>
            )}
          />
          <Text style={styles.resultCount}>
            {filteredVerifications.length} verification
            {filteredVerifications.length !== 1 ? "s" : ""} · Sorted by{" "}
            {sortOrder === "newest" ? "most recent" : "oldest first"}
          </Text>
        </View>
      </View>
    ),
    [activeFilter, filteredVerifications.length, sortOrder, statusCounts, toggleSort, completedCount, flaggedCount]
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Shield size={36} color={Colors.border} />
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
  headerSection: {
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: "500" as const,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  filterSection: {
    paddingBottom: 8,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortText: {
    fontSize: 12,
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
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center" as const,
  },
});
