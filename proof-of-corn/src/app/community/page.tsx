'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';

const FRED_API = 'https://farmer-fred.sethgoldstein.workers.dev';

interface HNComment {
  id: number;
  author: string;
  text: string;
  hoursAgo: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'question';
  topics: string[];
  replyCount: number;
}

interface HNData {
  post: {
    score: number;
    commentCount: number;
    hoursAgo: number;
    hnUrl: string;
  };
  topThemes: string[];
  recentComments: HNComment[];
  questionsNeedingResponse: HNComment[];
}

interface Learning {
  id: string;
  source: string;
  insight: string;
  category: string;
  confidence: string;
  createdAt: string;
}

interface Feedback {
  id: string;
  author: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function CommunityPage() {
  const [hnData, setHnData] = useState<HNData | null>(null);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'questions' | 'positive' | 'negative'>('all');
  const [activeTab, setActiveTab] = useState<'hn' | 'learnings' | 'feedback'>('hn');

  // Feedback form state
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${FRED_API}/hn`).then(res => res.json()).catch(() => null),
      fetch(`${FRED_API}/learnings`).then(res => res.json()).catch(() => ({ learnings: [] })),
      fetch(`${FRED_API}/feedback`).then(res => res.json()).catch(() => ({ feedback: [] }))
    ]).then(([hn, learn, fb]) => {
      setHnData(hn);
      setLearnings(learn?.learnings || []);
      setFeedback(fb?.feedback || []);
      setLoading(false);
    });
  }, []);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch(`${FRED_API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          content: feedbackContent,
          author: authorName || 'Anonymous'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitResult({ success: true, message: data.message });
        setFeedbackContent('');
        setAuthorName('');
        // Refresh feedback list
        const fbRes = await fetch(`${FRED_API}/feedback`);
        const fbData = await fbRes.json();
        setFeedback(fbData?.feedback || []);
      } else {
        setSubmitResult({ success: false, message: data.error || 'Failed to submit' });
      }
    } catch {
      setSubmitResult({ success: false, message: 'Network error. Please try again.' });
    }

