import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Rescue in 10 Seconds.',
    description: 'Our intelligent AI dispatch system connects you to the nearest heroes instantly. Every second saves a life.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=500', // Replaces custom 3D animal group illustration
  },
  {
    id: 2,
    title: 'Pinpoint Live Locations.',
    description: 'Use our interactive GPS mapping grid to report precise coordinates. Field responders navigate directly to the scene.',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=500', // Map route visual placeholder
  },
  {
    id: 3,
    title: 'Track Rescue Impact.',
    description: 'Gain XP points, advance Coordinator Levels, and monitor ambulance fleets in real time as cases are resolved.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=500', // Gold/XP reward style visual
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      console.log('💾 Saving onboarding complete state in device storage');
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to save onboarding state:', err);
      // Fallback redirect if storage fails
      router.replace('/(tabs)');
    }
  };

  const activeSlide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <Text style={styles.logoText}>StrayAid AEOS</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      {/* Center Image Area */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: activeSlide.image }}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      {/* Bottom Sheet Card */}
      <View style={styles.bottomCard}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{activeSlide.title}</Text>
          <Text style={styles.description}>{activeSlide.description}</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next →'}
          </Text>
        </TouchableOpacity>

        {/* Indicator dots */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSlide(index)}
              style={[
                styles.dot,
                currentSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Soft blue-grey background matching screenshot
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#006b49', // Brand green matching screenshot
    letterSpacing: 0.2,
  },
  skipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8e8e93', // Muted grey font
    letterSpacing: 0.5,
  },
  imageContainer: {
    flex: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustration: {
    width: '100%',
    height: '90%',
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#10b981', // Brand green solid button matching screenshot
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#006b49', // Active dot brand green
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#e2e8f0',
  },
});
