// E:\New folder\monopoly-app-main\mobile\monopoly-bank\app\(tabs)\AvailableProperties.js

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from "react-native";
import { getAvailableProperties } from "../../functions.js";

export default function AvailableProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAvailableProperties();
      if (error) {
        console.error("Error fetching properties:", error);
        return;
      }

      // Sort alphabetically
      const sorted = (data || []).sort((a, b) =>
        a.property_name.localeCompare(b.property_name)
      );
      setProperties(sorted);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#808080" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Properties</Text>

      <ScrollView style={styles.propertiesList}>
        {properties.length === 0 ? (
          <Text style={styles.noProperties}>No unowned properties found</Text>
        ) : (
          properties.map((property) => (
            <View key={property.property_name} style={styles.propertyCard}>
              <Text style={styles.propertyName}>{property.property_name}</Text>
              <Text style={styles.propertyPrice}>${property.property_value}</Text>
            </View>
          ))
        )}
      </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  title: {
    fontSize: 28,
    fontWeight: "300",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 30,
    letterSpacing: 1,
  },
  propertiesList: {
    flex: 1,
  },
  propertyCard: {
    width: "100%",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#444444",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  propertyPrice: {
    color: "#AAAAAA",
    fontSize: 16,
    fontWeight: "300",
  },
  noProperties: {
    color: "#AAAAAA",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "300",
  },
});
