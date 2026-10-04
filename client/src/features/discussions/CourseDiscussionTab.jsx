import React, { useState, useEffect, useCallback } from 'react';
import { discussionsApi } from '../../api/discussionsApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

export const CourseDiscussionTab = ({ courseId, user }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const toast = useToast();

  const loadThreads = useCallback(async () => {
    try {
      const data = await discussionsApi.listByCourse(courseId);
      setThreads(data);
    } catch (err) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const viewThread = async (id) => {
    setThreadLoading(true);
    try {
      const details = await discussionsApi.getThread(id);
      setActiveThread(details);
    } catch (err) {
      toast.error('Could not load discussion replies');
    } finally {
      setThreadLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter a title and question content');
      return;
    }
    setCreating(true);
    try {
      const created = await discussionsApi.createThread(courseId, {
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      toast.success('Discussion topic posted!');
      setShowNewModal(false);
      setNewTitle('');
      setNewContent('');
      await loadThreads();
      setActiveThread(created);
    } catch (err) {
      toast.error(err.message || 'Failed to create discussion');
    } finally {
      setCreating(false);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const reply = await discussionsApi.replyToThread(activeThread.id, { content: replyText.trim() });
      toast.success('Reply submitted!');
      setReplyText('');
      setActiveThread((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), reply],
      }));
      // update count in list
      setThreads((prev) =>
        prev.map((t) => (t.id === activeThread.id ? { ...t, reply_count: (t.reply_count || 0) + 1 } : t))
      );
    } catch (err) {
      toast.error(err.message || 'Could not post reply');
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="discussion-tab">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Course Q&A & Discussion</h2>
          <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
            Ask questions, get help from your instructor, and learn together.
          </p>
        </div>
        <button className="btn" type="button" onClick={() => setShowNewModal(true)}>
          + Ask Question
        </button>
      </div>

      {showNewModal && (
        <div className="card discussion-create-card" style={{ marginBottom: '1.5rem', border: '2px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0 }}>Start a New Discussion</h3>
            <button className="text-button" type="button" onClick={() => setShowNewModal(false)}>Close</button>
          </div>
          <form onSubmit={handleCreateThread}>
            <div style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                Question / Topic Title
              </label>
              <input
                className="input"
                placeholder="e.g. How does closure work in JavaScript?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                Details & Context
              </label>
              <textarea
                className="input textarea"
                placeholder="Describe your question or difficulty in detail..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn" type="submit" disabled={creating}>
                {creating ? 'Posting...' : 'Post Question'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowNewModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main split view or active thread view */}
      {activeThread ? (
        <div className="active-thread-view">
          <button className="text-link back-link" type="button" onClick={() => setActiveThread(null)} style={{ marginBottom: '0.8rem' }}>
            ← Back to all questions
          </button>
          {threadLoading ? <Spinner /> : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className="card main-question-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge">{activeThread.author_role === 'instructor' ? 'Instructor' : 'Student'}</span>
                  <span className="muted" style={{ fontSize: '0.82rem' }}>
                    {new Date(activeThread.created_at).toLocaleString()}
                  </span>
                </div>
                <h2 style={{ margin: '0.6rem 0', fontSize: '1.35rem' }}>{activeThread.title}</h2>
                <p style={{ margin: '0 0 0.8rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{activeThread.content}</p>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  Asked by <strong>{activeThread.author_name}</strong>
                </div>
              </div>

              {/* Replies */}
              <div style={{ paddingLeft: '0.5rem' }}>
                <h3 style={{ margin: '0 0 0.8rem' }}>Replies ({activeThread.replies?.length || 0})</h3>
                {(!activeThread.replies || activeThread.replies.length === 0) ? (
                  <p className="muted">No replies yet. Be the first to answer!</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {activeThread.replies.map((r) => (
                      <div
                        key={r.id}
                        className="card reply-card"
                        style={{
                          borderLeft: r.is_course_instructor ? '4px solid #4f46e5' : '1px solid var(--border-color, #e4e9f2)',
                          background: r.is_course_instructor ? 'rgba(99, 102, 241, 0.04)' : undefined
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong>{r.author_name}</strong>
                            {r.is_course_instructor ? (
                              <span className="badge" style={{ background: '#4f46e5', color: '#fff', fontSize: '0.72rem' }}>
                                ✓ Instructor Answer
                              </span>
                            ) : (
                              <span className="badge" style={{ fontSize: '0.72rem' }}>{r.author_role}</span>
                            )}
                          </div>
                          <span className="muted" style={{ fontSize: '0.78rem' }}>
                            {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <form onSubmit={handlePostReply} style={{ marginTop: '1.2rem' }}>
                  <textarea
                    className="input textarea"
                    placeholder={`Reply as ${user.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    required
                  />
                  <button className="btn" type="submit" disabled={replying} style={{ marginTop: '0.5rem' }}>
                    {replying ? 'Submitting...' : 'Post Reply'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Threads list */
        <div className="threads-list">
          {threads.length === 0 ? (
            <div className="card empty-state" style={{ padding: '2.5rem' }}>
              <h3>No questions asked yet</h3>
              <p className="muted">Have questions about lessons or concepts? Ask the instructor and community!</p>
              <button className="btn" type="button" onClick={() => setShowNewModal(true)}>Ask First Question</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {threads.map((t) => (
                <div
                  key={t.id}
                  className="card thread-card"
                  onClick={() => viewThread(t.id)}
                  style={{ cursor: 'pointer', transition: 'transform 120ms ease, box-shadow 120ms ease' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: 'var(--brand-color, #4338ca)' }}>
                        {t.title}
                      </h3>
                      <p className="course-description" style={{ margin: 0, fontSize: '0.88rem', WebkitLineClamp: 2 }}>
                        {t.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem', fontSize: '0.8rem' }} className="muted">
                        <span>Posted by <strong>{t.author_name}</strong></span>
                        <span>•</span>
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-color, #172033)' }}>
                        {t.reply_count}
                      </span>
                      <small className="muted" style={{ fontSize: '0.72rem' }}>
                        {t.reply_count === 1 ? 'reply' : 'replies'}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDiscussionTab;
