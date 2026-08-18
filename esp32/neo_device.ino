/*
 * NEO Device — ESP32 speaker/output node
 * ----------------------------------------
 * The ESP32 does NOT do any computer vision. The laptop runs all CV; this device
 * only receives commands over Wi-Fi and produces audio/visual output.
 *
 *   Laptop/backend --(Wi-Fi HTTP POST /command)--> ESP32 --> amplifier --> speaker
 *
 * It runs a tiny HTTP server and accepts:
 *   POST /command   body: {"command":"BREAK","message":"..."}
 *   GET  /command?cmd=GREETING            (convenience)
 *   GET  /health
 *
 * Supported commands: FOCUS_LOW | BREAK | GREETING | CUSTOM_MESSAGE
 *
 * Audio: a simple square-wave tone is bit-banged on SPEAKER_PIN so it works on
 * any ESP32 core version. Feed SPEAKER_PIN into a small amplifier (e.g. PAM8403)
 * driving the speaker. For spoken audio, wire a DFPlayer Mini and trigger clips
 * inside handleCommand() where noted.
 */

#include <WiFi.h>
#include <WebServer.h>

// ---- Configure these ----
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const int SPEAKER_PIN = 25;  // to amplifier input (or a piezo buzzer)
const int LED_PIN     = 2;   // onboard LED as a visual indicator

WebServer server(80);

// Bit-banged square-wave tone (portable across ESP32 core versions).
void beep(int freqHz, int durationMs) {
  if (freqHz <= 0) { delay(durationMs); return; }
  long halfPeriodUs = 500000L / freqHz;
  long cycles = (long)freqHz * durationMs / 1000;
  for (long i = 0; i < cycles; i++) {
    digitalWrite(SPEAKER_PIN, HIGH);
    delayMicroseconds(halfPeriodUs);
    digitalWrite(SPEAKER_PIN, LOW);
    delayMicroseconds(halfPeriodUs);
  }
}

void blink(int times, int ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH); delay(ms);
    digitalWrite(LED_PIN, LOW);  delay(ms);
  }
}

void handleCommand(const String& command, const String& message) {
  Serial.print("[NEO] command: "); Serial.println(command);
  if (message.length()) { Serial.print("[NEO] message: "); Serial.println(message); }

  if (command == "GREETING") {
    blink(2, 120); beep(660, 120); beep(880, 160);           // rising chime
  } else if (command == "FOCUS_LOW") {
    blink(3, 80);  beep(500, 100); beep(500, 100); beep(500, 100);  // alert
  } else if (command == "BREAK") {
    blink(1, 300); beep(440, 500);                            // one soft tone
  } else if (command == "CUSTOM_MESSAGE") {
    blink(1, 120); beep(700, 150);
    // >>> Trigger a DFPlayer Mini clip here for spoken output, if fitted.
  } else {
    beep(300, 120);                                           // unknown
  }
}

// Extract a JSON string value for `key` without a JSON library (prototype-grade).
String jsonValue(const String& body, const String& key) {
  String needle = "\"" + key + "\"";
  int k = body.indexOf(needle);
  if (k < 0) return "";
  int colon = body.indexOf(':', k);
  if (colon < 0) return "";
  int q1 = body.indexOf('"', colon + 1);
  if (q1 < 0) return "";
  int q2 = body.indexOf('"', q1 + 1);
  if (q2 < 0) return "";
  return body.substring(q1 + 1, q2);
}

void onCommandPost() {
  String body = server.arg("plain");
  String command = jsonValue(body, "command");
  String message = jsonValue(body, "message");
  if (command.length() == 0) command = server.arg("cmd");  // allow ?cmd= too
  handleCommand(command, message);
  server.send(200, "application/json", "{\"ok\":true}");
}

void onCommandGet() {
  String command = server.arg("cmd");
  handleCommand(command, "");
  server.send(200, "application/json", "{\"ok\":true}");
}

void setup() {
  Serial.begin(115200);
  pinMode(SPEAKER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[NEO] connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print("."); }
  Serial.println();
  Serial.print("[NEO] ready at http://");
  Serial.println(WiFi.localIP());        // put this IP in backend/.env ESP32_URL

  server.on("/command", HTTP_POST, onCommandPost);
  server.on("/command", HTTP_GET, onCommandGet);
  server.on("/health", HTTP_GET, []() { server.send(200, "application/json", "{\"ok\":true}"); });
  server.begin();

  handleCommand("GREETING", "");  // boot chime
}

void loop() {
  server.handleClient();
}
