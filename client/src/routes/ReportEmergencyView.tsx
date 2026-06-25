export default function ReportEmergencyView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-xl bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
          <span className="text-3xl">🚨</span>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Instant Animal Emergency Report</h2>
            <p className="text-xs text-neutral-500">File a distress alert in under 10 seconds</p>
          </div>
        </div>

        {/* Emergency Flow Card */}
        <div className="bg-emergency-50 border border-emergency-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-lg">📢</span>
          <div className="text-xs text-emergency-900 leading-relaxed">
            <span className="font-bold">Life-Saving Notice:</span> Your location is automatically determined via GPS to allow immediate dispatch of local animal rescuers. Please stay near the animal if it is safe to do so.
          </div>
        </div>

        {/* Mock Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Quick Category Grid */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              Select Distress Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="p-3 border border-emergency-200 bg-emergency-50/50 hover:bg-emergency-50 text-emergency-800 rounded-lg text-xs font-bold transition-all text-left cursor-pointer">
                🩹 Severe Injury
              </button>
              <button type="button" className="p-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold transition-all text-left cursor-pointer">
                🐶 Lost / Stray Pet
              </button>
              <button type="button" className="p-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold transition-all text-left cursor-pointer">
                🌧️ Extreme Weather Ex.
              </button>
              <button type="button" className="p-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold transition-all text-left cursor-pointer">
                ⚠️ Abused / Abandoned
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Distress Details / Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the animal (e.g. injured street dog, limping on front right leg near the metro station)..."
              className="w-full px-3.5 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-150"
            />
          </div>

          {/* Submission Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-emergency-600 hover:bg-emergency-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-emergency-600/10 transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            Broadcast Emergency Alert (10s Dispatch)
          </button>
        </form>

      </div>
    </div>
  );
}
