import { useState, useEffect } from 'react';
import api from '../api';
import { Play, Copy, Check, ChevronRight, Server, Database, Code, FileJson, Layers } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const ENDPOINTS = [
    {
        name: 'Get Configuration',
        method: 'GET',
        path: '/v1/config/:publicId',
        description: 'Fetch remote configuration for a specific project instance.',
        params: [
            { name: 'publicId', type: 'path', required: true, desc: 'Project Public ID' },
            { name: 'env', type: 'query', required: false, desc: 'Environment (prod/dev)' },
            { name: 'version', type: 'query', required: false, desc: 'Client Version (e.g. 1.0.0)' },
            { name: 'instanceId', type: 'query', required: false, desc: 'Unique Instance ID' }
        ],
        exampleResponse: {
            "config": { "FEATURE_X": true, "API_URL": "..." },
            "project": { "name": "My App", "minVersion": "1.0.0" }
        }
    },
    {
        name: 'Send Heartbeat',
        method: 'POST',
        path: '/v1/heartbeat/:publicId',
        description: 'Send a heartbeat signal to register/update an active instance.',
        params: [
            { name: 'publicId', type: 'path', required: true, desc: 'Project Public ID' }
        ],
        body: {
            "instanceId": "uuid-1234",
            "hardwareId": "hw-5678",
            "platform": "windows",
            "version": "1.0.0"
        },
        exampleResponse: { "status": "ok" }
    }
];

export default function ApiPlayground() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);

    // Request State
    const [params, setParams] = useState({ env: 'prod', version: '1.0.0', instanceId: 'test-1' });
    const [body, setBody] = useState(JSON.stringify(ENDPOINTS[1].body, null, 2));
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState('');
    const [useAuth, setUseAuth] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
            if (res.data.length > 0) setSelectedProject(res.data[0]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    const getFullUrl = () => {
        if (!selectedProject) return '';
        let url = `/v1${selectedEndpoint.path.replace('/v1', '').replace(':publicId', selectedProject.publicId)}`;

        if (selectedEndpoint.method === 'GET') {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, val]) => {
                if (val) query.append(key, val);
            });
            url += `?${query.toString()}`;
        }
        return url;
    };

    const getCurlCommand = () => {
        const url = getFullUrl();
        if (selectedEndpoint.method === 'GET') {
            return `curl -X GET "${url}"`;
        } else {
            return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '${body.replace(/\s+/g, ' ')}'`;
        }
    };

    const executeRequest = async () => {
        if (!selectedProject) return;
        setLoading(true);
        setResponse(null);

        try {
            const url = getFullUrl();
            let res;

            const config = {
                headers: {}
            };

            if (useAuth) {
                config.headers['x-client-id'] = selectedProject.publicId;
                config.headers['x-secret'] = selectedProject.secretKey;
            }

            if (selectedEndpoint.method === 'GET') {
                res = await api.get(url, config);
            } else {
                res = await api.post(url, JSON.parse(body), config);
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                data: res.data,
                headers: res.headers
            });
        } catch (err) {
            setResponse({
                status: err.response?.status || 'Error',
                statusText: err.response?.statusText || err.message,
                data: err.response?.data || null
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">

                {/* Sidebar: Endpoints & Project Select */}
                <div className="w-full lg:w-1/4 flex flex-col gap-6">
                    <div>
                        <label className="label">Target Project</label>
                        <div className="relative">
                            <select
                                value={selectedProject?._id}
                                onChange={e => setSelectedProject(projects.find(p => p._id === e.target.value))}
                                className="input w-full appearance-none cursor-pointer"
                            >
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <ChevronRight className="rotate-90" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        <label className="label">Available Endpoints</label>
                        {ENDPOINTS.map((endpoint, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedEndpoint(endpoint);
                                    setResponse(null);
                                }}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedEndpoint === endpoint
                                    ? 'bg-violet-500/10 border-violet-500/50 text-white'
                                    : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {endpoint.method}
                                    </span>
                                    {selectedEndpoint === endpoint && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                                </div>
                                <div className="font-mono text-sm truncate opacity-80 mb-1">{endpoint.path}</div>
                                <div className="text-xs opacity-60 line-clamp-2">{endpoint.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Playground Area */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="glass-card flex-1 flex flex-col overflow-hidden !p-0">
                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-4">
                            <div className={`font-mono font-bold ${selectedEndpoint.method === 'GET' ? 'text-blue-400' : 'text-green-400'}`}>
                                {selectedEndpoint.method}
                            </div>
                            <div className="flex-1 font-mono text-sm text-zinc-300 truncate">
                                {getFullUrl()}
                            </div>

                            {/* Auth Toggle */}
                            <button
                                onClick={() => setUseAuth(!useAuth)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${useAuth
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                                    }`}
                                title={useAuth ? "Sending with Auth Headers" : "Sending Public Request"}
                            >
                                {useAuth ? 'Auth: ON' : 'Auth: OFF'}
                            </button>

                            <button
                                onClick={() => handleCopy(getFullUrl(), 'url')}
                                className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors relative"
                                title="Copy URL"
                            >
                                {copied === 'url' ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                            </button>
                            <button
                                onClick={executeRequest}
                                disabled={loading || !selectedProject}
                                className="btn btn-primary px-6 py-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={18} fill="currentColor" />}
                                <span className="hidden sm:inline">{loading ? 'Running' : 'Send'}</span>
                            </button>
                        </div>

                        {/* Content Split */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Inputs Column */}
                            <div className="flex-1 border-r border-white/5 overflow-y-auto p-6 space-y-6">
                                <div>
                                    <h3 className="label flex items-center justify-between">
                                        Request Parameters
                                        <button
                                            onClick={() => handleCopy(getCurlCommand(), 'curl')}
                                            className="ml-auto text-xs normal-case text-violet-400 hover:text-violet-300 flex items-center gap-1"
                                        >
                                            <Code size={12} /> Copy as cURL {copied === 'curl' && <Check size={12} />}
                                        </button>
                                    </h3>

                                    {selectedEndpoint.method === 'GET' ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {selectedEndpoint.params.filter(p => p.type === 'query').map(param => (
                                                <div key={param.name}>
                                                    <label className="text-xs text-zinc-500 mb-1 block">{param.name} {param.required && '*'}</label>
                                                    <input
                                                        value={params[param.name] || ''}
                                                        onChange={e => setParams({ ...params, [param.name]: e.target.value })}
                                                        placeholder={param.desc}
                                                        className="input w-full py-2 text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-64 lg:h-96">
                                            <textarea
                                                value={body}
                                                onChange={e => setBody(e.target.value)}
                                                className="input w-full h-full font-mono text-xs resize-none leading-relaxed"
                                                spellCheck="false"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="label mb-3">Expected Response</h3>
                                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                        <pre className="text-xs text-zinc-500 break-all whitespace-pre-wrap font-mono">
                                            {JSON.stringify(selectedEndpoint.exampleResponse, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Response Column */}
                            <div className="flex-1 bg-black/20 overflow-hidden flex flex-col">
                                <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between">
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Real Response</div>
                                    {response && (
                                        <div className={`text-xs font-mono px-2 py-0.5 rounded ${response.status >= 200 && response.status < 300
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {response.status} {response.statusText}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-4 overflow-auto">
                                    {response ? (
                                        <pre className="text-sm font-mono text-blue-300 pointer-events-none select-text">
                                            {JSON.stringify(response.data, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <FileJson size={32} className="opacity-50" />
                                            </div>
                                            <p className="text-sm">Ready to test. Hit Send!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
