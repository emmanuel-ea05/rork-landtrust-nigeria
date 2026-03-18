import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
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
  Zap,
  Globe,
  BarChart3,
  ArrowUpRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MOCK_VERIFICATIONS, MOCK_PROFESSIONALS } from "@/mocks/data";
import StatusBadge from "@/components/StatusBadge";

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const [refreshing, setRefreshing] = useState(false);

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
    ]).start(() => {
      Animated.stagger(
        100,
        cardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();
    });
  }, [fadeAnim, slideAnim, cardAnims]);

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
  const totalFees = MOCK_VERIFICATIONS.reduce((sum, v) => sum + v.fee, 0);
  const availablePros = MOCK_PROFESSIONALS.filter((p) => p.available).length;

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    console.log("[HomeScreen] Refreshing data...");
    setTimeout(() => {
      setRefreshing(false);
      console.log("[HomeScreen] Refresh complete");
    }, 1200);
  }, []);

  const getTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      <Animated.View
        style={[
          styles.heroSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.heroContent}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Welcome back</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Verify Land{"\n"}Before You Buy.</Text>
          <Text style={styles.heroSubtitle}>
            Nigeria's trusted land verification platform
          </Text>
          <TouchableOpacity
            style={styles.heroCta}
            onPress={handleNewVerification}
            activeOpacity={0.8}
            testID="home-new-verification"
          >
            <Shield size={18} color={Colors.primaryDark} />
            <Text style={styles.heroCtaText}>Start Verification</Text>
            <ArrowUpRight size={16} color={Colors.primaryDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroGraphic}>
          <View style={styles.shieldIcon}>
            <Shield size={48} color={Colors.gold} />
          </View>
          <View style={styles.heroPatternDot1} />
          <View style={styles.heroPatternDot2} />
          <View style={styles.heroPatternDot3} />
        </View>
      </Animated.View>

      <View style={styles.statsGrid}>
        {[
          {
            icon: <TrendingUp size={18} color={Colors.white} />,
            value: totalVerifications,
            label: "Total",
            primary: true,
          },
          {
            icon: <Clock size={18} color={Colors.gold} />,
            value: activeCount,
            label: "Active",
            primary: false,
          },
          {
            icon: <FileCheck size={18} color={Colors.success} />,
            value: completedCount,
            label: "Done",
            primary: false,
          },
          {
            icon: <AlertTriangle size={18} color={Colors.danger} />,
            value: flaggedCount,
            label: "Flagged",
            primary: false,
          },
        ].map((stat, i) => (
          <Animated.View
            key={stat.label}
            style={[
              styles.statCard,
              stat.primary && styles.statCardPrimary,
              {
                opacity: cardAnims[i],
                transform: [
                  {
                    translateY: cardAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {stat.icon}
            <Text
              style={stat.primary ? styles.statNumber : styles.statNumberDark}
            >
              {stat.value}
            </Text>
            <Text
              style={stat.primary ? styles.statLabel : styles.statLabelDark}
            >
              {stat.label}
            </Text>
          </Animated.View>
        ))}
      </View>

      <View style={styles.insightBanner}>
        <View style={styles.insightLeft}>
          <BarChart3 size={18} color={Colors.primary} />
          <View>
            <Text style={styles.insightTitle}>Total Investment Protected</Text>
            <Text style={styles.insightValue}>
              ₦{(totalFees * completedCount).toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.insightRight}>
          <Users size={14} color={Colors.textTertiary} />
          <Text style={styles.insightPros}>
            {availablePros} pros online
          </Text>
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
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors.primary + "15" },
              ]}
            >
              <Shield size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>New{"\n"}Verification</Text>
            <Text style={styles.actionSub}>₦30,000</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/map")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors.gold + "20" },
              ]}
            >
              <MapPin size={22} color={Colors.goldDark} />
            </View>
            <Text style={styles.actionLabel}>Check{"\n"}Map</Text>
            <Text style={styles.actionSub}>GIS Zones</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/profile/professionals")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors.info + "15" },
              ]}
            >
              <Users size={22} color={Colors.info} />
            </View>
            <Text style={styles.actionLabel}>Find{"\n"}Experts</Text>
            <Text style={styles.actionSub}>{MOCK_PROFESSIONALS.length} listed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.diasporaCard}>
        <View style={styles.diasporaLeft}>
          <Globe size={20} color={Colors.primary} />
          <View style={styles.diasporaTextWrap}>
            <Text style={styles.diasporaTitle}>Diaspora Mode</Text>
            <Text style={styles.diasporaDesc}>
              Verify land remotely from anywhere in the world. Track progress in real-time.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.diasporaCta}
          onPress={handleNewVerification}
          activeOpacity={0.7}
        >
          <Zap size={14} color={Colors.white} />
          <Text style={styles.diasporaCtaText}>Start</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Verifications</Text>
          <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentVerifications.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Shield size={32} color={Colors.border} />
            <Text style={styles.emptyRecentText}>No verifications yet</Text>
            <Text style={styles.emptyRecentSub}>
              Start your first land verification today
            </Text>
          </View>
        ) : (
          recentVerifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentCard}
              onPress={() => handleViewCase(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.recentLeft}>
                <View style={styles.recentTopRow}>
                  <Text style={styles.recentPlot}>{item.plotNumber}</Text>
                  <Text style={styles.recentTime}>
                    {getTimeAgo(item.updatedAt)}
                  </Text>
                </View>
                <View style={styles.recentLocation}>
                  <MapPin size={11} color={Colors.textTertiary} />
                  <Text style={styles.recentDistrict}>
                    {item.district}, {item.state}
                  </Text>
                </View>
                <View style={styles.recentMeta}>
                  <Text style={styles.recentSeller}>
                    Seller: {item.sellerName}
                  </Text>
                </View>
              </View>
              <View style={styles.recentRight}>
                <StatusBadge status={item.status} size="small" />
                <ChevronRight size={16} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.coverageSection}>
        <Text style={styles.sectionTitle}>Coverage Areas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coverageScroll}
        >
          {["Guzape", "Maitama", "Asokoro", "Lugbe", "Gwarinpa", "Jabi", "Wuse", "Kubwa"].map(
            (area) => (
              <View key={area} style={styles.coverageChip}>
                <MapPin size={12} color={Colors.primary} />
                <Text style={styles.coverageChipText}>{area}</Text>
              </View>
            )
          )}
        </ScrollView>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconWrap}>
          <Shield size={20} color={Colors.gold} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Protect Your Investment</Text>
          <Text style={styles.infoText}>
            Over 60% of land disputes in Nigeria arise from unverified
            purchases. LandSecure checks C of O, survey plans, ownership
            history, and government acquisition status — so you buy with
            confidence.
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
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  greeting: {
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(46,204,113,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.success,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800" as const,
    lineHeight: 32,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
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
    position: "relative",
  },
  shieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroPatternDot1: {
    position: "absolute",
    top: -10,
    right: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(197,165,90,0.3)",
  },
  heroPatternDot2: {
    position: "absolute",
    bottom: -5,
    left: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroPatternDot3: {
    position: "absolute",
    top: 10,
    left: -15,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(197,165,90,0.2)",
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
  insightBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  insightLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  insightTitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.primary,
  },
  insightRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  insightPros: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
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
  actionSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: "500" as const,
  },
  diasporaCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.primary + "08",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  diasporaLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  diasporaTextWrap: {
    flex: 1,
  },
  diasporaTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 3,
  },
  diasporaDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  diasporaCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },
  diasporaCtaText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.white,
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
  emptyRecent: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyRecentText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
  },
  emptyRecentSub: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
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
  recentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recentPlot: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  recentTime: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
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
  recentMeta: {
    marginTop: 4,
  },
  recentSeller: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  recentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  coverageSection: {
    paddingLeft: 16,
    marginTop: 24,
  },
  coverageScroll: {
    gap: 8,
    paddingRight: 16,
  },
  coverageChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  coverageChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
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
