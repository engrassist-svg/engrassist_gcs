/**
 * Cloudflare Worker for EngrAssist
 * Handles authentication and project storage
 * Uses D1 database for persistence
 */

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Main request handler
 */
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route requests
      if (path === '/api/auth/signup') {
        return await handleSignup(request, env);
      } else if (path === '/api/auth/signin') {
        return await handleSignin(request, env);
      } else if (path === '/api/auth/google') {
        return await handleGoogleAuth(request, env);
      } else if (path === '/api/projects') {
        return await handleProjects(request, env);
      } else if (path.startsWith('/api/projects/')) {
        return await handleProjectById(request, env, path);
      } else {
        return jsonResponse({ error: 'Not found' }, 404);
      }
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
};

/**
 * Sign up new user
 */
async function handleSignup(request, env) {
  const { email, password, name } = await request.json();

  // Validate input
  if (!email || !password) {
    return jsonResponse({ error: 'Email and password required' }, 400);
  }

  // Check if user exists
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first();

  if (existing) {
    return jsonResponse({ error: 'User already exists' }, 409);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const userId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId, email, name || email.split('@')[0], passwordHash, Date.now()).run();

  // Generate JWT token
  const token = await generateToken(userId, email, env);

  return jsonResponse({
    success: true,
    user: { id: userId, email, name: name || email.split('@')[0] },
    token,
  });
}

/**
 * Sign in existing user
 */
async function handleSignin(request, env) {
  const { email, password } = await request.json();

  // Get user
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();

  if (!user) {
    return jsonResponse({ error: 'Invalid credentials' }, 401);
  }

  // Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return jsonResponse({ error: 'Invalid credentials' }, 401);
  }

  // Generate JWT token
  const token = await generateToken(user.id, user.email, env);

  return jsonResponse({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
}

/**
 * Google OAuth authentication
 */
async function handleGoogleAuth(request, env) {
  const { idToken, email, name, photoURL } = await request.json();

  // In production, verify the Google ID token
  // For now, we'll trust the client-side verification

  // Check if user exists
  let user = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();

  if (!user) {
    // Create new user
    const userId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, photo_url, auth_provider, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(userId, email, name, photoURL, 'google', Date.now()).run();

    user = { id: userId, email, name, photo_url: photoURL };
  }

  // Generate JWT token
  const token = await generateToken(user.id, user.email, env);

  return jsonResponse({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photo_url
    },
    token,
  });
}

/**
 * Handle projects endpoint (GET all, POST new)
 */
async function handleProjects(request, env) {
  const userId = await authenticateRequest(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (request.method === 'GET') {
    // Get all projects for user
    const { results } = await env.DB.prepare(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC'
    ).bind(userId).all();

    return jsonResponse({ projects: results });
  } else if (request.method === 'POST') {
    // Create new project
    const projectData = await request.json();
    const projectId = projectData.projectId || crypto.randomUUID();

    await env.DB.prepare(
      'INSERT OR REPLACE INTO projects (id, user_id, data, updated_at) VALUES (?, ?, ?, ?)'
    ).bind(projectId, userId, JSON.stringify(projectData), Date.now()).run();

    return jsonResponse({ success: true, projectId });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

/**
 * Handle individual project (GET, PUT, DELETE)
 */
async function handleProjectById(request, env, path) {
  const userId = await authenticateRequest(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const projectId = path.split('/').pop();

  if (request.method === 'GET') {
    const project = await env.DB.prepare(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?'
    ).bind(projectId, userId).first();

    if (!project) {
      return jsonResponse({ error: 'Project not found' }, 404);
    }

    return jsonResponse({ project: JSON.parse(project.data) });
  } else if (request.method === 'DELETE') {
    await env.DB.prepare(
      'DELETE FROM projects WHERE id = ? AND user_id = ?'
    ).bind(projectId, userId).run();

    return jsonResponse({ success: true });
  } else if (request.method === 'PUT') {
    const projectData = await request.json();

    await env.DB.prepare(
      'UPDATE projects SET data = ?, updated_at = ? WHERE id = ? AND user_id = ?'
    ).bind(JSON.stringify(projectData), Date.now(), projectId, userId).run();

    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

/**
 * Authenticate request using JWT
 */
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verifyToken(token, env);
    return payload.userId;
  } catch (error) {
    return null;
  }
}

/**
 * Generate JWT token
 */
async function generateToken(userId, email, env) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, env.JWT_SECRET);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT token
 */
async function verifyToken(token, env) {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  const validSignature = await sign(`${encodedHeader}.${encodedPayload}`, env.JWT_SECRET);
  if (signature !== validSignature) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64urlDecode(encodedPayload));

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}

/**
 * Hash password using Web Crypto API
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify password
 */
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Sign data using HMAC SHA-256
 */
async function sign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64urlEncode(signature);
}

/**
 * Base64 URL encode
 */
function base64urlEncode(data) {
  let str;
  if (typeof data === 'string') {
    str = btoa(unescape(encodeURIComponent(data)));
  } else {
    str = btoa(String.fromCharCode(...new Uint8Array(data)));
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(str)));
}

/**
 * JSON response helper
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
