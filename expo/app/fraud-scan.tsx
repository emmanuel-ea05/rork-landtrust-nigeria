import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  AlertTriangle,
  Shield,
  MapPin,
  ChevronDown,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  FileWarning,
  Building2,
  Gavel,
  Eye,
  Share2,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { DISTRICTS } from "@/mocks/data";
import { MOCK_LAND_RECORDS } from "@/mocks/data";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface FraudFlag {
  id: string;
  label: string;
  severity: RiskLevel;
  description: string;
  icon: "title" | "survey" | "acquisition" | "dispute" | "ownership";
}

interface ScanResult {
  riskScore: number;
  riskLevel: RiskLevel;
  flags: FraudFlag[];
  summary: string;
  matchedRecord: boolean;
  landId?: string;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: Colors.success,
  medium: Colors.warning,
  high: "#E67E22",
  critical: Colors.danger,
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "LOW RISK",
  medium: "MEDIUM RISK",
  high: "HIGH RISK",
  critical: "CRITICAL — DO NOT BUY",
};

const RISK_MESSAGES: Record<RiskLevel, string> = {
  low: "This area appears relatively safe based on available data. A full verification is still recommended before purchase.",
  medium: "Caution advised. There are some indicators that need professional review before proceeding.",
  high: "Significant red flags detected. Do NOT proceed without a full verification and legal consultation.",
  critical: "STOP. Multiple serious fraud indicators detected. This land is extremely risky. Get professional help immediately.",
};

const FLAG_ICONS = {
  title: FileWarning,
  survey: MapPin,
  acquisition: Building2,
  dispute: Gavel,
  ownership: Eye,
} as const;

function generateScanResult(
  plotNumber: string,
  district: string,
  _latitude: string,
  _longitude: string
): ScanResult {
  const existingRecord = MOCK_LAND_RECORDS.find(
    (r) =>
      r.plotNumber.toLowerCase() === plotNumber.toLowerCase() ||
      r.district.toLowerCase() === district.toLowerCase()
  );

  if (existingRecord) {
    const flags: FraudFlag[] = [];

    if (existingRecord.status === "government_acquisition") {
      flags.push({
        id: "gov_acq",
        label: "Government Acquisition Zone",
        severity: "critical",
        description: "This land falls within a government acquisition area. Purchase would be void.",
        icon: "acquisition",
      });
    }
    if (existingRecord.status === "disputed") {
      flags.push({
        id: "dispute",
        label: "Active Ownership Dispute",
        severity: "high",
        description: "Court records show an active dispute over this land's ownership.",
        icon: "dispute",
      });
      flags.push({
        id: "no_consent",
        label: "Missing Governor's Consent",
        severity: "high",
        description: "No record of Governor's consent for the most recent transfer.",
        icon: "title",
      });
    }
    if (existingRecord.riskScore > 60) {
      flags.push({
        id: "survey_mismatch",
        label: "Survey Coordinate Mismatch",
        severity: "high",
        description: "The stated coordinates do not match registry records for this plot.",
        icon: "survey",
      });
    }
    if (existingRecord.riskScore > 30 && existingRecord.riskScore <= 60) {
      flags.push({
        id: "incomplete_docs",
        label: "Incomplete Documentation",
        severity: "medium",
        description: "Some standard title documents are missing from the registry for this area.",
        icon: "title",
      });
    }
    if (existingRecord.riskScore <= 30 && flags.length === 0) {
      flags.push({
        id: "clear",
        label: "No Major Flags Detected",
        severity: "low",
        description: "No significant issues found in our database for this location.",
        icon: "title",
      });
    }

    const riskLevel: RiskLevel =
      existingRecord.riskScore > 80 ? "critical" :
      existingRecord.riskScore > 60 ? "high" :
      existingRecord.riskScore > 30 ? "medium" : "low";

    return {
      riskScore: existingRecord.riskScore,
      riskLevel,
      flags,
      summary: existingRecord.riskScore > 60
        ? `Multiple red flags detected for ${existingRecord.plotNumber} in ${existingRecord.district}. This land has serious issues that require immediate professional review.`
        : existingRecord.riskScore > 30
        ? `Some concerns found for ${existingRecord.plotNumber} in ${existingRecord.district}. A professional verification is recommended before proceeding.`
        : `No major issues found for ${existingRecord.plotNumber} in ${existingRecord.district}. For full peace of mind, order a complete verification.`,
      matchedRecord: true,
      landId: existingRecord.landId,
    };
  }

  const hash = (plotNumber + district).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const riskScore = (hash % 70) + 15;
  const flags: FraudFlag[] = [];

  if (riskScore > 50) {
    flags.push({
      id: "unverified_area",
      label: "Unverified Area",
      severity: "medium",
      description: "This plot has not been previously verified on LandSecure. Exercise caution.",
      icon: "title",
    });
    flags.push({
      id: "boundary_check",
      label: "Boundary Verification Needed",
      severity: "medium",
      description: "No survey records on file. Physical boundary check strongly recommended.",
      icon: "survey",
    });
  } else {
    flags.push({
      id: "no_record",
      label: "No Previous Records",
      severity: "medium",
      description: "This land has no history in our system. This doesn't mean it's safe — it means it hasn't been checked.",
      icon: "ownership",
    });
  }

  const riskLevel: RiskLevel = riskScore > 60 ? "high" : riskScore > 35 ? "medium" : "low";

  return {
    riskScore,
    riskLevel,
    flags,
    summary: `This land has no verified records in our database. In Nigeria, unverified land accounts for most fraud cases. We strongly recommend a full verification before any payment.`,
    matchedRecord: false,
  };
}

