import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  FlatList 
} from "react-native";

import { getTeamSummary, addCash, removeCash } from "../../functions.js"; // 👈 Import your Supabase functions

const TEAM_IDS = Array.from({ length: 8 }, (_, i) => i + 1);
const INITIAL_TEAM_BALANCE = 0;

export default function App() {
  const [teamId, setTeamId] = useState(1);
  const [balance, setBalance] = useState(INITIAL_TEAM_BALANCE);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // ✅ Handle amount input
  const handleAmountChange = (text) => {
    if (text === "") {
      setTransactionAmount("");
      return;
    }
    if (/^\d*\.?\d*$/.test(text)) {
      if (text.length > 1 && text.startsWith("0") && !text.startsWith("0.")) {
        text = text.replace(/^0+/, "");
      }
      setTransactionAmount(text);
    }
  };

  // ✅ Fetch team balance from Supabase
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getTeamSummary(teamId);
      if (error || !data) {
        console.error("❌ Error fetching balance:", error);
        setBalance(INITIAL_TEAM_BALANCE);
      } else {
        const teamBalance = data.total_cash ?? 0;
        setBalance(teamBalance);
      }
    } catch (err) {
      console.error("🔥 Unexpected error fetching balance:", err);
      setBalance(INITIAL_TEAM_BALANCE);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // ✅ Fetch whenever team changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // ✅ Handle add/deduct
  const handleTransaction = useCallback(
    async (type) => {
      if (loading) return;

      const amount = parseFloat(transactionAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert("Invalid Input", "Please enter a valid amount greater than 0.");
        return;
      }

      try {
        setLoading(true);
        if (type === "add") {
          await addCash(amount, teamId);
          setStatusMessage(`Added $${amount.toFixed(2)} successfully.`);
        } else {
          await removeCash(amount, teamId);
          setStatusMessage(`Deducted $${amount.toFixed(2)} successfully.`);
        }
        setTransactionAmount("");
        await fetchBalance(); // Refresh balance after transaction
      } catch (error) {
        console.error("🔥 Transaction Error:", error);
        Alert.alert("Transaction Error", error.message);
      } finally {
        setLoading(false);
      }
    },
    [transactionAmount, teamId, loading, fetchBalance]
  );

  // ✅ Loading screen
  if (loading && balance === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: "#4f46e5" }}>Connecting to Supabase...</Text>
      </View>
    );
  }

  // ✅ UI (with updated styles and elements)
  return (
    <View style={styles.container}>
      <View style={styles.headerGradient}>
        <Text style={styles.title}>🎲 Monopoly Bank</Text>
        <Text style={styles.subtitle}>Digital Banking for Teams 1–8</Text>
      </View>

      {/* Team Selector */}
      <FlatList
        horizontal
        data={TEAM_IDS}
        keyExtractor={(id) => id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setTeamId(item)}
            style={[styles.teamButton, teamId === item && styles.teamButtonActive]}
          >
            <Text style={[styles.teamButtonText, teamId === item && styles.teamButtonTextActive]}>
              Team {item}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ marginVertical: 15 }}
        showsHorizontalScrollIndicator={false}
      />

      {/* Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Team {teamId} Balance</Text>
        </View>
        <Text style={[styles.balanceValue, balance >= 0 ? styles.positive : styles.negative]}>
          ${balance.toFixed(2)}
        </Text>
        <View style={styles.balanceDivider} />
      </View>

      {/* Amount Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter amount:"
        value={transactionAmount}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
      />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => handleTransaction("add")}
          style={[styles.actionButton, { backgroundColor: "#808080" }]} // Changed to grey
        >
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTransaction("deduct")}
          style={[styles.actionButton, { backgroundColor: "#000000" }]} // Changed to black
        >
          <Text style={styles.buttonText}>Deduct</Text>
        </TouchableOpacity>
      </View>

      {/* Status Message */}
      {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}

      <Text style={styles.footer}>Synced with Supabase Database</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#004d40", // Dark green background
    paddingTop: 50,
  },
  headerGradient: {
    backgroundColor: '#004d40',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#0047AB',
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#ffffff",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginTop: 5,
  },
  teamButton: {
    padding: 12,
    marginHorizontal: 6,
    backgroundColor: "#808080", // Changed to dark green
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0047AB',
  },
  teamButtonActive: {
    backgroundColor: "#0047AB",
    transform: [{ scale: 1.05 }],
    shadowColor: "#0047AB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  teamButtonText: {
    fontWeight: "600",
    color: "#0047AB", // Keep existing blue text color
  },
  teamButtonTextActive: {
    color: "#ffffff",
  },
  balanceCard: {
    backgroundColor: "#000000ff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#808080', // Changed to grey
    shadowColor: "#808080",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "800",
    marginTop: 10,
    textAlign: 'center',
  },
  balanceDivider: {
    height: 2,
    backgroundColor: '#0047AB',
    marginVertical: 15,
    borderRadius: 1,
  },
  input: {
    backgroundColor: "#004d40",
    padding: 16,
    borderRadius: 15,
    fontSize: 18,
    marginHorizontal: 20,
    marginVertical: 15,
    borderWidth: 2,
    borderColor: '#0047AB',
    color: '#ffffff',
    shadowColor: "#0047AB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginVertical: 15,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#808080",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#808080', // Changed to grey
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  positive: { 
    color: "#808080", // Changed to grey
    textShadowColor: '#808080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  negative: { 
    color: "#ffffff",
    textShadowColor: '#ff0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  status: {
    textAlign: "center",
    color: "#808080", // Changed to grey
    fontWeight: "600",
    marginTop: 15,
    fontSize: 16,
  },
  footer: {
    textAlign: "center",
    color: "#ffffff",
    marginTop: 30,
    marginBottom: 20,
    fontSize: 14,
  },

});
