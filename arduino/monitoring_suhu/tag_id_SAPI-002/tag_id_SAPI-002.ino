// === Import Library yang Dibutuhkan ===
#include <WiFi.h>                                                   // Untuk koneksi WiFi pada ESP32
#include <HTTPClient.h>                                             // Untuk mengirim data HTTP ke server (metode POST/GET)
#include <OneWire.h>                                                // Untuk komunikasi dengan sensor DS18B20 (1 wire)
#include <DallasTemperature.h>                                      // Untuk membaca data suhu dari sensor DS18B20
#include <ArduinoJson.h>                                            // Untuk membuat dan mengelola data JSON

// ===== Pengaturan WiFi =====
const char* ssid = "KOST_PUTRA";                                    // Nama jaringan WiFi yang akan dihubungkan
const char* password = "1sampai8";                                  // Password WiFi

// ===== URL Server API =====
const char* serverUrl = "http://192.168.1.27:5001/api/temperature"; // Alamat server tujuan untuk kirim data

// ===== Konfigurasi Sensor DS18B20 ===== 
#define ONE_WIRE_BUS 4                                              // Pin data sensor DS18B20 terhubung ke pin GPIO 4
OneWire oneWire(ONE_WIRE_BUS);                                      // Membuat objek OneWire untuk komunikasi satu jalur
DallasTemperature sensors(&oneWire);                                // Membuat objek sensor DS18B20 menggunakan jalur OneWire

// ===== Identitas Sapi =====
int cow_id = 17;                                                    // ID unik sapi (misal dari database)

// === Fungsi setup() dijalankan sekali saat board menyala ===
void setup() {
  Serial.begin(115200);                                             // Mengaktifkan komunikasi serial untuk debug
  sensors.begin();                                                  // Memulai komunikasi dengan sensor suhu DS18B20

  // ====== Proses koneksi ke WiFi ======
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);                                       // Mulai koneksi ke jaringan WiFi
  int retryCount = 0;                                               // Variabel untuk menghitung berapa kali mencoba koneksi

  // Selama WiFi belum tersambung, ulangi pengecekan
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);                                                     // Tunggu 0.5 detik sebelum cek lagi
    Serial.print(".");                                              // Tampilkan titik di serial agar terlihat prosesnya
    retryCount++;                                                   // Tambah hitungan percobaan
    if (retryCount > 60) {                                          // Jika sudah 60x percobaan (~30 detik)
      Serial.println("\nFailed to connect WiFi!");                  // Tampilkan pesan gagal
      break;                                                        // Hentikan proses koneksi
    }
  }

  // Jika WiFi berhasil tersambung, tampilkan informasi
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());                                 // Menampilkan IP yang didapat dari router
  }
}

// === Fungsi loop() berjalan berulang-ulang ===
void loop() {
  // ===== Membaca Data Suhu dari Sensor =====
  sensors.requestTemperatures();                                    // Minta sensor untuk mengukur suhu terbaru
  float temperature = sensors.getTempCByIndex(0);                   // Ambil hasil suhu dalam Celcius dari sensor pertama (index 0)

  // ===== Cek apakah sensor terbaca dengan benar =====
  if (temperature == DEVICE_DISCONNECTED_C) {                                // Jika tidak ada respon dari sensor
    Serial.println("Error: Temperatur suhu tidak terpasang dengan benar");
    delay(2000);                                                             // Tunggu 2 detik sebelum mencoba membaca lagi
    return;                                                                  // Keluar dari loop() saat ini dan lanjut ke siklus berikutnya
  }

  // ===== Menampilkan data suhu di Serial Monitor =====
  Serial.print("Cow ID: "); Serial.print(cow_id);
  Serial.print(" | Temperature: "); Serial.print(temperature, 2);           // Menampilkan 2 angka desimal
  Serial.println(" °C");

  // ===== Jika WiFi tersambung, kirim data ke server =====
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;                                                        // Membuat objek HTTP untuk koneksi ke server
    http.begin(serverUrl);                                                  // Menentukan alamat server tujuan
    http.addHeader("Content-Type", "application/json");                     // Memberi tahu server bahwa data dikirim dalam format JSON

    // ===== Membuat data JSON untuk dikirim =====
    StaticJsonDocument<128> doc;                                            // Membuat dokumen JSON dengan kapasitas 128 byte
    doc["cow_id"] = cow_id;                                                 // Menambahkan data ID sapi
    doc["temperature"] = temperature;                                       // Menambahkan data suhu sapi

    // Mengubah JSON menjadi string untuk dikirim
    String payload;
    serializeJson(doc, payload);
    Serial.print("Sending payload: ");
    Serial.println(payload);                                                // Tampilkan isi JSON di Serial Monitor

    // ===== Mengirim data ke server dengan metode POST =====
    int httpResponseCode = http.POST(payload);                              // Kirim data JSON ke server

    // ===== Cek hasil respon dari server =====
    if (httpResponseCode == HTTP_CODE_OK || httpResponseCode == 201) {
      String response = http.getString();                                   // Ambil pesan balasan dari server
      Serial.print("Server Response: ");
      Serial.println(response);                                             // Tampilkan respon
    } else {
      Serial.print("Error sending POST. HTTP Code: ");
      Serial.println(httpResponseCode);                                     // Tampilkan kode error HTTP
    }
    http.end();                                                            // Tutup koneksi HTTP untuk menghemat memori
    
  } else {
    // Jika WiFi terputus
    Serial.println("WiFi not connected. Cannot send data.");
  }

  // ===== Pemisah dan jeda pengiriman berikutnya =====
  Serial.println("-------------------------------");
  delay(5000); // Tunggu 5 detik sebelum mengulangi pembacaan dan pengiriman lagi
}
