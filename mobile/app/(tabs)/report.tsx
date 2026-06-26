import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { IncidentServiceClient } from '../../src/services/api';
import type { AnimalType, Severity } from '../../src/types/incident';

export default function ReportScreen() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [animalType, setAnimalType] = useState<AnimalType>('dog');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Profile details
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  // UI status
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request GPS coordinates
  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'GPS access was denied. Simulating location coordinates within target grid area instead.',
          [{ text: 'Simulate', onPress: simulateLocation }]
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // If the location is outside NYC area (for testing), let's optionally shift it or keep it.
      // We will shift it to NYC bounding box if it's outside NYC, or just use it.
      // Let's use the actual coordinate, but if it is extremely far, we can prompt.
      // To ensure it shows up on the operator's custom vector map, let's keep coordinates in our New York grid box:
      // lat: 40.70 to 40.79, lng: -74.02 to -73.96
      const inGridLat = loc.coords.latitude;
      const inGridLng = loc.coords.longitude;

      const inNycGrid = inGridLat >= 40.70 && inGridLat <= 40.79 && inGridLng >= -74.02 && inGridLng <= -73.96;
      if (!inNycGrid) {
        // Shift mock coordinate so it fits on their tracking map
        simulateLocation();
        Alert.alert(
          'GPS Coordinates Pinned',
          'Your location was mapped to the active tactical grid space.',
          [{ text: 'OK' }]
        );
      } else {
        setLatitude(Number(inGridLat.toFixed(6)));
        setLongitude(Number(inGridLng.toFixed(6)));
        setLocationName(`Lat: ${inGridLat.toFixed(4)}, Lng: ${inGridLng.toFixed(4)}`);
      }

    } catch (err: any) {
      console.warn(err);
      simulateLocation();
    } finally {
      setDetectingLocation(false);
    }
  };

  const simulateLocation = () => {
    // Generate NYC grid coordinates
    const minLat = 40.70;
    const maxLat = 40.79;
    const minLng = -74.02;
    const maxLng = -73.96;
    
    const simLat = Number((minLat + Math.random() * (maxLat - minLat)).toFixed(6));
    const simLng = Number((minLng + Math.random() * (maxLng - minLng)).toFixed(6));
    
    setLatitude(simLat);
    setLongitude(simLng);
    
    const mockStreets = ['Broadway', '7th Ave', 'Madison Ave', 'Park Ave', 'Wall St'];
    const mockCross = ['E 14th St', 'W 42nd St', 'E 81st St', 'Water St'];
    setLocationName(`${mockStreets[Math.floor(Math.random() * mockStreets.length)]} & ${mockCross[Math.floor(Math.random() * mockCross.length)]}`);
  };

  // Launch camera to snap photo
  const snapPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permissions are required to snap incident photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Select photo from library
  const choosePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Library access permissions are required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || title.length < 3) {
      Alert.alert('Validation Error', 'Incident title must be at least 3 characters.');
      return;
    }
    if (!description.trim() || description.length < 5) {
      Alert.alert('Validation Error', 'Description must be at least 5 characters.');
      return;
    }
    if (!locationName.trim()) {
      Alert.alert('Validation Error', 'Please detail the location address/landmark.');
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert('Validation Error', 'Please detect or simulate GPS coordinates.');
      return;
    }

    setIsSubmitting(true);

    // Mock preset URLs corresponding to animal types for demo rendering in the database
    let simulatedUrl = null;
    if (imageUri) {
      // In production, we'd upload to Supabase storage. Here, we can map to beautiful Unsplash mocks
      if (animalType === 'dog') {
        simulatedUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
      } else if (animalType === 'cat') {
        simulatedUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600';
      } else {
        simulatedUrl = 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600';
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      animalType,
      severity,
      locationName: locationName.trim(),
      latitude,
      longitude,
      reporterName: reporterName.trim() || null,
      reporterPhone: reporterPhone.trim() || null,
      imageUrl: simulatedUrl,
    };

    try {
      const response = await IncidentServiceClient.createIncident(payload);
      Alert.alert(
        'Incident Dispatched',
        `StrayAid AEOS case published! Case ID: ${response.id}`,
        [{ text: 'OK', onPress: () => {
          // Reset form fields
          setTitle('');
          setDescription('');
          setLocationName('');
          setLatitude(null);
          setLongitude(null);
          setImageUri(null);
          setReporterName('');
          setReporterPhone('');
          
          // Switch to Feed screen
          router.replace('/');
        }}]
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Could not communicate with backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Emergency Headline</Text>
          <TextInput
            placeholder="e.g. Injured Dog with limp paw"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Animal selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Animal Class</Text>
          <View style={styles.row}>
            {(['dog', 'cat', 'bird', 'other'] as AnimalType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setAnimalType(type)}
                style={[
                  styles.selectorButton,
                  animalType === type && styles.activeSelectorButton
                ]}
              >
                <Text style={styles.selectorEmoji}>
                  {type === 'dog' ? '🐶' : type === 'cat' ? '🐱' : type === 'bird' ? '🐦' : '🐾'}
                </Text>
                <Text style={[styles.selectorText, animalType === type && styles.activeSelectorText]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity levels */}
        <View style={styles.section}>
          <Text style={styles.label}>Severity Level</Text>
          <View style={styles.row}>
            {(['low', 'medium', 'high', 'critical'] as Severity[]).map((level) => {
              const isActive = severity === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setSeverity(level)}
                  style={[
                    styles.severityButton,
                    isActive && { backgroundColor: level === 'critical' ? '#ef4444' : level === 'high' ? '#f97316' : level === 'medium' ? '#eab308' : '#3b82f6' }
                  ]}
                >
                  <Text style={[styles.severityText, isActive && styles.activeSeverityText]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description of Injury / Details</Text>
          <TextInput
            placeholder="Provide status of injury, animal color, breed, and general threat risk..."
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* GPS location detectors */}
        <View style={styles.section}>
          <Text style={styles.label}>Emergency Location (GPS)</Text>
          <View style={styles.detectContainer}>
            <View style={styles.coordDisplay}>
              {latitude && longitude ? (
                <Text style={styles.coordText}>
                  📍 Pinned: {latitude}, {longitude}
                </Text>
              ) : (
                <Text style={styles.noCoordText}>GPS coordinates not pinned yet</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={detectLocation}
              disabled={detectingLocation}
              style={styles.detectButton}
            >
              {detectingLocation ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.detectButtonText}>Detect GPS</Text>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Address description e.g. Central Park & 81st entrance"
            style={[styles.input, { marginTop: 10 }]}
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        {/* Picture selectors */}
        <View style={styles.section}>
          <Text style={styles.label}>Attach Field Photograph</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                <Text style={styles.removeImageText}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoButton} onPress={snapPhoto}>
                <Text style={styles.photoButtonText}>📸 Snap Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={choosePhoto}>
                <Text style={styles.photoButtonText}>🖼️ Choose Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Reporter info */}
        <View style={styles.section}>
          <Text style={styles.label}>Reporter Details (Optional)</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Name"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={reporterName}
              onChangeText={setReporterName}
            />
            <TextInput
              placeholder="Phone"
              keyboardType="phone-pad"
              style={[styles.input, { flex: 1 }]}
              value={reporterPhone}
              onChangeText={setReporterPhone}
            />
          </View>
        </View>

        {/* Action submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledSubmit]}
          disabled={isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>Submit Emergency Report</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#444444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  textarea: {
    height: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  activeSelectorButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  selectorEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  selectorText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666666',
    textTransform: 'capitalize',
  },
  activeSelectorText: {
    color: '#ffffff',
  },
  severityButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
    textTransform: 'uppercase',
  },
  activeSeverityText: {
    color: '#ffffff',
  },
  detectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coordDisplay: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  coordText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  noCoordText: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
  },
  detectButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  detectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#a3a3a3',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#525252',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  previewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removeImageButton: {
    paddingVertical: 10,
  },
  removeImageText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#16a34a', // Primary Brand green
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
    marginBottom: 40,
  },
  disabledSubmit: {
    backgroundColor: '#a3a3a3',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
