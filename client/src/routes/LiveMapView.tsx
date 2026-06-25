export default function LiveMapView() {
  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] border border-neutral-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
      
      {/* Map Sidebar / Case List */}
      <div className="w-full md:w-80 border-r border-neutral-100 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-bold text-neutral-900 flex items-center gap-2">
              🗺️ Rescue Radar
            </h2>
            <span className="bg-primary-100 text-primary-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Live updates
            </span>
          </div>
          
          <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
            Rescuers and active cases currently within 5km of your active GPS location.
          </p>

          {/* Dummy Active Incident Card */}
          <div className="space-y-3">
            <div className="p-3 border.5 border-emergency-100 bg-emergency-50/20 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-emergency-800 uppercase tracking-wider">🩹 Severely Injured Dog</span>
                <span className="text-[10px] text-neutral-500">2m ago</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800">Near central park avenue block 4</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emergency-600 animate-pulse"></span>
                <span className="text-[10px] text-neutral-500 font-medium">Pending responder dispatch</span>
              </div>
            </div>

            <div className="p-3 border border-neutral-100 bg-neutral-50/50 rounded-xl opacity-60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">🐶 Lost Cat (Golden/Orange)</span>
                <span className="text-[10px] text-neutral-500">1h ago</span>
              </div>
              <p className="text-xs font-semibold text-neutral-800">Metro station pillar 14</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                <span className="text-[10px] text-neutral-500 font-medium">Rescued successfully</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Location Diagnostics */}
        <div className="border-t border-neutral-100 pt-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
            </span>
            <span className="text-xs text-neutral-600 font-medium">GPS: Acquired (40.7128° N, 74.0060° W)</span>
          </div>
        </div>

      </div>

      {/* Main Map Box Visual Placeholder */}
      <div className="flex-1 bg-neutral-100 relative min-h-[400px] flex items-center justify-center">
        {/* Mock Map Background Grid Lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#808080_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Mock Rescuer Coordinates Indicator */}
        <div className="absolute top-[35%] left-[55%] flex flex-col items-center">
          <div className="bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md mb-1.5">
            Vol. Jane (0.4km)
          </div>
          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-primary-600/30 animate-bounce">
            🏍️
          </div>
        </div>

        {/* Mock Distress Coordinate Indicator */}
        <div className="absolute top-[50%] left-[30%] flex flex-col items-center">
          <div className="bg-emergency-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md mb-1.5">
            Urgent: Injured Dog (here)
          </div>
          <div className="relative flex h-7 w-7 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emergency-600 shadow-md shadow-emergency-600/40 items-center justify-center text-[10px]">
              ⚠️
            </span>
          </div>
        </div>

        <div className="z-10 bg-white/95 backdrop-blur border border-neutral-200/80 rounded-xl px-4 py-3 shadow-sm text-center">
          <span className="text-xl">🗺️</span>
          <p className="text-xs font-semibold text-neutral-800 mt-1">Live Map Feed Simulation</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Google Maps integration initializes in Phase 2, Module 6</p>
        </div>
      </div>

    </div>
  );
}
