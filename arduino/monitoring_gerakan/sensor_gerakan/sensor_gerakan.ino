// === Import Library yang Dibutuhkan ===
#include <Wire.h>           // Untuk komunikasi I2C
#include <WiFi.h>           // Untuk koneksi WiFi pada ESP32
#include <HTTPClient.h>     // Untuk koneksi HTTP POST ke server
#include <ArduinoJson.h>    // Untuk membuat data JSON
#include <Adafruit_ADXL345_U.h>  // Library sensor ADXL345

// ===== Pengaturan WiFi =====
const char* ssid = "KOST_PUTRA";             // Ganti dengan WiFi kamu
const char* password = "1sampai8";

// ===== URL Server API =====
const char* serverUrl = "http://192.168.1.25:5001/api/activity";  // Endpoint backend

// ===== Konfigurasi Sensor ADXL345 =====
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// ===== Identitas Sapi =====
int cow_id = 17;  // ID unik sapi (sama seperti di database)

// === Fungsi setup() ===
void setup() {
  Serial.begin(115200);
  Wire.begin();

  // === Koneksi WiFi ===
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 60) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect WiFi!");
  }

  // === Inisialisasi ADXL345 ===
  if (!accel.begin()) {
    Serial.println("Error: Sensor ADXL345 tidak terdeteksi!");
    while (1);
  }

  accel.setRange(ADXL345_RANGE_16_G);  // Atur sensitivitas sensor
  Serial.println("Sensor ADXL345 siap digunakan.");
}


// === Fungsi loop() ===
void loop() {
  sensors_event_t event;
  accel.getEvent(&event);  // Baca data akselerasi

  float accelX = event.acceleration.x;
  float accelY = event.acceleration.y;
  float accelZ = event.acceleration.z;

  // === Tampilkan data di Serial Monitor ===
  Serial.print("X: "); Serial.print(accelX); Serial.print(" m/s^2 ");
  Serial.print("Y: "); Serial.print(accelY); Serial.print(" m/s^2 ");
  Serial.print("Z: "); Serial.print(accelZ); Serial.println(" m/s^2 ");

  // === Kirim ke server jika WiFi aktif ===
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Buat JSON payload
    StaticJsonDocument<200> doc;
    doc["cow_id"] = cow_id;
    doc["accel_x"] = accelX;
    doc["accel_y"] = accelY;
    doc["accel_z"] = accelZ;

    String payload;
    serializeJson(doc, payload);

    Serial.print("Sending payload: ");
    Serial.println(payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Server response: ");
      Serial.println(response);
    } else {
      Serial.print("Error sending POST, code: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi not connected. Cannot send data.");
  }

  Serial.println("-----------------------------");
  delay(5000);  // Kirim setiap 5 detik
}
