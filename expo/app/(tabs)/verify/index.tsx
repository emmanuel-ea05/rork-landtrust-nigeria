import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Upload,
  FileText,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Shield,
  MapPin,
  User,
  CreditCard,
  Info,
  Lock,
  Zap,
  Database,
  Plus,
  Trash2,
  Ruler,
  Landmark,
  Home,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { DISTRICTS } from "@/mocks/data";
import {
  DocumentType,
  DOCUMENT_TYPE_LABELS,
  VerificationTier,
  TIER_LABELS,
  TIER_PRICES,
  TIER_DESCRIPTIONS,
  TIER_TURNAROUND,
  TitleType,
  TITLE_TYPE_LABELS,
  OwnershipChainEntry,
  DEVELOPMENT_STATUS_LABELS,
} from "@/types";

type Step = 1 | 2 | 3 | 4 | 5;

const TITLE_TYPES: TitleType[] = [
  "c_of_o", "r_of_o", "customary_right", "governor_consent",
  "allocation_letter", "deed_of_assignment", "unknown",
];

const DEV_STATUSES = ["undeveloped", "under_construction", "developed", "unknown"] as const;

const DOCUMENT_TYPES: DocumentType[] = [
  "c_of_o",
  "survey_plan",
  "deed_of_assignment",
  "allocation_letter",
  "other",
];

const DOC_DESCRIPTIONS: Record<DocumentType, string> = {
  c_of_o: "Official title document issued by the state governor",
  survey_plan: "Registered survey showing land boundaries & coordinates",
  deed_of_assignment: "Legal transfer document from seller to buyer",
  allocation_letter: "Government allocation notice for land grant",
  other: "Any other supporting document",
};

const STEP_ICONS = [MapPin, User, Database, FileText, Shield] as const;

