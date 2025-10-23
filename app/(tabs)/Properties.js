import React, { useState, useCallback, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ScrollView 
} from "react-native";

import { purchaseProperty, getTeamSummary } from "../../functions.js";

const TEAM_IDS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function Properties() {
  const [teamId, setTeamId] = useState(1);
  const [propertyName, setPropertyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showTeams, setShowTeams] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  // Fetch team balance
  const fetchTeamBalance = useCallback(async () => {
    try {
      const { data, error } = await getTeamSummary(teamId);
      if (error || !data) {
        console.error("❌ Error fetching team balance:", error);
        setCashBalance(0);
        setNetWorth(0);
      } else {
        setCashBalance(data.cash ?? 0);
        setNetWorth(data.total_cash ?? 0);
      }
    } catch (err) {
      console.error("🔥 Unexpected error fetching balance:", err);
      setCashBalance(0);
      setNetWorth(0);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeamBalance();
  }, [fetchTeamBalance]);

  const handlePropertyPurchase = useCallback(async () => {
    if (loading) return;
    if (!propertyName.trim()) {
      Alert.alert("Invalid Input", "Please enter a property name.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await purchaseProperty(propertyName.trim(), teamId);
      
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setStatusMessage(`Property ${propertyName} purchased successfully!`);
      setPropertyName("");
      await fetchTeamBalance();
    } catch (error) {
      console.error("🔥 Property Purchase Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [propertyName, teamId, loading]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Properties</Text>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Team {teamId} Financial Status</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Cash Balance</Text>
              <Text style={styles.cashBalance}>${cashBalance.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Net Worth</Text>
              <Text style={styles.netWorth}>${netWorth.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <Text style={styles.balanceNote}>Net Worth = Cash + Property Values</Text>
        </View>

        {/* Property Input & Team Selector */}
        <View style={styles.propertyCard}>
          <TextInput
            style={styles.input}
            placeholder="Enter property name"
            placeholderTextColor="#808080"
            value={propertyName}
            onChangeText={setPropertyName}
          />

          <TouchableOpacity 
            style={styles.teamSelector}
            onPress={() => setShowTeams(!showTeams)}
          >
            <Text style={styles.teamSelectorText}>Team: {teamId}</Text>
          </TouchableOpacity>

          {showTeams && (
            <ScrollView horizontal style={styles.teamList} showsHorizontalScrollIndicator={false}>
              {TEAM_IDS.map(id => (
                <TouchableOpacity
                  key={id}
                  style={[styles.teamOption, teamId === id && styles.selectedTeam]}
                  onPress={() => {
                    setTeamId(id);
                    setShowTeams(false);
                  }}
                >
                  <Text style={[styles.teamOptionText, teamId === id && styles.selectedTeamText]}>{id}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={handlePropertyPurchase}
            style={styles.actionButton}
          >
            <Text style={styles.buttonText}>Buy Property</Text>
          </TouchableOpacity>
        </View>

        {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 40,
  },
  container: {
    width: "90%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 30,
    letterSpacing: 1,
  },
  balanceCard: {
    width: "100%",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    marginVertical: 15,
    padding: 24,
    borderWidth: 1,
    borderColor: "#444444",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40, // keeps both boxes nicely spaced in the center
  },
  balanceItem: {
    alignItems: "center",
  },
  balanceItemLabel: {
    fontSize: 12,
    color: "#AAAAAA",
    fontWeight: "400",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cashBalance: {
    fontSize: 20,
    fontWeight: "300",
    color: "#4CAF50",
  },
  netWorth: {
    fontSize: 20,
    fontWeight: "300",
    color: "#FF9800",
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "#444444",
    width: "80%",
    marginVertical: 10,
  },
  balanceNote: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
    fontWeight: "300",
  },
  propertyCard: {
    width: "100%",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#444444",
    alignItems: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#444444",
    color: "#FFFFFF",
    textAlign: "center",
  },
  teamSelector: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#444444",
    alignItems: "center",
  },
  teamSelectorText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "300",
  },
  teamList: {
    marginVertical: 5,
  },
  teamOption: {
    width: 40,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#333333",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555555",
    alignItems: "center",
  },
  selectedTeam: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  teamOptionText: {
    color: "#AAAAAA",
    fontSize: 14,
    fontWeight: "400",
  },
  selectedTeamText: {
    color: "#1A1A1A",
    fontWeight: "500",
  },
  actionButton: {
    width: "80%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  buttonText: {
    color: "#1A1A1A",
    fontWeight: "500",
    fontSize: 16,
  },
  status: {
    textAlign: "center",
    color: "#AAAAAA",
    fontWeight: "300",
    marginTop: 15,
    fontSize: 14,
  },
});