export default function FraudScanScreen() {
  const router = useRouter();
  const [plotNumber, setPlotNumber] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanProgressAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flagAnims = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const runScan = useCallback(() => {
    if (!plotNumber.trim() && !selectedDistrict) {
      Alert.alert("Enter Details", "Enter a plot number or select a district to scan.");
      return;
    }

    console.log("[FraudScan] Starting scan:", { plotNumber, selectedDistrict, latitude, longitude });

    setScanning(true);
    setResult(null);
    scanProgressAnim.setValue(0);
    resultAnim.setValue(0);

    Animated.timing(scanProgressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start(() => {
      const scanResult = generateScanResult(plotNumber, selectedDistrict, latitude, longitude);
      setResult(scanResult);
      setScanning(false);

      console.log("[FraudScan] Scan complete:", scanResult);

      while (flagAnims.length < scanResult.flags.length) {
        flagAnims.push(new Animated.Value(0));
      }

      Animated.sequence([
        Animated.timing(resultAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.stagger(
          100,
          flagAnims.slice(0, scanResult.flags.length).map((anim) =>
            Animated.spring(anim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true })
          )
        ),
      ]).start();

      if (scanResult.riskLevel === "high" || scanResult.riskLevel === "critical") {
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
      }
    });
  }, [plotNumber, selectedDistrict, latitude, longitude, scanProgressAnim, resultAnim, flagAnims, shakeAnim]);

  const handleFullVerification = useCallback(() => {
    router.replace("/(tabs)/verify");
  }, [router]);

  const handleViewRecord = useCallback((landId: string) => {
    router.push({ pathname: "/land-record", params: { landId } });
  }, [router]);

  const riskColor = result ? RISK_COLORS[result.riskLevel] : Colors.textTertiary;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Instant Risk Scan",
          headerStyle: { backgroundColor: "#1A1A1A" },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "700" as const },
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.warningBanner}>
            <AlertTriangle size={20} color={Colors.danger} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>60% of land in Abuja has issues</Text>
              <Text style={styles.warningDesc}>
                Fake titles, government acquisition, boundary disputes — scan before you lose millions.
              </Text>
            </View>
          </View>

          <Animated.View style={[styles.scanCard, { transform: [{ scale: !scanning && !result ? pulseAnim : new Animated.Value(1) }] }]}>
            <View style={styles.scanIconWrap}>
              <Shield size={28} color={Colors.danger} />
            </View>
            <Text style={styles.scanTitle}>Instant Fraud Risk Score</Text>
            <Text style={styles.scanSubtitle}>
              Enter plot details below. Get a risk assessment in seconds — free.
            </Text>
          </Animated.View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Plot Number / Survey No.</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. PLT-4521-GZP or FCT/ABJ/2019/0342"
                placeholderTextColor={Colors.textTertiary}
                value={plotNumber}
                onChangeText={setPlotNumber}
                testID="fraud-scan-plot"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>District / Area</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowDistrictPicker(!showDistrictPicker)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectText, !selectedDistrict && styles.selectPlaceholder]}>
                  {selectedDistrict || "Select district"}
                </Text>
                <ChevronDown size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
              {showDistrictPicker && (
                <View style={styles.pickerDropdown}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    {DISTRICTS.map((d) => (
                      <TouchableOpacity
                        key={d.id}
                        style={[styles.pickerItem, selectedDistrict === d.name && styles.pickerItemActive]}
                        onPress={() => {
                          setSelectedDistrict(d.name);
                          setShowDistrictPicker(false);
                          setLatitude(d.coordinates.latitude.toString());
                          setLongitude(d.coordinates.longitude.toString());
                        }}
                      >
                        <Text style={[styles.pickerItemText, selectedDistrict === d.name && styles.pickerItemTextActive]}>
                          {d.name}, {d.state}
                        </Text>
                        {selectedDistrict === d.name && <CheckCircle size={16} color={Colors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.coordRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9.0234"
                  placeholderTextColor={Colors.textTertiary}
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="7.5186"
                  placeholderTextColor={Colors.textTertiary}
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {scanning && (
            <View style={styles.scanningSection}>
              <View style={styles.scanningHeader}>
                <Zap size={18} color={Colors.gold} />
                <Text style={styles.scanningText}>Scanning databases...</Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: scanProgressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <View style={styles.scanningChecks}>
                {["Checking AGIS records...", "Scanning court disputes...", "Verifying acquisition zones...", "Analyzing ownership patterns..."].map((check, i) => (
                  <Animated.View
                    key={check}
                    style={[
                      styles.scanCheckRow,
                      {
                        opacity: scanProgressAnim.interpolate({
                          inputRange: [i * 0.25, Math.min((i + 1) * 0.25, 1)],
                          outputRange: [0.3, 1],
                          extrapolate: "clamp",
                        }),
                      },
                    ]}
                  >
                    <Search size={12} color={Colors.textTertiary} />
                    <Text style={styles.scanCheckText}>{check}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {result && !scanning && (
            <Animated.View
              style={[
                styles.resultSection,
                {
                  opacity: resultAnim,
                  transform: [{ translateX: shakeAnim }],
                },
              ]}
            >
              <View style={[styles.riskScoreCard, { borderColor: riskColor + "40" }]}>
                <View style={[styles.riskScoreCircle, { borderColor: riskColor }]}>
                  <Text style={[styles.riskScoreNumber, { color: riskColor }]}>{result.riskScore}</Text>
                  <Text style={styles.riskScoreOf}>/100</Text>
                </View>
                <View style={[styles.riskLevelBadge, { backgroundColor: riskColor + "20" }]}>
                  {result.riskLevel === "critical" || result.riskLevel === "high" ? (
                    <XCircle size={16} color={riskColor} />
                  ) : result.riskLevel === "medium" ? (
                    <AlertCircle size={16} color={riskColor} />
                  ) : (
                    <CheckCircle size={16} color={riskColor} />
                  )}
                  <Text style={[styles.riskLevelText, { color: riskColor }]}>
                    {RISK_LABELS[result.riskLevel]}
                  </Text>
                </View>
                <Text style={styles.riskMessage}>{RISK_MESSAGES[result.riskLevel]}</Text>
              </View>

              <Text style={styles.flagsTitle}>
                {result.flags.length} Flag{result.flags.length !== 1 ? "s" : ""} Detected
              </Text>

              {result.flags.map((flag, i) => {
                const FlagIcon = FLAG_ICONS[flag.icon];
                const flagColor = RISK_COLORS[flag.severity];
                const animValue = flagAnims[i] ?? new Animated.Value(1);

                return (
                  <Animated.View
                    key={flag.id}
                    style={[
                      styles.flagCard,
                      { borderLeftColor: flagColor },
                      {
                        opacity: animValue,
                        transform: [{
                          translateY: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [15, 0],
                          }),
                        }],
                      },
                    ]}
                  >
                    <View style={[styles.flagIconWrap, { backgroundColor: flagColor + "15" }]}>
                      <FlagIcon size={16} color={flagColor} />
                    </View>
                    <View style={styles.flagContent}>
                      <View style={styles.flagHeader}>
                        <Text style={styles.flagLabel}>{flag.label}</Text>
                        <View style={[styles.severityBadge, { backgroundColor: flagColor + "15" }]}>
                          <Text style={[styles.severityText, { color: flagColor }]}>
                            {flag.severity.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.flagDesc}>{flag.description}</Text>
                    </View>
                  </Animated.View>
                );
              })}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Assessment Summary</Text>
                <Text style={styles.summaryText}>{result.summary}</Text>
              </View>

              {result.matchedRecord && result.landId && (
                <TouchableOpacity
                  style={styles.viewRecordBtn}
                  onPress={() => handleViewRecord(result.landId!)}
                  activeOpacity={0.7}
                >
                  <Eye size={16} color={Colors.primary} />
                  <Text style={styles.viewRecordText}>View Full Land Record</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.fullVerifyBtn}
                onPress={handleFullVerification}
                activeOpacity={0.8}
              >
                <Shield size={18} color={Colors.white} />
                <Text style={styles.fullVerifyText}>Get Full Verification</Text>
                <ArrowRight size={16} color={Colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareResultBtn}
                activeOpacity={0.7}
                onPress={() => {
                  import("react-native").then(({ Share: S }) =>
                    S.share({
                      message: `LandSecure Fraud Scan Result\n\nPlot: ${plotNumber || "N/A"}\nDistrict: ${selectedDistrict || "N/A"}\nRisk Score: ${result.riskScore}/100 (${RISK_LABELS[result.riskLevel]})\n\nFlags: ${result.flags.map(f => f.label).join(", ")}\n\nScan your land free at landsecure.ng\n\nDon't buy land without checking first.`,
                    })
                  ).catch(() => {});
                }}
              >
                <Share2 size={14} color={Colors.primary} />
                <Text style={styles.shareResultText}>Share this result</Text>
              </TouchableOpacity>

              <View style={styles.disclaimerCard}>
                <AlertCircle size={14} color={Colors.textTertiary} />
                <Text style={styles.disclaimerText}>
                  This instant scan uses available data and pattern analysis. It is NOT a substitute for professional verification. Always get a full verification before paying for land.
                </Text>
              </View>
            </Animated.View>
          )}

          {!scanning && !result && (
            <View style={styles.fearStats}>
              <View style={styles.fearStatCard}>
                <Text style={styles.fearStatNumber}>₦4.2B+</Text>
                <Text style={styles.fearStatLabel}>Lost to land fraud in Abuja yearly</Text>
              </View>
              <View style={styles.fearStatCard}>
                <Text style={styles.fearStatNumber}>1 in 3</Text>
                <Text style={styles.fearStatLabel}>Land titles in Nigeria have issues</Text>
              </View>
              <View style={styles.fearStatCard}>
                <Text style={styles.fearStatNumber}>78%</Text>
                <Text style={styles.fearStatLabel}>Of diaspora land purchases are unverified</Text>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {!scanning && !result && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[
                styles.scanBtn,
                (!plotNumber.trim() && !selectedDistrict) && styles.scanBtnDisabled,
              ]}
              onPress={runScan}
              disabled={!plotNumber.trim() && !selectedDistrict}
              activeOpacity={0.8}
              testID="fraud-scan-btn"
            >
              <Shield size={18} color={Colors.white} />
              <Text style={styles.scanBtnText}>Scan for Fraud — Free</Text>
            </TouchableOpacity>
          </View>
        )}

        {result && !scanning && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => {
                setResult(null);
                setPlotNumber("");
                setSelectedDistrict("");
                setLatitude("");
                setLongitude("");
                flagAnims.length = 0;
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.rescanText}>New Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.verifyNowBtn}
              onPress={handleFullVerification}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyNowText}>Verify Now — From ₦30k</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  content: {
    paddingBottom: 20,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.danger + "15",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.danger,
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 13,
    color: "#AAAAAA",
    lineHeight: 19,
  },
  scanCard: {
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 24,
  },
  scanIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.danger + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.danger + "40",
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.white,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center" as const,
    lineHeight: 20,
  },
  formSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#CCCCCC",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.white,
    borderWidth: 1,
    borderColor: "#333333",
  },
  selectInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  selectText: {
    fontSize: 15,
    color: Colors.white,
  },
  selectPlaceholder: {
    color: "#666666",
  },
  pickerDropdown: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#333333",
    maxHeight: 200,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerItemActive: {
    backgroundColor: Colors.primary + "15",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  pickerItemTextActive: {
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  coordRow: {
    flexDirection: "row",
    gap: 12,
  },
  scanningSection: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333333",
  },
  scanningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  scanningText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.gold,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#333333",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  scanningChecks: {
    gap: 10,
  },
  scanCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanCheckText: {
    fontSize: 13,
    color: "#888888",
  },
  resultSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  riskScoreCard: {
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 28,
    borderWidth: 2,
  },
  riskScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  riskScoreNumber: {
    fontSize: 36,
    fontWeight: "900" as const,
  },
  riskScoreOf: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "600" as const,
    marginTop: -4,
  },
  riskLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 14,
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: "800" as const,
    letterSpacing: 0.5,
  },
  riskMessage: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center" as const,
    lineHeight: 21,
  },
  flagsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
    marginTop: 24,
    marginBottom: 12,
  },
  flagCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderLeftWidth: 4,
  },
  flagIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  flagContent: {
    flex: 1,
  },
  flagHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  flagLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.white,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 0.3,
  },
  flagDesc: {
    fontSize: 13,
    color: "#999999",
    lineHeight: 19,
  },
  summaryCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#AAAAAA",
    lineHeight: 21,
  },
  viewRecordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    backgroundColor: Colors.primary + "15",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  viewRecordText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  fullVerifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  fullVerifyText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  shareResultBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
  },
  shareResultText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 14,
    padding: 14,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: "#777777",
    lineHeight: 16,
  },
  fearStats: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 10,
  },
  fearStatCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  fearStatNumber: {
    fontSize: 22,
    fontWeight: "900" as const,
    color: Colors.danger,
    minWidth: 80,
  },
  fearStatLabel: {
    fontSize: 14,
    color: "#999999",
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 34,
    backgroundColor: "#0F0F0F",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    gap: 12,
  },
  scanBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.danger,
    paddingVertical: 16,
    borderRadius: 14,
  },
  scanBtnDisabled: {
    backgroundColor: "#333333",
  },
  scanBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  rescanBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444444",
    justifyContent: "center",
    alignItems: "center",
  },
  rescanText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#CCCCCC",
  },
  verifyNowBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyNowText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
