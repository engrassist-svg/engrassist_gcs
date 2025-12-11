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

// Rate limiting configuration
const RATE_LIMITS = {
  auth: { max: 5, window: 60000 }, // 5 requests per minute for auth endpoints
  api: { max: 60, window: 60000 }, // 60 requests per minute for API endpoints
};

// In-memory rate limit store (consider using KV for production)
const rateLimitStore = new Map();

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
      // Auth endpoints
      if (path === '/api/auth/signup') {
        return await handleSignup(request, env);
      } else if (path === '/api/auth/signin') {
        return await handleSignin(request, env);
      } else if (path === '/api/auth/google') {
        return await handleGoogleAuth(request, env);
      } else if (path === '/api/auth/forgot-password') {
        return await handleForgotPassword(request, env);
      } else if (path === '/api/auth/reset-password') {
        return await handleResetPassword(request, env);
      } else if (path === '/api/auth/change-password') {
        return await handleChangePassword(request, env);
      }
      // User profile endpoints
      else if (path === '/api/user/profile') {
        return await handleUserProfile(request, env);
      }
      // Project endpoints
      else if (path === '/api/projects') {
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

  // Validate password strength
  if (password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
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
    'INSERT INTO users (id, email, name, password_hash, auth_provider, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(userId, email, name || email.split('@')[0], passwordHash, 'email', Date.now()).run();

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
 * Forgot password - send reset token
 */
async function handleForgotPassword(request, env) {
  const { email } = await request.json();

  if (!email) {
    return jsonResponse({ error: 'Email required' }, 400);
  }

  // Check rate limit
  const rateLimitKey = `forgot-password:${email}`;
  if (!checkRateLimit(rateLimitKey, RATE_LIMITS.auth)) {
    return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429);
  }

  // Get user
  const user = await env.DB.prepare(
    'SELECT id, email, name FROM users WHERE email = ?'
  ).bind(email).first();

  // Always return success to prevent email enumeration
  if (!user) {
    return jsonResponse({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  }

  // Generate secure reset token
  const resetToken = crypto.randomUUID() + '-' + crypto.randomUUID();
  const tokenId = crypto.randomUUID();
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour expiry

  // Save token to database
  await env.DB.prepare(
    'INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(tokenId, user.id, resetToken, expiresAt, Date.now()).run();

  // In production, send email with reset link
  // For now, we'll return the token in the response (DEV ONLY)
  // TODO: Integrate with email service (SendGrid, Mailgun, etc.)

  const resetLink = `${env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  console.log(`Password reset requested for ${email}`);
  console.log(`Reset link: ${resetLink}`);

  return jsonResponse({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
    // DEV ONLY - remove in production
    resetToken: resetToken,
    resetLink: resetLink
  });
}

/**
 * Reset password with token
 */
async function handleResetPassword(request, env) {
  const { token, newPassword } = await request.json();

  if (!token || !newPassword) {
    return jsonResponse({ error: 'Token and new password required' }, 400);
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
  }

  // Find valid token
  const resetToken = await env.DB.prepare(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?'
  ).bind(token, Date.now()).first();

  if (!resetToken) {
    return jsonResponse({ error: 'Invalid or expired reset token' }, 400);
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user password
  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
  ).bind(passwordHash, Date.now(), resetToken.user_id).run();

  // Mark token as used
  await env.DB.prepare(
    'UPDATE password_reset_tokens SET used = 1 WHERE id = ?'
  ).bind(resetToken.id).run();

  // Delete all other reset tokens for this user
  await env.DB.prepare(
    'DELETE FROM password_reset_tokens WHERE user_id = ? AND id != ?'
  ).bind(resetToken.user_id, resetToken.id).run();

  return jsonResponse({
    success: true,
    message: 'Password has been reset successfully'
  });
}

/**
 * Change password for logged-in user
 */
async function handleChangePassword(request, env) {
  const userId = await authenticateRequest(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return jsonResponse({ error: 'Current password and new password required' }, 400);
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return jsonResponse({ error: 'New password must be at least 8 characters' }, 400);
  }

  // Get user
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!user || !user.password_hash) {
    return jsonResponse({ error: 'Cannot change password for this account' }, 400);
  }

  // Verify current password
  const valid = await verifyPassword(currentPassword, user.password_hash);
  if (!valid) {
    return jsonResponse({ error: 'Current password is incorrect' }, 401);
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
  ).bind(passwordHash, Date.now(), userId).run();

  // Invalidate all password reset tokens
  await env.DB.prepare(
    'DELETE FROM password_reset_tokens WHERE user_id = ?'
  ).bind(userId).run();

  return jsonResponse({
    success: true,
    message: 'Password changed successfully'
  });
}

/**
 * Handle user profile (GET and PUT)
 */
async function handleUserProfile(request, env) {
  const userId = await authenticateRequest(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (request.method === 'GET') {
    // Get user profile
    const user = await env.DB.prepare(
      'SELECT id, email, name, photo_url, auth_provider, created_at, updated_at FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404);
    }

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photo_url,
        authProvider: user.auth_provider,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } else if (request.method === 'PUT') {
    // Update user profile
    const { name, photoURL } = await request.json();

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (photoURL !== undefined) {
      updates.push('photo_url = ?');
      params.push(photoURL);
    }

    if (updates.length === 0) {
      return jsonResponse({ error: 'No updates provided' }, 400);
    }

    updates.push('updated_at = ?');
    params.push(Date.now());
    params.push(userId);

    await env.DB.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();

    // Get updated user
    const user = await env.DB.prepare(
      'SELECT id, email, name, photo_url FROM users WHERE id = ?'
    ).bind(userId).first();

    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photo_url
      }
    });
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
 * Hash password using PBKDF2 (more secure than SHA-256)
 * Format: salt:hash
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();

  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100k iterations for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Convert to hex and combine with salt
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify password against PBKDF2 hash
 * Also supports legacy SHA-256 hashes for backwards compatibility
 */
async function verifyPassword(password, storedHash) {
  const encoder = new TextEncoder();

  // Check if it's a legacy SHA-256 hash (no colon)
  if (!storedHash.includes(':')) {
    // Legacy SHA-256 verification
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex === storedHash;
  }

  // PBKDF2 verification
  const [saltHex, hashHex] = storedHash.split(':');

  // Convert salt from hex
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using same parameters
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Compare hashes
  const computedHashHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHashHex === hashHex;
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
 * Check rate limit for a given key
 */
function checkRateLimit(key, limit) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetAt: now + limit.window };

  if (now > record.resetAt) {
    // Reset the window
    record.count = 0;
    record.resetAt = now + limit.window;
  }

  record.count++;
  rateLimitStore.set(key, record);

  return record.count <= limit.max;
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
