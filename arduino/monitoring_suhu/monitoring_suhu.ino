#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ===== WiFi =====
const char* ssid = "KOST_PUTRA";
const char* password = "1sampai8";

// ===== API Server =====
const char* serverUrl = "http://192.168.1.31:5001/api/temperature"; // ganti dengan IP server Node.js

// ===== DS18B20 =====
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

int cow_id = 1; // ID sapi

void setup() {
  Serial.begin(115200);       
  sensors.begin();

  // Koneksi WiFi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    retryCount++;
    if (retryCount > 60) {  // timeout 30 detik
      Serial.println("\nFailed to connect WiFi!");
      break;
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  }
}

void loop() {
  // Baca suhu sensor DS18B20
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  // Tampilkan di Serial Monitor
  Serial.print("Cow ID: "); Serial.print(cow_id);
  Serial.print(" | Temperature: "); Serial.print(temperature);
  Serial.println(" °C");

  // Kirim data ke server jika WiFi tersambung
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Buat JSON payload
    String payload = "{\"cow_id\":";
    payload += cow_id;
    payload += ",\"temperature\":";
    payload += temperature;
    payload += "}";

    // POST data
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Server Response: ");
      Serial.println(response); // menampilkan apakah data berhasil tersimpan di DB
    } else {
      Serial.print("Error sending POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi not connected. Cannot send data.");
  }

  Serial.println("-------------------------------");
  delay(5000); // Kirim tiap 5 detik
}
