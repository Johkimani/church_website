import axios from "axios";
import logger from "../logger/winston.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

const SITE_KNOWLEDGE = `
SITE OVERVIEW:
- The website belongs to CSA Kirinyaga, a Catholic Students Association in Kenya. Users are often English and Swahili speakers.
- Respond in the user's language. Be warm, respectful, brief (1 to 4 sentences) and genuinely helpful. Do not be preachy or preachy-sounding.
- If a page on the site is relevant, ALWAYS suggest it as a link.

MAIN PAGES (paths you can suggest as links):
- Home: /
- Daily devotions hub (prayers, bible, rosary, challenge, progress): /devotions
- Prayer book / readings: /devotions/readings
- All prayers: /devotions/all-prayers
- Daily Missal / liturgy of the day: /devotions/daily-liturgy
- Liturgy guide: /devotions/liturgy
- Holy Bible: /devotions/bible
- Holy Rosary: /devotions/rosary
- Novenas & litanies: /devotions/prayer-module
- Daily faith challenge: /devotions/challenge
- My progress: /devotions/progress
- Community hub (choir, St. Francis, charismatic, dance, mentorship): /community
- Jumuiya groups: /jumuiya
- Officials directory: /officials
- Leadership history: /officials/history
- Photo gallery: /gallery
- Projects & shop (sacramentals, t-shirts, chairs, instruments): /projects
- Activities & booking: /activities
- My bookings: /my-bookings
- Notifications: /Notification
- Login / account: /login
- Privacy & terms: /privacy, /terms

JUMUIYA GROUPS (each has its own detail page at /jumuiya/<id>):
- St. Anthony of Padua: /jumuiya/st-anthony
- St. Augustine of Hippo: /jumuiya/st-augustine
- St. Catherine of Alexandria: /jumuiya/st-catherine
- St. Dominic: /jumuiya/st-dominic
- St. Elizabeth of Hungary: /jumuiya/st-elizabeth
- St. Maria Goretti: /jumuiya/st-maria-goretti
- St. Monica: /jumuiya/st-monica
- If the user asks about one of these saints or groups (for example "st. antony", "augustine", "goretti"), reply about the jumuiya and link straight to its /jumuiya/<id> page.

FEATURES TO KNOW:
- The shop lets members buy sacramentals, t-shirts and other items, and hire chairs and instruments.
- Activities (weekly and semester) can be booked online.
- Devotions include a prayer book, bible reader, rosary tracker, daily missal, novenas and a daily faith challenge with progress tracking per jumuiya.
- Notifications and announcements are posted to members.

ADMIN / LEADERS:
- Only authorized leaders (chairpersons, secretaries, coordinators and similar office bearers) can access the admin panel at /admin.
- If a user asks about admin access, explain it is restricted to authorized leadership and suggest they contact the association leadership if they believe they should have access. Never promise access.
- Developer team and chairperson contact details appear on the site footer.

OUTPUT FORMAT:
Reply with JSON only, using exactly this shape:
{"reply": "your short answer", "links": [{"label": "short label", "href": "/path"}]}
- links: 0 to 3 items, each href must be an internal path starting with "/". Only include links when a page is genuinely relevant.
- Do not add any text outside the JSON object.
`;

const SYSTEM_PROMPT = `You are Rafiki, the friendly virtual assistant of the CSA Kirinyaga Catholic Students Association website. Your job is to help visitors and members use the website: explain features, point them to the right pages, and answer simple questions about the association.

${SITE_KNOWLEDGE}`;

const safeLink = (href) => {
  if (typeof href !== "string") return false;
  const url = href.trim();
  return url.startsWith("/") && !url.startsWith("//") && url.length <= 200;
};

const parseAssistantReply = (content) => {
  try {
    const cleaned = String(content).replace(/```json|```/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const data = JSON.parse(cleaned.slice(start, end + 1));
      const reply = typeof data.reply === "string" ? data.reply.trim() : "";
      const links = Array.isArray(data.links)
        ? data.links
            .filter(
              (l) => l && typeof l.label === "string" && safeLink(l.href),
            )
            .slice(0, 4)
            .map((l) => ({
              label: l.label.slice(0, 40),
              href: l.href.trim(),
            }))
        : [];
      if (reply) return { reply, links };
    }
  } catch (err) {
    logger.warn("Assistant JSON parse failed, falling back to raw text");
  }
  return { reply: String(content).slice(0, 800), links: [] };
};

export const AssistantChat = async (req, res) => {
  const { message, history = [], context = {} } = req.body || {};

  const text =
    typeof message === "string" ? message.trim().slice(0, 1000) : "";

  if (!text) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res
      .status(503)
      .json({ error: "Assistant service is not configured" });
  }

  const recentHistory = (Array.isArray(history) ? history : [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 500) }));

  const userName =
    typeof context.name === "string" ? context.name.trim().slice(0, 60) : "";
  const currentPath =
    typeof context.path === "string" ? context.path.slice(0, 120) : "";
  const role = Array.isArray(context.role)
    ? context.role.map((r) => String(r).toUpperCase()).join(", ")
    : typeof context.role === "string"
      ? String(context.role).toUpperCase()
      : "";
  const siteKnowledge =
    typeof context.knowledge === "string"
      ? context.knowledge.trim().slice(0, 60000)
      : "";

  const userContext = [
    userName ? `- User name: ${userName}` : "",
    currentPath ? `- User is currently on page: ${currentPath}` : "",
    role ? `- User roles: ${role}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const systemContent = siteKnowledge
    ? `${SYSTEM_PROMPT}\n\n${siteKnowledge}`
    : SYSTEM_PROMPT;

  const messages = [
    { role: "system", content: systemContent },
    ...recentHistory,
    ...(userContext
      ? [
          {
            role: "user",
            content: `[Context]\n${userContext}`,
          },
        ]
      : []),
    { role: "user", content: text },
  ];

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        timeout: 30000,
      },
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      logger.error("Groq assistant: no content in response");
      return res
        .status(502)
        .json({ error: "Groq API error: No content in response" });
    }

    const { reply, links } = parseAssistantReply(content);
    return res.json({ reply, links });
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      logger.error(`Groq assistant API error ${status}`);

      if (status === 401) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Invalid Groq API key" });
      }
      if (status === 404) {
        return res
          .status(404)
          .json({ error: "Model not found or wrong endpoint" });
      }
      if (status === 400) {
        return res
          .status(400)
          .json({ error: "Bad Request: Invalid payload or model name" });
      }
      if (status === 429) {
        return res
          .status(429)
          .json({ error: "Too Many Requests: Rate limit exceeded" });
      }
      return res.status(502).json({ error: "Groq API error" });
    } else if (error.request) {
      logger.error("Gateway Timeout: No response from Groq");
      return res
        .status(504)
        .json({ error: "Gateway Timeout: No response from Groq" });
    } else {
      logger.error("Assistant internal error:", error.message);
      return res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }
};
