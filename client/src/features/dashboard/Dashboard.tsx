import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { IncidentServiceClient } from '../../services/incident.service';
import type { Incident, Severity, AnimalType } from '../../types/incident';
import { VectorMap } from '../../components/VectorMap';
import { AlertCircle, ShieldAlert, Award, FileText, Navigation, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering states
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [animalFilter, setAnimalFilter] = useState<string>('all');

  // Selected incident on the map/list preview
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Notification notification popups
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch initial incidents
  useEffect(() => {
    let active = true;
    IncidentServiceClient.getAllIncidents()
      .then((data) => {
        if (active) {
          setIncidents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to fetch incidents');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Listen for real-time WebSocket events
  useEffect(() => {
    if (!socket) return;

    const handleIncidentCreated = (newIncident: Incident) => {
      console.log('📡 Realtime: Incident created', newIncident);
      setIncidents((prev) => [newIncident, ...prev]);

      // Visual trigger notification
      setNotification(`📢 NEW CRITICAL REPORT: ${newIncident.title}`);
      setTimeout(() => setNotification(null), 5000);
    };

    const handleIncidentUpdated = (updatedIncident: Incident) => {
      console.log('📡 Realtime: Incident updated', updatedIncident);
      setIncidents((prev) =>
        prev.map((item) => (item.id === updatedIncident.id ? updatedIncident : item))
      );

      // Also update selected incident details if previewed
      setSelectedIncident((prev) => (prev?.id === updatedIncident.id ? updatedIncident : prev));
    };

    socket.on('incident:created', handleIncidentCreated);
    socket.on('incident:updated', handleIncidentUpdated);

    return () => {
      socket.off('incident:created', handleIncidentCreated);
      socket.off('incident:updated', handleIncidentUpdated);
    };
  }, [socket]);

  // Calculate Metrics
  const totalCases = incidents.length;
  const criticalCases = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const dispatchingCases = incidents.filter((i) => i.status === 'dispatched' || i.status === 'active').length;
  const resolvedCases = incidents.filter((i) => i.status === 'resolved').length;

  // Filtered incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesAnimal = animalFilter === 'all' || incident.animalType === animalFilter;
    return matchesSeverity && matchesAnimal;
  });

  const getSeverityBadgeClass = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'resolving':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'active':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'dispatched':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'reported':
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getAnimalEmoji = (type: AnimalType) => {
    switch (type) {
      case 'dog':
        return '🐶';
      case 'cat':
        return '🐱';
      case 'bird':
        return '🐦';
      case 'other':
      default:
        return '🐾';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Real-time alert bar */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between font-medium text-sm border border-red-500"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 animate-pulse" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white hover:text-red-100 font-bold ml-4"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Reports</span>
            <h3 className="text-2xl font-bold text-neutral-800 mt-1">{totalCases}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
          {criticalCases > 0 && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl animate-pulse"></div>
          )}
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Critical Queue</span>
            <h3 className={`text-2xl font-bold mt-1 ${criticalCases > 0 ? 'text-red-600' : 'text-neutral-800'}`}>
              {criticalCases}
            </h3>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${criticalCases > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-neutral-100 text-neutral-600'}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Rescues</span>
            <h3 className="text-2xl font-bold text-neutral-800 mt-1">{dispatchingCases}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Navigation className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Case Solved</span>
            <h3 className="text-2xl font-bold text-neutral-800 mt-1">{resolvedCases}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Console Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Map & Selected Preview (span 2) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Incident Tracking Vector Map</h2>
              <span className="text-xs text-neutral-400 font-mono">Center: NY Metropolitan Grid</span>
            </div>
            
            {/* Vector Map Component */}
            <VectorMap
              incidents={incidents}
              selectedIncidentId={selectedIncident?.id}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />
          </div>

          {/* Selected Incident Detail Card (Sticky floating look) */}
          <AnimatePresence>
            {selectedIncident && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-md border-l-4"
                style={{ borderLeftColor: getSeverityBadgeClass(selectedIncident.severity).includes('red') ? '#ef4444' : getSeverityBadgeClass(selectedIncident.severity).includes('orange') ? '#f97316' : getSeverityBadgeClass(selectedIncident.severity).includes('yellow') ? '#eab308' : '#3b82f6' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getAnimalEmoji(selectedIncident.animalType)}</span>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{selectedIncident.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">ID: {selectedIncident.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadgeClass(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(selectedIncident.status)}`}>
                      {selectedIncident.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                  {selectedIncident.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-4 pt-1">
                  <span>📍 {selectedIncident.locationName}</span>
                  <button
                    onClick={() => navigate(`/incidents/${selectedIncident.id}`)}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-bold border border-primary-100 hover:border-primary-200 px-3 py-1.5 rounded-lg bg-primary-50/50 hover:bg-primary-50 transition-colors"
                  >
                    <span>Launch Operations Board</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Live Stream list */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full max-h-[750px]">
            
            {/* List Header */}
            <div className="border-b border-neutral-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-neutral-900">Emergency Case Feed</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Real-time reports queue sorted by newest</p>
            </div>

            {/* Filter Group */}
            <div className="space-y-3 mb-4">
              {/* Severity filter */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">Severity</label>
                <div className="flex flex-wrap gap-1">
                  {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-2.5 py-1 text-[10px] font-bold capitalize rounded-md transition-all ${
                        severityFilter === sev
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animal Type filter */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">Animal Class</label>
                <div className="flex flex-wrap gap-1">
                  {['all', 'dog', 'cat', 'bird', 'other'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAnimalFilter(type)}
                      className={`px-2.5 py-1 text-[10px] font-bold capitalize rounded-md transition-all ${
                        animalFilter === type
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {type === 'all' ? 'All' : `${getAnimalEmoji(type as AnimalType)} ${type}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feed List Container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
                  <svg className="animate-spin h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs font-mono">Syncing incidents...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500 text-xs font-semibold">
                  ⚠️ Error loading feed: {error}
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="text-center py-16 text-neutral-400 text-xs italic">
                  No incidents matching filters.
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredIncidents.map((incident) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={() => {
                        setSelectedIncident(incident);
                        // Optional scroll to map focus can be handled visually
                      }}
                      className={`p-3.5 border rounded-xl cursor-pointer hover:border-neutral-400 transition-all text-left flex flex-col gap-2 relative ${
                        selectedIncident?.id === incident.id
                          ? 'border-neutral-800 bg-neutral-50/70 shadow-sm'
                          : 'border-neutral-200/80 bg-white hover:bg-neutral-50/30'
                      }`}
                    >
                      {/* Critical Warning border accent */}
                      {incident.severity === 'critical' && incident.status !== 'resolved' && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl"></span>
                      )}

                      {/* Header info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base flex-shrink-0">{getAnimalEmoji(incident.animalType)}</span>
                          <span className="font-bold text-neutral-800 text-xs truncate">{incident.title}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${getSeverityBadgeClass(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>

                      {/* Location descriptor */}
                      <div className="text-[10px] text-neutral-500 truncate flex items-center gap-1">
                        <span>📍</span>
                        <span className="truncate">{incident.locationName}</span>
                      </div>

                      {/* Status and timestamp */}
                      <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-neutral-400 border-t border-neutral-100 pt-2">
                        <span className={`px-1.5 py-0.2 rounded border uppercase font-bold text-[8px] tracking-wide ${getStatusBadgeClass(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span>{new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
