import { useState } from 'react';
import { Play, Clipboard, Check, ChevronRight, ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function ApiPlayground() {
    const [method, setMethod] = useState('GET');
    const [endpoint, setEndpoint] = useState('/v1/config/:publicId');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const simulateCall = () => {
        setLoading(true);
        setTimeout(() => {
            setResponse({
                config: {
                    API_ENDPOINT: "https://api.prod.example.com",
                    FEATURE_FLAG_X: true,
                    THEME_COLOR: "#123456"
                },
                project: {
                    name: "My Awesome App",
                    latestVersion: "2.1.0",
                    updateRequired: false
                }
            });
            setLoading(false);
        }, 800);
    };

    return (
        <PageTransition>
            <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">API Playground</h1>
                        <p className="text-zinc-400">Test and integrate your endpoints directly.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Request Builder */}
                        <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-4">
                            <div className="flex gap-2">
                                <select
                                    value={method}
                                    onChange={e => setMethod(e.target.value)}
                                    className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm font-mono font-bold text-violet-400 focus:outline-none"
                                >
                                    <option>GET</option>
                                    <option>POST</option>
                                </select>
                                <input
                                    value={endpoint}
                                    onChange={e => setEndpoint(e.target.value)}
                                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-zinc-300 focus:border-violet-500/50 focus:outline-none"
                                />
                                <button
                                    onClick={simulateCall}
                                    className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    <Play size={16} fill="currentColor" />
                                    {loading ? 'Running...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response Viewer */}
                <div className="bg-[#0d0d10] rounded-2xl border border-white/10 flex flex-col relative overflow-hidden shadow-2xl h-full">
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                        <div className="text-xs font-bold text-zinc-400">Response</div>
                        <div className={`text-xs font-mono px-2 py-0.5 rounded ${response ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-500'}`}>
                            {response ? '200 OK' : 'Waiting...'}
                        </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto text-blue-300">
                        {response ? (
                            <pre>{JSON.stringify(response, null, 2)}</pre>
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-700 italic">
                                Run a request to see response...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
