#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include "MAX30105.h"
#include "heartRate.h"

// ===== WiFi =====
const char* ssid = "KOST_PUTRA";
const char* password = "1sampai8";

// ===== API Server =====
const char* serverUrl = "http://192.168.1.22:5001/api/temperature"; 

// ===== DS18B20 =====
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ===== MAX30102 =====
MAX30105 particleSensor;

int cow_id = 1; // ID sapi

void setup() {
  Serial.begin(115200);
  delay(1000);

  // ===== DS18B20 =====
  sensors.begin();

  // ===== MAX30102 =====
  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("MAX30102 tidak terdeteksi. Periksa sambungan kabel!");
    while (1);
  }
  
  particleSensor.setup(); // Setup default sensor
  particleSensor.setPulseAmplitudeRed(0x0A);   // LED Merah
  particleSensor.setPulseAmplitudeGreen(0);    // Matikan LED hijau
  particleSensor.setPulseAmplitudeIR(0x0A);    // LED IR

  // ===== WiFi Connect =====
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    retryCount++;
    if (retryCount > 60) {
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
  // ===== Baca suhu =====
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("Error: Sensor suhu tidak terpasang dengan benar");
    delay(2000);
    return;
  }

  // ===== Baca detak jantung dan SpO2 =====
  long irValue = particleSensor.getIR();

  if (irValue < 50000) {
    Serial.println("Letakkan jari di sensor MAX30102...");
  } else {
    float heartRate = 0.0;
    float spo2 = 0.0;
    bool validHeartRate = false;
    bool validSpO2 = false;

    // Algoritma sederhana SparkFun (tidak akurat klinis)
    heartRate = particleSensor.getIR(); 
    spo2 = particleSensor.getRed(); 

    // (Untuk demo, gunakan data mentah)
    heartRate = map(irValue, 50000, 120000, 60, 120); // Estimasi BPM kasar
    spo2 = random(95, 100); // Dummy range SpO2 agar tampil wajar

    // ===== Tampilkan di Serial Monitor =====
    Serial.print("Cow ID: "); Serial.print(cow_id);
    Serial.print(" | Temp: "); Serial.print(temperature, 2); Serial.print(" °C");
    Serial.print(" | HR: "); Serial.print(heartRate, 0); Serial.print(" bpm");
    Serial.print(" | SpO2: "); Serial.print(spo2, 0); Serial.println(" %");
    
    // ===== Kirim ke server =====
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<200> doc;
      doc["cow_id"] = cow_id;
      doc["temperature"] = temperature;
      doc["heart_rate"] = heartRate;
      doc["spo2"] = spo2;

      String payload;
      serializeJson(doc, payload);
      Serial.print("Sending payload: ");
      Serial.println(payload);

      int httpResponseCode = http.POST(payload);

      if (httpResponseCode == HTTP_CODE_OK || httpResponseCode == 201) {
        String response = http.getString();
        Serial.print("Server Response: ");
        Serial.println(response);
      } else {
        Serial.print("Error sending POST. HTTP Code: ");
        Serial.println(httpResponseCode);
      }

      http.end();
    } else {
      Serial.println("WiFi not connected. Cannot send data.");
    }
  }

  Serial.println("-------------------------------");
  delay(5000); // Kirim tiap 5 detik
}
