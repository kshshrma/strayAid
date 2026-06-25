import { useEffect, useState } from 'react';

interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
}

interface TestData {
  success: boolean;
  data?: {
    message: string;
  };
  message?: string;
  status?: string;
}

export default function DiagnosticsView() {
  // Connection states
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Dynamic API query test states
  const [testResult, setTestResult] = useState<TestData | null>(null);
  const [loadingTest, setLoadingTest] = useState<boolean>(false);
  const [testQuery, setTestQuery] = useState<string>('StrayAidVolunteer');

  // Fetch backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: HealthData) => {
        setHealth(data);
        setLoadingHealth(false);
      })
      .catch((err: Error) => {
        console.error('Error fetching health check:', err);
        setHealthError(err.message);
        setLoadingHealth(false);
      });
  }, []);

  // Function to call the layered test routes
  const triggerTestRoute = (nameParam: string) => {
    setLoadingTest(true);
    setTestResult(null);
    setTestQuery(nameParam);

    fetch(`/api/test?name=${nameParam}`)
      .then(async (res) => {
        const isJson = res.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await res.json() : null;

        if (!res.ok) {
          return {
            success: false,
            status: data?.status || 'fail',
            message: data?.message || 'Server error occurred'
          };
        }
        return data;
      })
      .then((data: TestData) => {
        setTestResult(data);
        setLoadingTest(false);
      })
      .catch((err: Error) => {
        setTestResult({
          success: false,
          message: err.message
        });
        setLoadingTest(false);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-2 sm:px-4">
      <div className="w-full max-w-2xl bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-6 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">StrayAid AEOS</h1>
              <p className="text-xs text-neutral-500 font-medium">Animal Emergency Operating System • Phase 1 Core Diagnostics</p>
            </div>
          </div>
          
          {/* Health Status Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="relative flex h-3 w-3">
              {healthError ? (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency-400 opacity-75"></span>
              ) : loadingHealth ? (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              ) : (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              )}
              
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                healthError ? 'bg-emergency-600' : loadingHealth ? 'bg-amber-500' : 'bg-primary-600'
              }`}></span>
            </span>
            <span className="text-sm font-semibold text-neutral-700">
              {healthError ? 'API Disconnected' : loadingHealth ? 'Connecting...' : 'API Connected'}
            </span>
          </div>
        </div>

        {/* System Diagnostics Block */}
        <div className="space-y-6">
          
          {/* Section 1: Tailwind CSS v4 Theme Validation */}
          <div>
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">1. Design System Theme Validation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Primary Color Box */}
              <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-primary-600/20">
                  A
                </div>
                <div>
                  <h3 className="text-xs font-bold text-primary-900 uppercase">Primary Brand Palette</h3>
                  <p className="text-xs text-primary-700">Compiled with custom class: <code className="bg-primary-100 px-1 rounded font-mono">bg-primary-600</code></p>
                </div>
              </div>

              {/* Emergency Color Box */}
              <div className="p-4 bg-emergency-50 border border-emergency-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emergency-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-emergency-600/20">
                  E
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emergency-900 uppercase">Emergency Palette</h3>
                  <p className="text-xs text-emergency-700">Compiled with custom class: <code className="bg-emergency-100 px-1 rounded font-mono">bg-emergency-600</code></p>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Express Health Endpoint Status */}
          <div>
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">2. Express Health Check Response</h2>
            <div className="p-4 bg-neutral-900 rounded-xl font-mono text-xs text-neutral-300 leading-relaxed overflow-x-auto shadow-inner">
              {loadingHealth ? (
                <div className="flex items-center gap-2 text-neutral-400">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Querying `/api/health` endpoint...</span>
                </div>
              ) : healthError ? (
                <div className="text-emergency-400 font-semibold">
                  ❌ Connection Failed: {healthError}
                </div>
              ) : health ? (
                <div className="space-y-1">
                  <div><span className="text-primary-400">GET</span> http://localhost:5000/api/health</div>
                  <div className="text-neutral-500">-------------------------------------------</div>
                  <div><span className="text-neutral-400">status:</span> "{health.status}"</div>
                  <div><span className="text-neutral-400">message:</span> "{health.message}"</div>
                  <div><span className="text-neutral-400">timestamp:</span> "{health.timestamp}"</div>
                  <div><span className="text-neutral-400">uptime:</span> {health.uptime.toFixed(2)} seconds</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Section 3: Architecture Layers API Query */}
          <div>
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">3. Test Layered API Flow & Custom Error Middleware</h2>
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              Click the actions below to trigger HTTP requests to <code className="bg-neutral-100 px-1 rounded font-mono">/api/test?name=nameParam</code>. This verifies the Express Route-Controller-Service architectural flow and tests our error-handling middleware.
            </p>

            {/* Test Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => triggerTestRoute('StrayAidVolunteer')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
              >
                Trigger Success Path (?name=StrayAidVolunteer)
              </button>
              <button
                onClick={() => triggerTestRoute('error')}
                className="px-4 py-2 bg-emergency-600 hover:bg-emergency-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
              >
                Trigger Error Path (?name=error)
              </button>
              <button
                onClick={() => triggerTestRoute('')}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
              >
                Trigger Default Path (Empty Query)
              </button>
            </div>

            {/* API Execution Result */}
            <div className="p-4 bg-neutral-900 rounded-xl font-mono text-xs text-neutral-300 leading-relaxed overflow-x-auto min-h-[100px] flex items-center justify-start border border-neutral-800 shadow-inner">
              {loadingTest ? (
                <div className="flex items-center gap-2 text-neutral-400">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Requesting API response...</span>
                </div>
              ) : testResult ? (
                <div className="space-y-1 w-full">
                  <div>
                    <span className="text-blue-400">GET</span> /api/test?name={testQuery}
                  </div>
                  <div className="text-neutral-500">-------------------------------------------</div>
                  {testResult.success ? (
                    <div>
                      <div className="text-primary-400 font-bold">✓ Success Response (Status: 200)</div>
                      <div className="mt-1">
                        <span className="text-neutral-400">data.message:</span> "{testResult.data?.message}"
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-emergency-400 font-bold">
                        ❌ Intercepted by Global Error Handler (Status: {testQuery === 'error' ? '400' : '500'})
                      </div>
                      <div className="mt-1">
                        <span className="text-neutral-400">status:</span> "{testResult.status}"
                      </div>
                      <div>
                        <span className="text-neutral-400">message:</span> "{testResult.message}"
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-neutral-500 italic">No query triggered. Click an action button above to run diagnostic tests.</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
