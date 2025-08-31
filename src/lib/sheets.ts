import { google } from "googleapis";

export interface SheetRow {
  date: string;
  time: string;
  type: string;
  items: string;
  has_carb: boolean;
  has_protein: boolean;
  has_veggies: boolean;
  userId: string;
  notes: string;
}

function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.SHEET_ID;
  if (!clientEmail || !privateKey || !sheetId) {
    throw new Error("Missing Google Sheets env vars (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SHEET_ID)");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, sheetId };
}

/**
 * Append rows to a Google Sheet using a Service Account.
 */
export async function appendRowsToSheet(rows: SheetRow[], range: string = "A:I"): Promise<{ appended: number }> {
  if (rows.length === 0) return { appended: 0 };
  const { sheets, sheetId } = getSheetsClient();

  const values = rows.map((r) => [
    r.date,
    r.time,
    r.type,
    r.items,
    r.has_carb,
    r.has_protein,
    r.has_veggies,
    r.userId,
    r.notes,
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  return { appended: rows.length };
}


