export interface WhatsAppMessage {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  user: string;
  text: string;
  raw: string;
}

/**
 * Parse a WhatsApp exported .txt file (no media) into structured messages.
 */
export function parseWhatsAppExport(txt: string): WhatsAppMessage[] {
  const lines = txt.split(/\r?\n/);

  type Pending = {
    dateStr: string;
    timeStr: string;
    ampm?: string | null;
    user: string;
    textLines: string[];
    rawLines: string[];
  } | null;

  let pending: Pending = null;
  const messages: WhatsAppMessage[] = [];

  for (const line of lines) {
    const meta = detectMessageStart(line);
    if (meta) {
      // flush previous
      if (pending) {
        const { date, time } = normalizeDateTime(pending.dateStr, pending.timeStr, pending.ampm ?? undefined);
        messages.push({
          date,
          time,
          user: pending.user,
          text: pending.textLines.join("\n").trim(),
          raw: pending.rawLines.join("\n"),
        });
      }

      const { dateStr, timeStr, ampm, rest, style } = meta;
      const { user, text } = parseUserAndText(rest, style);
      pending = {
        dateStr,
        timeStr,
        ampm: ampm ?? null,
        user,
        textLines: [text],
        rawLines: [line],
      };
    } else if (pending) {
      // continuation of previous message
      pending.textLines.push(line);
      pending.rawLines.push(line);
    } else {
      // Ignore leading lines until we detect the first message header
      continue;
    }
  }

  // flush last pending
  if (pending) {
    const { date, time } = normalizeDateTime(pending.dateStr, pending.timeStr, pending.ampm ?? undefined);
    messages.push({
      date,
      time,
      user: pending.user,
      text: pending.textLines.join("\n").trim(),
      raw: pending.rawLines.join("\n"),
    });
  }

  return messages;
}

/**
 * Predicate to determine whether a message likely describes food.
 */
export function isFoodRelatedMessage(msg: WhatsAppMessage): boolean {
  if (!msg.text) return false;
  const text = msg.text.toLowerCase();
  if (msg.user.toLowerCase() === "system") return false;

  // Ignore media/system-like messages
  const ignoreTokens = [
    "multimedia omitido",
    "omitted",
    "imagen omitida",
    "mensajes y llamadas",
    "changed the subject",
    "cambió el asunto",
    "changed to",
    "se unió usando el enlace",
  ];
  if (ignoreTokens.some((t) => text.includes(t))) return false;

  const mealTokens = [
    // Spanish
    "desayuno",
    "almuerzo",
    "comida",
    "cena",
    "merienda",
    "snack",
    "desayuné",
    "almorcé",
    "cené",
    "comí",
    // English
    "breakfast",
    "lunch",
    "dinner",
  ];

  const foodWords = [
    "ensalada",
    "pollo",
    "huevo",
    "huevos",
    "carne",
    "arroz",
    "pasta",
    "verdura",
    "verduras",
    "fruta",
    "frutas",
    "sandwich",
    "sándwich",
    "yogur",
    "yogurt",
    "cereal",
    "tostadas",
    "avena",
    "sopa",
    "pizza",
    "empanada",
    "tarta",
    "pescado",
    "legumbre",
    "legumbres",
  ];

  return mealTokens.some((t) => text.includes(t)) || countMatches(text, foodWords) >= 2;
}

/**
 * Convenience helper to directly extract only food-related messages from raw export text.
 */
export function extractFoodMessages(txt: string): WhatsAppMessage[] {
  const all = parseWhatsAppExport(txt);
  return all.filter(isFoodRelatedMessage);
}

type DetectedStart = {
  dateStr: string;
  timeStr: string;
  ampm?: string;
  rest: string; // the content after "] " or " - "
  style: "bracket" | "dash";
} | null;

function detectMessageStart(line: string): DetectedStart {
  // [dd/mm/yy, HH:MM AM/PM] Name: text
  const bracket = line.match(/^\[(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}),\s+(\d{1,2}:\d{2})(?:\s*([APap][Mm]))?\]\s(.+)$/);
  if (bracket) {
    return {
      dateStr: bracket[1],
      timeStr: bracket[2],
      ampm: bracket[3],
      rest: bracket[4],
      style: "bracket",
    };
  }

  // dd/mm/yy, HH:MM AM/PM - rest OR dd/mm/yy HH:MM - rest
  const dash = line.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})(?:,)?\s+(\d{1,2}:\d{2})(?:\s*([APap][Mm]))?\s-\s(.+)$/);
  if (dash) {
    return {
      dateStr: dash[1],
      timeStr: dash[2],
      ampm: dash[3],
      rest: dash[4],
      style: "dash",
    };
  }

  return null;
}

function parseUserAndText(rest: string, style: "bracket" | "dash"): { user: string; text: string } {
  // In both styles, after header we often have "Name: message".
  // Some system messages have no colon/user.
  const colonIdx = rest.indexOf(": ");
  if (colonIdx !== -1) {
    const user = rest.slice(0, colonIdx).trim();
    const text = rest.slice(colonIdx + 2);
    return { user: user || "Unknown", text };
  }
  // No user present
  return { user: "System", text: rest };
}

function normalizeDateTime(dateStr: string, timeStr: string, ampm?: string): { date: string; time: string } {
  // Date: dd/mm/yy or dd/mm/yyyy or with '-'
  const sep = dateStr.includes("/") ? "/" : "-";
  const [p1, p2, p3] = dateStr.split(sep).map((p) => p.trim());

  let day = parseInt(p1, 10);
  let month = parseInt(p2, 10);
  let year = parseInt(p3, 10);

  // Heuristic: if first part <= 12 and second part > 12, still dd/mm works; if both <=12, assume dd/mm (common in ES exports)
  // If year < 100, assume 2000+
  if (year < 100) year += 2000;

  const date = `${pad2(year)}-${pad2(month)}-${pad2(day)}`;

  // Time: HH:MM with optional AM/PM
  let [hStr, mStr] = timeStr.split(":");
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  if (ampm) {
    const a = ampm.toLowerCase();
    if (a === "pm" && hour < 12) hour += 12;
    if (a === "am" && hour === 12) hour = 0;
  }
  const time = `${pad2(hour)}:${pad2(minute)}`;

  return { date, time };
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function countMatches(text: string, words: string[]): number {
  let count = 0;
  for (const w of words) {
    if (text.includes(w)) count++;
  }
  return count;
}


