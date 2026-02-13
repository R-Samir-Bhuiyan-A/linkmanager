export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}

export default function middleware(request) {
    const url = new URL(request.url);
    const hostname = request.headers.get('host');

    // Logic for api.dlm.lol
    if (hostname === 'api.dlm.lol') {
        // If the request is NOT for the API or V1, we should probably block it or 404 it
        // because this domain is strictly for the backend.
        if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/v1') && !url.pathname.startsWith('/server')) {
            // We can rewrite to a 404 page or just return a simple response
            // Since this is edge middleware, we can just let Vercel handle the rewrite
            // OR we can rewrite to a non-existent path to force 404
            // But wait, the standard routes would pick it up and show frontend.
            // So we MUST rewrite to something that is definitely not the frontend.
            url.pathname = '/404'; // Assuming we don't have a /404 api route
            return Response.redirect(url); // Or rewrite? Rewrite is better for user experience but redirect is clearer for domains.
        }
    }

    // Logic for dashboard.dlm.lol (Frontend)
    if (hostname === 'dashboard.dlm.lol' || hostname === 'dlm.lol') {
        // If the frontend tries to access /api directly, maybe we allow it (for debugging)?
        // Or strictly force them to use api.dlm.lol?
        // User asked: "only run the api on api.dlm.lol"
        // So if someone accesses dashboard.dlm.lol/api, maybe we should redirect them to api.dlm.lol?
        if (url.pathname.startsWith('/api') || url.pathname.startsWith('/v1')) {
            url.hostname = 'api.dlm.lol';
            return Response.redirect(url);
        }
    }
}
