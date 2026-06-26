import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Map, Bell, Camera, HandHeart, Truck } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#006b49', // Brand green matching map tab
        tabBarInactiveTintColor: '#8e8e93',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: '#f8fafc', // Soft blue-grey background
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingTop: 8,
        },
        headerShown: false, // Managed custom headers on screens
      }}>
      
      {/* 1. Map Tab (Active Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconWrapper, focused && styles.activeMapWrapper]}>
              <Map size={20} color={focused ? '#ffffff' : '#8e8e93'} />
            </View>
          ),
        }}
      />

      {/* 2. Alerts Tab */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconWrapper}>
              <Bell size={20} color={color} />
            </View>
          ),
        }}
      />

      {/* 3. REPORT Tab (Center Circular Highlight) */}
      <Tabs.Screen
        name="report"
        options={{
          title: 'REPORT',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#a84a04', // Custom copper orange label
            marginBottom: 6,
          },
          tabBarIcon: () => (
            <View style={styles.centerReportWrapper}>
              <Camera size={22} color="#ffffff" />
            </View>
          ),
        }}
      />

      {/* 4. Impact Tab */}
      <Tabs.Screen
        name="impact"
        options={{
          title: 'Impact',
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconWrapper}>
              <HandHeart size={20} color={color} />
            </View>
          ),
        }}
      />

      {/* 5. Fleet Tab */}
      <Tabs.Screen
        name="fleet"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ color }) => (
            <View style={styles.tabIconWrapper}>
              <Truck size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    width: 38,
  },
  activeMapWrapper: {
    backgroundColor: '#10b981', // Solid emerald green background matching screenshot
    borderRadius: 10,
  },
  centerReportWrapper: {
    backgroundColor: '#a84a04', // Copper orange matching report circle
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a84a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    // Float visual correction
    marginTop: -16,
  },
});
