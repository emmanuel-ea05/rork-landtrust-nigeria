import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  MapPin,
  ChevronRight,
  Users,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Star,
  FileCheck,
  Mail,
  Phone,
  Globe,
  Lock,
  MessageCircle,
  Award,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MOCK_VERIFICATIONS, MOCK_PROFESSIONALS } from "@/mocks/data";

export default function ProfileScreen() {
  const router = useRouter();
  const totalVerifications = MOCK_VERIFICATIONS.length;
  const completedVerifications = MOCK_VERIFICATIONS.filter(
    (v) => v.status === "completed"
  ).length;
  const totalSpent = MOCK_VERIFICATIONS.filter((v) => v.paid).reduce(
    (sum, v) => sum + v.fee,
    0
  );

  const handleProfessionals = useCallback(() => {
    router.push("/(tabs)/profile/professionals");
  }, [router]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of LandSecure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive" },
      ]
    );
  }, []);

  const handleMenuItem = useCallback((label: string) => {
    console.log(`[ProfileScreen] Menu item pressed: ${label}`);
    if (label === "My Verifications") {
      router.push("/(tabs)/activity");
    } else if (label === "Professional Network") {
      router.push("/(tabs)/profile/professionals");
    } else {
      Alert.alert(label, "This feature is coming soon.");
    }
  }, [router]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={32} color={Colors.white} />
          </View>
          <View style={styles.verifiedBadge}>
            <Shield size={12} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.userName}>Guest User</Text>
        <View style={styles.userTypeRow}>
          <View style={styles.userTypeBadge}>
            <Text style={styles.userTypeText}>Buyer</Text>
          </View>
          <View style={styles.memberBadge}>
            <Award size={10} color={Colors.gold} />
            <Text style={styles.memberText}>Member since 2026</Text>
          </View>
        </View>
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <MapPin size={13} color={Colors.goldLight} />
            <Text style={styles.contactText}>Abuja, Nigeria</Text>
          </View>
          <View style={styles.contactItem}>
            <Mail size={13} color={Colors.goldLight} />
            <Text style={styles.contactText}>guest@email.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalVerifications}</Text>
          <Text style={styles.statLabel}>Requests</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {completedVerifications}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₦{(totalSpent / 1000).toFixed(0)}k
          </Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Services</Text>
        <MenuItem
          icon={<Users size={20} color={Colors.primary} />}
          label="Professional Network"
          sublabel={`${MOCK_PROFESSIONALS.length} verified experts`}
          onPress={handleProfessionals}
        />
        <MenuItem
          icon={<FileCheck size={20} color={Colors.success} />}
          label="My Verifications"
          sublabel={`${totalVerifications} total, ${completedVerifications} completed`}
          onPress={() => handleMenuItem("My Verifications")}
        />
        <MenuItem
          icon={<Star size={20} color={Colors.gold} />}
          label="Verified Properties"
          sublabel={`${completedVerifications} properties verified`}
          onPress={() => handleMenuItem("Verified Properties")}
        />
        <MenuItem
          icon={<Globe size={20} color={Colors.info} />}
          label="Diaspora Services"
          sublabel="Remote verification & monitoring"
          onPress={() => handleMenuItem("Diaspora Services")}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Account</Text>
        <MenuItem
          icon={<Bell size={20} color={Colors.warning} />}
          label="Notifications"
          sublabel="Verification updates & alerts"
          onPress={() => handleMenuItem("Notifications")}
          badge={2}
        />
        <MenuItem
          icon={<Lock size={20} color={Colors.primary} />}
          label="Security & Privacy"
          sublabel="Data protection settings"
          onPress={() => handleMenuItem("Security & Privacy")}
        />
        <MenuItem
          icon={<Phone size={20} color={Colors.success} />}
          label="Payment Methods"
          sublabel="Cards, bank transfer & USSD"
          onPress={() => handleMenuItem("Payment Methods")}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Support</Text>
        <MenuItem
          icon={<MessageCircle size={20} color={Colors.info} />}
          label="Live Chat"
          sublabel="Chat with our support team"
          onPress={() => handleMenuItem("Live Chat")}
        />
        <MenuItem
          icon={<HelpCircle size={20} color={Colors.textSecondary} />}
          label="Help & FAQ"
          sublabel="Common questions answered"
          onPress={() => handleMenuItem("Help & FAQ")}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.7}
        onPress={handleSignOut}
      >
        <LogOut size={18} color={Colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>LandSecure v1.0.0</Text>
        <Text style={styles.versionSubtext}>
          Verify Land Before You Buy.
        </Text>
        <Text style={styles.versionCompany}>
          NDPC Compliant · Powered by LandSecure Nigeria
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrap}>{icon}</View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSublabel}>{sublabel}</Text>
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badgeCircle}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <ChevronRight size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.white,
    marginBottom: 8,
  },
  userTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  userTypeBadge: {
    backgroundColor: Colors.gold + "30",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.gold,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberText: {
    fontSize: 11,
    color: Colors.goldLight,
    fontWeight: "500" as const,
  },
  contactRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  menuSublabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  badgeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
    backgroundColor: Colors.danger + "08",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.danger,
  },
  versionInfo: {
    alignItems: "center",
    marginTop: 24,
    gap: 2,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: "600" as const,
  },
  versionSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: "italic" as const,
  },
  versionCompany: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 20,
  },
});
