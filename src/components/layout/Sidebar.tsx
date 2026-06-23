'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MessageSquarePlus,
  Pin,
  MoreVertical,
  Edit3,
  Share2,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const {
    sessions,
    activeSessionId,
    isLoadingSessions,
    startNewChat,
    setActiveSession,
    deleteSession,
    renameSession,
    pinSession,
    shareSession,
  } = useChatStore();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Inline rename state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.is_pinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.is_pinned);

  const handleNewChat = () => {
    startNewChat();
  };

  const handleInlineRename = (sessionId: string) => {
    const trimmed = editTitleValue.trim();
    if (trimmed) {
      const originalSession = sessions.find((s) => s.id === sessionId);
      if (originalSession && trimmed !== originalSession.title) {
        renameSession(sessionId, trimmed);
      }
    }
    setEditingSessionId(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      const wasActive = activeSessionId === deleteTarget;
      deleteSession(deleteTarget);
      if (wasActive) {
        router.push('/');
      }
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleShare = async (sessionId: string) => {
    const shareUrl = `${window.location.origin}/share/${sessionId}`;
    try {
      await shareSession(sessionId);
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Tautan berhasil disalin ke papan klip!');
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Tautan berhasil disalin ke papan klip!');
    }
  };

  const ChatItem = ({ session }: { session: typeof sessions[0] }) => {
    const isEditing = editingSessionId === session.id;

    return (
      <div
        className={cn(
          'group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
          activeSessionId === session.id
            ? 'bg-blue-50 dark:bg-[#1e293b] text-blue-700 dark:text-blue-400'
            : 'text-slate-750 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#1e293b]'
        )}
        onClick={() => {
          if (!isEditing) {
            setActiveSession(session.id);
          }
        }}
      >
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onBlur={() => handleInlineRename(session.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineRename(session.id);
                } else if (e.key === 'Escape') {
                  setEditingSessionId(null);
                }
              }}
              className="w-full px-2 py-0.5 text-sm bg-white dark:bg-gray-800 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-gray-150 font-medium"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm font-medium truncate">{session.title}</p>
          )}
        </div>
        {session.is_pinned && !isEditing && (
          <Pin className="h-3 w-3 text-blue-500 shrink-0" />
        )}
        {!isEditing && (
          <div
            className={cn(
              'transition-opacity shrink-0',
              activeSessionId === session.id
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              align="right"
              menuClassName="bg-[#1A1F2C] border border-gray-800 rounded-xl p-1.5 shadow-xl min-w-0 w-52 z-50"
              trigger={
                <div
                  className={cn(
                    'p-1 rounded-lg transition-colors cursor-pointer',
                    activeSessionId === session.id
                      ? 'hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400'
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </div>
              }
            >
              {(close) => (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      handleShare(session.id);
                      close();
                    }}
                    className="w-full flex items-center text-sm text-gray-300 hover:bg-gray-800/60 rounded-lg p-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Bagikan percakapan
                  </button>
                  <button
                    onClick={() => {
                      pinSession(session.id);
                      close();
                    }}
                    className="w-full flex items-center text-sm text-gray-300 hover:bg-gray-800/60 rounded-lg p-2 transition-colors cursor-pointer"
                  >
                    <Pin className="w-4 h-4 mr-2" />
                    {session.is_pinned ? 'Lepaskan pin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingSessionId(session.id);
                      setEditTitleValue(session.title);
                      close();
                    }}
                    className="w-full flex items-center text-sm text-gray-300 hover:bg-gray-800/60 rounded-lg p-2 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Ganti nama
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget(session.id);
                      setDeleteModalOpen(true);
                      close();
                    }}
                    className="w-full flex items-center text-sm text-red-400 hover:bg-gray-800/60 rounded-lg p-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-400" />
                    Hapus
                  </button>
                </div>
              )}
            </Dropdown>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-full bg-slate-100/90 border-r border-slate-200 dark:bg-[#0b0f19] dark:border-slate-800 flex flex-col overflow-hidden shrink-0 transition-colors duration-200"
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-50">Chats</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleNewChat}
                    className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-200/80 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Percakapan baru"
                  >
                    <MessageSquarePlus className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onToggle}
                    aria-label="Tutup sidebar"
                    className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-200/80 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    title="Tutup sidebar"
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white text-slate-900 border border-slate-250 dark:bg-[#1e293b] dark:text-zinc-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
              {isLoadingSessions ? (
                <div className="space-y-2 px-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {pinnedSessions.length > 0 && (
                    <div className="mb-2">
                      <p className="px-3 py-1 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        Pinned
                      </p>
                      {pinnedSessions.map((s) => (
                        <ChatItem key={s.id} session={s} />
                      ))}
                    </div>
                  )}
                  {unpinnedSessions.length > 0 && (
                    <div>
                      {pinnedSessions.length > 0 && (
                        <p className="px-3 py-1 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                          Recent
                      </p>
                      )}
                      {unpinnedSessions.map((s) => (
                        <ChatItem key={s.id} session={s} />
                      ))}
                    </div>
                  )}
                  {filteredSessions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        {searchQuery ? 'No chats found.' : 'No chats yet.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User Footer */}
            {user && (
              <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-850 dark:text-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm shrink-0">
                    {user.full_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-450 truncate">{user.email || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed hover zone + toggle */}
      {!isOpen && (
        <div className="group/toggle fixed left-0 top-14 h-[calc(100vh-56px)] w-12 z-40">
          <button
            onClick={onToggle}
            aria-label="Buka sidebar"
            className="absolute left-2 top-3 h-10 w-10 rounded-xl bg-white dark:bg-[#1a1f2c] border border-slate-200 dark:border-slate-800 shadow-md text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer flex items-center justify-center opacity-0 pointer-events-none group-hover/toggle:opacity-100 group-hover/toggle:pointer-events-auto"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Chat"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this chat? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
