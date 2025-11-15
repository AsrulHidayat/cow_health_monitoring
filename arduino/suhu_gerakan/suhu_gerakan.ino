// ========================================================
// 🔹 Import Library yang Dibutuhkan
// ========================================================
#include <Wire.h>                 // Untuk komunikasi I2C (ADXL345)
#include <WiFi.h>                 // Untuk koneksi WiFi pada ESP32
#include <HTTPClient.h>           // Untuk koneksi HTTP ke server (POST/GET)
#include <ArduinoJson.h>          // Untuk membuat data JSON
#include <OneWire.h>              // Untuk komunikasi 1-Wire (DS18B20)
#include <DallasTemperature.h>    // Untuk membaca data suhu
#include <Adafruit_ADXL345_U.h>   // Untuk sensor percepatan ADXL345

// ========================================================
// 🔹 Pengaturan WiFi
// ========================================================
const char* ssid = "KOST_PUTRA";
const char* password = "1sampai8";

// ========================================================
// 🔹 URL Server API
// ========================================================
const char* serverTempUrl = "http://192.168.1.19:5001/api/temperature";  // Endpoint suhu
const char* serverActUrl  = "http://192.168.1.19:5001/api/activity";     // Endpoint aktivitas

// ========================================================
// 🔹 Konfigurasi Sensor DS18B20 (Suhu)
// ========================================================
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ========================================================
// 🔹 Konfigurasi Sensor ADXL345 (Gerakan)
// ========================================================
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// ========================================================
// 🔹 Identitas Sapi
// ========================================================
int cow_id = 1;

// ========================================================
// 🔹 setup()
// ========================================================
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
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Failed to connect WiFi!");
  }

  // === Inisialisasi Sensor ===
  sensors.begin();  // DS18B20
  Serial.println("Sensor DS18B20 siap digunakan.");

  if (!accel.begin()) {
    Serial.println("❌ Error: Sensor ADXL345 tidak terdeteksi!");
    while (1);
  }
  accel.setRange(ADXL345_RANGE_16_G);
  Serial.println("Sensor ADXL345 siap digunakan.");
}

// ========================================================
// 🔹 loop()
// ========================================================
void loop() {
  // =====================================================
  // 🔸 1. Baca Data Suhu dari DS18B20
  // =====================================================
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("Error: Sensor suhu tidak terpasang dengan benar!");
  } else {
    Serial.print("🌡️ Cow ID: "); Serial.print(cow_id);
    Serial.print(" | Temperature: "); Serial.print(temperature, 2);
    Serial.println(" °C");
  }

  // =====================================================
  // 🔸 2. Baca Data Gerakan dari ADXL345
  // =====================================================
  sensors_event_t event;
  accel.getEvent(&event);
  float accelX = event.acceleration.x;
  float accelY = event.acceleration.y;
  float accelZ = event.acceleration.z;

  Serial.print("📈 X: "); Serial.print(accelX);
  Serial.print(" | Y: "); Serial.print(accelY);
  Serial.print(" | Z: "); Serial.println(accelZ);

  // =====================================================
  // 🔸 3. Kirim Data ke Server (Jika WiFi Aktif)
  // =====================================================
  if (WiFi.status() == WL_CONNECTED) {

    // ===== Kirim Data Suhu =====
    HTTPClient httpTemp;
    httpTemp.begin(serverTempUrl);
    httpTemp.addHeader("Content-Type", "application/json");

    StaticJsonDocument<128> jsonTemp;
    jsonTemp["cow_id"] = cow_id;
    jsonTemp["temperature"] = temperature;

    String payloadTemp;
    serializeJson(jsonTemp, payloadTemp);

    Serial.print("Sending Temperature Payload: ");
    Serial.println(payloadTemp);

    int tempResponse = httpTemp.POST(payloadTemp);
    if (tempResponse == HTTP_CODE_OK || tempResponse == 201) {
      String response = httpTemp.getString();
      Serial.print("✅ Temp Response: ");
      Serial.println(response);
    } else {
      Serial.print("❌ Temp POST Error: ");
      Serial.println(tempResponse);
    }
    httpTemp.end();

    // ===== Kirim Data Gerakan =====
    HTTPClient httpAct;
    httpAct.begin(serverActUrl);
    httpAct.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> jsonAct;
    jsonAct["cow_id"] = cow_id;
    jsonAct["accel_x"] = accelX;
    jsonAct["accel_y"] = accelY;
    jsonAct["accel_z"] = accelZ;

    String payloadAct;
    serializeJson(jsonAct, payloadAct);

    Serial.print("Sending Activity Payload: ");
    Serial.println(payloadAct);

    int actResponse = httpAct.POST(payloadAct);
    if (actResponse == HTTP_CODE_OK || actResponse == 201) {
      String response = httpAct.getString();
      Serial.print("✅ Activity Response: ");
      Serial.println(response);
    } else {
      Serial.print("❌ Activity POST Error: ");
      Serial.println(actResponse);
    }
    httpAct.end();

  } else {
    Serial.println("⚠️ WiFi not connected. Cannot send data.");
  }

  // =====================================================
  // 🔸 4. Pemisah dan jeda pengiriman berikutnya
  // =====================================================
  Serial.println("--------------------------------------");
  delay(5000);  // kirim setiap 5 detik
}
