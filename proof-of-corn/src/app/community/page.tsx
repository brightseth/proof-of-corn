'use client';

import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';

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

export default function CommunityPage() {
  const [hnData, setHnData] = useState<HNData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'questions' | 'positive' | 'negative'>('all');

  useEffect(() => {
    fetch('https://farmer-fred.sethgoldstein.workers.dev/hn')
      .then(res => res.json())
      .then(data => {
        setHnData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  return (
    <PageLayout title="Community Feedback" subtitle="Live analysis of Hacker News discussion">
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading community feedback...</div>
          ) : !hnData ? (
            <div className="text-center py-12 text-red-500">Failed to load feedback</div>
          ) : (
            <>
              {/* HN Stats Banner */}
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

              {/* Sentiment Breakdown */}
              <section className="bg-white border border-zinc-200 rounded-lg p-6">
                <h2 className="font-bold mb-4">Sentiment Analysis</h2>
                <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-zinc-100">
                  {sentimentCounts.positive > 0 && (
                    <div
                      className="bg-green-500"
                      style={{ width: `${(sentimentCounts.positive / (hnData.recentComments?.length || 1)) * 100}%` }}
                      title={`Positive: ${sentimentCounts.positive}`}
                    />
                  )}
                  {sentimentCounts.neutral > 0 && (
                    <div
                      className="bg-zinc-400"
                      style={{ width: `${(sentimentCounts.neutral / (hnData.recentComments?.length || 1)) * 100}%` }}
                      title={`Neutral: ${sentimentCounts.neutral}`}
                    />
                  )}
                  {sentimentCounts.question > 0 && (
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(sentimentCounts.question / (hnData.recentComments?.length || 1)) * 100}%` }}
                      title={`Questions: ${sentimentCounts.question}`}
                    />
                  )}
                  {sentimentCounts.negative > 0 && (
                    <div
                      className="bg-red-500"
                      style={{ width: `${(sentimentCounts.negative / (hnData.recentComments?.length || 1)) * 100}%` }}
                      title={`Negative: ${sentimentCounts.negative}`}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Positive ({sentimentCounts.positive})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-zinc-400 rounded-full"></span> Neutral ({sentimentCounts.neutral})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Questions ({sentimentCounts.question})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Critical ({sentimentCounts.negative})</span>
                </div>
              </section>

              {/* Top Themes */}
              {hnData.topThemes && hnData.topThemes.length > 0 && (
                <section className="bg-white border border-zinc-200 rounded-lg p-6">
                  <h2 className="font-bold mb-4">Discussion Themes</h2>
                  <div className="flex flex-wrap gap-2">
                    {hnData.topThemes.map((theme, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-full text-sm font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Questions Needing Response */}
              {hnData.questionsNeedingResponse && hnData.questionsNeedingResponse.length > 0 && (
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-600">?</span> Unanswered Questions ({hnData.questionsNeedingResponse.length})
                  </h2>
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

              {/* Comment Feed */}
              <section className="bg-white border border-zinc-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">Recent Comments</h2>
                  <div className="flex gap-2 text-sm">
                    {(['all', 'questions', 'positive', 'negative'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full ${
                          filter === f
                            ? 'bg-amber-600 text-white'
                            : 'bg-zinc-100 hover:bg-zinc-200'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
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
                        {comment.topics.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {comment.topics.map((topic, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 bg-zinc-50 text-zinc-500 rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Call to Action */}
              <div className="text-center py-6">
                <a
                  href={hnData.post.hnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Join the Discussion on HN →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
