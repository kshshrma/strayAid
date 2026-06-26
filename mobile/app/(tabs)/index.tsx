import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../../src/context/SocketContext';
import { IncidentServiceClient } from '../../src/services/api';
import type { Incident } from '../../src/types/incident';
import { BarChart2, User, HandHeart, Truck, Plus, AlertCircle } from 'lucide-react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CAROUSEL_CARD_WIDTH = width * 0.75;

// Mock list of Immediate Requests if backend is empty (to match screenshot visual exactly)
const presetRequests = [
  {
    id: 'inc-preset-1',
    title: 'Injured Kitten',
    description: 'Found a stray kitten with a cut on its leg near the market. Needs vet transport.',
    distance: '0.4 miles away',
    severity: 'URGENT',
    reporterName: 'Sarah M.',
    timeAgo: '5 mins ago',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150', // Cute cat avatar
  },
  {
    id: 'inc-preset-2',
    title: 'Trapped Dog',
    description: 'Medium dog trapped in a fence behind the storage warehouse. Scared and barking.',
    distance: '1.2 miles away',
    severity: 'HIGH',
    reporterName: 'David K.',
    timeAgo: '12 mins ago',
    avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150', // Cute dog avatar
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { socket } = useSocket();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const data = await IncidentServiceClient.getAllIncidents();
      // Filter out resolved cases for the immediate request queue
      const active = data.filter((i) => i.status !== 'resolved');
      setIncidents(active);
    } catch (err) {
      console.error('Failed to sync feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Socket updates
  useEffect(() => {
    if (!socket) return;

    const handleCreated = () => fetchIncidents();
    const handleUpdated = () => fetchIncidents();

    socket.on('incident:created', handleCreated);
    socket.on('incident:updated', handleUpdated);

    return () => {
      socket.off('incident:created', handleCreated);
      socket.off('incident:updated', handleUpdated);
    };
  }, [socket]);

  // Combine dynamic cases from backend with mockup presets so there's always rich content
  const displayRequests = [
    ...incidents.map((inc) => ({
      id: inc.id,
      title: inc.title,
      description: inc.description,
      distance: '0.8 miles away', // Mock distance
      severity: inc.severity === 'critical' ? 'URGENT' : inc.severity.toUpperCase(),
      reporterName: inc.reporterName || 'Anonymous Rescuer',
      timeAgo: 'Just now',
      avatar: inc.animalType === 'dog' 
        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150'
        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150',
    })),
    ...presetRequests,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Profile Panel */}
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' }}
              style={styles.avatar}
            />
            <View style={styles.profileTexts}>
              <Text style={styles.brandTitle}>StrayAid AEOS</Text>
              <Text style={styles.brandSubtitle}>Lvl 4 Coordinator</Text>
            </View>
          </View>
          
          <View style={styles.profileRight}>
            <View style={styles.xpBox}>
              <Text style={styles.xpLabel}>IMPACT SCORE</Text>
              <Text style={styles.xpValue}>2,480 XP</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <BarChart2 size={20} color="#1a1a1a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <User size={20} color="#1a1a1a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Hero Stats Card */}
        <View style={styles.heroCard}>
          <Text style={styles.greeting}>Good morning, Rescuer.</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.livesSavedContainer}>
              <Text style={styles.livesNumber}>12</Text>
              <Text style={styles.livesLabel}>Lives Saved</Text>
            </View>
            
            <View style={styles.goldBadgeContainer}>
              <View style={styles.goldPill}>
                <Text style={styles.goldText}>GOLD</Text>
              </View>
              <View style={styles.handHeartBg}>
                <HandHeart size={34} color="#006b49" />
              </View>
            </View>
          </View>
          <Text style={styles.heroFootnote}>
            You are in the top 5% of responders in your region this month.
          </Text>
        </View>

        {/* 3. Map Section ("Active Rescues Nearby") */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Rescues Nearby</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>3 LIVE</Text>
          </View>
        </View>

        {/* Custom Mock Map Card */}
        <View style={styles.mapCard}>
          {/* SVG Map Illustration detailing streets and river */}
          <View style={styles.svgMapPlaceholder}>
            <Svg height="160" width="100%" viewBox="0 0 400 160">
              {/* Rivers */}
              <Path d="M0,80 Q100,50 200,90 T400,100" fill="none" stroke="#e2e8f0" strokeWidth="25" />
              <Path d="M0,80 Q100,50 200,90 T400,100" fill="none" stroke="#f1f5f9" strokeWidth="20" />
              {/* Park */}
              <Rect x="280" y="20" width="60" height="50" rx="6" fill="#f0fdf4" stroke="#dcfce7" strokeWidth="1" />
              
              {/* Streets Grid */}
              <Path d="M0,40 L400,40 M0,120 L400,120 M120,0 L120,160 M260,0 L260,160" stroke="#f1f5f9" strokeWidth="2" />
              <Path d="M40,0 L180,160 M340,0 L220,160" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Pulsing ambulance dots */}
              <Circle cx="150" cy="60" r="14" fill="#a84a04" fillOpacity="0.1" />
              <Circle cx="150" cy="60" r="7" fill="#a84a04" />
              
              <Circle cx="280" cy="110" r="10" fill="#006b49" fillOpacity="0.1" />
              <Circle cx="280" cy="110" r="5" fill="#006b49" />
            </Svg>

            {/* Float location labels */}
            <Text style={[styles.mapLabel, { top: 70, left: 170 }]}>London Grid</Text>
          </View>

          {/* Map Overlay bottom banner */}
          <View style={styles.mapBanner}>
            <View style={styles.mapBannerLeft}>
              <Truck size={18} color="#a84a04" />
              <Text style={styles.mapBannerText}>Ambulance #402 En-Route</Text>
            </View>
            <Text style={styles.mapBannerTime}>2.4 mins</Text>
          </View>
        </View>

        {/* 4. Immediate Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Immediate Requests</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CAROUSEL_CARD_WIDTH + 16}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContainer}
        >
          {displayRequests.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.reqHeader}>
                <View style={styles.reqTitleGroup}>
                  <Text style={styles.reqTitle}>{item.title}</Text>
                  <Text style={styles.reqDistance}>{item.distance}</Text>
                </View>
                
                <View style={[
                  styles.reqBadge,
                  { backgroundColor: item.severity === 'URGENT' ? '#ffedd5' : '#e0f2fe' }
                ]}>
                  <Text style={[
                    styles.reqBadgeText,
                    { color: item.severity === 'URGENT' ? '#a84a04' : '#0369a1' }
                  ]}>
                    {item.severity}
                  </Text>
                </View>
              </View>

              {/* Reporter details */}
              <View style={styles.reporterRow}>
                <Image source={{ uri: item.avatar }} style={styles.reporterAvatar} />
                <View>
                  <Text style={styles.reportedByLabel}>Reported by {item.reporterName}</Text>
                  <Text style={styles.reportedTime}>{item.timeAgo}</Text>
                </View>
              </View>

              {/* Green respond pill button */}
              <TouchableOpacity
                onPress={() => router.push(`/incident/${item.id}`)}
                style={styles.respondButton}
                activeOpacity={0.8}
              >
                <Text style={styles.respondButtonText}>RESPOND</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

      </ScrollView>

      {/* 5. Floating Action Button (FAB) */}
      <TouchableOpacity
        onPress={() => router.push('/report')}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Plus size={20} color="#ffffff" style={styles.fabIcon} />
        <Text style={styles.fabText}>Report Animal</Text>
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Soft blue-grey page background
  },
  scrollContainer: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Extra padding to clear FAB and tabs
  },
  keyboardContainer: {
    flex: 1,
  },
  // Header Panel Styles
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  profileTexts: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006b49', // Dark emerald brand color
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  profileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBox: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  xpLabel: {
    fontSize: 8,
    color: '#006b49',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  xpValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  // Hero Stats Card
  heroCard: {
    backgroundColor: '#f0fdf9', // Soft teal-green backdrop
    borderWidth: 1,
    borderColor: '#ccfbf1',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  livesSavedContainer: {
    justifyContent: 'center',
  },
  livesNumber: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#006b49',
    lineHeight: 40,
  },
  livesLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  goldBadgeContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  goldPill: {
    backgroundColor: '#a84a04', // Copper gold pill color
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    position: 'absolute',
    top: -6,
    zIndex: 10,
  },
  goldText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  handHeartBg: {
    backgroundColor: '#ccfbf1', // soft badge green circle background
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  heroFootnote: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  // Map Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  svgMapPlaceholder: {
    height: 160,
    backgroundColor: '#fafafa',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    fontFamily: 'SpaceMono',
  },
  mapBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  mapBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  mapBannerTime: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  // Immediate Requests Carousel
  viewAllText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    width: CAROUSEL_CARD_WIDTH,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reqTitleGroup: {
    flex: 1,
    marginRight: 6,
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  reqDistance: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  reqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  reqBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 12,
  },
  reporterAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  reportedByLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },
  reportedTime: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  respondButton: {
    backgroundColor: '#006b49', // Emerald respond button matching screenshot
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  respondButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Floating Action Button (FAB)
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 80, // Floating above tabs
    right: 16,
    backgroundColor: '#a84a04', // Custom copper/orange FAB matching Report circle
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#a84a04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  fabIcon: {
    marginRight: 6,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
