import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncidentServiceClient } from '../../services/incident.service';
import type { AnimalType, Severity } from '../../types/incident';
import { AlertTriangle, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReportForm: React.FC = () => {
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [animalType, setAnimalType] = useState<AnimalType>('dog');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  // Reporter info
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Map limits for New York Metropolitan area (seeds match this bounding box)
  const minLat = 40.70;
  const maxLat = 40.79;
  const minLng = -74.02;
  const maxLng = -73.96;

  // Simulate picking coordinates
  const triggerAutoLocation = () => {
    // Generate random coordinates inside our metropolitan bounding box
    const randomLat = Number((minLat + Math.random() * (maxLat - minLat)).toFixed(6));
    const randomLng = Number((minLng + Math.random() * (maxLng - minLng)).toFixed(6));
    
    setLatitude(randomLat);
    setLongitude(randomLng);

    // Provide a mock descriptive street address
    const mockStreets = ['Broadway', 'Madison Ave', 'Park Ave', '8th Ave', 'Central Park West', 'Wall St'];
    const mockCrossStreets = ['W 14th St', 'E 42nd St', 'E 81st St', 'Liberty St', 'W 110th St'];
    const randomStreet = mockStreets[Math.floor(Math.random() * mockStreets.length)];
    const randomCross = mockCrossStreets[Math.floor(Math.random() * mockCrossStreets.length)];
    
    setLocationName(`${randomStreet} & ${randomCross}`);
  };

  // Mock preset images for testing
  const presets = [
    { name: 'Dog Preset', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=250', type: 'dog' },
    { name: 'Cat Preset', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=250', type: 'cat' },
    { name: 'Bird Preset', url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=250', type: 'bird' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!title.trim() || title.length < 3) {
      setFormError('Title must be at least 3 characters.');
      return;
    }
    if (!description.trim() || description.length < 5) {
      setFormError('Description must be at least 5 characters.');
      return;
    }
    if (!locationName.trim()) {
      setFormError('Please specify the location name/description.');
      return;
    }
    if (!latitude || !longitude) {
      setFormError('Please select map coordinates by clicking "Autodetect Coordinates".');
      return;
    }

    setIsSubmitting(true);

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
      reporterEmail: reporterEmail.trim() || null,
      imageUrl,
    };

    try {
      const response = await IncidentServiceClient.createIncident(payload);
      setIsSubmitting(false);
      setIsSuccess(true);
      setCreatedId(response.id);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'An error occurred while submitting the report.');
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'high': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'low': return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  if (isSuccess && createdId) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-neutral-200 rounded-3xl p-8 text-center shadow-lg space-y-6"
        >
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 text-3xl">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">Emergency Dispatched Successfully</h2>
            <p className="text-sm text-neutral-500">
              The case has been broadcast to active operators and responders on duty.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl font-mono text-xs text-neutral-600 border border-neutral-100 inline-block">
            CASE ID: <span className="font-bold text-neutral-800">{createdId}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-neutral-800 text-white text-sm font-semibold rounded-xl hover:bg-neutral-900 transition active:scale-95 cursor-pointer"
            >
              Go to Control Dashboard
            </button>
            <button
              onClick={() => navigate(`/incidents/${createdId}`)}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition active:scale-95 cursor-pointer"
            >
              Open Incident Operations Room
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header and Back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Report Stray Animal Emergency</h1>
          <p className="text-xs text-neutral-500">Submit coordinates and details directly to the operating system queue</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {formError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Emergency classification */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
              1. Emergency Classification
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Animal Type */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-2">Animal Class</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['dog', 'cat', 'bird', 'other'] as AnimalType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAnimalType(type)}
                      className={`py-3 text-center border rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1 transition ${
                        animalType === type
                          ? 'border-neutral-800 bg-neutral-900 text-white shadow-sm'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      <span className="text-lg">
                        {type === 'dog' ? '🐶' : type === 'cat' ? '🐱' : type === 'bird' ? '🐦' : '🐾'}
                      </span>
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-2">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as Severity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-3 border rounded-xl font-semibold text-xs transition ${
                        severity === sev
                          ? getSeverityColor(sev) + ' border-transparent shadow-sm'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      <span className="capitalize">{sev}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Incident Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
              2. Incident Details
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="text-xs font-bold text-neutral-700 block mb-1">Incident Headline</label>
                <input
                  type="text"
                  id="title"
                  placeholder="e.g. Injured Dog with Limping Paw"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-600 transition"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-xs font-bold text-neutral-700 block mb-1">Description of Danger/Injury</label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Provide details about the animal's physical state, exact condition, color/breed, and behavior (friendly, aggressive, scared)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-600 transition resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Geolocation */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
              3. Geolocation & Coordinates
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 border border-neutral-150 p-4 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-neutral-200 flex items-center justify-center text-neutral-500 flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 w-full text-left">
                {latitude && longitude ? (
                  <div className="font-mono text-[11px] text-neutral-700">
                    <div className="font-bold text-neutral-800">📍 COORDINATES PINNED:</div>
                    <div>Latitude: {latitude}</div>
                    <div>Longitude: {longitude}</div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">
                    Traces coordinates in the NYC Metro command grid. Click the button to simulate location pinpointing.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={triggerAutoLocation}
                className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                Autodetect Coordinates
              </button>
            </div>

            <div>
              <label htmlFor="locationName" className="text-xs font-bold text-neutral-700 block mb-1">Address/Location Landmark</label>
              <input
                type="text"
                id="locationName"
                placeholder="e.g. Central Park West near 81st St entrance"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-600 transition"
                required
              />
            </div>
          </div>

          {/* Section 4: Attachments & Reporter Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
              4. Media & Contact Profile
            </h3>

            {/* Test Image Presets */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-2">Attach Photo (Testing Presets)</label>
              <div className="flex flex-wrap gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative p-1 border rounded-xl transition overflow-hidden ${
                      imageUrl === preset.url ? 'border-primary-600 bg-primary-50/20' : 'border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-16 h-16 object-cover rounded-lg" />
                    {imageUrl === preset.url && (
                      <span className="absolute top-1 right-1 bg-primary-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
                
                {/* Clear Image Selection */}
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="h-18 px-3 border border-dashed border-red-300 rounded-xl text-red-500 hover:bg-red-50 text-[10px] font-bold"
                  >
                    Clear Photo
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="reporterName" className="text-xs font-bold text-neutral-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  id="reporterName"
                  placeholder="Sarah Jenkins"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="reporterPhone" className="text-xs font-bold text-neutral-700 block mb-1">Your Phone</label>
                <input
                  type="tel"
                  id="reporterPhone"
                  placeholder="555-0199"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label htmlFor="reporterEmail" className="text-xs font-bold text-neutral-700 block mb-1">Your Email</label>
                <input
                  type="email"
                  id="reporterEmail"
                  placeholder="sarah@example.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="border-t border-neutral-100 pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Broadcasting Emergency Traces...</span>
                </>
              ) : (
                <span>Publish Emergency Incident</span>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
