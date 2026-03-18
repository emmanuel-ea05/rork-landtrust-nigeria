import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import {
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Clock,
  Phone,
  Share2,
  Copy,
  Calendar,
  DollarSign,
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

const STEP_DESCRIPTIONS: Record<string, string> = {
  submitted: "Your request has been received and is in the queue.",
  under_review: "A team member is reviewing your submitted documents.",
  survey_check: "A licensed surveyor is verifying coordinates and boundaries.",
  legal_review: "A lawyer is checking title authenticity and ownership chain.",
  field_inspection: "A field inspector is visiting the physical location.",
  completed: "All checks complete. Your report is ready.",
};

const ESTIMATED_TIMES: Record<string, string> = {
  submitted: "1-2 hours",
  under_review: "24-48 hours",
  survey_check: "2-3 days",
  legal_review: "3-5 days",
  field_inspection: "1-2 days",
  completed: "Done",
};

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

  const handleShare = async () => {
    if (!verification) return;
    try {
      await Share.share({
        message: `LandSecure Verification ${verification.id}\nPlot: ${verification.plotNumber}\nDistrict: ${verification.district}, ${verification.state}\nStatus: ${STATUS_LABELS[verification.status]}`,
      });
    } catch (error) {
      console.log("[VerificationDetail] Share error:", error);
    }
  };

  const handleCopyId = () => {
    if (!verification) return;
    Alert.alert("Copied", `Case ID ${verification.id} copied to clipboard.`);
  };

  const handleDownloadReport = () => {
    Alert.alert(
      "Download Report",
      "Your verification report PDF will be generated and downloaded.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Download", style: "default" },
      ]
    );
  };

  const handleContactPro = (name: string) => {
    Alert.alert(
      "Contact Professional",
      `Would you like to contact ${name} about this verification?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Contact", style: "default" },
      ]
    );
  };

  if (!verification) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Verification not found</Text>
        <Text style={styles.notFoundSub}>
          This case may have been removed or the ID is invalid.
        </Text>
      </View>
    );
  }

  const isFlagged = verification.status === "flagged";
  const isCompleted = verification.status === "completed";
  const riskColor =
    (verification.riskScore ?? 0) > 60
      ? Colors.danger
      : (verification.riskScore ?? 0) > 30
      ? Colors.warning
      : Colors.success;
  const riskLabel =
    (verification.riskScore ?? 0) > 60
      ? "High Risk"
      : (verification.riskScore ?? 0) > 30
      ? "Medium Risk"
      : "Low Risk";

  const daysSinceSubmission = Math.floor(
    (Date.now() - new Date(verification.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

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
            <View style={styles.headerTitleArea}>
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

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleCopyId}
              activeOpacity={0.7}
            >
              <Copy size={14} color={Colors.goldLight} />
              <Text style={styles.headerActionText}>{verification.id}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={14} color={Colors.goldLight} />
              <Text style={styles.headerActionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {verification.riskScore !== undefined && (
            <View style={styles.riskSection}>
              <View style={styles.riskLabelRow}>
                <Text style={styles.riskLabel}>Risk Score</Text>
                <Text style={[styles.riskBadge, { color: riskColor }]}>
                  {riskLabel}
                </Text>
              </View>
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

        <View style={styles.timelineCard}>
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Calendar size={14} color={Colors.textTertiary} />
              <View>
                <Text style={styles.timelineLabel}>Submitted</Text>
                <Text style={styles.timelineValue}>
                  {new Date(verification.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <Clock size={14} color={Colors.textTertiary} />
              <View>
                <Text style={styles.timelineLabel}>Duration</Text>
                <Text style={styles.timelineValue}>{daysSinceSubmission} days</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <DollarSign size={14} color={Colors.textTertiary} />
              <View>
                <Text style={styles.timelineLabel}>Fee</Text>
                <Text style={styles.timelineValue}>
                  ₦{verification.fee.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
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
                            isActive &&
                              i < currentStepIndex &&
                              styles.pipelineLineActive,
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
                        <>
                          <View style={styles.currentBadge}>
                            <Clock size={10} color={Colors.primary} />
                            <Text style={styles.currentBadgeText}>
                              In Progress
                            </Text>
                          </View>
                          <Text style={styles.stepDesc}>
                            {STEP_DESCRIPTIONS[step]}
                          </Text>
                          <Text style={styles.stepEta}>
                            Est. {ESTIMATED_TIMES[step]}
                          </Text>
                        </>
                      )}
                      {i < currentStepIndex && (
                        <Text style={styles.stepCompleted}>Completed</Text>
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
                Our team has identified potential problems with the title or
                ownership. Review the full report below for details.
              </Text>
              <View style={styles.flaggedActions}>
                <TouchableOpacity style={styles.flaggedAction} activeOpacity={0.7}>
                  <Text style={styles.flaggedActionText}>Contact Support</Text>
                </TouchableOpacity>
              </View>
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
              <DetailRow
                label="Survey Number"
                value={verification.surveyNumber}
              />
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
              label="Last Updated"
              value={new Date(verification.updatedAt).toLocaleDateString(
                "en-NG",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            />
            <DetailRow
              label="Fee"
              value={`₦${verification.fee.toLocaleString()}`}
            />
            <DetailRow
              label="Payment"
              value={verification.paid ? "Paid" : "Pending"}
              isLast
              valueColor={verification.paid ? Colors.success : Colors.warning}
            />
          </View>
        </View>

        <View style={styles.docsSection}>
          <Text style={styles.sectionTitle}>
            Documents ({verification.documents.length})
          </Text>
          {verification.documents.map((doc) => (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.docIconWrap}>
                <FileText size={18} color={Colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </Text>
                <Text style={styles.docFile}>{doc.name}</Text>
                <Text style={styles.docDate}>
                  Uploaded{" "}
                  {new Date(doc.uploadedAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {assignedPros.length > 0 && (
          <View style={styles.prosSection}>
            <Text style={styles.sectionTitle}>
              Assigned Professionals ({assignedPros.length})
            </Text>
            {assignedPros.map((pro) => (
              <View key={pro.id} style={styles.proCard}>
                <View style={styles.proAvatar}>
                  <Text style={styles.proInitials}>
                    {pro.name
                      .split(" ")
                      .slice(-2)
                      .map((n) => n[0])
                      .join("")}
                  </Text>
                </View>
                <View style={styles.proInfo}>
                  <Text style={styles.proName}>{pro.name}</Text>
                  <Text style={styles.proType}>{pro.specialization}</Text>
                  <Text style={styles.proLicense}>{pro.license}</Text>
                </View>
                <TouchableOpacity
                  style={styles.proContactBtn}
                  onPress={() => handleContactPro(pro.name)}
                  activeOpacity={0.7}
                >
                  <Phone size={14} color={Colors.primary} />
                </TouchableOpacity>
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

              <Text style={styles.reportGenerated}>
                Report generated{" "}
                {new Date(verification.report.generatedAt).toLocaleDateString(
                  "en-NG",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </Text>

              <TouchableOpacity
                style={styles.downloadButton}
                activeOpacity={0.7}
                onPress={handleDownloadReport}
              >
                <Download size={16} color={Colors.white} />
                <Text style={styles.downloadText}>Download PDF Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isCompleted && !verification.report && (
          <View style={styles.pendingReport}>
            <Clock size={20} color={Colors.info} />
            <View style={styles.pendingReportContent}>
              <Text style={styles.pendingReportTitle}>Report Being Generated</Text>
              <Text style={styles.pendingReportText}>
                Your verification is complete. The final report is being compiled
                and will be available shortly.
              </Text>
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

function ReportRow({ label, value }: { label: string; value: string }) {
  const isGood = value === "verified" || value === "clear";
  const isBad =
    value === "suspicious" ||
    value === "disputed" ||
    value === "acquired" ||
    value === "mismatch";
  const color = isGood
    ? Colors.success
    : isBad
    ? Colors.danger
    : Colors.warning;

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
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  notFoundSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
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
  headerTitleArea: {
    flex: 1,
    marginRight: 12,
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
  headerActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerActionText: {
    fontSize: 12,
    color: Colors.goldLight,
    fontWeight: "500" as const,
  },
  riskSection: {
    marginTop: 16,
  },
  riskLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  riskLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500" as const,
  },
  riskBadge: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  riskBarTrack: {
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
    marginTop: 4,
    textAlign: "right" as const,
  },
  timelineCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
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
    paddingBottom: 14,
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
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  stepEta: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 3,
    fontStyle: "italic" as const,
  },
  stepCompleted: {
    fontSize: 11,
    color: Colors.success,
    marginTop: 2,
    fontWeight: "500" as const,
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
  flaggedActions: {
    marginTop: 12,
  },
  flaggedAction: {
    backgroundColor: Colors.danger + "15",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  flaggedActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.danger,
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
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
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
  docDate: {
    fontSize: 11,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "12",
    justifyContent: "center",
    alignItems: "center",
  },
  proInitials: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: Colors.primary,
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
    color: Colors.textSecondary,
    marginTop: 2,
  },
  proLicense: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  proContactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 8,
  },
  reportGenerated: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 16,
    fontStyle: "italic" as const,
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
  pendingReport: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.info + "10",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.info + "25",
  },
  pendingReportContent: {
    flex: 1,
  },
  pendingReportTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.info,
    marginBottom: 4,
  },
  pendingReportText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  bottomSpacer: {
    height: 20,
  },
});
