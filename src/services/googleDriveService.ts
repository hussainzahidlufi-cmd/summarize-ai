import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Supported Drive Scopes as configured
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.appdata'
];

// Initialize Firebase App once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Workspace scopes
const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-Memory Access Token Cache (CRITICAL: Do NOT store in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

/**
 * Initialize Auth state listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token was cleared on page reload or expired, notify failure so user can reconnect
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign In with Google popup flow
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve cached in-memory access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Get cached user profile
 */
export const getCurrentUser = (): User | null => {
  return cachedUser || auth.currentUser;
};

/**
 * Logout and clear token cache
 */
export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

/**
 * Helper: Find or create app-dedicated folder in Google Drive
 */
export const getOrCreateAppFolder = async (
  folderName: string = 'SummarizeAI Notes & Transcripts'
): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Drive access token missing. Please sign in with Google.');

  try {
    // Check if folder exists
    const query = encodeURIComponent(
      `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return folderData.id;
    }
    return null;
  } catch (e) {
    console.warn('Folder check/create error:', e);
    return null;
  }
};

/**
 * Save text / markdown file to Google Drive using multipart upload
 */
export const saveTextFileToDrive = async ({
  name,
  content,
  mimeType = 'text/markdown',
  folderName = 'SummarizeAI Notes & Transcripts',
}: {
  name: string;
  content: string;
  mimeType?: string;
  folderName?: string;
}): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not connected to Google Drive. Please sign in with Google first.');

  // Find or create parent folder
  const folderId = await getOrCreateAppFolder(folderName);

  const metadata: any = {
    name,
    mimeType,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------SummarizeAIDriveBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result;
};

/**
 * List files from user's Google Drive with optional filter and search
 */
export const listDriveFiles = async ({
  query = '',
  fileType = 'all', // 'all' | 'media' | 'audio' | 'video' | 'notes'
  pageSize = 30,
}: {
  query?: string;
  fileType?: 'all' | 'media' | 'audio' | 'video' | 'notes';
  pageSize?: number;
}): Promise<DriveFileItem[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not connected to Google Drive. Please sign in with Google.');

  const conditions: string[] = ['trashed = false'];

  if (fileType === 'media') {
    conditions.push(
      "(mimeType contains 'video/' or mimeType contains 'audio/')"
    );
  } else if (fileType === 'audio') {
    conditions.push("mimeType contains 'audio/'");
  } else if (fileType === 'video') {
    conditions.push("mimeType contains 'video/'");
  } else if (fileType === 'notes') {
    conditions.push(
      "(mimeType contains 'text/' or mimeType = 'application/vnd.google-apps.document' or name contains '.md' or name contains '.txt')"
    );
  }

  if (query.trim()) {
    conditions.push(`name contains '${query.trim().replace(/'/g, "\\'")}'`);
  }

  const q = encodeURIComponent(conditions.join(' and '));
  const fields = encodeURIComponent(
    'files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink)'
  );

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=${pageSize}&orderBy=modifiedTime desc&fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list Google Drive files (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Download a file from Google Drive as Blob (or text if Google Doc)
 */
export const downloadDriveFileBlob = async (
  fileId: string,
  mimeType: string
): Promise<{ blob: Blob; fileName?: string; textContent?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not connected to Google Drive. Please sign in.');

  // If it is a native Google Doc, export it as plain text
  if (mimeType === 'application/vnd.google-apps.document') {
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!exportRes.ok) throw new Error('Failed to export Google Doc');
    const text = await exportRes.text();
    const blob = new Blob([text], { type: 'text/plain' });
    return { blob, textContent: text };
  }

  // Regular media / binary / text file
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to download file from Google Drive: ${err}`);
  }

  const blob = await response.blob();
  return { blob };
};

/**
 * Delete a file from Google Drive (DESTRUCTIVE OPERATION)
 * Note: Must be guarded by an explicit user confirmation modal in UI!
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not connected to Google Drive.');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.text();
    throw new Error(`Failed to delete file from Google Drive: ${err}`);
  }

  return true;
};
