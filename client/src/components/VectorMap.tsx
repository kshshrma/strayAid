import React, { useState } from 'react';
import type { Incident } from '../types/incident';

interface VectorMapProps {
  incidents: Incident[];
  selectedIncidentId?: string | null;
  onSelectIncident: (incident: Incident) => void;
}

export const VectorMap: React.FC<VectorMapProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}) => {
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map bounding box for New York Metropolitan area (seeds match this bounding box)
  const minLat = 40.70;
  const maxLat = 40.79;
  const minLng = -74.025;
  const maxLng = -73.96;

  const width = 800;
  const height = 550;
  const padding = 50;

  // Project latitude/longitude coordinates to SVG canvas space (x, y)
  const projectCoords = (lat: number, lng: number) => {
    // Standard Mercator projection approximation for a small bounding box
    const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
    // Y-axis is inverted in SVG coordinate space
    const y = padding + (1 - (lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);
    return { x, y };
  };

  // Helper for color matching
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ef4444'; // Red
      case 'high':
        return '#f97316'; // Orange
      case 'medium':
        return '#eab308'; // Yellow
      case 'low':
      default:
        return '#3b82f6'; // Blue
    }
  };

  // Helper for animal icon/emojis
  const getAnimalEmoji = (type: string) => {
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
    <div className="relative w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-inner p-4 select-none">
      
      {/* HUD Header overlay */}
      <div className="absolute top-4 left-4 z-10 bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 px-3 py-2 rounded-lg pointer-events-none">
        <h4 className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">AEOS Vector Tracking Grid</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
          <span className="text-[11px] font-mono text-primary-400">Live coordinates active ({incidents.length} traced)</span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 p-2.5 rounded-lg text-[10px] font-mono text-neutral-300 space-y-1.5 pointer-events-none">
        <div className="font-bold text-neutral-400 mb-1 border-b border-neutral-800 pb-1">SEVERITY INDEX</div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
          <span>CRITICAL (Active)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block"></span>
          <span>HIGH PRIORITY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-yellow-500 inline-block"></span>
          <span>MEDIUM PRIORITY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
          <span>LOW PRIORITY</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-h-[500px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Grid Lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#262626" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" className="opacity-60" />

        {/* Diagonal Tech Scans */}
        <line x1="0" y1="0" x2={width} y2={height} stroke="#171717" strokeWidth="0.5" />
        <line x1={width} y1="0" x2="0" y2={height} stroke="#171717" strokeWidth="0.5" />

        {/* Stylized River (Hudson/East River concept) */}
        <path
          d="M -50,150 Q 150,120 280,260 T 550,420 T 900,480"
          fill="none"
          stroke="#1e293b"
          strokeWidth="60"
          strokeLinecap="round"
          className="opacity-30"
        />
        <path
          d="M -50,150 Q 150,120 280,260 T 550,420 T 900,480"
          fill="none"
          stroke="#0f172a"
          strokeWidth="50"
          strokeLinecap="round"
          className="opacity-45"
        />

        {/* Stylized Park (Central Park concept) */}
        <rect
          x="480"
          y="60"
          width="120"
          height="160"
          rx="10"
          fill="#14532d"
          className="opacity-15"
        />
        <rect
          x="480"
          y="60"
          width="120"
          height="160"
          rx="10"
          fill="none"
          stroke="#15803d"
          strokeWidth="1"
          strokeDasharray="4,4"
          className="opacity-40"
        />

        {/* Sector Labels */}
        <text x="120" y="80" fill="#404040" fontSize="10" fontFamily="monospace" letterSpacing="2" textAnchor="middle">
          SECTOR ALFA (WEST)
        </text>
        <text x="650" y="480" fill="#404040" fontSize="10" fontFamily="monospace" letterSpacing="2" textAnchor="middle">
          SECTOR OMEGA (EAST)
        </text>
        <text x="540" y="145" fill="#15803d" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1" textAnchor="middle" className="opacity-50">
          RESERVE ZONE
        </text>

        {/* Stylized Roads Grid */}
        <path d="M 0,100 L 800,100 M 0,250 L 800,250 M 0,400 L 800,400" stroke="#1f2937" strokeWidth="1" className="opacity-20" />
        <path d="M 150,0 L 150,550 M 350,0 L 350,550 M 600,0 L 600,550" stroke="#1f2937" strokeWidth="1" className="opacity-20" />

        {/* Render Incident Pins */}
        {incidents.map((incident) => {
          const { x, y } = projectCoords(incident.latitude, incident.longitude);
          const color = getSeverityColor(incident.severity);
          const isSelected = selectedIncidentId === incident.id;
          const isCritical = incident.severity === 'critical' && incident.status !== 'resolved';

          return (
            <g
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              onMouseEnter={(e) => {
                setHoveredIncident(incident);
                const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (parentRect) {
                  setTooltipPos({
                    x: x,
                    y: y - 10,
                  });
                }
              }}
              onMouseLeave={() => setHoveredIncident(null)}
              className="cursor-pointer group"
            >
              {/* Outer Pulsing Glow (for Critical Emergencies) */}
              {isCritical && (
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  className="opacity-70 animate-ping"
                  style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '2s' }}
                />
              )}

              {/* Ping Ring selection indicator */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 14 : 10}
                fill="transparent"
                stroke={isSelected ? '#ffffff' : color}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                className="transition-all duration-200"
              />

              {/* Inner core color */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 7 : 5}
                fill={color}
                className="transition-all duration-200 group-hover:scale-125"
                style={{ transformOrigin: `${x}px ${y}px` }}
              />

              {/* Emoji label on hover or if selected */}
              {(isSelected || hoveredIncident?.id === incident.id) && (
                <text
                  x={x}
                  y={y - 18}
                  textAnchor="middle"
                  className="text-base select-none"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                >
                  {getAnimalEmoji(incident.animalType)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* SVG Canvas Map Tooltip Overlay */}
      {hoveredIncident && (
        <div
          className="absolute z-20 pointer-events-none bg-neutral-950/95 border border-neutral-800 p-3 rounded-lg shadow-xl text-left w-56 font-sans text-xs transition-all duration-100 ease-out"
          style={{
            left: `calc(${(tooltipPos.x / width) * 100}% - 112px)`, // Center tooltip horizontally relative to map scale
            top: `calc(${(tooltipPos.y / height) * 100}% - 95px)`, // Position above target
          }}
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-1.5">
            <span className="font-bold font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider text-neutral-200 bg-neutral-900" style={{ borderColor: getSeverityColor(hoveredIncident.severity), borderLeftWidth: '3px' }}>
              {hoveredIncident.severity}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono capitalize">
              {getAnimalEmoji(hoveredIncident.animalType)} {hoveredIncident.animalType}
            </span>
          </div>
          <h5 className="font-semibold text-white truncate">{hoveredIncident.title}</h5>
          <p className="text-[10px] text-neutral-400 mt-1 truncate">📍 {hoveredIncident.locationName}</p>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-900 text-[9px] font-mono text-neutral-500">
            <span>Status: <span className="text-primary-400 capitalize">{hoveredIncident.status}</span></span>
            <span className="text-neutral-600">Click to focus</span>
          </div>
        </div>
      )}
    </div>
  );
};