export default function VerifyScreen() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [plotNumber, setPlotNumber] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<DocumentType[]>([]);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedTier, setSelectedTier] = useState<VerificationTier>("basic");
  const [titleType, setTitleType] = useState<TitleType>("unknown");
  const [showTitleTypePicker, setShowTitleTypePicker] = useState(false);
  const [landSize, setLandSize] = useState("");
  const [landSizeUnit, setLandSizeUnit] = useState<"sqm" | "hectares" | "plots" | "acres">("sqm");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [ownershipChain, setOwnershipChain] = useState<OwnershipChainEntry[]>([{ name: "", acquiredDate: "", method: "" }]);
  const [knownDisputes, setKnownDisputes] = useState("");
  const [yearOfAllocation, setYearOfAllocation] = useState("");
  const [developmentStatus, setDevelopmentStatus] = useState<string>("unknown");
  const [accessRoad, setAccessRoad] = useState(false);
  const [fenced, setFenced] = useState(false);
  const progressAnim = useRef(new Animated.Value(0.2)).current;

  const animateProgress = useCallback(
    (step: Step) => {
      Animated.spring(progressAnim, {
        toValue: step / 5,
        useNativeDriver: false,
        tension: 40,
        friction: 10,
      }).start();
    },
    [progressAnim]
  );

  const goToStep = useCallback(
    (step: Step) => {
      console.log(`[VerifyScreen] Moving to step ${step}`);
      setCurrentStep(step);
      animateProgress(step);
    },
    [animateProgress]
  );

  const toggleDocument = useCallback((docType: DocumentType) => {
    setSelectedDocs((prev) =>
      prev.includes(docType)
        ? prev.filter((d) => d !== docType)
        : [...prev, docType]
    );
  }, []);

  const addOwnershipEntry = useCallback(() => {
    setOwnershipChain((prev) => [...prev, { name: "", acquiredDate: "", method: "" }]);
  }, []);

  const removeOwnershipEntry = useCallback((index: number) => {
    setOwnershipChain((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateOwnershipEntry = useCallback((index: number, field: keyof OwnershipChainEntry, value: string) => {
    setOwnershipChain((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return plotNumber.trim() !== "" && selectedDistrict !== "";
      case 2:
        return sellerName.trim() !== "";
      case 3:
        return true;
      case 4:
        return selectedDocs.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, plotNumber, selectedDistrict, sellerName, selectedDocs]);

  const handleNext = useCallback(() => {
    if (currentStep < 5) {
      goToStep((currentStep + 1) as Step);
    }
  }, [currentStep, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as Step);
    }
  }, [currentStep, goToStep]);

  const verificationFee = TIER_PRICES[selectedTier];

  const handleSubmit = useCallback(() => {
    console.log("[VerifyScreen] Submitting verification request", {
      plotNumber, selectedDistrict, sellerName, selectedDocs, selectedTier,
      intelligence: { titleType, landSize, landSizeUnit, estimatedPrice, ownershipChain: ownershipChain.filter((e) => e.name.trim()), knownDisputes, yearOfAllocation, developmentStatus, accessRoad, fenced },
    });
    const resetForm = () => {
      setCurrentStep(1); animateProgress(1);
      setPlotNumber(""); setSelectedDistrict(""); setSurveyNumber("");
      setSellerName(""); setSellerPhone(""); setLatitude(""); setLongitude("");
      setSelectedDocs([]); setAdditionalNotes(""); setSelectedTier("basic");
      setTitleType("unknown"); setLandSize(""); setEstimatedPrice("");
      setOwnershipChain([{ name: "", acquiredDate: "", method: "" }]);
      setKnownDisputes(""); setYearOfAllocation(""); setDevelopmentStatus("unknown");
      setAccessRoad(false); setFenced(false);
    };
    Alert.alert(
      "Verification Submitted",
      `Your verification request for ${plotNumber} in ${selectedDistrict} has been submitted successfully.\n\nCase ID: VR-${Date.now().toString().slice(-6)}\nPlan: ${TIER_LABELS[selectedTier]}\nFee: ₦${verificationFee.toLocaleString()}\nTurnaround: ${TIER_TURNAROUND[selectedTier]}\n\nYour data has been added to our Land Intelligence Database.`,
      [
        { text: "View Activity", onPress: resetForm },
        { text: "OK", onPress: resetForm },
      ]
    );
  }, [plotNumber, selectedDistrict, sellerName, selectedDocs, selectedTier, animateProgress, verificationFee, titleType, landSize, landSizeUnit, estimatedPrice, ownershipChain, knownDisputes, yearOfAllocation, developmentStatus, accessRoad, fenced]);

  const selectedDistrictData = DISTRICTS.find((d) => d.name === selectedDistrict);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.stepLabels}>
        {["Location", "Seller", "Intel", "Docs", "Review"].map((label, i) => {
          const IconComp = STEP_ICONS[i];
          return (
            <View key={label} style={styles.stepLabelWrap}>
              <View
                style={[
                  styles.stepDot,
                  i + 1 <= currentStep && styles.stepDotActive,
                  i + 1 < currentStep && styles.stepDotCompleted,
                ]}
              >
                {i + 1 < currentStep ? (
                  <CheckCircle size={14} color={Colors.white} />
                ) : (
                  <IconComp
                    size={13}
                    color={
                      i + 1 <= currentStep
                        ? Colors.white
                        : Colors.textTertiary
                    }
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabelText,
                  i + 1 <= currentStep && styles.stepLabelTextActive,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeaderRow}>
        <View style={styles.stepIconCircle}>
          <MapPin size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.stepTitle}>Property Location</Text>
          <Text style={styles.stepDescription}>
            Enter the plot details and location of the land.
          </Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Plot Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., PLT-4521-GZP"
          placeholderTextColor={Colors.textTertiary}
          value={plotNumber}
          onChangeText={setPlotNumber}
          testID="verify-plot-number"
        />
        <Text style={styles.inputHint}>
          Find this on your survey plan or allocation letter
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>District / Area *</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => setShowDistrictPicker(!showDistrictPicker)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.selectText,
              !selectedDistrict && styles.selectPlaceholder,
            ]}
          >
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
                  style={[
                    styles.pickerItem,
                    selectedDistrict === d.name && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setSelectedDistrict(d.name);
                    setShowDistrictPicker(false);
                    setLatitude(d.coordinates.latitude.toString());
                    setLongitude(d.coordinates.longitude.toString());
                    console.log(`[VerifyScreen] Selected district: ${d.name}`);
                  }}
                >
                  <View style={styles.pickerItemContent}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedDistrict === d.name &&
                          styles.pickerItemTextActive,
                      ]}
                    >
                      {d.name}
                    </Text>
                    <Text style={styles.pickerItemSub}>{d.state}</Text>
                  </View>
                  {selectedDistrict === d.name && (
                    <CheckCircle size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Survey Number (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., FCT/ABJ/2024/0342"
          placeholderTextColor={Colors.textTertiary}
          value={surveyNumber}
          onChangeText={setSurveyNumber}
        />
      </View>

      <View style={styles.coordinateRow}>
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

      {selectedDistrictData && (
        <View style={styles.coordAutoFill}>
          <Info size={14} color={Colors.info} />
          <Text style={styles.coordAutoFillText}>
            Coordinates auto-filled from selected district. Adjust if needed for exact plot location.
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeaderRow}>
        <View style={styles.stepIconCircle}>
          <User size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.stepTitle}>Seller Information</Text>
          <Text style={styles.stepDescription}>
            Provide details of the person or entity selling.
          </Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Seller Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Adamu Ibrahim"
          placeholderTextColor={Colors.textTertiary}
          value={sellerName}
          onChangeText={setSellerName}
          testID="verify-seller-name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Seller Phone (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 08012345678"
          placeholderTextColor={Colors.textTertiary}
          value={sellerPhone}
          onChangeText={setSellerPhone}
          keyboardType="phone-pad"
        />
        <Text style={styles.inputHint}>
          Helps our team reach the seller for verification
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any additional info about the property or seller..."
          placeholderTextColor={Colors.textTertiary}
          value={additionalNotes}
          onChangeText={setAdditionalNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.warningCard}>
        <AlertCircle size={18} color={Colors.warning} />
        <Text style={styles.warningText}>
          The seller name should match exactly as it appears on the land
          documents for accurate verification. Mismatched names may delay the
          process.
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeaderRow}>
        <View style={styles.stepIconCircle}>
          <Database size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.stepTitle}>Land Intelligence</Text>
          <Text style={styles.stepDescription}>
            Help us build Nigeria's land database.
          </Text>
        </View>
      </View>

      <View style={styles.intelBanner}>
        <Database size={14} color={Colors.gold} />
        <Text style={styles.intelBannerText}>
          This data feeds our Land Intelligence Database — making every future buyer safer.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title Document Type</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => setShowTitleTypePicker(!showTitleTypePicker)}
          activeOpacity={0.7}
        >
          <Text style={[styles.selectText, titleType === "unknown" && styles.selectPlaceholder]}>
            {TITLE_TYPE_LABELS[titleType]}
          </Text>
          <ChevronDown size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
        {showTitleTypePicker && (
          <View style={styles.pickerDropdown}>
            <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
              {TITLE_TYPES.map((tt) => (
                <TouchableOpacity
                  key={tt}
                  style={[styles.pickerItem, titleType === tt && styles.pickerItemActive]}
                  onPress={() => { setTitleType(tt); setShowTitleTypePicker(false); }}
                >
                  <Text style={[styles.pickerItemText, titleType === tt && styles.pickerItemTextActive]}>
                    {TITLE_TYPE_LABELS[tt]}
                  </Text>
                  {titleType === tt && <CheckCircle size={16} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.coordinateRow}>
        <View style={[styles.inputGroup, { flex: 2 }]}>
          <Text style={styles.inputLabel}>Land Size</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1200"
            placeholderTextColor={Colors.textTertiary}
            value={landSize}
            onChangeText={setLandSize}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Unit</Text>
          <View style={styles.unitRow}>
            {(["sqm", "hectares", "plots", "acres"] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, landSizeUnit === u && styles.unitChipActive]}
                onPress={() => setLandSizeUnit(u)}
                activeOpacity={0.7}
              >
                <Text style={[styles.unitChipText, landSizeUnit === u && styles.unitChipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Estimated Price (₦)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 45000000"
          placeholderTextColor={Colors.textTertiary}
          value={estimatedPrice}
          onChangeText={setEstimatedPrice}
          keyboardType="numeric"
        />
        <Text style={styles.inputHint}>Asking price or last known transaction price</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Year of Original Allocation</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2019"
          placeholderTextColor={Colors.textTertiary}
          value={yearOfAllocation}
          onChangeText={setYearOfAllocation}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Development Status</Text>
        <View style={styles.devStatusRow}>
          {DEV_STATUSES.map((ds) => (
            <TouchableOpacity
              key={ds}
              style={[styles.devStatusChip, developmentStatus === ds && styles.devStatusChipActive]}
              onPress={() => setDevelopmentStatus(ds)}
              activeOpacity={0.7}
            >
              {ds === "undeveloped" && <Ruler size={12} color={developmentStatus === ds ? Colors.white : Colors.textSecondary} />}
              {ds === "under_construction" && <Landmark size={12} color={developmentStatus === ds ? Colors.white : Colors.textSecondary} />}
              {ds === "developed" && <Home size={12} color={developmentStatus === ds ? Colors.white : Colors.textSecondary} />}
              {ds === "unknown" && <AlertCircle size={12} color={developmentStatus === ds ? Colors.white : Colors.textSecondary} />}
              <Text style={[styles.devStatusText, developmentStatus === ds && styles.devStatusTextActive]}>
                {DEVELOPMENT_STATUS_LABELS[ds]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleCard, accessRoad && styles.toggleCardActive]}
          onPress={() => setAccessRoad(!accessRoad)}
          activeOpacity={0.7}
        >
          <View style={[styles.toggleCheck, accessRoad && styles.toggleCheckActive]}>
            {accessRoad && <CheckCircle size={14} color={Colors.white} />}
          </View>
          <Text style={[styles.toggleLabel, accessRoad && styles.toggleLabelActive]}>Access Road</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleCard, fenced && styles.toggleCardActive]}
          onPress={() => setFenced(!fenced)}
          activeOpacity={0.7}
        >
          <View style={[styles.toggleCheck, fenced && styles.toggleCheckActive]}>
            {fenced && <CheckCircle size={14} color={Colors.white} />}
          </View>
          <Text style={[styles.toggleLabel, fenced && styles.toggleLabelActive]}>Fenced</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.chainHeader}>
          <Text style={styles.inputLabel}>Ownership Chain (if known)</Text>
          <TouchableOpacity onPress={addOwnershipEntry} activeOpacity={0.7} style={styles.addChainBtn}>
            <Plus size={14} color={Colors.primary} />
            <Text style={styles.addChainText}>Add</Text>
          </TouchableOpacity>
        </View>
        {ownershipChain.map((entry, idx) => (
          <View key={idx} style={styles.chainEntry}>
            <View style={styles.chainEntryHeader}>
              <Text style={styles.chainEntryLabel}>Owner #{idx + 1}</Text>
              {ownershipChain.length > 1 && (
                <TouchableOpacity onPress={() => removeOwnershipEntry(idx)} activeOpacity={0.7}>
                  <Trash2 size={14} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.chainInput}
              placeholder="Full name"
              placeholderTextColor={Colors.textTertiary}
              value={entry.name}
              onChangeText={(v) => updateOwnershipEntry(idx, "name", v)}
            />
            <View style={styles.coordinateRow}>
              <TextInput
                style={[styles.chainInput, { flex: 1 }]}
                placeholder="Year acquired"
                placeholderTextColor={Colors.textTertiary}
                value={entry.acquiredDate ?? ""}
                onChangeText={(v) => updateOwnershipEntry(idx, "acquiredDate", v)}
                keyboardType="numeric"
                maxLength={4}
              />
              <TextInput
                style={[styles.chainInput, { flex: 2 }]}
                placeholder="How (e.g. Purchase, Gift)"
                placeholderTextColor={Colors.textTertiary}
                value={entry.method ?? ""}
                onChangeText={(v) => updateOwnershipEntry(idx, "method", v)}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Known Disputes or Issues</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any known court cases, boundary issues, or government acquisition notices..."
          placeholderTextColor={Colors.textTertiary}
          value={knownDisputes}
          onChangeText={setKnownDisputes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeaderRow}>
        <View style={styles.stepIconCircle}>
          <FileText size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.stepTitle}>Upload Documents</Text>
          <Text style={styles.stepDescription}>
            Select the documents you have available.
          </Text>
        </View>
      </View>

      {DOCUMENT_TYPES.map((docType) => {
        const isSelected = selectedDocs.includes(docType);
        return (
          <TouchableOpacity
            key={docType}
            style={[styles.docOption, isSelected && styles.docOptionActive]}
            onPress={() => toggleDocument(docType)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.docCheckbox,
                isSelected && styles.docCheckboxActive,
              ]}
            >
              {isSelected && <CheckCircle size={18} color={Colors.white} />}
            </View>
            <View style={styles.docInfo}>
              <Text
                style={[styles.docName, isSelected && styles.docNameActive]}
              >
                {DOCUMENT_TYPE_LABELS[docType]}
              </Text>
              <Text style={styles.docDesc}>{DOC_DESCRIPTIONS[docType]}</Text>
            </View>
            <FileText
              size={18}
              color={isSelected ? Colors.primary : Colors.textTertiary}
            />
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.uploadButton} activeOpacity={0.7}>
        <Upload size={20} color={Colors.primary} />
        <View>
          <Text style={styles.uploadText}>Upload Document Files</Text>
          <Text style={styles.uploadSubtext}>
            PDF, JPG, PNG — Max 10MB each
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.docTip}>
        <Info size={14} color={Colors.info} />
        <Text style={styles.docTipText}>
          Clear, legible scans work best. Our team may request additional
          documents during verification.
        </Text>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeaderRow}>
        <View style={styles.stepIconCircle}>
          <Shield size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.stepTitle}>Review & Submit</Text>
          <Text style={styles.stepDescription}>
            Confirm your details before submitting.
          </Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Plot Number</Text>
          <Text style={styles.reviewValue}>{plotNumber}</Text>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>District</Text>
          <Text style={styles.reviewValue}>{selectedDistrict}, Abuja</Text>
        </View>
        {surveyNumber ? (
          <>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Survey No.</Text>
              <Text style={styles.reviewValue}>{surveyNumber}</Text>
            </View>
          </>
        ) : null}
        {latitude && longitude ? (
          <>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Coordinates</Text>
              <Text style={styles.reviewValue}>
                {latitude}, {longitude}
              </Text>
            </View>
          </>
        ) : null}
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Seller</Text>
          <Text style={styles.reviewValue}>{sellerName}</Text>
        </View>
        {sellerPhone ? (
          <>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Seller Phone</Text>
              <Text style={styles.reviewValue}>{sellerPhone}</Text>
            </View>
          </>
        ) : null}
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Documents</Text>
          <Text style={styles.reviewValue}>
            {selectedDocs.map((d) => DOCUMENT_TYPE_LABELS[d]).join(", ")}
          </Text>
        </View>
      </View>

      {(titleType !== "unknown" || landSize || estimatedPrice) && (
        <View style={[styles.reviewCard, { marginTop: 14 }]}>
          <View style={styles.intelReviewHeader}>
            <Database size={14} color={Colors.primary} />
            <Text style={styles.intelReviewTitle}>Intelligence Data Captured</Text>
          </View>
          {titleType !== "unknown" && (
            <><View style={styles.reviewRow}><Text style={styles.reviewLabel}>Title Type</Text><Text style={styles.reviewValue}>{TITLE_TYPE_LABELS[titleType]}</Text></View><View style={styles.reviewDivider} /></>
          )}
          {landSize ? (
            <><View style={styles.reviewRow}><Text style={styles.reviewLabel}>Land Size</Text><Text style={styles.reviewValue}>{landSize} {landSizeUnit}</Text></View><View style={styles.reviewDivider} /></>
          ) : null}
          {estimatedPrice ? (
            <><View style={styles.reviewRow}><Text style={styles.reviewLabel}>Est. Price</Text><Text style={styles.reviewValue}>₦{Number(estimatedPrice).toLocaleString()}</Text></View><View style={styles.reviewDivider} /></>
          ) : null}
          {developmentStatus !== "unknown" && (
            <><View style={styles.reviewRow}><Text style={styles.reviewLabel}>Dev. Status</Text><Text style={styles.reviewValue}>{DEVELOPMENT_STATUS_LABELS[developmentStatus]}</Text></View><View style={styles.reviewDivider} /></>
          )}
          {ownershipChain.filter((e) => e.name.trim()).length > 0 && (
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Owners</Text><Text style={styles.reviewValue}>{ownershipChain.filter((e) => e.name.trim()).map((e) => e.name).join(" → ")}</Text></View>
          )}
        </View>
      )}

      <Text style={styles.tierSectionTitle}>Select Verification Plan</Text>
      {(["basic", "full_diligence", "priority"] as VerificationTier[]).map((tier) => {
        const isSelected = selectedTier === tier;
        const price = TIER_PRICES[tier];
        const isPriority = tier === "priority";
        const isFullDiligence = tier === "full_diligence";
        return (
          <TouchableOpacity
            key={tier}
            style={[
              styles.tierCard,
              isSelected && styles.tierCardActive,
              isPriority && styles.tierCardPriority,
              isFullDiligence && isSelected && styles.tierCardDiligenceActive,
            ]}
            onPress={() => setSelectedTier(tier)}
            activeOpacity={0.7}
          >
            <View style={styles.tierHeader}>
              <View style={styles.tierLeft}>
                <View
                  style={[
                    styles.tierRadio,
                    isSelected && styles.tierRadioActive,
                    isPriority && isSelected && styles.tierRadioPriority,
                  ]}
                >
                  {isSelected && <View style={styles.tierRadioDot} />}
                </View>
                <View style={styles.tierInfo}>
                  <View style={styles.tierLabelRow}>
                    <Text
                      style={[
                        styles.tierLabel,
                        isSelected && styles.tierLabelActive,
                      ]}
                    >
                      {TIER_LABELS[tier]}
                    </Text>
                    {isPriority && (
                      <View style={styles.fastBadge}>
                        <Zap size={10} color={Colors.white} />
                        <Text style={styles.fastBadgeText}>FAST</Text>
                      </View>
                    )}
                    {isFullDiligence && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>RECOMMENDED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tierDesc}>{TIER_DESCRIPTIONS[tier]}</Text>
                  <Text style={styles.tierTurnaround}>
                    Turnaround: {TIER_TURNAROUND[tier]}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.tierPrice,
                  isSelected && styles.tierPriceActive,
                  isPriority && isSelected && styles.tierPricePriority,
                ]}
              >
                ₦{price.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.feeCard}>
        <View style={styles.feeTop}>
          <Text style={styles.feeLabel}>Total</Text>
          <Text style={styles.feeAmount}>
            ₦{verificationFee.toLocaleString()}
          </Text>
        </View>
        <View style={styles.feeBreakdown}>
          <View style={styles.feeRow}>
            <Text style={styles.feeRowLabel}>{TIER_LABELS[selectedTier]}</Text>
            <Text style={styles.feeRowValue}>₦{verificationFee.toLocaleString()}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeRowLabel}>Turnaround</Text>
            <Text style={styles.feeRowValue}>{TIER_TURNAROUND[selectedTier]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.verificationChecks}>
        <Text style={styles.checksTitle}>What We Verify</Text>
        {[
          "Certificate of Occupancy authenticity",
          "Survey plan coordinates & boundaries",
          "Ownership history & chain of title",
          "Government acquisition status",
          "Court disputes & encumbrances",
          "Physical land inspection",
        ].map((check) => (
          <View key={check} style={styles.checkRow}>
            <CheckCircle size={14} color={Colors.success} />
            <Text style={styles.checkText}>{check}</Text>
          </View>
        ))}
      </View>

      <View style={styles.paymentMethods}>
        <CreditCard size={16} color={Colors.textSecondary} />
        <Text style={styles.paymentMethodsText}>
          Pay securely via Paystack — Cards, Bank Transfer, USSD
        </Text>
      </View>

      <View style={styles.securityNote}>
        <Lock size={12} color={Colors.textTertiary} />
        <Text style={styles.securityNoteText}>
          Your documents are encrypted and stored securely. NDPC compliant.
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepIndicator()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </ScrollView>

      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
            currentStep === 1 && styles.nextButtonFull,
          ]}
          onPress={currentStep === 5 ? handleSubmit : handleNext}
          disabled={!canProceed()}
          activeOpacity={0.7}
          testID="verify-next-button"
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 5
              ? `Submit & Pay ₦${verificationFee.toLocaleString()}`
              : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepIndicator: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepLabelWrap: {
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
  },
  stepLabelText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  stepLabelTextActive: {
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "12",
    justifyContent: "center",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 6,
    fontStyle: "italic" as const,
  },
  selectInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectText: {
    fontSize: 15,
    color: Colors.text,
  },
  selectPlaceholder: {
    color: Colors.textTertiary,
  },
  pickerDropdown: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerItemActive: {
    backgroundColor: Colors.primary + "10",
  },
  pickerItemContent: {
    flex: 1,
  },
  pickerItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  pickerItemTextActive: {
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  pickerItemSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  coordinateRow: {
    flexDirection: "row",
    gap: 12,
  },
  coordAutoFill: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.info + "10",
    padding: 12,
    borderRadius: 10,
    marginTop: -6,
    marginBottom: 10,
  },
  coordAutoFillText: {
    flex: 1,
    fontSize: 12,
    color: Colors.info,
    lineHeight: 17,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.warning + "12",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.warning + "30",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  docOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  docOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  docCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  docCheckboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  docNameActive: {
    color: Colors.primary,
  },
  docDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    lineHeight: 15,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary + "40",
    borderStyle: "dashed",
    marginTop: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  uploadSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  docTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.info + "08",
    borderRadius: 10,
  },
  docTipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    minWidth: 90,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "right" as const,
    flex: 1,
    marginLeft: 16,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  tierSectionTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  tierCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  tierCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "06",
  },
  tierCardPriority: {
    borderColor: Colors.gold + "60",
  },
  tierCardDiligenceActive: {
    borderColor: Colors.primary,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  tierLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  tierRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  tierRadioActive: {
    borderColor: Colors.primary,
  },
  tierRadioPriority: {
    borderColor: Colors.gold,
  },
  tierRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  tierInfo: {
    flex: 1,
  },
  tierLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  tierLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  tierLabelActive: {
    color: Colors.primary,
  },
  fastBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.gold,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fastBadgeText: {
    fontSize: 9,
    fontWeight: "800" as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  recommendedBadge: {
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: "800" as const,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  tierDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 4,
  },
  tierTurnaround: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
    fontStyle: "italic" as const,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.text,
    marginLeft: 8,
  },
  tierPriceActive: {
    color: Colors.primary,
  },
  tierPricePriority: {
    color: Colors.goldDark,
  },
  feeCard: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    marginTop: 16,
  },
  feeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabel: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: "500" as const,
  },
  feeAmount: {
    fontSize: 22,
    color: Colors.gold,
    fontWeight: "800" as const,
  },
  feeBreakdown: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  feeRowLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  feeRowValue: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600" as const,
  },
  verificationChecks: {
    marginTop: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  checksTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  checkText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  paymentMethods: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  paymentMethodsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  securityNoteText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  intelBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.gold + "12",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gold + "30",
  },
  intelBannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.goldDark,
    lineHeight: 19,
  },
  unitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitChipText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  unitChipTextActive: {
    color: Colors.white,
  },
  devStatusRow: {
    gap: 8,
  },
  devStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devStatusChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  devStatusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  devStatusTextActive: {
    color: Colors.white,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  toggleCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  toggleCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleCheckActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  toggleLabelActive: {
    color: Colors.primary,
  },
  chainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addChainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.primary + "10",
  },
  addChainText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  chainEntry: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chainEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chainEntryLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  chainInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  intelReviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  intelReviewTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
});
