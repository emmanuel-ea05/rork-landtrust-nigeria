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
import {
  Filter,
  Shield,
  ArrowUpDown,
  Database,
  MapPin,
  Eye,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { VerificationStatus, LAND_STATUS_LABELS, LAND_STATUS_COLORS } from "@/types";
import { MOCK_VERIFICATIONS, MOCK_LAND_RECORDS } from "@/mocks/data";
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
type ActiveTab = "verifications" | "registry";

export default function ActivityScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<VerificationStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("verifications");

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

  const sortedLandRecords = useMemo(() => {
    return [...MOCK_LAND_RECORDS].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [sortOrder]);

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

  const handleViewLandRecord = useCallback(
    (landId: string) => {
      console.log(`[ActivityScreen] Viewing land record: ${landId}`);
      router.push({ pathname: "/land-record", params: { landId } });
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
  const safeLandCount = MOCK_LAND_RECORDS.filter((r) => r.status === "safe").length;

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerSection}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "verifications" && styles.tabBtnActive]}
            onPress={() => setActiveTab("verifications")}
            activeOpacity={0.7}
          >
            <Shield size={14} color={activeTab === "verifications" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "verifications" && styles.tabBtnTextActive]}>
              Verifications
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "registry" && styles.tabBtnActive]}
            onPress={() => setActiveTab("registry")}
            activeOpacity={0.7}
          >
            <Database size={14} color={activeTab === "registry" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "registry" && styles.tabBtnTextActive]}>
              Land Registry
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "verifications" ? (
          <>
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
          </>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{MOCK_LAND_RECORDS.length}</Text>
                <Text style={styles.summaryLabel}>Tracked</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>{safeLandCount}</Text>
                <Text style={styles.summaryLabel}>Safe</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                  {MOCK_LAND_RECORDS.filter((r) => r.status === "disputed" || r.status === "government_acquisition").length}
                </Text>
                <Text style={styles.summaryLabel}>At Risk</Text>
              </View>
            </View>

            <View style={styles.registryIntro}>
              <Database size={16} color={Colors.primary} />
              <Text style={styles.registryIntroText}>
                Every verified land gets a persistent record with full ownership history, verification trail, and live status.
              </Text>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <View style={styles.filterLeft}>
                  <Text style={styles.filterLabel}>{sortedLandRecords.length} land records</Text>
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
            </View>
          </>
        )}
      </View>
    ),
    [activeFilter, filteredVerifications.length, sortOrder, statusCounts, toggleSort, completedCount, flaggedCount, activeTab, safeLandCount, sortedLandRecords.length]
  );

  if (activeTab === "registry") {
    return (
      <View style={styles.container}>
        <FlatList
          data={sortedLandRecords}
          keyExtractor={(item) => item.landId}
          renderItem={({ item }) => {
            const statusColor = LAND_STATUS_COLORS[item.status];
            const riskColor = item.riskScore > 60 ? Colors.danger : item.riskScore > 30 ? Colors.warning : Colors.success;
            return (
              <TouchableOpacity
                style={styles.landCard}
                onPress={() => handleViewLandRecord(item.landId)}
                activeOpacity={0.7}
              >
                <View style={styles.landCardHeader}>
                  <View style={styles.landCardLeft}>
                    <View style={[styles.landStatusIndicator, { backgroundColor: statusColor }]} />
                    <View style={styles.landCardInfo}>
                      <View style={styles.landIdRow}>
                        <Text style={styles.landIdText}>{item.landId}</Text>
                        <View style={[styles.landStatusBadge, { backgroundColor: statusColor + "15" }]}>
                          <Text style={[styles.landStatusText, { color: statusColor }]}>
                            {LAND_STATUS_LABELS[item.status]}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.landPlotNumber}>{item.plotNumber}</Text>
                      <View style={styles.landLocationRow}>
                        <MapPin size={11} color={Colors.textTertiary} />
                        <Text style={styles.landDistrict}>{item.district}, {item.state}</Text>
                        {item.areaSize && <Text style={styles.landArea}> · {item.areaSize}</Text>}
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={18} color={Colors.textTertiary} />
                </View>
                <View style={styles.landCardFooter}>
                  <View style={styles.landMetaItem}>
                    <Text style={styles.landMetaLabel}>Owner</Text>
                    <Text style={styles.landMetaValue}>{item.currentOwner}</Text>
                  </View>
                  <View style={styles.landMetaDivider} />
                  <View style={styles.landMetaItem}>
                    <Text style={styles.landMetaLabel}>Risk</Text>
                    <Text style={[styles.landMetaValue, { color: riskColor }]}>{item.riskScore}/100</Text>
                  </View>
                  <View style={styles.landMetaDivider} />
                  <View style={styles.landMetaItem}>
                    <Eye size={12} color={Colors.textTertiary} />
                    <Text style={styles.landMetaValue}>{item.totalVerifications}</Text>
                  </View>
                  <View style={styles.landMetaDivider} />
                  <View style={styles.landMetaItem}>
                    <Text style={styles.landMetaLabel}>Events</Text>
                    <Text style={styles.landMetaValue}>{item.timeline.length}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
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
              <Database size={36} color={Colors.border} />
              <Text style={styles.emptyText}>No land records yet</Text>
              <Text style={styles.emptySubtext}>
                Land records are created automatically when verifications are completed.
              </Text>
            </View>
          }
        />
      </View>
    );
  }

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
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.white,
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
  registryIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.primary + "08",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "15",
  },
  registryIntroText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
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
  landCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  landCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  landCardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },
  landStatusIndicator: {
    width: 4,
    height: 52,
    borderRadius: 2,
    marginTop: 2,
  },
  landCardInfo: {
    flex: 1,
  },
  landIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  landIdText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  landStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  landStatusText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  landPlotNumber: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 3,
  },
  landLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  landDistrict: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  landArea: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  landCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  landMetaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  landMetaLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  landMetaValue: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  landMetaDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.borderLight,
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
