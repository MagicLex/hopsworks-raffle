/**
 * Hopsworks Book Raffle - Google Apps Script
 *
 * SETUP:
 * 1. Create a new Google Sheet
 * 2. Add headers in Row 1: Number | Name | Email | Timestamp
 * 3. Go to Extensions > Apps Script
 * 4. Delete everything and paste this code
 * 5. Click Deploy > New deployment
 * 6. Select "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Deploy and copy the URL
 * 10. Add to your .env.local: NEXT_PUBLIC_GOOGLE_SCRIPT_URL=<your-url>
 */

const SHEET_NAME = "Sheet1"; // Change if your sheet has a different name

function doGet(e) {
  const action = e.parameter.action;

  if (action === "list") {
    return listParticipants();
  } else if (action === "getByEmail") {
    return getByEmail(e.parameter.email);
  }

  return jsonResponse({ error: "Unknown action" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === "register") {
      return registerParticipant(data.name, data.email);
    }

    return jsonResponse({ error: "Unknown action" });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

function registerParticipant(name, email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  // Check if email already registered
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] && data[i][2].toString().toLowerCase() === email.toLowerCase()) {
      return jsonResponse({
        success: true,
        participant: { number: data[i][0], name: data[i][1], email: data[i][2] },
        message: "Already registered"
      });
    }
  }

  // Get next number
  const nextNumber = data.length; // Row 1 is headers, so row count = next number

  // Add new participant
  sheet.appendRow([nextNumber, name, email, new Date().toISOString()]);

  return jsonResponse({
    success: true,
    participant: { number: nextNumber, name, email }
  });
}

function listParticipants() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  const participants = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      participants.push({
        number: data[i][0],
        name: data[i][1],
        email: data[i][2]
      });
    }
  }

  return jsonResponse({ success: true, participants });
}

function getByEmail(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] && data[i][2].toString().toLowerCase() === email.toLowerCase()) {
      return jsonResponse({
        success: true,
        participant: { number: data[i][0], name: data[i][1], email: data[i][2] }
      });
    }
  }

  return jsonResponse({ success: false, error: "Not found" });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
