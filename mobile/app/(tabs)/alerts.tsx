import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AlertsScreen() {
  const router = useRouter();

  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      Alert.alert(
        'Onboarding Reset',
        'Storage key has been cleared. The onboarding welcome flow will display on next app load.',
        [{ text: 'OK', onPress: () => router.replace('/onboarding') }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to clear onboarding state.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>Emergency Notifications</Text>
        <Text style={styles.subtitle}>All critical push notifications and regional alarms are listed here.</Text>

        {/* Developer Reset tool */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
          <Text style={styles.resetButtonText}>Reset Onboarding Flow</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

