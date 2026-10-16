'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Send,
  Archive,
  Volume2,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';

import { api } from '@/lib/api';

interface AdminPhrase {
  id: number;
  scenario_id: number;
  kannada_text: string;
  english_meaning: string;
  transliteration: string;
  status: 'draft' | 'under_review' | 'approved' | 'published' | 'archived' | 'rejected';
  created_at: string | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  draft: {
    label: 'Draft',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-700/50',
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-sky-950/40',
    text: 'text-sky-400',
    border: 'border-sky-700/50',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-400',
    border: 'border-indigo-700/50',
  },
  published: {
    label: 'Published',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-700/50',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-slate-900',
    text: 'text-slate-400',
    border: 'border-slate-700',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-700/50',
  },
};

export default function AdminPortalPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phrases, setPhrases] = useState<AdminPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Phrase Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenarioId, setNewScenarioId] = useState<number>(1);
  const [newKannada, setNewKannada] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newTransliteration, setNewTransliteration] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newFormalityNote, setNewFormalityNote] = useState('');

  const getAuthHeader = useCallback(() => {
    return 'Basic ' + btoa(`${username}:${password}`);
  }, [username, password]);

  const loadPhrases = useCallback(async () => {
    if (!username || !password) {
      setError('Please enter your administrator username and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(api.admin.content(), {
        headers: {
          Authorization: getAuthHeader(),
        },
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setError('Invalid administrator username or password. Please verify your credentials.');
        return;
      }
      if (!res.ok) {
        throw new Error(`Error ${res.status}: Failed to fetch admin content`);
      }
      const data = await res.json();
      setPhrases(data.phrases || []);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend API';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [username, password, getAuthHeader]);

  useEffect(() => {
    if (username && password) {
      loadPhrases();
    }
  }, [username, password, loadPhrases]);

  const handleAction = async (endpointUrl: string, method = 'POST', body?: unknown) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(endpointUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Action failed (${res.status})`);
      }

      setSuccessMsg('Status transitioned successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadPhrases();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg);
    }
  };

  const handleCreatePhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(api.admin.createPhrase(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          scenario_id: Number(newScenarioId),
          kannada_text: newKannada,
          english_meaning: newEnglish,
          transliteration: newTransliteration,
          context: newContext || null,
          example: newExample || null,
          formality_note: newFormalityNote || null,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to create phrase');
      }

      setSuccessMsg('New phrase created in Draft state!');
      setShowCreateModal(false);
      // Reset form
      setNewKannada('');
      setNewEnglish('');
      setNewTransliteration('');
      setNewContext('');
      setNewExample('');
      setNewFormalityNote('');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadPhrases();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create phrase';
      setError(msg);
    }
  };

  const speakKannada = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'kn-IN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtered phrases
  const filteredPhrases = useMemo(() => {
    return phrases.filter((p) => {
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchSearch =
        searchQuery === '' ||
        p.kannada_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.english_meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.transliteration.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [phrases, selectedStatus, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: phrases.length,
      draft: 0,
      under_review: 0,
      approved: 0,
      published: 0,
      archived: 0,
    };
    phrases.forEach((p) => {
      if (res[p.status] !== undefined) res[p.status]++;
    });
    return res;
  }, [phrases]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Content Workflow & Admin Portal
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Lifecycle management: Draft &rarr; Under Review &rarr; Approved &rarr; Published &rarr; Archived
          </p>
        </div>

        {/* Credentials Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-900 p-2 border border-slate-800 text-xs">
          <span
            className={`h-2.5 w-2.5 rounded-full ml-1 ${
              isAuthenticated ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'
            }`}
            title={isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          />
          <Lock className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-24 rounded bg-slate-800 px-2 py-1 text-slate-200 outline-none focus:ring-1 focus:ring-amber-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-24 rounded bg-slate-800 px-2 py-1 text-slate-200 outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={loadPhrases}
            className="rounded bg-amber-500 px-3 py-1 font-semibold text-slate-950 hover:bg-amber-400 transition"
          >
            Authenticate
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-800/60 bg-rose-950/40 p-4 text-sm text-rose-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-4 text-sm text-emerald-300">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="flex-1">{successMsg}</p>
        </div>
      )}

      {/* Lifecycle Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { key: 'all', label: 'Total Content', count: counts.all, color: 'text-white' },
          { key: 'draft', label: 'Draft', count: counts.draft, color: 'text-amber-400' },
          { key: 'under_review', label: 'Under Review', count: counts.under_review, color: 'text-sky-400' },
          { key: 'approved', label: 'Approved', count: counts.approved, color: 'text-indigo-400' },
          { key: 'published', label: 'Published', count: counts.published, color: 'text-emerald-400' },
          { key: 'archived', label: 'Archived', count: counts.archived, color: 'text-slate-400' },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setSelectedStatus(stat.key)}
            className={`flex flex-col rounded-xl border p-4 text-left transition ${
              selectedStatus === stat.key
                ? 'border-amber-500 bg-slate-800/90 shadow-md shadow-amber-500/10'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-medium text-slate-400">{stat.label}</span>
            <span className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</span>
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrase, meaning, or transliteration..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPhrases}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Phrase</span>
          </button>
        </div>
      </div>

      {/* Phrases Table / List */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3.5">ID</th>
                <th scope="col" className="px-4 py-3.5">Kannada & Meaning</th>
                <th scope="col" className="px-4 py-3.5">Transliteration</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {filteredPhrases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No phrases found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredPhrases.map((p) => {
                  const conf = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">#{p.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakKannada(p.kannada_text)}
                            title="Hear pronunciation"
                            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <div>
                            <div className="text-base font-semibold text-white">
                              {p.kannada_text}
                            </div>
                            <div className="text-xs text-slate-400">{p.english_meaning}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-amber-300/80">
                        {p.transliteration}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Actions depending on current status */}
                          {p.status === 'draft' && (
                            <button
                              onClick={() => handleAction(api.admin.submitReview(p.id))}
                              className="inline-flex items-center gap-1 rounded-lg bg-sky-950 px-2.5 py-1 text-xs font-medium text-sky-400 border border-sky-800 hover:bg-sky-900 transition"
                              title="Submit for review"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Submit
                            </button>
                          )}

                          {p.status === 'under_review' && (
                            <button
                              onClick={() => handleAction(api.admin.approve(p.id))}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-950 px-2.5 py-1 text-xs font-medium text-indigo-400 border border-indigo-800 hover:bg-indigo-900 transition"
                              title="Approve for publication"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          )}

                          {p.status === 'approved' && (
                            <button
                              onClick={() => handleAction(api.admin.publish(p.id))}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-950 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition"
                              title="Publish live to learners"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Publish
                            </button>
                          )}

                          {p.status === 'published' && (
                            <button
                              onClick={() => handleAction(api.admin.archive(p.id))}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                              title="Archive phrase"
                            >
                              <Archive className="h-3.5 w-3.5" />
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Phrase Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New Phrase (Draft)</h2>
            <form onSubmit={handleCreatePhrase} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Scenario ID (1 to 18) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="18"
                  value={newScenarioId}
                  onChange={(e) => setNewScenarioId(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Kannada Script *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ"
                  value={newKannada}
                  onChange={(e) => setNewKannada(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  English Meaning *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please help me"
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  English Transliteration *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dayavittu sahaaya maadi"
                  value={newTransliteration}
                  onChange={(e) => setNewTransliteration(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Context / Usage
                </label>
                <input
                  type="text"
                  placeholder="e.g. Used when asking someone politely for assistance"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Example Sentence / In-Context Usage
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dayavittu bas stand ellide heli?"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Formality &amp; Politeness Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Respectful form using 'maadi'; safe for elders and strangers"
                  value={newFormalityNote}
                  onChange={(e) => setNewFormalityNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition"
                >
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
