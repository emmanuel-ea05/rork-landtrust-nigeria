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
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { DISTRICTS } from "@/mocks/data";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types";

type Step = 1 | 2 | 3 | 4;

const DOCUMENT_TYPES: DocumentType[] = [
  "c_of_o",
  "survey_plan",
  "deed_of_assignment",
  "allocation_letter",
  "other",
];

export default function VerifyScreen() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [plotNumber, setPlotNumber] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<DocumentType[]>([]);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const progressAnim = useRef(new Animated.Value(0.25)).current;

  const animateProgress = useCallback(
    (step: Step) => {
      Animated.spring(progressAnim, {
        toValue: step / 4,
        useNativeDriver: false,
        tension: 40,
        friction: 10,
      }).start();
    },
    [progressAnim]
  );

  const goToStep = useCallback(
    (step: Step) => {
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

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return plotNumber.trim() !== "" && selectedDistrict !== "";
      case 2:
        return sellerName.trim() !== "";
      case 3:
        return selectedDocs.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, plotNumber, selectedDistrict, sellerName, selectedDocs]);

  const handleNext = useCallback(() => {
    if (currentStep < 4) {
      goToStep((currentStep + 1) as Step);
    }
  }, [currentStep, goToStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as Step);
    }
  }, [currentStep, goToStep]);

  const handleSubmit = useCallback(() => {
    Alert.alert(
      "Verification Submitted",
      `Your verification request for ${plotNumber} in ${selectedDistrict} has been submitted successfully. You will be notified once a professional is assigned.`,
      [
        {
          text: "OK",
          onPress: () => {
            setCurrentStep(1);
            animateProgress(1);
            setPlotNumber("");
            setSelectedDistrict("");
            setSurveyNumber("");
            setSellerName("");
            setLatitude("");
            setLongitude("");
            setSelectedDocs([]);
          },
        },
      ]
    );
  }, [plotNumber, selectedDistrict, animateProgress]);

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
        {["Location", "Seller", "Documents", "Review"].map((label, i) => (
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
                <Text
                  style={[
                    styles.stepDotText,
                    i + 1 <= currentStep && styles.stepDotTextActive,
                  ]}
                >
                  {i + 1}
                </Text>
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
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Property Location</Text>
      <Text style={styles.stepDescription}>
        Enter the plot details and location of the land you want to verify.
      </Text>

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
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedDistrict === d.name &&
                        styles.pickerItemTextActive,
                    ]}
                  >
                    {d.name}
                  </Text>
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
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Seller Information</Text>
      <Text style={styles.stepDescription}>
        Provide the name of the person or entity selling the land.
      </Text>

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

      <View style={styles.warningCard}>
        <AlertCircle size={18} color={Colors.warning} />
        <Text style={styles.warningText}>
          The seller name should match exactly as it appears on the land documents for accurate verification.
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Upload Documents</Text>
      <Text style={styles.stepDescription}>
        Select the document types you have. You can upload files after submission.
      </Text>

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
                style={[
                  styles.docName,
                  isSelected && styles.docNameActive,
                ]}
              >
                {DOCUMENT_TYPE_LABELS[docType]}
              </Text>
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
        <Text style={styles.uploadText}>Upload Document Files</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepDescription}>
        Please review your verification request before submitting.
      </Text>

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
        <View style={styles.reviewDivider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Documents</Text>
          <Text style={styles.reviewValue}>
            {selectedDocs.length} selected
          </Text>
        </View>
      </View>

      <View style={styles.feeCard}>
        <Text style={styles.feeLabel}>Verification Fee</Text>
        <Text style={styles.feeAmount}>₦30,000</Text>
      </View>

      <View style={styles.paymentNote}>
        <Text style={styles.paymentNoteText}>
          Payment will be processed via Paystack after submission.
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
          onPress={currentStep === 4 ? handleSubmit : handleNext}
          disabled={!canProceed()}
          activeOpacity={0.7}
          testID="verify-next-button"
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 4 ? "Submit & Pay ₦30,000" : "Continue"}
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
    width: 26,
    height: 26,
    borderRadius: 13,
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
  stepDotText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  stepDotTextActive: {
    color: Colors.white,
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
  stepTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
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
  },
  pickerItemActive: {
    backgroundColor: Colors.primary + "10",
  },
  pickerItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  pickerItemTextActive: {
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  coordinateRow: {
    flexDirection: "row",
    gap: 12,
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
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
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
  feeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    marginTop: 16,
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
  paymentNote: {
    marginTop: 12,
    alignItems: "center",
  },
  paymentNoteText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center" as const,
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
});
