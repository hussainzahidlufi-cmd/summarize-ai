import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileVideo,
  FileAudio,
  FileText,
  File,
  Search,
  ExternalLink,
  Trash2,
  RefreshCw,
  Sparkles,
  CloudUpload,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react';
import {
  DriveFileItem,
  listDriveFiles,
  downloadDriveFileBlob,
  deleteDriveFile,
  googleSignIn,
  logout,
  getAccessToken,
  getCurrentUser
} from '../services/googleDriveService';
import { User } from 'firebase/auth';

interface DriveExplorerProps {
  user: User | null;
  onSelectFileForSummarize: (payload: {
    fileData: string;
    mimeType: string;
    fileName: string;
    type: 'file';
  }) => void;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const DriveExplorer: React.FC<DriveExplorerProps> = ({
  user,
  onSelectFileForSummarize,
  onSignIn,
  onSignOut,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'media' | 'notes'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Destructive Action Confirmation Modal State (MANDATORY per Workspace Skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const items = await listDriveFiles({
        query: searchQuery,
        fileType: filterType,
        pageSize: 40,
      });
      setFiles(items);
    } catch (err: any) {
      console.error('Failed to list files:', err);
      setError(err?.message || 'Could not load files from Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFiles();
    } else {
      setFiles([]);
    }
  }, [user, filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles();
  };

  // Process file for summarization
  const handleProcessDriveFile = async (item: DriveFileItem) => {
    setDownloadingId(item.id);
    setError(null);
    try {
      const { blob, textContent } = await downloadDriveFileBlob(item.id, item.mimeType);

      if (textContent) {
        // Plain text / exported Google Doc
        const base64 = 'data:text/plain;base64,' + btoa(unescape(encodeURIComponent(textContent)));
        onSelectFileForSummarize({
          fileData: base64,
          mimeType: 'text/plain',
          fileName: item.name,
          type: 'file',
        });
      } else {
        // Audio / Video binary blob
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onSelectFileForSummarize({
            fileData: base64,
            mimeType: item.mimeType || 'video/mp4',
            fileName: item.name,
            type: 'file',
          });
        };
        reader.readAsDataURL(blob);
      }
    } catch (err: any) {
      console.error('Error importing file from Google Drive:', err);
      setError(err?.message || 'Failed to download file from Google Drive for summarization.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Confirmed Deletion (Destructive Operation Confirmation)
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setSuccessMessage(`"${fileToDelete.name}" was deleted from your Google Drive.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setFileToDelete(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string, name: string) => {
    if (mimeType.includes('video') || name.endsWith('.mp4') || name.endsWith('.mkv')) {
      return <FileVideo className="w-5 h-5 text-indigo-600" />;
    }
    if (mimeType.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a')) {
      return <FileAudio className="w-5 h-5 text-emerald-600" />;
    }
    if (mimeType.includes('document') || mimeType.includes('text') || name.endsWith('.md') || name.endsWith('.txt')) {
      return <FileText className="w-5 h-5 text-amber-600" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '';
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return '';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Google Drive Cloud Storage
                </h2>
                {user && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Save lecture notes, study summaries, and transcripts directly to your Google Drive, or pick recorded media to summarize.
              </p>
            </div>
          </div>

          <div>
            {!user ? (
              <button
                onClick={onSignIn}
                className="gsi-material-button inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Sign in with Google</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800">
                      {user.displayName || 'Google User'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Main Files Panel */}
      {user ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Files
              </button>
              <button
                onClick={() => setFilterType('media')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterType === 'media'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Audio & Video
              </button>
              <button
                onClick={() => setFilterType('notes')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterType === 'notes'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Transcripts & Notes
              </button>
            </div>

            {/* Search and Refresh */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </form>

              <button
                onClick={fetchFiles}
                disabled={isLoading}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh Drive Files"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* File List */}
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
              <p className="text-xs text-slate-600">Loading files from your Google Drive...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Folder className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No files found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No matching files found in your Google Drive. Save summaries or upload videos to process them here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {files.map((file) => {
                const isMedia =
                  file.mimeType.includes('video') ||
                  file.mimeType.includes('audio') ||
                  file.name.endsWith('.mp4') ||
                  file.name.endsWith('.mkv') ||
                  file.name.endsWith('.mp3') ||
                  file.name.endsWith('.wav');
                const isDownloading = downloadingId === file.id;

                return (
                  <div
                    key={file.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                        {getFileIcon(file.mimeType, file.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {file.size && <span>{formatFileSize(file.size)}</span>}
                          {file.size && <span>•</span>}
                          <span>Modified {formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Process with Gemini Summarizer button */}
                      <button
                        onClick={() => handleProcessDriveFile(file)}
                        disabled={isDownloading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isMedia
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                        title="Import and Summarize with Gemini"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Importing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isMedia ? 'Summarize Media' : 'Process File'}</span>
                          </>
                        )}
                      </button>

                      {/* Open in Google Drive */}
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* Delete File (Triggers Mandatory Confirmation Modal) */}
                      <button
                        onClick={() => setFileToDelete(file)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete from Google Drive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Signed Out State */
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
            <HardDrive className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900">
            Connect Your Google Drive
          </h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Sign in with Google to automatically back up your Roman Urdu study notes, transcripts, and SMC cheat-sheets to Google Drive, or pick recorded trading lectures directly from cloud storage.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Delete from Google Drive?
                </h3>
                <p className="text-xs text-slate-500">
                  This action mutates your Google Drive data.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold block truncate">File: {fileToDelete.name}</span>
              <span className="text-slate-500 text-[11px] block mt-1">
                Type: {fileToDelete.mimeType}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this file from your Google Drive? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
