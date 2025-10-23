import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { getTeamSummary, addCash, removeCash } from "../../functions.js"; // ✅ Your Supabase functions

const TEAM_IDS = Array.from({ length: 8 }, (_, i) => i + 1);
const INITIAL_TEAM_BALANCE = 0;

export default function App() {
  const [teamId, setTeamId] = useState(1);
  const [cashBalance, setCashBalance] = useState(INITIAL_TEAM_BALANCE);
  const [netWorth, setNetWorth] = useState(INITIAL_TEAM_BALANCE);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

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

  // ✅ Fetch balance from Supabase
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getTeamSummary(teamId);
      if (error || !data) {
        console.error("❌ Error fetching balance:", error);
        setCashBalance(INITIAL_TEAM_BALANCE);
        setNetWorth(INITIAL_TEAM_BALANCE);
      } else {
        setCashBalance(data.cash ?? 0);
        setNetWorth(data.total_cash ?? 0);
      }
    } catch (err) {
      console.error("🔥 Unexpected error fetching balance:", err);
      setCashBalance(INITIAL_TEAM_BALANCE);
      setNetWorth(INITIAL_TEAM_BALANCE);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // ✅ Add / Deduct logic
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
        await fetchBalance();
      } catch (error) {
        console.error("🔥 Transaction Error:", error);
        Alert.alert("Transaction Error", error.message);
      } finally {
        setLoading(false);
      }
    },
    [transactionAmount, teamId, loading, fetchBalance]
  );

  if (loading && cashBalance === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: "#4f46e5" }}>Connecting to Supabase...</Text>
      </View>
    );
  }

  // ✅ Main UI
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: "center" }}>
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
              <Text
                style={[
                  styles.teamButtonText,
                  teamId === item && styles.teamButtonTextActive,
                ]}
              >
                Team {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ marginVertical: 10, paddingHorizontal: 10 }}
          showsHorizontalScrollIndicator={false}
        />

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Team {teamId} Financial Status</Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Cash Balance</Text>
              <Text
                style={[
                  styles.cashBalance,
                  cashBalance >= 0 ? styles.positive : styles.negative,
                ]}
              >
                ${cashBalance.toFixed(2)}
              </Text>
            </View>

            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Net Worth</Text>
              <Text
                style={[
                  styles.netWorth,
                  netWorth >= 0 ? styles.positive : styles.negative,
                ]}
              >
                ${netWorth.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.balanceDivider} />
          <Text style={styles.balanceNote}>Net Worth = Cash + Property Values</Text>
        </View>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter amount:"
          placeholderTextColor="#888"
          value={transactionAmount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
        />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => handleTransaction("add")}
            style={[styles.actionButton, { backgroundColor: "#808080" }]}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTransaction("deduct")}
            style={[styles.actionButton, { backgroundColor: "#000000" }]}
          >
            <Text style={styles.buttonText}>Deduct</Text>
          </TouchableOpacity>
        </View>

        {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}

        <Text style={styles.footer}>Synced with Supabase Database</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Responsive Styles
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  headerGradient: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 0.05 * width,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "300",
    textAlign: "center",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: "center",
    color: "#AAAAAA",
    fontSize: width * 0.035,
    marginTop: 8,
    fontWeight: "300",
  },
  teamButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    backgroundColor: "#333333",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555555",
    alignItems: "center",
    minWidth: width * 0.18,
  },
  teamButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  teamButtonText: {
    fontWeight: "400",
    color: "#AAAAAA",
    fontSize: width * 0.035,
  },
  teamButtonTextActive: {
    color: "#1A1A1A",
    fontWeight: "500",
  },
  balanceCard: {
    width: "90%",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    marginVertical: 15,
    padding: width * 0.06,
    borderWidth: 1,
    borderColor: "#444444",
  },
  balanceLabel: {
    fontSize: width * 0.045,
    color: "#FFFFFF",
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceItem: {
    width: "48%",
    alignItems: "center",
  },
  balanceItemLabel: {
    fontSize: width * 0.03,
    color: "#AAAAAA",
    fontWeight: "400",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cashBalance: {
    fontSize: width * 0.045,
    fontWeight: "400",
    color: "#4CAF50",
  },
  netWorth: {
    fontSize: width * 0.045,
    fontWeight: "400",
    color: "#FF9800",
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "#444444",
    marginVertical: 15,
  },
  balanceNote: {
    fontSize: width * 0.028,
    color: "#777777",
    textAlign: "center",
    fontStyle: "italic",
  },
  input: {
    width: "90%",
    backgroundColor: "#1A1A1A",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: width * 0.04,
    borderWidth: 1,
    borderColor: "#444444",
    color: "#FFFFFF",
    fontWeight: "300",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "90%",
    marginVertical: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: width * 0.04,
  },
  positive: {
    color: "#FFFFFF",
  },
  negative: {
    color: "#FF6B6B",
  },
  status: {
    textAlign: "center",
    color: "#AAAAAA",
    fontWeight: "300",
    marginTop: 10,
    fontSize: width * 0.035,
  },
  footer: {
    textAlign: "center",
    color: "#AAAAAA",
    marginBottom: 30,
    fontSize: width * 0.03,
    fontWeight: "300",
  },
});
