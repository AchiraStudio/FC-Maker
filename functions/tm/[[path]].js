export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Extract everything after /tm/
  // The pathname might be /tm/something
  const pathPrefix = '/tm';
  let targetPath = url.pathname;
  if (targetPath.startsWith(pathPrefix)) {
    targetPath = targetPath.slice(pathPrefix.length);
  }
  
  const targetUrl = new URL(`${targetPath}${url.search}`, 'https://www.transfermarkt.com');
  
  const newHeaders = new Headers(request.headers);
  newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  newHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
  newHeaders.set('Accept-Language', 'en-US,en;q=0.9');
  newHeaders.set('Cache-Control', 'no-cache');
  // Remove origin/referer to avoid being blocked if needed
  newHeaders.delete('Origin');
  newHeaders.delete('Referer');
  
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual' // so we can handle redirects ourselves
    });
    
    // Create a new response to allow header modification
    const newResponse = new Response(response.body, response);
    
    newResponse.headers.set('X-Proxy-Final-URL', response.url);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Expose-Headers', 'X-Proxy-Final-URL, X-Redirected-To');

    if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.has('location')) {
      let loc = response.headers.get('location');
      if (loc.startsWith('/')) {
        newResponse.headers.set('location', '/tm' + loc);
      } else if (loc.startsWith('https://www.transfermarkt.com')) {
        newResponse.headers.set('location', loc.replace('https://www.transfermarkt.com', '/tm'));
      }
      newResponse.headers.set('X-Redirected-To', newResponse.headers.get('location'));
    }
    
    return newResponse;
  } catch (error) {
    return new Response(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
