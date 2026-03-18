import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  MapPin,
  Search,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { DISTRICTS } from "@/mocks/data";

interface MapZone {
  id: string;
  name: string;
  status: "safe" | "caution" | "acquired";
  description: string;
}

const MAP_ZONES: MapZone[] = [
  { id: "z1", name: "Guzape District I", status: "safe", description: "Residential area, titles generally clear" },
  { id: "z2", name: "Maitama Extension", status: "caution", description: "Some disputed boundaries reported" },
  { id: "z3", name: "Lugbe Phase 2", status: "acquired", description: "Under government acquisition since 2023" },
  { id: "z4", name: "Asokoro Extension", status: "safe", description: "Premium residential, well-documented" },
  { id: "z5", name: "Gwarinpa Phase 4", status: "caution", description: "Mixed ownership claims in some sections" },
  { id: "z6", name: "Jabi Lake Area", status: "acquired", description: "Partly under FCDA development plan" },
  { id: "z7", name: "Wuse Zone 5", status: "safe", description: "Commercial zone, titles generally verified" },
  { id: "z8", name: "Life Camp Extension", status: "caution", description: "Boundary disputes near satellite settlements" },
  { id: "z9", name: "Kubwa North", status: "safe", description: "Residential expansion area, new allocations" },
  { id: "z10", name: "Karu / Nyanya Border", status: "acquired", description: "FCT boundary, partial government acquisition" },
];

const STATUS_CONFIG = {
  safe: { color: Colors.success, Icon: CheckCircle, label: "Clear" },
  caution: { color: Colors.warning, Icon: AlertTriangle, label: "Caution" },
  acquired: { color: Colors.danger, Icon: AlertTriangle, label: "Gov. Acquired" },
} as const;

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);
  const [coordLat, setCoordLat] = useState("");
  const [coordLng, setCoordLng] = useState("");

  const filteredZones = MAP_ZONES.filter((z) =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckCoordinates = useCallback(() => {
    if (!coordLat || !coordLng) return;
    const lat = parseFloat(coordLat);
    const lng = parseFloat(coordLng);
    if (isNaN(lat) || isNaN(lng)) return;

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
        description: "Coordinate lookup — verify with a surveyor for exact boundary confirmation.",
      });
    }
  }, [coordLat, coordLng]);

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
          <Navigation size={24} color={Colors.primary} />
          <Text style={styles.mapOverlayText}>Abuja FCT — Land Zone Map</Text>
          <Text style={styles.mapOverlaySubtext}>
            Interactive GIS mapping coming soon
          </Text>
        </View>
      </View>

      <View style={styles.coordSection}>
        <Text style={styles.sectionTitle}>Check Coordinates</Text>
        <View style={styles.coordInputRow}>
          <TextInput
            style={[styles.coordInput, { flex: 1 }]}
            placeholder="Latitude"
            placeholderTextColor={Colors.textTertiary}
            value={coordLat}
            onChangeText={setCoordLat}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.coordInput, { flex: 1 }]}
            placeholder="Longitude"
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
          <View
            style={[
              styles.zoneResult,
              { borderColor: STATUS_CONFIG[selectedZone.status].color + "40" },
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
          </View>
        )}
      </View>

      <View style={styles.legendSection}>
        <Text style={styles.sectionTitle}>Zone Legend</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Clear — No known acquisition</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>Caution — Disputed or mixed claims</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.legendText}>Acquired — Government acquisition</Text>
        </View>
      </View>

      <View style={styles.zonesSection}>
        <Text style={styles.sectionTitle}>Abuja Land Zones</Text>
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

        {filteredZones.map((zone) => {
          const config = STATUS_CONFIG[zone.status];
          return (
            <TouchableOpacity
              key={zone.id}
              style={styles.zoneCard}
              onPress={() => setSelectedZone(zone)}
              activeOpacity={0.7}
            >
              <View style={[styles.zoneIndicator, { backgroundColor: config.color }]} />
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDesc}>{zone.description}</Text>
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
      </View>

      <View style={styles.disclaimerCard}>
        <Info size={16} color={Colors.info} />
        <Text style={styles.disclaimerText}>
          Zone statuses are based on available data and may not reflect real-time changes. Always verify with AGIS and a licensed surveyor.
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
  coordSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
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
  legendSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    marginBottom: 12,
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
    height: 36,
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
