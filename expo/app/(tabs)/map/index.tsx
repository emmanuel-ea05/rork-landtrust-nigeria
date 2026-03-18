import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
} from "react-native";
import {
  MapPin,
  Search,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Info,
  Crosshair,
  Layers,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { DISTRICTS } from "@/mocks/data";

interface MapZone {
  id: string;
  name: string;
  status: "safe" | "caution" | "acquired";
  description: string;
  lastUpdated: string;
  plotCount: number;
}

const MAP_ZONES: MapZone[] = [
  { id: "z1", name: "Guzape District I", status: "safe", description: "Residential area, titles generally clear", lastUpdated: "2026-03-15", plotCount: 342 },
  { id: "z2", name: "Maitama Extension", status: "caution", description: "Some disputed boundaries reported near eastern edge", lastUpdated: "2026-03-12", plotCount: 189 },
  { id: "z3", name: "Lugbe Phase 2", status: "acquired", description: "Under government acquisition since 2023 — FCDA expansion plan", lastUpdated: "2026-03-10", plotCount: 567 },
  { id: "z4", name: "Asokoro Extension", status: "safe", description: "Premium residential, well-documented titles with AGIS", lastUpdated: "2026-03-16", plotCount: 124 },
  { id: "z5", name: "Gwarinpa Phase 4", status: "caution", description: "Mixed ownership claims in sections B3–B7", lastUpdated: "2026-03-14", plotCount: 456 },
  { id: "z6", name: "Jabi Lake Area", status: "acquired", description: "Partly under FCDA development plan — commercial rezoning", lastUpdated: "2026-03-08", plotCount: 78 },
  { id: "z7", name: "Wuse Zone 5", status: "safe", description: "Commercial zone, titles generally verified with registry", lastUpdated: "2026-03-17", plotCount: 213 },
  { id: "z8", name: "Life Camp Extension", status: "caution", description: "Boundary disputes near satellite settlements — survey recommended", lastUpdated: "2026-03-11", plotCount: 298 },
  { id: "z9", name: "Kubwa North", status: "safe", description: "Residential expansion area, new AGIS allocations from 2024", lastUpdated: "2026-03-13", plotCount: 431 },
  { id: "z10", name: "Karu / Nyanya Border", status: "acquired", description: "FCT boundary zone, partial government acquisition for road project", lastUpdated: "2026-03-09", plotCount: 156 },
  { id: "z11", name: "Orozo Residential", status: "caution", description: "Rapid development area — some unapproved subdivisions detected", lastUpdated: "2026-03-15", plotCount: 389 },
  { id: "z12", name: "Idu Industrial", status: "safe", description: "Industrial zone, AGIS-registered allocations, clear titles", lastUpdated: "2026-03-16", plotCount: 92 },
];

const STATUS_CONFIG = {
  safe: { color: Colors.success, Icon: CheckCircle, label: "Clear", bgColor: Colors.success + "15" },
  caution: { color: Colors.warning, Icon: AlertTriangle, label: "Caution", bgColor: Colors.warning + "15" },
  acquired: { color: Colors.danger, Icon: AlertTriangle, label: "Gov. Acquired", bgColor: Colors.danger + "15" },
} as const;

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);
  const [coordLat, setCoordLat] = useState("");
  const [coordLng, setCoordLng] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "safe" | "caution" | "acquired">("all");
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedZone) {
      resultAnim.setValue(0);
      Animated.spring(resultAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedZone, resultAnim]);

  const filteredZones = MAP_ZONES.filter((z) => {
    const matchesSearch = z.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeStatusFilter === "all" || z.status === activeStatusFilter;
    return matchesSearch && matchesFilter;
  });

  const zoneCounts = {
    safe: MAP_ZONES.filter((z) => z.status === "safe").length,
    caution: MAP_ZONES.filter((z) => z.status === "caution").length,
    acquired: MAP_ZONES.filter((z) => z.status === "acquired").length,
  };

  const handleCheckCoordinates = useCallback(() => {
    if (!coordLat || !coordLng) {
      Alert.alert("Missing Coordinates", "Please enter both latitude and longitude values.");
      return;
    }
    const lat = parseFloat(coordLat);
    const lng = parseFloat(coordLng);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert("Invalid Coordinates", "Please enter valid numeric coordinates.");
      return;
    }

    if (lat < 8.5 || lat > 9.5 || lng < 7.0 || lng > 8.0) {
      Alert.alert(
        "Outside Coverage",
        "These coordinates appear to be outside the Abuja FCT area. LandSecure currently covers Abuja districts only.",
        [{ text: "OK" }]
      );
      return;
    }

    console.log(`[MapScreen] Checking coordinates: ${lat}, ${lng}`);

    const nearestDistrict = DISTRICTS.reduce((nearest, d) => {
      const dist = Math.sqrt(
        Math.pow(d.coordinates.latitude - lat, 2) +
          Math.pow(d.coordinates.longitude - lng, 2)
      );
      const nearestDist = Math.sqrt(
        Math.pow(nearest.coordinates.latitude - lat, 2) +
          Math.pow(nearest.coordinates.longitude - lng, 2)
      );
      return dist < nearestDist ? d : nearest;
    }, DISTRICTS[0]);

    const matchingZone = MAP_ZONES.find((z) =>
      z.name.toLowerCase().includes(nearestDistrict.name.toLowerCase())
    );

    if (matchingZone) {
      setSelectedZone(matchingZone);
    } else {
      setSelectedZone({
        id: "custom",
        name: `Near ${nearestDistrict.name}`,
        status: "caution",
        description: "Coordinate lookup — verify with a licensed surveyor for exact boundary confirmation. This area may have mixed status zones.",
        lastUpdated: new Date().toISOString().split("T")[0],
        plotCount: 0,
      });
    }
  }, [coordLat, coordLng]);

  const handleVerifyZone = useCallback((zone: MapZone) => {
    Alert.alert(
      "Start Verification",
      `Would you like to start a land verification in ${zone.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start", style: "default" },
      ]
    );
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapGrid}>
          {DISTRICTS.slice(0, 6).map((d, i) => (
            <View
              key={d.id}
              style={[
                styles.mapGridItem,
                {
                  backgroundColor:
                    i % 3 === 0
                      ? Colors.success + "20"
                      : i % 3 === 1
                      ? Colors.warning + "20"
                      : Colors.danger + "20",
                },
              ]}
            >
              <MapPin
                size={14}
                color={
                  i % 3 === 0
                    ? Colors.success
                    : i % 3 === 1
                    ? Colors.warning
                    : Colors.danger
                }
              />
              <Text style={styles.mapGridLabel}>{d.name}</Text>
            </View>
          ))}
        </View>
        <View style={styles.mapOverlay}>
          <Navigation size={22} color={Colors.primary} />
          <Text style={styles.mapOverlayText}>Abuja FCT — Land Zone Map</Text>
          <Text style={styles.mapOverlaySubtext}>
            {MAP_ZONES.length} zones tracked · Updated daily
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.success }]}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>{zoneCounts.safe}</Text>
          <Text style={styles.summaryLabel}>Clear</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.warning }]}>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>{zoneCounts.caution}</Text>
          <Text style={styles.summaryLabel}>Caution</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.danger }]}>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>{zoneCounts.acquired}</Text>
          <Text style={styles.summaryLabel}>Acquired</Text>
        </View>
      </View>

      <View style={styles.coordSection}>
        <View style={styles.sectionHeader}>
          <Crosshair size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Check Coordinates</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Enter GPS coordinates to check land zone status instantly.
        </Text>
        <View style={styles.coordInputRow}>
          <TextInput
            style={[styles.coordInput, { flex: 1 }]}
            placeholder="Latitude (e.g. 9.0234)"
            placeholderTextColor={Colors.textTertiary}
            value={coordLat}
            onChangeText={setCoordLat}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.coordInput, { flex: 1 }]}
            placeholder="Longitude (e.g. 7.5186)"
            placeholderTextColor={Colors.textTertiary}
            value={coordLng}
            onChangeText={setCoordLng}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheckCoordinates}
            activeOpacity={0.7}
          >
            <Search size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {selectedZone && (
          <Animated.View
            style={[
              styles.zoneResult,
              { borderColor: STATUS_CONFIG[selectedZone.status].color + "40" },
              {
                opacity: resultAnim,
                transform: [
                  {
                    translateY: resultAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.zoneResultHeader}>
              {React.createElement(STATUS_CONFIG[selectedZone.status].Icon, {
                size: 18,
                color: STATUS_CONFIG[selectedZone.status].color,
              })}
              <Text style={styles.zoneResultName}>{selectedZone.name}</Text>
              <View
                style={[
                  styles.zoneStatusBadge,
                  {
                    backgroundColor:
                      STATUS_CONFIG[selectedZone.status].color + "18",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.zoneStatusText,
                    { color: STATUS_CONFIG[selectedZone.status].color },
                  ]}
                >
                  {STATUS_CONFIG[selectedZone.status].label}
                </Text>
              </View>
            </View>
            <Text style={styles.zoneResultDesc}>
              {selectedZone.description}
            </Text>
            {selectedZone.plotCount > 0 && (
              <View style={styles.zoneResultMeta}>
                <Text style={styles.zoneResultMetaText}>
                  {selectedZone.plotCount} plots in area · Updated {selectedZone.lastUpdated}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.zoneVerifyBtn}
              onPress={() => handleVerifyZone(selectedZone)}
              activeOpacity={0.7}
            >
              <Shield size={14} color={Colors.primary} />
              <Text style={styles.zoneVerifyText}>Verify Property Here</Text>
              <ChevronRight size={14} color={Colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.legendSection}>
        <View style={styles.sectionHeader}>
          <Layers size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Zone Legend</Text>
        </View>
        <View style={styles.legendGrid}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <View>
              <Text style={styles.legendLabel}>Clear</Text>
              <Text style={styles.legendDesc}>No known acquisition or disputes</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
            <View>
              <Text style={styles.legendLabel}>Caution</Text>
              <Text style={styles.legendDesc}>Disputed boundaries or mixed claims</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <View>
              <Text style={styles.legendLabel}>Gov. Acquired</Text>
              <Text style={styles.legendDesc}>Government acquisition in effect</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.zonesSection}>
        <View style={styles.sectionHeader}>
          <MapPin size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Abuja Land Zones</Text>
        </View>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search zones..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilterRow}
        >
          {([
            { label: "All", value: "all" as const },
            { label: `Clear (${zoneCounts.safe})`, value: "safe" as const },
            { label: `Caution (${zoneCounts.caution})`, value: "caution" as const },
            { label: `Acquired (${zoneCounts.acquired})`, value: "acquired" as const },
          ]).map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.statusFilterChip,
                activeStatusFilter === f.value && styles.statusFilterChipActive,
              ]}
              onPress={() => setActiveStatusFilter(f.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  activeStatusFilter === f.value && styles.statusFilterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.zoneCount}>
          {filteredZones.length} zone{filteredZones.length !== 1 ? "s" : ""} found
        </Text>

        {filteredZones.map((zone) => {
          const config = STATUS_CONFIG[zone.status];
          return (
            <TouchableOpacity
              key={zone.id}
              style={styles.zoneCard}
              onPress={() => setSelectedZone(zone)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.zoneIndicator,
                  { backgroundColor: config.color },
                ]}
              />
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDesc}>{zone.description}</Text>
                <View style={styles.zoneMetaRow}>
                  <Text style={styles.zoneMetaText}>
                    {zone.plotCount} plots · {zone.lastUpdated}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.zoneStatusBadge,
                  { backgroundColor: config.color + "18" },
                ]}
              >
                <Text style={[styles.zoneStatusText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredZones.length === 0 && (
          <View style={styles.emptyZones}>
            <MapPin size={28} color={Colors.border} />
            <Text style={styles.emptyZonesText}>No zones match your search</Text>
          </View>
        )}
      </View>

      <View style={styles.disclaimerCard}>
        <Info size={16} color={Colors.info} />
        <Text style={styles.disclaimerText}>
          Zone statuses are based on available data from AGIS and field reports. They may not reflect real-time changes. Always verify with AGIS and a licensed surveyor before purchasing.
        </Text>
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
  mapPlaceholder: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.primary + "08",
    borderWidth: 1,
    borderColor: Colors.primary + "20",
    height: 220,
  },
  mapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 6,
  },
  mapGridItem: {
    width: "31%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },
  mapGridLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  mapOverlaySubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderLeftWidth: 3,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: "500" as const,
  },
  coordSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  coordInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  coordInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  zoneResult: {
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  zoneResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  zoneResultName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  zoneStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoneStatusText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  zoneResultDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  zoneResultMeta: {
    marginTop: 8,
  },
  zoneResultMetaText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  zoneVerifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: Colors.primary + "10",
    borderRadius: 10,
  },
  zoneVerifyText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  legendSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  legendGrid: {
    gap: 10,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  legendDesc: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  zonesSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
  },
  statusFilterRow: {
    gap: 8,
    paddingBottom: 10,
  },
  statusFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  statusFilterTextActive: {
    color: Colors.white,
  },
  zoneCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 10,
  },
  zoneCard: {
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
  zoneIndicator: {
    width: 4,
    height: 44,
    borderRadius: 2,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  zoneDesc: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  zoneMetaRow: {
    marginTop: 4,
  },
  zoneMetaText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  emptyZones: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyZonesText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  disclaimerCard: {
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.info + "10",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.info + "25",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 20,
  },
});
