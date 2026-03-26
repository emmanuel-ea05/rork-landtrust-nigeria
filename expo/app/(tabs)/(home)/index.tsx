import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Shield,
  MapPin,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Clock,
  Users,
  Zap,
  Globe,
  BarChart3,
  ArrowUpRight,
  Search,
  Database,
  Eye,
  Share2,
  Fingerprint,
  Skull,
  ScanLine,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MOCK_VERIFICATIONS, MOCK_PROFESSIONALS, MOCK_LAND_RECORDS } from "@/mocks/data";
import { LAND_STATUS_LABELS, LAND_STATUS_COLORS } from "@/types";
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
  const [lookupQuery, setLookupQuery] = useState("");
  const lookupAnim = useRef(new Animated.Value(0)).current;

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
  const trackedLands = MOCK_LAND_RECORDS.length;
  const safeLands = MOCK_LAND_RECORDS.filter((r) => r.status === "safe").length;

  const handleNewVerification = useCallback(() => {
    router.push("/(tabs)/verify");
  }, [router]);

  const handleFraudScan = useCallback(() => {
    router.push("/fraud-scan");
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

  const handleLandLookup = useCallback(() => {
    const query = lookupQuery.trim();
    if (!query) {
      Alert.alert("Enter Land ID", "Please enter a Land ID or plot number to look up.");
      return;
    }

    console.log(`[HomeScreen] Looking up land: ${query}`);

    const record = MOCK_LAND_RECORDS.find(
      (r) =>
        r.landId.toLowerCase() === query.toLowerCase() ||
        r.plotNumber.toLowerCase() === query.toLowerCase()
    );

    if (record) {
      router.push({ pathname: "/land-record", params: { landId: record.landId } });
      setLookupQuery("");
    } else {
      Animated.sequence([
        Animated.timing(lookupAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(lookupAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(lookupAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(lookupAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      Alert.alert(
        "Land Not Found",
        `No record found for "${query}". This land may not have been verified yet.\n\nWould you like to request a verification?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Verify Now", onPress: handleNewVerification },
        ]
      );
    }
  }, [lookupQuery, router, lookupAnim, handleNewVerification]);

  const handleViewLandRecord = useCallback(
    (landId: string) => {
      router.push({ pathname: "/land-record", params: { landId } });
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
          styles.fraudHero,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.fraudHeroBadge}>
          <Skull size={12} color={Colors.danger} />
          <Text style={styles.fraudHeroBadgeText}>LAND FRAUD ALERT</Text>
        </View>
        <Text style={styles.fraudHeroTitle}>This land could{"\n"}be a scam.</Text>
        <Text style={styles.fraudHeroSubtitle}>
          ₦4.2 billion lost to land fraud in Abuja every year. Check before you lose millions.
        </Text>
        <TouchableOpacity
          style={styles.fraudHeroCta}
          onPress={handleFraudScan}
          activeOpacity={0.8}
          testID="home-fraud-scan"
        >
          <ScanLine size={18} color={Colors.white} />
          <Text style={styles.fraudHeroCtaText}>Instant Fraud Risk Score — Free</Text>
        </TouchableOpacity>
        <Text style={styles.fraudHeroFootnote}>Takes 30 seconds · No payment required</Text>
      </Animated.View>

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

      <Animated.View style={[styles.lookupSection, { transform: [{ translateX: lookupAnim }] }]}>
        <View style={styles.lookupHeader}>
          <Fingerprint size={18} color={Colors.primary} />
          <Text style={styles.lookupTitle}>Check Land Status</Text>
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>FREE</Text>
          </View>
        </View>
        <Text style={styles.lookupDesc}>
          Already have a Land ID? Look up its verified status instantly.
        </Text>
        <View style={styles.lookupInputRow}>
          <TextInput
            style={styles.lookupInput}
            placeholder="e.g. LS-ABJ-00142 or PLT-4521-GZP"
            placeholderTextColor={Colors.textTertiary}
            value={lookupQuery}
            onChangeText={setLookupQuery}
            onSubmitEditing={handleLandLookup}
            returnKeyType="search"
            testID="land-lookup-input"
          />
          <TouchableOpacity
            style={styles.lookupBtn}
            onPress={handleLandLookup}
            activeOpacity={0.7}
            testID="land-lookup-btn"
          >
            <Search size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.statsGrid}>
        {[
          {
            icon: <Database size={18} color={Colors.white} />,
            value: trackedLands,
            label: "Tracked",
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
            value: safeLands,
            label: "Safe",
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

      <View style={styles.registrySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Land Registry</Text>
          <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.registryDesc}>
          Persistent land records with full ownership history and status tracking.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.registryScroll}
        >
          {MOCK_LAND_RECORDS.slice(0, 4).map((record) => {
            const statusColor = LAND_STATUS_COLORS[record.status];
            const riskColor = record.riskScore > 60 ? Colors.danger : record.riskScore > 30 ? Colors.warning : Colors.success;
            return (
              <TouchableOpacity
                key={record.landId}
                style={styles.registryCard}
                onPress={() => handleViewLandRecord(record.landId)}
                activeOpacity={0.7}
              >
                <View style={styles.registryCardTop}>
                  <View style={[styles.registryStatusDot, { backgroundColor: statusColor }]} />
                  <Text style={styles.registryLandId}>{record.landId}</Text>
                </View>
                <Text style={styles.registryPlot}>{record.plotNumber}</Text>
                <View style={styles.registryLocation}>
                  <MapPin size={11} color={Colors.textTertiary} />
                  <Text style={styles.registryDistrict}>{record.district}</Text>
                </View>
                <View style={styles.registryMeta}>
                  <View style={[styles.registryStatusBadge, { backgroundColor: statusColor + "15" }]}>
                    <Text style={[styles.registryStatusText, { color: statusColor }]}>
                      {LAND_STATUS_LABELS[record.status]}
                    </Text>
                  </View>
                  <View style={styles.registryRisk}>
                    <View style={[styles.registryRiskDot, { backgroundColor: riskColor }]} />
                    <Text style={styles.registryRiskText}>{record.riskScore}</Text>
                  </View>
                </View>
                <View style={styles.registryFooter}>
                  <Eye size={11} color={Colors.textTertiary} />
                  <Text style={styles.registryFooterText}>
                    {record.totalVerifications} checks · {record.timeline.length} events
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            <Text style={styles.actionSub}>From ₦30k</Text>
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

      <View style={styles.viralCard}>
        <View style={styles.viralIconWrap}>
          <Share2 size={22} color={Colors.primary} />
        </View>
        <View style={styles.viralContent}>
          <Text style={styles.viralTitle}>Know someone buying land?</Text>
          <Text style={styles.viralDesc}>
            Share a land's verified status with them — it's free to check. Help protect others from fraud.
          </Text>
          <TouchableOpacity
            style={styles.viralCta}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                "Share LandSecure",
                "Share the app with someone who's buying land in Abuja.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Share App",
                    onPress: async () => {
                      try {
                        await import("react-native").then(({ Share: S }) =>
                          S.share({
                            message: "Check if your land is safe before buying. Use LandSecure — Nigeria's trusted land verification platform.\n\nVerify Land Before You Buy.\nlandsecure.ng",
                          })
                        );
                      } catch (e) {
                        console.log("[HomeScreen] Share error:", e);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.viralCtaText}>Share with someone</Text>
            <ChevronRight size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.fearCard}
        onPress={handleFraudScan}
        activeOpacity={0.8}
      >
        <View style={styles.fearIconWrap}>
          <AlertTriangle size={22} color={Colors.danger} />
        </View>
        <View style={styles.fearContent}>
          <Text style={styles.fearTitle}>Don't become a victim</Text>
          <Text style={styles.fearText}>
            1 in 3 land titles in Nigeria have issues. Fake C of O, ghost sellers, government acquisition — scan any land for free before you pay a single naira.
          </Text>
          <View style={styles.fearCta}>
            <ScanLine size={14} color={Colors.danger} />
            <Text style={styles.fearCtaText}>Scan Now — It's Free</Text>
            <ChevronRight size={14} color={Colors.danger} />
          </View>
        </View>
      </TouchableOpacity>

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
  lookupSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  lookupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  lookupTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  freeBadge: {
    backgroundColor: Colors.success + "18",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  freeText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: Colors.success,
    letterSpacing: 0.5,
  },
  lookupDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  lookupInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  lookupInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lookupBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 16,
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
  registrySection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  registryDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: -8,
    marginBottom: 14,
  },
  registryScroll: {
    gap: 10,
    paddingRight: 4,
  },
  registryCard: {
    width: 180,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  registryCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  registryStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  registryLandId: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  registryPlot: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  registryLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 8,
  },
  registryDistrict: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  registryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  registryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  registryStatusText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  registryRisk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  registryRiskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  registryRiskText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: "600" as const,
  },
  registryFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  registryFooterText: {
    fontSize: 10,
    color: Colors.textTertiary,
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
  viralCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: Colors.primary + "06",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.primary + "15",
  },
  viralIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "12",
    justifyContent: "center",
    alignItems: "center",
  },
  viralContent: {
    flex: 1,
  },
  viralTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  viralDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  viralCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  viralCtaText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
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
  fraudHero: {
    backgroundColor: "#1A1A1A",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  fraudHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.danger + "18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  fraudHeroBadgeText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: Colors.danger,
    letterSpacing: 0.8,
  },
  fraudHeroTitle: {
    fontSize: 28,
    fontWeight: "900" as const,
    color: Colors.white,
    lineHeight: 34,
    marginBottom: 8,
  },
  fraudHeroSubtitle: {
    fontSize: 14,
    color: "#999999",
    lineHeight: 21,
    marginBottom: 20,
  },
  fraudHeroCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  fraudHeroCtaText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  fraudHeroFootnote: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center" as const,
  },
  fearCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.danger + "08",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.danger + "20",
  },
  fearIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.danger + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  fearContent: {
    flex: 1,
  },
  fearTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.danger,
    marginBottom: 4,
  },
  fearText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  fearCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  fearCtaText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.danger,
  },
});
