#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi credentials
const char* ssid = "KOST_PUTRA";
const char* password = "1sampai8";

// Server REST API endpoint
const char* serverName = "http://192.168.1.22:5001/api/suhu"; 
const char* apiKey = "mysecretkey123";

// Setup sensor suhu DS18B20
OneWire oneWire(4);                 // Pin data sensor DS18B20 di GPIO 4
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200); 
  sensors.begin();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

void loop() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  // ✅ Tampilkan ke Serial Monitor
  Serial.print("Suhu sekarang: ");
  Serial.print(tempC);
  Serial.println(" °C");

  // ✅ Kirim ke server REST API
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-KEY", apiKey);

    String payload = "{\"device_id\":\"sapi01\",\"suhu\":" + String(tempC, 2) + "}";
    int code = http.POST(payload);

    Serial.print("Status HTTP: ");
    Serial.println(code);

    if (code > 0) {
      String resp = http.getString();
      Serial.println("Response: " + resp);
    } else {
      Serial.println("Gagal kirim data ke server.");
    }
    http.end();
  }

  delay(2000); // ✅ kirim tiap 2 detik
}
