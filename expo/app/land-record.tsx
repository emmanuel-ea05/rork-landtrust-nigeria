import React, { useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
  MapPin,
  Shield,
  Clock,
  AlertTriangle,
  Share2,
  Copy,
  ExternalLink,
  FileText,
  Users,
  Gavel,
  Building2,
  ArrowRightLeft,
  Eye,
  TrendingUp,
  Link,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MOCK_LAND_RECORDS } from "@/mocks/data";
import {
  LAND_STATUS_LABELS,
  LAND_STATUS_COLORS,
  OwnershipEvent,
} from "@/types";

const EVENT_ICONS: Record<OwnershipEvent["type"], React.ComponentType<{ size: number; color: string }>> = {
  allocation: Building2,
  transfer: ArrowRightLeft,
  verification: Shield,
  dispute: AlertTriangle,
  acquisition: Building2,
  mortgage: FileText,
  court_ruling: Gavel,
  status_change: TrendingUp,
};

const EVENT_COLORS: Record<OwnershipEvent["type"], string> = {
  allocation: Colors.info,
  transfer: Colors.gold,
  verification: Colors.primary,
  dispute: Colors.danger,
  acquisition: Colors.danger,
  mortgage: Colors.warning,
  court_ruling: Colors.statusSurvey,
  status_change: Colors.success,
};

