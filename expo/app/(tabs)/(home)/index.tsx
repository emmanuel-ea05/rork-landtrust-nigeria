import React, { useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Shield,
  MapPin,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Clock,
  Users,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MOCK_VERIFICATIONS } from "@/mocks/data";
import StatusBadge from "@/components/StatusBadge";

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const totalVerifications = MOCK_VERIFICATIONS.length;
  const completedCount = MOCK_VERIFICATIONS.filter(
    (v) => v.status === "completed"
  ).length;
  const activeCount = MOCK_VERIFICATIONS.filter(
    (v) => v.status !== "completed" && v.status !== "flagged"
  ).length;
  const flaggedCount = MOCK_VERIFICATIONS.filter(
    (v) => v.status === "flagged"
  ).length;

  const recentVerifications = MOCK_VERIFICATIONS.slice(0, 3);

  const handleNewVerification = useCallback(() => {
    router.push("/(tabs)/verify");
  }, [router]);

  const handleViewAll = useCallback(() => {
    router.push("/(tabs)/activity");
  }, [router]);

  const handleViewCase = useCallback(
    (id: string) => {
      router.push(`/(tabs)/activity/${id}`);
    },
    [router]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.heroSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.heroContent}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.heroTitle}>Verify Land{"\n"}Before You Buy.</Text>
          <TouchableOpacity
            style={styles.heroCta}
            onPress={handleNewVerification}
            activeOpacity={0.8}
            testID="home-new-verification"
          >
            <Shield size={18} color={Colors.primaryDark} />
            <Text style={styles.heroCtaText}>Start Verification</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroGraphic}>
          <View style={styles.shieldIcon}>
            <Shield size={48} color={Colors.gold} />
          </View>
        </View>
      </Animated.View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <TrendingUp size={20} color={Colors.white} />
          <Text style={styles.statNumber}>{totalVerifications}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color={Colors.gold} />
          <Text style={styles.statNumberDark}>{activeCount}</Text>
          <Text style={styles.statLabelDark}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <FileCheck size={20} color={Colors.success} />
          <Text style={styles.statNumberDark}>{completedCount}</Text>
          <Text style={styles.statLabelDark}>Done</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={20} color={Colors.danger} />
          <Text style={styles.statNumberDark}>{flaggedCount}</Text>
          <Text style={styles.statLabelDark}>Flagged</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleNewVerification}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primary + "15" }]}>
              <Shield size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>New{"\n"}Verification</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/map")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.gold + "20" }]}>
              <MapPin size={22} color={Colors.goldDark} />
            </View>
            <Text style={styles.actionLabel}>Check{"\n"}Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/profile/professionals")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.info + "15" }]}>
              <Users size={22} color={Colors.info} />
            </View>
            <Text style={styles.actionLabel}>Find{"\n"}Experts</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Verifications</Text>
          <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentVerifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recentCard}
            onPress={() => handleViewCase(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.recentLeft}>
              <Text style={styles.recentPlot}>{item.plotNumber}</Text>
              <View style={styles.recentLocation}>
                <MapPin size={11} color={Colors.textTertiary} />
                <Text style={styles.recentDistrict}>{item.district}</Text>
              </View>
            </View>
            <View style={styles.recentRight}>
              <StatusBadge status={item.status} size="small" />
              <ChevronRight size={16} color={Colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconWrap}>
          <Shield size={20} color={Colors.gold} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Protect Your Investment</Text>
          <Text style={styles.infoText}>
            Over 60% of land disputes in Nigeria arise from unverified purchases. Always verify before you buy.
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 20,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800" as const,
    lineHeight: 32,
    marginBottom: 18,
  },
  heroCta: {
    backgroundColor: Colors.gold,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
    gap: 8,
  },
  heroCtaText: {
    color: Colors.primaryDark,
    fontWeight: "700" as const,
    fontSize: 14,
  },
  heroGraphic: {
    justifyContent: "center",
    alignItems: "center",
  },
  shieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statCardPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.white,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statNumberDark: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statLabelDark: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center" as const,
    lineHeight: 16,
  },
  recentSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  recentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  recentLeft: {
    flex: 1,
  },
  recentPlot: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  recentLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recentDistrict: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  recentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.gold + "12",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gold + "30",
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gold + "25",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.goldDark,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 20,
  },
});
