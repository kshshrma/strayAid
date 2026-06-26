import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '../../src/context/SocketContext';
import { IncidentServiceClient } from '../../src/services/api';
import type { Incident, Comment, IncidentStatus, Severity } from '../../src/types/incident';

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { socket } = useSocket();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentStatusUpdate, setCommentStatusUpdate] = useState<IncidentStatus | ''>('');

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const details = await IncidentServiceClient.getIncidentById(id);
      setIncident(details);
      
      const commentTimeline = await IncidentServiceClient.getComments(id);
      setComments(commentTimeline);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Load Failure', err.message || 'Could not fetch case details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Socket updates
  useEffect(() => {
    if (!socket || !id) return;

    const handleIncidentUpdated = (updatedIncident: Incident) => {
      if (updatedIncident.id === id) {
        setIncident(updatedIncident);
      }
    };

    const handleCommentAdded = (payload: { incidentId: string; comment: Comment }) => {
      if (payload.incidentId === id) {
        setComments((prev) => {
          if (prev.some((c) => c.id === payload.comment.id)) return prev;
          return [...prev, payload.comment];
        });
      }
    };

    socket.on('incident:updated', handleIncidentUpdated);
    socket.on('comment:added', handleCommentAdded);

    return () => {
      socket.off('incident:updated', handleIncidentUpdated);
      socket.off('comment:added', handleCommentAdded);
    };
  }, [socket, id]);

  const updateStatus = async (newStatus: IncidentStatus) => {
    if (!incident || !id) return;
    try {
      const updated = await IncidentServiceClient.updateIncident(id, {
        status: newStatus,
        // Auto assign to mobile volunteer when dispatched
        ...(newStatus === 'dispatched' && !incident.responderId ? { responderId: 'vol-mobile' } : {})
      });
      setIncident(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update workflow.');
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !id) return;
    try {
      const payload = {
        authorName: 'Field Responder',
        text: commentText.trim(),
        statusUpdate: commentStatusUpdate || null,
      };

      const newComment = await IncidentServiceClient.addComment(id, payload);
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      setCommentStatusUpdate('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit log entry.');
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'resolved': return '#22c55e';
      case 'resolving': return '#a855f7';
      case 'active': return '#ef4444';
      case 'dispatched': return '#f59e0b';
      case 'reported': default: return '#737373';
    }
  };

  if (loading || !incident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Syncing operations deck...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        style={styles.keyboardContainer}
      >
        <ScrollView style={styles.scrollFrame} contentContainerStyle={styles.scrollContent}>
          
          {/* Card: core details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: getSeverityColor(incident.severity) + '15', borderColor: getSeverityColor(incident.severity) }]}>
                  <Text style={[styles.badgeText, { color: getSeverityColor(incident.severity) }]}>
                    {incident.severity.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(incident.status) + '15', borderColor: getStatusColor(incident.status) }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(incident.status) }]}>
                    {incident.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.caseId}>CASE: {incident.id}</Text>
            </View>

            <Text style={styles.title}>{incident.title}</Text>
            <Text style={styles.description}>{incident.description}</Text>

            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>📍 {incident.locationName}</Text>
              <Text style={styles.coordinateText}>
                Lat: {incident.latitude.toFixed(5)}, Lng: {incident.longitude.toFixed(5)}
              </Text>
            </View>

            {incident.responderId ? (
              <View style={styles.responderBox}>
                <Text style={styles.responderText}>
                  👤 Assigned: <Text style={styles.boldText}>{incident.responderId}</Text>
                </Text>
              </View>
            ) : (
              <View style={styles.unassignedBox}>
                <Text style={styles.unassignedText}>Unassigned Case</Text>
              </View>
            )}
          </View>

          {/* Workflow Command Center */}
          <View style={styles.controlCard}>
            <Text style={styles.cardLabel}>Field Command Actions</Text>
            <View style={styles.actionRow}>
              {incident.status === 'reported' && (
                <TouchableOpacity style={[styles.actionButton, styles.dispatchBtn]} onPress={() => updateStatus('dispatched')}>
                  <Text style={styles.actionButtonText}>Accept Dispatch</Text>
                </TouchableOpacity>
              )}
              {incident.status === 'dispatched' && (
                <TouchableOpacity style={[styles.actionButton, styles.activeBtn]} onPress={() => updateStatus('active')}>
                  <Text style={styles.actionButtonText}>Mark On Scene</Text>
                </TouchableOpacity>
              )}
              {incident.status === 'active' && (
                <TouchableOpacity style={[styles.actionButton, styles.resolvingBtn]} onPress={() => updateStatus('resolving')}>
                  <Text style={styles.actionButtonText}>Mark Treatment</Text>
                </TouchableOpacity>
              )}
              {(incident.status === 'active' || incident.status === 'resolving') && (
                <TouchableOpacity style={[styles.actionButton, styles.resolvedBtn]} onPress={() => updateStatus('resolved')}>
                  <Text style={styles.actionButtonText}>Resolve Case</Text>
                </TouchableOpacity>
              )}
              {incident.status === 'resolved' && (
                <View style={styles.resolvedBanner}>
                  <Text style={styles.resolvedBannerText}>✓ Emergency Case Resolved Successfully</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Log timeline list */}
          <View style={styles.logCard}>
            <Text style={styles.cardLabel}>Case Action Log</Text>
            
            {comments.length === 0 ? (
              <Text style={styles.emptyLogText}>No action logs posted yet.</Text>
            ) : (
              comments.map((item) => {
                const isSystem = item.authorName === 'System Log';
                return (
                  <View key={item.id} style={styles.logItem}>
                    <View style={styles.logHeader}>
                      <Text style={[styles.logAuthor, isSystem && styles.systemAuthor]}>
                        {item.authorName}
                      </Text>
                      <Text style={styles.logTime}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={[styles.logText, isSystem && styles.systemText]}>{item.text}</Text>
                    {item.statusUpdate && (
                      <View style={styles.logBadgeContainer}>
                        <Text style={[styles.logBadgeText, { color: getStatusColor(item.statusUpdate) }]}>
                          ↳ STATE: {item.statusUpdate.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

        </ScrollView>

        {/* Comment input footer */}
        <View style={styles.inputFooter}>
          <View style={styles.metaInputRow}>
            <Text style={styles.senderLabel}>Posting as: Field Responder</Text>
            <View style={styles.selectWrapper}>
              <Text style={styles.cascadeLabel}>Cascade:</Text>
              <View style={styles.dropdownMini}>
                <TouchableOpacity
                  onPress={() => {
                    const nextVal = commentStatusUpdate === '' ? 'resolving' : commentStatusUpdate === 'resolving' ? 'resolved' : '';
                    setCommentStatusUpdate(nextVal);
                  }}
                  style={styles.cascadeToggle}
                >
                  <Text style={styles.cascadeToggleText}>
                    {commentStatusUpdate === '' ? 'None' : commentStatusUpdate.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.inputTextRow}>
            <TextInput
              placeholder="Record case notes..."
              style={styles.textInput}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handlePostComment}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#888888',
    fontFamily: 'SpaceMono',
  },
  scrollFrame: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  caseId: {
    fontSize: 10,
    color: '#a3a3a3',
    fontFamily: 'SpaceMono',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 19,
    marginBottom: 16,
  },
  locationContainer: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinateText: {
    fontSize: 10,
    color: '#888888',
    fontFamily: 'SpaceMono',
  },
  responderBox: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  responderText: {
    fontSize: 12,
    color: '#166534',
  },
  boldText: {
    fontWeight: 'bold',
  },
  unassignedBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  unassignedText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '600',
  },
  controlCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchBtn: { backgroundColor: '#16a34a' },
  activeBtn: { backgroundColor: '#ea580c' },
  resolvingBtn: { backgroundColor: '#8b5cf6' },
  resolvedBtn: { backgroundColor: '#10b981' },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resolvedBanner: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resolvedBannerText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  emptyLogText: {
    fontSize: 12,
    color: '#a3a3a3',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  logItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0f0',
    paddingLeft: 12,
    marginBottom: 14,
    position: 'relative',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  logAuthor: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#525252',
  },
  systemAuthor: {
    color: '#b45309',
  },
  logTime: {
    fontSize: 9,
    color: '#a3a3a3',
    fontFamily: 'SpaceMono',
  },
  logText: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 17,
  },
  systemText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  logBadgeContainer: {
    marginTop: 4,
  },
  logBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  inputFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#ffffff',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  metaInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderLabel: {
    fontSize: 10,
    color: '#737373',
    fontWeight: '600',
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cascadeLabel: {
    fontSize: 9,
    color: '#a3a3a3',
    fontWeight: 'bold',
    marginRight: 4,
  },
  dropdownMini: {},
  cascadeToggle: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cascadeToggleText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#525252',
  },
  inputTextRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#fafafa',
  },
  sendButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