export default function LandRecordScreen() {
  const { landId } = useLocalSearchParams<{ landId: string }>();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timelineAnims = useRef<Animated.Value[]>([]).current;

  const record = useMemo(
    () => MOCK_LAND_RECORDS.find((r) => r.landId === landId),
    [landId]
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    if (record) {
      while (timelineAnims.length < record.timeline.length) {
        timelineAnims.push(new Animated.Value(0));
      }
      Animated.stagger(
        80,
        timelineAnims.slice(0, record.timeline.length).map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [record, fadeAnim, timelineAnims]);

  const handleShareReport = useCallback(async () => {
    if (!record) return;
    try {
      const statusLabel = LAND_STATUS_LABELS[record.status];
      const riskText = record.riskScore > 60 ? "HIGH RISK" : record.riskScore > 30 ? "MEDIUM RISK" : "LOW RISK";
      await Share.share({
        message: `LandSecure Verified Report\n\nLand ID: ${record.landId}\nPlot: ${record.plotNumber}\nLocation: ${record.district}, ${record.state}\nStatus: ${statusLabel}\nRisk: ${riskText} (${record.riskScore}/100)\nOwner: ${record.currentOwner}\nVerifications: ${record.totalVerifications}\n\nCheck this land's status: landsecure.ng/land/${record.landId}\n\nVerify Land Before You Buy \u2014 LandSecure Nigeria`,
        title: `Land Status: ${record.plotNumber}`,
      });
      console.log("[LandRecord] Report shared successfully");
    } catch (error) {
      console.log("[LandRecord] Share error:", error);
    }
  }, [record]);

  const handleSharePublicLink = useCallback(async () => {
    if (!record) return;
    try {
      await Share.share({
        message: `Check the verified status of this land on LandSecure:\n\nLand ID: ${record.landId}\nPlot: ${record.plotNumber}\nDistrict: ${record.district}\n\nView status: landsecure.ng/land/${record.landId}\n\nFree to check \u2014 LandSecure Nigeria`,
        title: `View Land Status: ${record.landId}`,
      });
      console.log("[LandRecord] Public link shared");
    } catch (error) {
      console.log("[LandRecord] Share link error:", error);
    }
  }, [record]);

  const handleCopyLandId = useCallback(() => {
    if (!record) return;
    Alert.alert("Copied", `Land ID ${record.landId} copied to clipboard.`);
  }, [record]);

  const handleRequestVerification = useCallback(() => {
    router.push("/(tabs)/verify");
  }, [router]);

  if (!record) {
    return (
      <>
        <Stack.Screen options={{ title: "Land Record" }} />
        <View style={styles.notFound}>
          <Shield size={40} color={Colors.border} />
          <Text style={styles.notFoundTitle}>Land Record Not Found</Text>
          <Text style={styles.notFoundSub}>
            This Land ID doesn't exist in our registry. It may not have been verified yet.
          </Text>
          <TouchableOpacity
            style={styles.notFoundCta}
            onPress={handleRequestVerification}
            activeOpacity={0.7}
          >
            <Text style={styles.notFoundCtaText}>Request Verification</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const statusColor = LAND_STATUS_COLORS[record.status];
  const riskColor = record.riskScore > 60 ? Colors.danger : record.riskScore > 30 ? Colors.warning : Colors.success;
  const riskLabel = record.riskScore > 60 ? "High Risk" : record.riskScore > 30 ? "Medium Risk" : "Low Risk";
  const sortedTimeline = [...record.timeline].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: record.landId,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "700" as const },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.headerCard, { opacity: fadeAnim }]}>
          <View style={styles.landIdRow}>
            <TouchableOpacity
              style={styles.landIdBadge}
              onPress={handleCopyLandId}
              activeOpacity={0.7}
            >
              <Copy size={12} color={Colors.gold} />
              <Text style={styles.landIdText}>{record.landId}</Text>
            </TouchableOpacity>
            <View style={[styles.statusChip, { backgroundColor: statusColor + "25" }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusChipText, { color: statusColor }]}>
                {LAND_STATUS_LABELS[record.status]}
              </Text>
            </View>
          </View>

          <Text style={styles.plotNumber}>{record.plotNumber}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.goldLight} />
            <Text style={styles.locationText}>
              {record.district}, {record.state}
            </Text>
            {record.areaSize && (
              <Text style={styles.areaText}> · {record.areaSize}</Text>
            )}
          </View>

          <View style={styles.ownerRow}>
            <Users size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.ownerLabel}>Current Owner:</Text>
            <Text style={styles.ownerName}>{record.currentOwner}</Text>
          </View>

          <View style={styles.riskSection}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskLabel}>Risk Score</Text>
              <Text style={[styles.riskBadgeText, { color: riskColor }]}>{riskLabel}</Text>
            </View>
            <View style={styles.riskBarTrack}>
              <View
                style={[styles.riskBarFill, { width: `${record.riskScore}%`, backgroundColor: riskColor }]}
              />
            </View>
            <Text style={[styles.riskValue, { color: riskColor }]}>{record.riskScore}/100</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareReport}
              activeOpacity={0.7}
            >
              <Share2 size={14} color={Colors.gold} />
              <Text style={styles.shareBtnText}>Share Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleSharePublicLink}
              activeOpacity={0.7}
            >
              <Link size={14} color={Colors.gold} />
              <Text style={styles.shareBtnText}>Public Link</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Eye size={16} color={Colors.primary} />
            <Text style={styles.statValue}>{record.totalVerifications}</Text>
            <Text style={styles.statLabel}>Verifications</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Clock size={16} color={Colors.primary} />
            <Text style={styles.statValue}>
              {record.lastVerified
                ? new Date(record.lastVerified).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                : "Pending"}
            </Text>
            <Text style={styles.statLabel}>Last Verified</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TrendingUp size={16} color={Colors.primary} />
            <Text style={styles.statValue}>{record.timeline.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        {record.status === "disputed" && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={20} color={Colors.danger} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Active Dispute</Text>
              <Text style={styles.warningDesc}>
                This land has an active ownership dispute. Do not purchase without legal counsel.
              </Text>
            </View>
          </View>
        )}

        {record.status === "government_acquisition" && (
          <View style={[styles.warningBanner, { backgroundColor: Colors.danger + "10", borderColor: Colors.danger + "25" }]}>
            <Building2 size={20} color={Colors.danger} />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: Colors.danger }]}>Government Acquisition</Text>
              <Text style={styles.warningDesc}>
                This land is under government acquisition. Purchase is strongly advised against.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <DetailRow label="Land ID" value={record.landId} />
          <DetailRow label="Plot Number" value={record.plotNumber} />
          <DetailRow label="District" value={`${record.district}, ${record.state}`} />
          {record.surveyNumber && <DetailRow label="Survey No." value={record.surveyNumber} />}
          {record.coordinates && (
            <DetailRow
              label="Coordinates"
              value={`${record.coordinates.latitude}, ${record.coordinates.longitude}`}
            />
          )}
          {record.areaSize && <DetailRow label="Area Size" value={record.areaSize} />}
          <DetailRow label="Current Owner" value={record.currentOwner} />
          <DetailRow
            label="Status"
            value={LAND_STATUS_LABELS[record.status]}
            valueColor={statusColor}
          />
          <DetailRow
            label="First Recorded"
            value={new Date(record.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            isLast
          />
        </View>

        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={styles.sectionTitle}>Land History Timeline</Text>
            <Text style={styles.timelineCount}>{record.timeline.length} events</Text>
          </View>

          {sortedTimeline.map((event, i) => {
            const IconComp = EVENT_ICONS[event.type];
            const eventColor = EVENT_COLORS[event.type];
            const animValue = timelineAnims[i] ?? new Animated.Value(1);

            return (
              <Animated.View
                key={event.id}
                style={[
                  styles.timelineEvent,
                  {
                    opacity: animValue,
                    transform: [
                      {
                        translateX: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineIcon, { backgroundColor: eventColor + "18" }]}>
                    <IconComp size={16} color={eventColor} />
                  </View>
                  {i < sortedTimeline.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.timelineDate}>
                    {new Date(event.date).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={styles.timelineTitle}>{event.title}</Text>
                  <Text style={styles.timelineDesc}>{event.description}</Text>
                  {event.actor && (
                    <View style={styles.timelineMeta}>
                      <Users size={11} color={Colors.textTertiary} />
                      <Text style={styles.timelineActor}>{event.actor}</Text>
                    </View>
                  )}
                  {event.documentRef && (
                    <View style={styles.timelineMeta}>
                      <FileText size={11} color={Colors.textTertiary} />
                      <Text style={styles.timelineRef}>{event.documentRef}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share This Land Record</Text>
          <Text style={styles.shareDesc}>
            Help others verify this land before purchasing. Share the verified status with buyers, family, or lawyers.
          </Text>

          <TouchableOpacity
            style={styles.sharePrimaryBtn}
            onPress={handleShareReport}
            activeOpacity={0.7}
          >
            <Share2 size={18} color={Colors.white} />
            <Text style={styles.sharePrimaryText}>Share Full Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareSecondaryBtn}
            onPress={handleSharePublicLink}
            activeOpacity={0.7}
          >
            <ExternalLink size={16} color={Colors.primary} />
            <Text style={styles.shareSecondaryText}>Share Public Status Link</Text>
          </TouchableOpacity>

          <View style={styles.shareTip}>
            <Eye size={14} color={Colors.info} />
            <Text style={styles.shareTipText}>
              Anyone with the link can view this land's status and basic info for free. Full reports require verification.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.requestVerificationBtn}
          onPress={handleRequestVerification}
          activeOpacity={0.7}
        >
          <Shield size={18} color={Colors.white} />
          <Text style={styles.requestVerificationText}>Request New Verification</Text>
          <ChevronRight size={16} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

function DetailRow({
  label,
  value,
  isLast,
  valueColor,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  valueColor?: string;
}) {
  return (
    <>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, valueColor ? { color: valueColor } : undefined]}>
          {value}
        </Text>
      </View>
      {!isLast && <View style={styles.detailDivider} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 32,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
    marginBottom: 24,
  },
  notFoundCta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  notFoundCtaText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  headerCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
  },
  landIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  landIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  landIdText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  plotNumber: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.white,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: Colors.goldLight,
  },
  areaText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ownerLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  riskSection: {
    marginBottom: 16,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  riskLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500" as const,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  riskBarTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  riskBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  riskValue: {
    fontSize: 13,
    fontWeight: "700" as const,
    marginTop: 4,
    textAlign: "right" as const,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.gold,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.warning + "10",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + "25",
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.warning,
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    minWidth: 90,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "right" as const,
    flex: 1,
    marginLeft: 16,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  timelineSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  timelineCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  timelineEvent: {
    flexDirection: "row",
    marginBottom: 2,
  },
  timelineLeft: {
    alignItems: "center",
    width: 44,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginLeft: 8,
  },
  timelineDate: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 6,
  },
  timelineMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  timelineActor: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  timelineRef: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  shareSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  shareDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
    marginTop: -6,
  },
  sharePrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  sharePrimaryText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  shareSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary + "10",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "25",
    marginBottom: 12,
  },
  shareSecondaryText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  shareTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.info + "08",
    padding: 12,
    borderRadius: 10,
  },
  shareTipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  requestVerificationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 14,
  },
  requestVerificationText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primaryDark,
  },
  bottomSpacer: {
    height: 30,
  },
});