    setSubmitting(false);
  };

  const filteredComments = hnData?.recentComments?.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'questions') return c.sentiment === 'question';
    if (filter === 'positive') return c.sentiment === 'positive';
    if (filter === 'negative') return c.sentiment === 'negative';
    return true;
  }) || [];

  const sentimentCounts = {
    positive: hnData?.recentComments?.filter(c => c.sentiment === 'positive').length || 0,
    neutral: hnData?.recentComments?.filter(c => c.sentiment === 'neutral').length || 0,
    negative: hnData?.recentComments?.filter(c => c.sentiment === 'negative').length || 0,
    question: hnData?.recentComments?.filter(c => c.sentiment === 'question').length || 0,
  };

  const sourceIcon = (source: string) => {
    switch (source) {
      case 'email': return '📧';
      case 'hn': return '🟠';
      case 'feedback': return '💬';
      default: return '📝';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-blue-50 text-blue-700';
      case 'improvement': return 'bg-green-50 text-green-700';
      case 'bug': return 'bg-red-50 text-red-700';
      case 'question': return 'bg-purple-50 text-purple-700';
      case 'praise': return 'bg-amber-50 text-amber-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <PageLayout title="Community" subtitle="How Fred learns from HN, emails, and your feedback">
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* How Fred Learns Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="font-bold text-lg mb-2">How Fred Gets Smarter</h2>
            <p className="text-zinc-700 text-sm mb-4">
              Every interaction helps Farmer Fred learn and improve:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">📧</span>
                <div>
                  <strong>Emails</strong>
                  <p className="text-zinc-600">Farmer conversations, partnerships</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">🟠</span>
                <div>
                  <strong>Hacker News</strong>
                  <p className="text-zinc-600">Discussion analysis, themes</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <strong>Your Feedback</strong>
                  <p className="text-zinc-600">Direct suggestions to Fred</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-zinc-200">
            {[
              { id: 'hn', label: 'HN Discussion', count: hnData?.post?.commentCount },
              { id: 'learnings', label: 'Fred\'s Learnings', count: learnings.length },
              { id: 'feedback', label: 'Submit Feedback', count: feedback.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'hn' | 'learnings' | 'feedback')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-xs bg-zinc-100 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading...</div>
          ) : (
            <>
              {/* HN Tab */}
              {activeTab === 'hn' && hnData && (
                <div className="space-y-6">
                  {/* HN Stats */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-orange-600">Y</span>
                        <span className="font-bold">Hacker News</span>
                      </div>
                      <a
                        href={hnData.post.hnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline text-sm"
                      >
                        View Discussion →
                      </a>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-orange-600">{hnData.post.score}</div>
                        <div className="text-xs text-zinc-500 uppercase">Points</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-amber-600">{hnData.post.commentCount}</div>
                        <div className="text-xs text-zinc-500 uppercase">Comments</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-600">{sentimentCounts.positive}</div>
                        <div className="text-xs text-zinc-500 uppercase">Positive</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-600">{sentimentCounts.question}</div>
                        <div className="text-xs text-zinc-500 uppercase">Questions</div>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Bar */}
                  <section className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Sentiment Analysis</h3>
                    <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-zinc-100">
                      {sentimentCounts.positive > 0 && (
                        <div className="bg-green-500" style={{ width: `${(sentimentCounts.positive / (hnData.recentComments?.length || 1)) * 100}%` }} />
                      )}
                      {sentimentCounts.neutral > 0 && (
                        <div className="bg-zinc-400" style={{ width: `${(sentimentCounts.neutral / (hnData.recentComments?.length || 1)) * 100}%` }} />
                      )}
                      {sentimentCounts.question > 0 && (
                        <div className="bg-blue-500" style={{ width: `${(sentimentCounts.question / (hnData.recentComments?.length || 1)) * 100}%` }} />
                      )}
                      {sentimentCounts.negative > 0 && (
                        <div className="bg-red-500" style={{ width: `${(sentimentCounts.negative / (hnData.recentComments?.length || 1)) * 100}%` }} />
                      )}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Positive ({sentimentCounts.positive})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-zinc-400 rounded-full"></span> Neutral ({sentimentCounts.neutral})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Questions ({sentimentCounts.question})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Critical ({sentimentCounts.negative})</span>
                    </div>
                  </section>

                  {/* Themes */}
                  {hnData.topThemes && hnData.topThemes.length > 0 && (
                    <section className="bg-white border border-zinc-200 rounded-lg p-6">
                      <h3 className="font-bold mb-4">Discussion Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {hnData.topThemes.map((theme, i) => (
                          <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-full text-sm font-medium">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Unanswered Questions */}
                  {hnData.questionsNeedingResponse && hnData.questionsNeedingResponse.length > 0 && (
                    <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span className="text-blue-600">?</span> Unanswered Questions ({hnData.questionsNeedingResponse.length})
                      </h3>
                      <div className="space-y-4">
                        {hnData.questionsNeedingResponse.slice(0, 5).map((q, i) => (
                          <div key={i} className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-blue-800">@{q.author}</span>
                              <span className="text-xs text-zinc-500">{q.hoursAgo}h ago</span>
                            </div>
                            <p className="text-zinc-700 text-sm">{q.text.slice(0, 200)}{q.text.length > 200 ? '...' : ''}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Comment Feed with Filter */}
                  <section className="bg-white border border-zinc-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Recent Comments</h3>
                      <div className="flex gap-2 text-sm">
                        {(['all', 'questions', 'positive', 'negative'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full ${filter === f ? 'bg-amber-600 text-white' : 'bg-zinc-100 hover:bg-zinc-200'}`}
                          >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredComments.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4">No comments match this filter</p>
                      ) : (
                        filteredComments.slice(0, 10).map((comment, i) => (
                          <div key={i} className="border-b border-zinc-100 pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">@{comment.author}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  comment.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                  comment.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                  comment.sentiment === 'question' ? 'bg-blue-100 text-blue-700' :
                                  'bg-zinc-100 text-zinc-600'
                                }`}>
                                  {comment.sentiment}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-500">{comment.hoursAgo}h ago</span>
                            </div>
                            <p className="text-zinc-700 text-sm">{comment.text.slice(0, 300)}{comment.text.length > 300 ? '...' : ''}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* Learnings Tab */}
              {activeTab === 'learnings' && (
                <div className="space-y-6">
                  <section className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="font-bold mb-4">What Fred Has Learned ({learnings.length})</h3>
                    {learnings.length === 0 ? (
                      <p className="text-zinc-500">Fred is just getting started. Learnings will appear as he processes emails, HN comments, and feedback.</p>
                    ) : (
                      <div className="space-y-4">
                        {learnings.map((learning) => (
                          <div key={learning.id} className="p-4 bg-zinc-50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <span className="text-xl">{sourceIcon(learning.source)}</span>
                              <div className="flex-1">
                                <p className="text-zinc-800">{learning.insight}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                                  <span className="px-2 py-0.5 bg-zinc-200 rounded">{learning.category}</span>
                                  <span>{learning.confidence} confidence</span>
                                  <span>{new Date(learning.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <div className="text-center">
                    <a href={`${FRED_API}/learnings`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline text-sm">
                      View raw learnings API →
                    </a>
                  </div>
                </div>
              )}

              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Submit Form */}
                  <section className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Help Fred Improve</h3>
                    <form onSubmit={submitFeedback} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        >
                          <option value="suggestion">Suggestion</option>
                          <option value="improvement">Improvement</option>
                          <option value="question">Question</option>
                          <option value="bug">Bug</option>
                          <option value="praise">Praise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Your Feedback</label>
                        <textarea
                          value={feedbackContent}
                          onChange={(e) => setFeedbackContent(e.target.value)}
                          placeholder="Share your thoughts..."
                          rows={4}
                          maxLength={2000}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm resize-none"
                        />
                        <p className="text-xs text-zinc-400 mt-1">{feedbackContent.length}/2000</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Name (optional)</label>
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="Anonymous"
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || feedbackContent.length < 10}
                        className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-300 text-white rounded-lg font-medium"
                      >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                      {submitResult && (
                        <div className={`p-3 rounded-lg text-sm ${submitResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {submitResult.message}
                        </div>
                      )}
                    </form>
                  </section>

                  {/* Recent Feedback */}
                  <section className="bg-white border border-zinc-200 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Recent Feedback ({feedback.length})</h3>
                    {feedback.length === 0 ? (
                      <p className="text-zinc-500">No feedback yet. Be the first!</p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {feedback.slice(0, 8).map((fb) => (
                          <div key={fb.id} className="p-3 bg-zinc-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${typeColor(fb.type)}`}>{fb.type}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                fb.status === 'incorporated' ? 'bg-green-100 text-green-700' :
                                fb.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>{fb.status}</span>
                            </div>
                            <p className="text-sm text-zinc-700">{fb.content}</p>
                            <p className="text-xs text-zinc-400 mt-2">— {fb.author}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </>
          )}

          {/* API Links */}
          <div className="text-center text-sm text-zinc-500 pt-4 border-t border-zinc-200">
            <p>Full transparency. All data via API:</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href={`${FRED_API}/hn`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">/hn</a>
              <a href={`${FRED_API}/learnings`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">/learnings</a>
              <a href={`${FRED_API}/feedback`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">/feedback</a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
