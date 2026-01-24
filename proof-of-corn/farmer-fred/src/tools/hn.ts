/**
 * HACKER NEWS TOOL
 *
 * Fetches HN post data and comments for Proof of Corn tracking.
 * API docs: https://github.com/HackerNews/API
 */

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

// The Proof of Corn HN post (January 23, 2026)
export const PROOF_OF_CORN_POST_ID = 46735511;

export interface HNItem {
  id: number;
  type: "story" | "comment" | "job" | "poll" | "pollopt";
  by?: string;
  time: number;
  text?: string;
  url?: string;
  title?: string;
  score?: number;
  kids?: number[];
  parent?: number;
  descendants?: number;
  deleted?: boolean;
  dead?: boolean;
}

export interface HNPostSummary {
  id: number;
  title: string;
  score: number;
  commentCount: number;
  url: string;
  hnUrl: string;
  postedAt: string;
  hoursAgo: number;
}

export interface HNCommentSummary {
  id: number;
  author: string;
  text: string;
  postedAt: string;
  hoursAgo: number;
  replyCount: number;
  isQuestion: boolean;
  sentiment: "positive" | "neutral" | "negative" | "question";
  topics: string[];
}

export interface HNContext {
  post: HNPostSummary;
  recentComments: HNCommentSummary[];
  newCommentsSinceLastCheck: number;
  topThemes: string[];
  questionsNeedingResponse: HNCommentSummary[];
}

/**
 * Fetch a single HN item by ID
 */
export async function fetchHNItem(id: number): Promise<HNItem | null> {
  const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
  if (!response.ok) return null;
  return response.json();
}

/**
 * Get the main Proof of Corn post summary
 */
export async function fetchPostSummary(postId: number = PROOF_OF_CORN_POST_ID): Promise<HNPostSummary | null> {
  const item = await fetchHNItem(postId);
  if (!item || item.type !== "story") return null;

  const now = Date.now();
  const postedAt = new Date(item.time * 1000);
  const hoursAgo = Math.round((now - postedAt.getTime()) / (1000 * 60 * 60));

  return {
    id: item.id,
    title: item.title || "Proof of Corn",
    score: item.score || 0,
    commentCount: item.descendants || 0,
    url: item.url || "",
    hnUrl: `https://news.ycombinator.com/item?id=${item.id}`,
    postedAt: postedAt.toISOString(),
    hoursAgo
  };
}

/**
 * Fetch recent comments on the post
 */
