import { useState } from 'react';
import { Book, Code, Copy, Check, Server, Key, Shield, Database, Activity } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useNotification } from '../context/NotificationContext';

export default function ApiDocs() {
    const [copiedId, setCopiedId] = useState(null);
    const { success } = useNotification();
    
    // Get the base API URL dynamically depending on where the app is hosted
    // Get the base API URL dynamically depending on where the app is hosted
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sections = [
        {
            id: 'auth',
            title: 'Authentication',
            icon: Shield,
            color: 'emerald',
            description: 'Learn how to authenticate with the API',
            endpoints: [
                {
                    method: 'POST',
                    path: '/api/auth/login',
                    description: 'Admin login - Get JWT token for admin panel access',
                    request: `{
  "username": "admin",
  "password": "your_password"
}`,
                    response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}`,
                    example: `curl -X POST ${baseUrl}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"your_password"}'`
                },
                {
                    method: 'INFO',
                    path: 'Client Authentication',
                    description: 'For client API endpoints (/v1/*), use x-client-id and x-secret headers',
                    request: `Headers:
x-client-id: pub_546e65fb3f5473d4
x-secret: sk_abc123... (Master Key or API Key)`,
                    response: `# Master Key: Full access to all project data
# API Key: Access based on key permissions
# No Auth: Only public fields returned`,
                    example: `# Using Master Key (Secret Key)
curl -X GET "${baseUrl}/v1/config/pub_546e65fb3f5473d4" \\
  -H "x-client-id: pub_546e65fb3f5473d4" \\
  -H "x-secret: sk_abc123..."

# Using API Key
curl -X GET "${baseUrl}/v1/config/pub_546e65fb3f5473d4" \\
  -H "x-client-id: pub_546e65fb3f5473d4" \\
  -H "x-secret: key_xyz789..."`
                }
            ]
        },
        {
            id: 'admin',
            title: 'Admin API',
            icon: Shield,
            color: 'violet',
            description: 'Manage projects, configurations, and system settings',
            endpoints: [
                {
                    method: 'GET',
                    path: '/api/projects',
                    description: 'List all projects',
                    response: `[
  {
    "_id": "698e02190f88071306b443d2",
    "name": "My Minecraft Plugin",
    "slug": "my-plugin",
    "publicId": "pub_546e65fb3f5473d4",
    "category": "minecraft-plugin",
    "latestVersion": "1.0.0",
    "maintenanceMode": false
  }
]`,
                    example: `curl -X GET ${baseUrl}/api/projects`
                },
                {
                    method: 'POST',
                    path: '/api/projects',
                    description: 'Create a new project',
                    request: `{
  "name": "My App",
  "slug": "my-app",
  "category": "web"
}`,
                    response: `{
  "_id": "...",
  "name": "My App",
  "publicId": "pub_abc123...",
  "secretKey": "sk_xyz789..."
}`,
                    example: `curl -X POST ${baseUrl}/api/projects \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My App","slug":"my-app","category":"web"}'`
                },
                {
                    method: 'PATCH',
                    path: '/api/projects/:id',
                    description: 'Update project settings',
                    request: `{
  "maintenanceMode": true,
  "latestVersion": "2.0.0"
}`,
                    example: `curl -X PATCH ${baseUrl}/api/projects/PROJECT_ID \\
  -H "Content-Type: application/json" \\
  -d '{"maintenanceMode":true}'`
                },
                {
                    method: 'DELETE',
                    path: '/api/projects/:id',
                    description: 'Delete a project',
                    example: `curl -X DELETE ${baseUrl}/api/projects/PROJECT_ID`
                }
            ]
        },
        {
            id: 'configs',
            title: 'Configuration API',
            icon: Database,
            color: 'blue',
            description: 'Manage environment-specific configurations',
            endpoints: [
                {
                    method: 'GET',
                    path: '/api/configs/project/:projectId',
                    description: 'Get all configs for a project',
                    response: `[
  {
    "_id": "...",
    "key": "api_url",
    "value": "https://api.example.com",
    "environment": "prod",
    "isEnabled": true
  }
]`,
                    example: `curl -X GET ${baseUrl}/api/configs/project/PROJECT_ID`
                },
                {
                    method: 'POST',
                    path: '/api/configs',
                    description: 'Create a new config',
                    request: `{
  "projectId": "698e02190f88071306b443d2",
  "key": "max_connections",
  "value": "100",
  "environment": "prod"
}`,
                    example: `curl -X POST ${baseUrl}/api/configs \\
  -H "Content-Type: application/json" \\
  -d '{"projectId":"...","key":"max_connections","value":"100"}'`
                }
            ]
        },
        {
            id: 'licenses',
            title: 'License API',
            icon: Key,
            color: 'amber',
            description: 'Generate and manage software licenses',
            endpoints: [
                {
                    method: 'POST',
                    path: '/api/licenses/generate',
                    description: 'Generate a new license key',
                    request: `{
  "projectId": "698e02190f88071306b443d2",
  "holderName": "John Doe",
  "email": "john@example.com",
  "type": "lifetime"
}`,
                    response: `{
  "_id": "...",
  "key": "PRO-4C61-E9C2-9F81",
  "status": "active",
  "hardwareId": null
}`,
                    example: `curl -X POST ${baseUrl}/api/licenses/generate \\
  -H "Content-Type: application/json" \\
  -d '{"projectId":"...","holderName":"John Doe","email":"john@example.com","type":"lifetime"}'`
                },
                {
                    method: 'GET',
                    path: '/api/licenses/project/:projectId',
                    description: 'List all licenses for a project',
                    example: `curl -X GET ${baseUrl}/api/licenses/project/PROJECT_ID`
                },
                {
                    method: 'PATCH',
                    path: '/api/licenses/:id/revoke',
                    description: 'Revoke a license',
                    example: `curl -X PATCH ${baseUrl}/api/licenses/LICENSE_ID/revoke`
                },
                {
                    method: 'PATCH',
                    path: '/api/licenses/:id/reset-hwid',
                    description: 'Reset hardware ID lock',
                    example: `curl -X PATCH ${baseUrl}/api/licenses/LICENSE_ID/reset-hwid`
                }
            ]
        },
        {
            id: 'client',
            title: 'Client API (Public)',
            icon: Server,
            color: 'emerald',
            description: 'Public endpoints for your applications',
            endpoints: [
                {
                    method: 'GET',
                    path: '/v1/config/:publicId',
                    description: 'Fetch project configuration',
                    params: 'Query: env, version, instanceId, hardwareId',
                    response: `{
  "project": {
    "name": "My Plugin",
    "latestVersion": "1.0.0",
    "updateUrl": "https://...",
    "updateRequired": false
  },
  "config": {
    "api_url": "https://api.example.com",
    "max_connections": "100"
  }
}`,
                    example: `# Without Authentication (public fields only)
curl -X GET "${baseUrl}/v1/config/pub_546e65fb3f5473d4?env=prod&version=1.0.0"

# With Master Key (full access)
curl -X GET "${baseUrl}/v1/config/pub_546e65fb3f5473d4?env=prod&version=1.0.0" \\
  -H "x-client-id: pub_546e65fb3f5473d4" \\
  -H "x-secret: sk_abc123..."`
                },
                {
                    method: 'POST',
                    path: '/v1/heartbeat/:publicId',
                    description: 'Send instance heartbeat',
                    request: `{
  "instanceId": "server-1",
  "hardwareId": "hw-abc123",
  "platform": "linux",
  "version": "1.0.0"
}`,
                    response: `{ "status": "ok" }`,
                    example: `curl -X POST ${baseUrl}/v1/heartbeat/pub_546e65fb3f5473d4 \\
  -H "Content-Type: application/json" \\
  -d '{"instanceId":"server-1","version":"1.0.0"}'`
                },
                {
                    method: 'POST',
                    path: '/v1/validate-license',
                    description: 'Validate a license key (HWID locking)',
                    request: `{
  "key": "PRO-4C61-E9C2-9F81",
  "hwid": "PC-1",
  "publicId": "pub_546e65fb3f5473d4"
}`,
                    response: `{
  "valid": true,
  "message": "Authorized",
  "license": {
    "holder": "John Doe",
    "type": "lifetime"
  }
}`,
                    example: `curl -X POST ${baseUrl}/v1/validate-license \\
  -H "Content-Type: application/json" \\
  -d '{"key":"PRO-...","hwid":"PC-1","publicId":"pub_..."}'`
                }
            ]
        },
        {
            id: 'analytics',
            title: 'Analytics API',
            icon: Activity,
            color: 'cyan',
            description: 'Track requests and monitor system health',
            endpoints: [
                {
                    method: 'GET',
                    path: '/api/analytics/overview',
                    description: 'Get system-wide analytics',
                    response: `{
  "totalRequests": 15234,
  "activeProjects": 12,
  "totalInstances": 45
}`,
                    example: `curl -X GET ${baseUrl}/api/analytics/overview`
                },
                {
                    method: 'GET',
                    path: '/api/analytics/audit',
                    description: 'Get audit log entries',
                    example: `curl -X GET ${baseUrl}/api/analytics/audit`
                }
            ]
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
        };
        return colors[color] || colors.violet;
    };

    const getMethodColor = (method) => {
        const colors = {
            GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            PATCH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
            INFO: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
        };
        return colors[method] || colors.GET;
    };

    return (
        <PageTransition>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Book className="text-violet-400" /> API Documentation
                    </h1>
                    <p className="text-zinc-400">Complete reference for all API endpoints</p>
                </div>
            </div>

            <div className="space-y-8">
                {sections.map(section => (
                    <div key={section.id} className="glass-card">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <div className={`p-2 rounded-lg ${getColorClasses(section.color)}`}>
                                <section.icon size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{section.title}</h2>
                                <p className="text-xs text-zinc-500">{section.description}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {section.endpoints.map((endpoint, idx) => (
                                <div key={idx} className="bg-black/20 border border-white/5 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getMethodColor(endpoint.method)}`}>
                                                {endpoint.method}
                                            </span>
                                            <code className="text-sm font-mono text-zinc-200">{endpoint.path}</code>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-400 mb-4">{endpoint.description}</p>

                                    {endpoint.params && (
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Parameters</div>
                                            <div className="text-xs text-zinc-400 font-mono">{endpoint.params}</div>
                                        </div>
                                    )}

                                    {endpoint.request && (
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Request Body</div>
                                            <div className="relative">
                                                <pre className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto">
                                                    <code>{endpoint.request}</code>
                                                </pre>
                                                <button
                                                    onClick={() => copyToClipboard(endpoint.request, `req-${idx}`)}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors"
                                                >
                                                    {copiedId === `req-${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-zinc-400" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {endpoint.response && (
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-zinc-500 uppercase mb-2">Response</div>
                                            <div className="relative">
                                                <pre className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto">
                                                    <code>{endpoint.response}</code>
                                                </pre>
                                                <button
                                                    onClick={() => copyToClipboard(endpoint.response, `res-${idx}`)}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors"
                                                >
                                                    {copiedId === `res-${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-zinc-400" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {endpoint.example && (
                                        <div>
                                            <div className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                                                <Code size={12} /> cURL Example
                                            </div>
                                            <div className="relative">
                                                <pre className="bg-black/60 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto">
                                                    <code>{endpoint.example}</code>
                                                </pre>
                                                <button
                                                    onClick={() => copyToClipboard(endpoint.example, `ex-${idx}`)}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors"
                                                >
                                                    {copiedId === `ex-${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-zinc-400" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </PageTransition>
    );
}
