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

import { transferCash, getTeamSummary } from "../../functions.js";

const TEAM_IDS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function CashTransfer() {
  const [amount, setAmount] = useState("");
  const [fromTeam, setFromTeam] = useState(1);
  const [toTeam, setToTeam] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFromTeams, setShowFromTeams] = useState(false);
  const [showToTeams, setShowToTeams] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [fromTeamCash, setFromTeamCash] = useState(0);
  const [fromTeamNetWorth, setFromTeamNetWorth] = useState(0);
  const [toTeamCash, setToTeamCash] = useState(0);
  const [toTeamNetWorth, setToTeamNetWorth] = useState(0);

  // Fetch team balances
  const fetchTeamBalances = useCallback(async () => {
    try {
      const [fromTeamData, toTeamData] = await Promise.all([
        getTeamSummary(fromTeam),
        getTeamSummary(toTeam)
      ]);
      
      setFromTeamCash(fromTeamData.data?.cash ?? 0);
      setFromTeamNetWorth(fromTeamData.data?.total_cash ?? 0);
      setToTeamCash(toTeamData.data?.cash ?? 0);
      setToTeamNetWorth(toTeamData.data?.total_cash ?? 0);
    } catch (err) {
      console.error("Error fetching team balances:", err);
    }
  }, [fromTeam, toTeam]);

  // Fetch balances when teams change
  useEffect(() => {
    fetchTeamBalances();
  }, [fetchTeamBalances]);

  const handleTransfer = useCallback(async () => {
    if (loading) return;
    
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount greater than 0.");
      return;
    }

    if (fromTeam === toTeam) {
      Alert.alert("Invalid Teams", "Source and destination teams cannot be the same.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await transferCash(transferAmount, fromTeam, toTeam);
      
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setStatusMessage(`Successfully transferred $${transferAmount} from Team ${fromTeam} to Team ${toTeam}`);
      setAmount("");
      // Refresh team balances after successful transfer
      await fetchTeamBalances();
    } catch (error) {
      console.error("🔥 Transfer Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [amount, fromTeam, toTeam, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cash Transfer</Text>

      {/* Team Balances Display */}
      <View style={styles.balanceRow}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Team {fromTeam}</Text>
          <View style={styles.balanceDetails}>
            <Text style={styles.cashLabel}>Cash: ${fromTeamCash.toFixed(2)}</Text>
            <Text style={styles.netWorthLabel}>Net Worth: ${fromTeamNetWorth.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Team {toTeam}</Text>
          <View style={styles.balanceDetails}>
            <Text style={styles.cashLabel}>Cash: ${toTeamCash.toFixed(2)}</Text>
            <Text style={styles.netWorthLabel}>Net Worth: ${toTeamNetWorth.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transferCard}>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#808080"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={styles.teamSelector}
          onPress={() => setShowFromTeams(!showFromTeams)}
        >
          <Text style={styles.teamSelectorText}>From Team: {fromTeam}</Text>
        </TouchableOpacity>

        {showFromTeams && (
          <ScrollView horizontal style={styles.teamList}>
            {TEAM_IDS.map(id => (
              <TouchableOpacity
                key={id}
                style={[styles.teamOption, fromTeam === id && styles.selectedTeam]}
                onPress={() => {
                  setFromTeam(id);
                  setShowFromTeams(false);
                }}
              >
                <Text style={styles.teamOptionText}>{id}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity 
          style={styles.teamSelector}
          onPress={() => setShowToTeams(!showToTeams)}
        >
          <Text style={styles.teamSelectorText}>To Team: {toTeam}</Text>
        </TouchableOpacity>

        {showToTeams && (
          <ScrollView horizontal style={styles.teamList}>
            {TEAM_IDS.map(id => (
              <TouchableOpacity
                key={id}
                style={[styles.teamOption, toTeam === id && styles.selectedTeam]}
                onPress={() => {
                  setToTeam(id);
                  setShowToTeams(false);
                }}
              >
                <Text style={styles.teamOptionText}>{id}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          onPress={handleTransfer}
          style={styles.transferButton}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Transfer</Text>
        </TouchableOpacity>
      </View>

      {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 30,
    letterSpacing: 1,
  },
  transferCard: {
    width: '100%',
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#444444',
  },
  input: {
    width: '100%',
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#444444',
    color: '#FFFFFF',
    fontWeight: '300',
  },
  teamSelector: {
    width: '100%',
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#444444',
  },
  teamSelectorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
  },
  teamList: {
    maxHeight: 60,
    marginVertical: 5,
  },
  teamOption: {
    width: 40,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#333333",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    alignItems: 'center',
  },
  selectedTeam: {
    backgroundColor: "#FFFFFF",
    borderColor: '#FFFFFF',
  },
  teamOptionText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '400',
  },
  transferButton: {
    width: '100%',
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FFFFFF',
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
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 15,
  },
  balanceCard: {
    width: '48%',
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#444444',
  },
  balanceLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "300",
    marginTop: 5,
    textAlign: 'center',
    color: "#FFFFFF",
  },
  balanceDetails: {
    marginTop: 8,
  },
  cashLabel: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "400",
    textAlign: 'center',
    marginBottom: 4,
  },
  netWorthLabel: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "400",
    textAlign: 'center',
  },
});