export async function fetchRecentComments(
  postId: number = PROOF_OF_CORN_POST_ID,
  limit: number = 20
): Promise<HNCommentSummary[]> {
  const post = await fetchHNItem(postId);
  if (!post?.kids) return [];

  const comments: HNCommentSummary[] = [];
  const commentIds = post.kids.slice(0, limit * 2); // Fetch more to filter deleted

  for (const id of commentIds) {
    if (comments.length >= limit) break;

    const comment = await fetchHNItem(id);
    if (!comment || comment.deleted || comment.dead || !comment.text) continue;

    const now = Date.now();
    const postedAt = new Date(comment.time * 1000);
    const hoursAgo = Math.round((now - postedAt.getTime()) / (1000 * 60 * 60));

    const summary = analyzeComment(comment.text);

    comments.push({
      id: comment.id,
      author: comment.by || "anonymous",
      text: cleanHtmlText(comment.text),
      postedAt: postedAt.toISOString(),
      hoursAgo,
      replyCount: comment.kids?.length || 0,
      isQuestion: summary.isQuestion,
      sentiment: summary.sentiment,
      topics: summary.topics
    });
  }

  // Sort by most recent
  return comments.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

/**
 * Analyze comment text for sentiment and topics
 */
function analyzeComment(text: string): {
  isQuestion: boolean;
  sentiment: "positive" | "neutral" | "negative" | "question";
  topics: string[];
} {
  const lowerText = text.toLowerCase();

  // Is it a question?
  const isQuestion = text.includes("?") ||
    lowerText.startsWith("how") ||
    lowerText.startsWith("what") ||
    lowerText.startsWith("why") ||
    lowerText.startsWith("when") ||
    lowerText.startsWith("where") ||
    lowerText.startsWith("who") ||
    lowerText.startsWith("can you") ||
    lowerText.startsWith("will");

  // Sentiment analysis (simple keyword-based)
  const positiveWords = ["great", "awesome", "love", "cool", "interesting", "brilliant", "genius", "amazing", "fun", "nice", "good", "excellent"];
  const negativeWords = ["stupid", "dumb", "waste", "pointless", "bad", "terrible", "ridiculous", "scam", "fraud", "concern", "worried", "risk"];

  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

  let sentiment: "positive" | "neutral" | "negative" | "question" = "neutral";
  if (isQuestion) {
    sentiment = "question";
  } else if (positiveCount > negativeCount) {
    sentiment = "positive";
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
  }

  // Topic detection
  const topics: string[] = [];
  if (lowerText.includes("secur") || lowerText.includes("prompt injection") || lowerText.includes("hack")) {
    topics.push("security");
  }
  if (lowerText.includes("future") || lowerText.includes("commodit") || lowerText.includes("market") || lowerText.includes("trading")) {
    topics.push("futures");
  }
  if (lowerText.includes("scale") || lowerText.includes("acre") || lowerText.includes("size")) {
    topics.push("scale");
  }
  if (lowerText.includes("ai") || lowerText.includes("llm") || lowerText.includes("claude") || lowerText.includes("gpt")) {
    topics.push("ai");
  }
  if (lowerText.includes("autonom") || lowerText.includes("agent")) {
    topics.push("autonomy");
  }
  if (lowerText.includes("soil") || lowerText.includes("organic") || lowerText.includes("regenerat")) {
    topics.push("agriculture");
  }
  if (lowerText.includes("iowa") || lowerText.includes("texas") || lowerText.includes("argentina")) {
    topics.push("regions");
  }

  return { isQuestion, sentiment, topics };
}

/**
 * Strip HTML tags from HN comment text
 */
function cleanHtmlText(html: string): string {
  return html
    .replace(/<p>/g, "\n")
    .replace(/<\/p>/g, "")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n\n+/g, "\n")
    .trim();
}

/**
 * Get full HN context for Fred's daily check
 */
export async function getHNContext(
  lastCheckTime?: Date,
  postId: number = PROOF_OF_CORN_POST_ID
): Promise<HNContext | null> {
  const post = await fetchPostSummary(postId);
  if (!post) return null;

  const comments = await fetchRecentComments(postId, 30);

  // Count new comments since last check
  const newComments = lastCheckTime
    ? comments.filter(c => new Date(c.postedAt) > lastCheckTime)
    : comments;

  // Extract top themes
  const topicCounts: Record<string, number> = {};
  for (const comment of comments) {
    for (const topic of comment.topics) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }
  const topThemes = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  // Find questions that might need response
  const questionsNeedingResponse = comments.filter(c =>
    c.isQuestion &&
    c.replyCount === 0 &&
    c.hoursAgo < 24
  );

  return {
    post,
    recentComments: comments.slice(0, 10),
    newCommentsSinceLastCheck: newComments.length,
    topThemes,
    questionsNeedingResponse
  };
}

/**
 * Format HN context for agent prompt
 */
export function formatHNContextForAgent(hn: HNContext): string {
  let ctx = `### Hacker News Activity
- Post: "${hn.post.title}"
- Score: ${hn.post.score} points
- Comments: ${hn.post.commentCount} total
- New since last check: ${hn.newCommentsSinceLastCheck}
- Top themes: ${hn.topThemes.join(", ") || "None detected"}
- Unanswered questions: ${hn.questionsNeedingResponse.length}

`;

  if (hn.questionsNeedingResponse.length > 0) {
    ctx += `#### Questions Needing Response:\n`;
    for (const q of hn.questionsNeedingResponse.slice(0, 3)) {
      ctx += `- @${q.author} (${q.hoursAgo}h ago): "${q.text.slice(0, 150)}${q.text.length > 150 ? "..." : ""}"\n`;
    }
    ctx += "\n";
  }

  if (hn.recentComments.length > 0) {
    ctx += `#### Recent Comment Sentiment:\n`;
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, question: 0 };
    for (const c of hn.recentComments) {
      sentimentCounts[c.sentiment]++;
    }
    ctx += `- Positive: ${sentimentCounts.positive}, Neutral: ${sentimentCounts.neutral}, Negative: ${sentimentCounts.negative}, Questions: ${sentimentCounts.question}\n`;
  }

  return ctx;
}
