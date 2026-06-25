import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { IncidentServiceClient } from '../../services/incident.service';
import type { Incident, Comment, IncidentStatus, Severity } from '../../types/incident';
import { ArrowLeft, Clock, MapPin, User, Phone, Mail, MessageSquare, Send, Camera } from 'lucide-react';


export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Dispatcher 1');
  const [commentStatusUpdate, setCommentStatusUpdate] = useState<IncidentStatus | ''>('');
  
  // Responder edit state
  const [responderIdInput, setResponderIdInput] = useState('');
  const [isEditingResponder, setIsEditingResponder] = useState(false);

  // Fetch incident details & comments
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const incidentData = await IncidentServiceClient.getIncidentById(id);
        setIncident(incidentData);
        setResponderIdInput(incidentData.responderId || '');

        const commentsData = await IncidentServiceClient.getComments(id);
        setComments(commentsData);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch incident details');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Real-time socket updates for details and timeline
  useEffect(() => {
    if (!socket || !id) return;

    const handleIncidentUpdated = (updatedIncident: Incident) => {
      if (updatedIncident.id === id) {
        setIncident(updatedIncident);
        setResponderIdInput(updatedIncident.responderId || '');
      }
    };

    const handleCommentAdded = (payload: { incidentId: string; comment: Comment }) => {
      if (payload.incidentId === id) {
        // Prevent duplicate comments if we submitted it ourselves
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

  const handleUpdateStatus = async (newStatus: IncidentStatus) => {
    if (!incident || !id) return;
    try {
      const updated = await IncidentServiceClient.updateIncident(id, { status: newStatus });
      setIncident(updated);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleUpdateResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !id) return;
    try {
      const updated = await IncidentServiceClient.updateIncident(id, {
        responderId: responderIdInput.trim() || null,
      });
      setIncident(updated);
      setIsEditingResponder(false);
    } catch (err: any) {
      alert(`Error updating responder: ${err.message}`);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    try {
      const payload = {
        authorName: commentAuthor.trim() || 'Anonymous',
        text: commentText.trim(),
        statusUpdate: commentStatusUpdate || null,
      };

      const newComment = await IncidentServiceClient.addComment(id, payload);
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      setCommentStatusUpdate('');
    } catch (err: any) {
      alert(`Error posting comment: ${err.message}`);
    }
  };

  const getSeverityBadgeClass = (severity: Severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusBadgeClass = (status: IncidentStatus) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolving': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'dispatched': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'reported': default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-2">
        <svg className="animate-spin h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-mono text-sm">Syncing Operations Room...</span>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="text-red-500 text-xl font-bold">⚠️ Access Terminated</div>
        <p className="text-sm text-neutral-500">{error || 'Incident case board could not be loaded.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-neutral-800 text-white rounded-xl text-xs font-semibold hover:bg-neutral-900 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-neutral-900">{incident.title}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadgeClass(incident.severity)}`}>
                {incident.severity}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">Operations Room • CASE ID: {incident.id}</p>
          </div>
        </div>

        {/* Current status bar */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <span className="text-xs text-neutral-500 font-mono">Workflow Status:</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wider ${getStatusBadgeClass(incident.status)}`}>
            {incident.status}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Operations detail & Responder (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Core details */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
              Core Emergency Case File
            </h3>

            {/* Photo Attachment if exists */}
            {incident.imageUrl ? (
              <div className="relative h-64 rounded-2xl overflow-hidden border border-neutral-200">
                <img src={incident.imageUrl} alt={incident.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-neutral-950/70 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-mono">
                  Attachment: Case Image
                </div>
              </div>
            ) : (
              <div className="h-40 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 text-xs">
                <Camera className="h-6 w-6 mb-1 text-neutral-300" />
                <span>No media attachments uploaded</span>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-700">Case Description</h4>
              <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50/50 p-4 border border-neutral-100 rounded-xl">
                {incident.description}
              </p>
            </div>

            {/* Geographical details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-neutral-700">Reported Location</h5>
                  <p className="text-xs text-neutral-600 mt-0.5">{incident.locationName}</p>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">Lat: {incident.latitude}, Lng: {incident.longitude}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-neutral-700">Time Reported</h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {new Date(incident.createdAt).toLocaleDateString()} at {new Date(incident.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Updated: {new Date(incident.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Reporter details */}
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
              <h5 className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-neutral-400" />
                <span>Reporter Contact Details</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Reporter Name</span>
                  <span className="font-semibold">{incident.reporterName || 'Anonymous reporter'}</span>
                </div>
                {incident.reporterPhone && (
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Reporter Phone</span>
                    <a href={`tel:${incident.reporterPhone}`} className="hover:underline flex items-center gap-1">
                      <Phone className="h-3 w-3 text-neutral-400" />
                      {incident.reporterPhone}
                    </a>
                  </div>
                )}
                {incident.reporterEmail && (
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Reporter Email</span>
                    <a href={`mailto:${incident.reporterEmail}`} className="hover:underline flex items-center gap-1">
                      <Mail className="h-3 w-3 text-neutral-400" />
                      {incident.reporterEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Status controls */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
              Dispatch Command Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Volunteer Assignment */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-700 block">Assigned Incident Responder</label>
                
                {isEditingResponder ? (
                  <form onSubmit={handleUpdateResponder} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. vol-105"
                      value={responderIdInput}
                      onChange={(e) => setResponderIdInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-600"
                    />
                    <button type="submit" className="px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-xs font-semibold">
                      Save
                    </button>
                    <button type="button" onClick={() => setIsEditingResponder(false)} className="px-3 py-1.5 border rounded-lg text-xs text-neutral-600">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-neutral-100 rounded-xl bg-neutral-50/50">
                    <span className="text-xs font-semibold font-mono text-neutral-700">
                      {incident.responderId ? `ID: ${incident.responderId}` : 'No responder assigned yet'}
                    </span>
                    <button
                      onClick={() => setIsEditingResponder(true)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Assign Responder
                    </button>
                  </div>
                )}
              </div>

              {/* Status workflow triggers */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-700 block font-sans">Quick Status Workflow</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['reported', 'dispatched', 'active', 'resolving', 'resolved'] as IncidentStatus[]).map((statusVal) => (
                    <button
                      key={statusVal}
                      onClick={() => handleUpdateStatus(statusVal)}
                      className={`px-2.5 py-1.5 text-[10px] font-bold capitalize rounded-lg transition-all cursor-pointer ${
                        incident.status === statusVal
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {statusVal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Logs timeline & Comment box */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full max-h-[750px]">
            
            <div className="border-b border-neutral-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
                <MessageSquare className="h-4.5 w-4.5 text-neutral-400" />
                <span>Incident Action Log</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Live timestamp telemetry updates</p>
            </div>

            {/* Timeline Stream */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 min-h-[300px]">
              {comments.map((comment) => {
                const isSystemLog = comment.authorName === 'System Log';
                return (
                  <div key={comment.id} className="text-left relative pl-4 border-l-2 border-neutral-100 last:border-l-0 pb-1">
                    {/* Pulsing dot indicator */}
                    <span className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      isSystemLog ? 'bg-amber-500' : 'bg-primary-500'
                    }`}></span>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span className={`font-bold ${isSystemLog ? 'text-amber-600' : 'text-neutral-700'}`}>
                        {comment.authorName}
                      </span>
                      <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className={`text-xs mt-1 leading-relaxed ${isSystemLog ? 'text-neutral-500 italic' : 'text-neutral-700'}`}>
                      {comment.text}
                    </p>

                    {comment.statusUpdate && (
                      <div className="mt-1">
                        <span className={`text-[8px] font-bold uppercase px-1 rounded border tracking-wide inline-block ${getStatusBadgeClass(comment.statusUpdate)}`}>
                          STATE CHANGE: {comment.statusUpdate}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comment Form box */}
            <form onSubmit={handleSubmitComment} className="border-t border-neutral-100 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Author Name */}
                <div>
                  <label htmlFor="logAuthor" className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Author Identity</label>
                  <input
                    type="text"
                    id="logAuthor"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-full px-2 py-1 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-600 font-medium"
                    required
                  />
                </div>

                {/* Optional Status change cascade */}
                <div>
                  <label htmlFor="logStatus" className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Cascade Status</label>
                  <select
                    id="logStatus"
                    value={commentStatusUpdate}
                    onChange={(e) => setCommentStatusUpdate(e.target.value as IncidentStatus | '')}
                    className="w-full px-2 py-1 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none focus:border-neutral-600 font-medium text-neutral-700"
                  >
                    <option value="">No status change</option>
                    <option value="reported">Reported</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="active">Active</option>
                    <option value="resolving">Resolving</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Text input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Record case notes..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-600"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs transition active:scale-95 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
