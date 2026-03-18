import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import {
  MapPin,
  FileText,
  User,
  AlertTriangle,
  CheckCircle,
  Download,
  Clock,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MOCK_VERIFICATIONS, MOCK_PROFESSIONALS } from "@/mocks/data";
import {
  VerificationStatus,
  STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
} from "@/types";
import StatusBadge from "@/components/StatusBadge";

const PIPELINE_STEPS: VerificationStatus[] = [
  "submitted",
  "under_review",
  "survey_check",
  "legal_review",
  "field_inspection",
  "completed",
];

export default function VerificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const verification = useMemo(
    () => MOCK_VERIFICATIONS.find((v) => v.id === id),
    [id]
  );

  const currentStepIndex = useMemo(() => {
    if (!verification) return 0;
    if (verification.status === "flagged") return -1;
    return PIPELINE_STEPS.indexOf(verification.status);
  }, [verification]);

  useEffect(() => {
    if (currentStepIndex >= 0) {
      Animated.timing(progressAnim, {
        toValue: currentStepIndex / (PIPELINE_STEPS.length - 1),
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [currentStepIndex, progressAnim]);

  const assignedPros = useMemo(() => {
    if (!verification) return [];
    return MOCK_PROFESSIONALS.filter((p) =>
      verification.assignedProfessionals.includes(p.id)
    );
  }, [verification]);

  if (!verification) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Verification not found</Text>
      </View>
    );
  }

  const isFlagged = verification.status === "flagged";
  const riskColor =
    (verification.riskScore ?? 0) > 60
      ? Colors.danger
      : (verification.riskScore ?? 0) > 30
      ? Colors.warning
      : Colors.success;

  return (
    <>
      <Stack.Screen options={{ title: verification.id }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.plotNumber}>{verification.plotNumber}</Text>
              <View style={styles.locationRow}>
                <MapPin size={13} color={Colors.goldLight} />
                <Text style={styles.locationText}>
                  {verification.district}, {verification.state}
                </Text>
              </View>
            </View>
            <StatusBadge status={verification.status} size="medium" />
          </View>

          {verification.riskScore !== undefined && (
            <View style={styles.riskSection}>
              <Text style={styles.riskLabel}>Risk Score</Text>
              <View style={styles.riskBarTrack}>
                <View
                  style={[
                    styles.riskBarFill,
                    {
                      width: `${verification.riskScore}%`,
                      backgroundColor: riskColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.riskValue, { color: riskColor }]}>
                {verification.riskScore}/100
              </Text>
            </View>
          )}
        </View>

        {!isFlagged && (
          <View style={styles.pipelineSection}>
            <Text style={styles.sectionTitle}>Verification Progress</Text>
            <View style={styles.pipeline}>
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <View key={step} style={styles.pipelineStep}>
                    <View style={styles.pipelineLeftCol}>
                      <View
                        style={[
                          styles.pipelineDot,
                          isActive && styles.pipelineDotActive,
                          isCurrent && styles.pipelineDotCurrent,
                        ]}
                      >
                        {i < currentStepIndex ? (
                          <CheckCircle size={14} color={Colors.white} />
                        ) : (
                          <Text
                            style={[
                              styles.pipelineDotNumber,
                              isActive && styles.pipelineDotNumberActive,
                            ]}
                          >
                            {i + 1}
                          </Text>
                        )}
                      </View>
                      {i < PIPELINE_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.pipelineLine,
                            isActive && i < currentStepIndex && styles.pipelineLineActive,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.pipelineContent}>
                      <Text
                        style={[
                          styles.pipelineStepLabel,
                          isActive && styles.pipelineStepLabelActive,
                          isCurrent && styles.pipelineStepLabelCurrent,
                        ]}
                      >
                        {STATUS_LABELS[step]}
                      </Text>
                      {isCurrent && (
                        <View style={styles.currentBadge}>
                          <Clock size={10} color={Colors.primary} />
                          <Text style={styles.currentBadgeText}>
                            In Progress
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {isFlagged && (
          <View style={styles.flaggedCard}>
            <AlertTriangle size={22} color={Colors.danger} />
            <View style={styles.flaggedContent}>
              <Text style={styles.flaggedTitle}>Issues Detected</Text>
              <Text style={styles.flaggedText}>
                This property has been flagged due to verification concerns.
                Review the report below for details.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Plot Number" value={verification.plotNumber} />
            <DetailRow
              label="District"
              value={`${verification.district}, ${verification.state}`}
            />
            {verification.surveyNumber && (
              <DetailRow label="Survey Number" value={verification.surveyNumber} />
            )}
            {verification.coordinates && (
              <DetailRow
                label="Coordinates"
                value={`${verification.coordinates.latitude}, ${verification.coordinates.longitude}`}
              />
            )}
            <DetailRow label="Seller" value={verification.sellerName} />
            <DetailRow
              label="Submitted"
              value={new Date(verification.createdAt).toLocaleDateString(
                "en-NG",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            />
            <DetailRow
              label="Fee"
              value={`₦${verification.fee.toLocaleString()}`}
              isLast
            />
          </View>
        </View>

        <View style={styles.docsSection}>
          <Text style={styles.sectionTitle}>
            Documents ({verification.documents.length})
          </Text>
          {verification.documents.map((doc) => (
            <View key={doc.id} style={styles.docCard}>
              <FileText size={18} color={Colors.primary} />
              <View style={styles.docInfo}>
                <Text style={styles.docName}>
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </Text>
                <Text style={styles.docFile}>{doc.name}</Text>
              </View>
            </View>
          ))}
        </View>

        {assignedPros.length > 0 && (
          <View style={styles.prosSection}>
            <Text style={styles.sectionTitle}>Assigned Professionals</Text>
            {assignedPros.map((pro) => (
              <View key={pro.id} style={styles.proCard}>
                <View style={styles.proAvatar}>
                  <User size={18} color={Colors.primary} />
                </View>
                <View style={styles.proInfo}>
                  <Text style={styles.proName}>{pro.name}</Text>
                  <Text style={styles.proType}>{pro.specialization}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {verification.report && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Verification Report</Text>
            <View style={styles.reportCard}>
              <ReportRow
                label="Title Authenticity"
                value={verification.report.titleAuthenticity}
              />
              <ReportRow
                label="Survey Verification"
                value={verification.report.surveyVerification}
              />
              <ReportRow
                label="Ownership Check"
                value={verification.report.ownershipCheck}
              />
              <ReportRow
                label="Gov. Acquisition"
                value={verification.report.governmentAcquisition}
              />

              <View style={styles.reportDivider} />
              <Text style={styles.reportSummaryLabel}>Summary</Text>
              <Text style={styles.reportSummary}>
                {verification.report.summary}
              </Text>

              <TouchableOpacity
                style={styles.downloadButton}
                activeOpacity={0.7}
              >
                <Download size={16} color={Colors.white} />
                <Text style={styles.downloadText}>Download PDF Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

function DetailRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      {!isLast && <View style={styles.detailDivider} />}
    </>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  const isGood =
    value === "verified" || value === "clear";
  const isBad =
    value === "suspicious" || value === "disputed" || value === "acquired" || value === "mismatch";
  const color = isGood ? Colors.success : isBad ? Colors.danger : Colors.warning;

  return (
    <View style={styles.reportRow}>
      <Text style={styles.reportLabel}>{label}</Text>
      <View style={[styles.reportBadge, { backgroundColor: color + "18" }]}>
        {isGood ? (
          <CheckCircle size={12} color={color} />
        ) : (
          <AlertTriangle size={12} color={color} />
        )}
        <Text style={[styles.reportBadgeText, { color }]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 30,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  plotNumber: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.white,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.goldLight,
  },
  riskSection: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  riskLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500" as const,
  },
  riskBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
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
  },
  pipelineSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  pipeline: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pipelineStep: {
    flexDirection: "row",
    minHeight: 44,
  },
  pipelineLeftCol: {
    alignItems: "center",
    width: 30,
  },
  pipelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  pipelineDotActive: {
    backgroundColor: Colors.success,
  },
  pipelineDotCurrent: {
    backgroundColor: Colors.primary,
  },
  pipelineDotNumber: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.textTertiary,
  },
  pipelineDotNumberActive: {
    color: Colors.white,
  },
  pipelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  pipelineLineActive: {
    backgroundColor: Colors.success,
  },
  pipelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 12,
    justifyContent: "center",
  },
  pipelineStepLabel: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  pipelineStepLabelActive: {
    color: Colors.text,
    fontWeight: "600" as const,
  },
  pipelineStepLabelCurrent: {
    color: Colors.primary,
    fontWeight: "700" as const,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  flaggedCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.danger + "10",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.danger + "25",
  },
  flaggedContent: {
    flex: 1,
  },
  flaggedTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.danger,
    marginBottom: 4,
  },
  flaggedText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  detailsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
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
  docsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  docFile: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  prosSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  proCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  proAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "12",
    justifyContent: "center",
    alignItems: "center",
  },
  proInfo: {
    flex: 1,
  },
  proName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  proType: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  reportSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  reportCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  reportLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  reportDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  reportSummaryLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  reportSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  bottomSpacer: {
    height: 20,
  },
});
