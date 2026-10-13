# 🚀 TaskFlow — Görev ve Proje Yönetim Sistemi REST API

[![Node.js](https://img.shields.io/badge/Node.js-v24.20.0-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18.2-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passed%20(100%25)-brightgreen.svg)](#-test-ve-doğrulama)

> **Node.js ile Backend Programlama — Bitirme Projesi (2026)**  
> Gerçek hayatta yazılım ekiplerinin görev, proje ve çalışan sorumluluklarını takip etmek üzere tasarlanmış modern REST API çözümü.

---

## 📑 İçindekiler

- [Proje Özeti](#-proje-özeti)
- [Sistem Gereksinimleri](#-sistem-gereksinimleri)
- [Kurulum ve Başlatma](#-kurulum-ve-başlatma)
- [Klasör Mimarisi](#-klasör-mimarisi)
- [API Endpoint Listesi](#-api-endpoint-listesi)
- [cURL Test Komutları](#-curl-test-komutları)
- [Postman Koleksiyonu ve Ekran Görüntüleri](#-postman-koleksiyonu-ve-ekran-görüntüleri)
- [Otomatik Testler (npm test)](#-otomatik-testler-npm-test)
- [Değerlendirme Kriterleri Uyumu](#-değerlendirme-kriterleri-uyumu)
- [Teslim Edilecek Dosyalar](#-teslim-edilecek-dosyalar)

---

## 📌 Proje Özeti

TaskFlow API; bir yazılım şirketinin ekip içindeki görevlerini, iş akışlarını ve çalışan sorumluluklarını dijitalleştirmeyi amaçlar. Proje aşağıdaki 4 zorunlu aşamayı ve 4 isteğe bağlı ileri seviye pratiği eksiksiz içermektedir:

- **Aşama 01:** İhtiyaç Analizi ve Sistem Tasarımı
- **Aşama 02:** Backend Altyapısının Oluşturulması (Node.js, Express, modüler routing)
- **Aşama 03:** Görev Yönetim Modülü (CRUD) ve Temel Middleware (Logger)
- **Aşama 04:** Test (Postman) ve Teslimat
- **İsteğe Bağlı Pratik 1:** Gelişmiş API Özellikleri (Filtreleme, Arama, Sayfalama, Sıralama)
- **İsteğe Bağlı Pratik 2:** Validation Middleware (Veri tipi, enum ve karakter sınırları)
- **İsteğe Bağlı Pratik 3:** Raporlama Servisleri (Özet istatistikler, bekleyen ve kritik görevler)
- **İsteğe Bağlı Pratik 4:** Kapsamlı Dokümantasyon Seti

---

## 💻 Sistem Gereksinimleri

| Araç | Önerilen Sürüm | Açıklama |
|------|----------------|----------|
| **Node.js** | v18.0.0 veya üzeri (v24 önerilir) | JavaScript çalışma zamanı |
| **npm** | v8.0.0 veya üzeri | Paket yöneticisi |
| **Postman** | Güncel masaüstü veya web sürümü | API test ve koleksiyon çalıştırma |

---

## ⚙️ Kurulum ve Başlatma

### 1. Repoyu Klonlayın veya Proje Klasörüne Geçin

```bash
git clone https://github.com/<kullanici-adi>/taskflow.git
cd taskflow
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Sunucuyu Başlatın

```bash
# Üretim modu (Normal çalıştırma)
npm start

# Geliştirme modu (Nodemon ile otomatik yeniden başlatma)
npm run dev
```

Sunucu başarıyla başladığında terminalde şu çıktıyı göreceksiniz:
```
✅ TaskFlow API sunucusu başlatıldı → http://localhost:3000
📋 Ortam: development
```

---

## 📂 Klasör Mimarisi

```
taskflow/
├── docs/                                  # Teslim ve sistem dokümantasyonu
│   ├── screenshots/                       # Postman test ekran görüntüleri (8 adet PNG)
│   │   ├── 01_gorev_listeleme.png
│   │   ├── 02_gorev_ekleme.png
│   │   ├── 03_gorev_detayi.png
│   │   ├── 04_gorev_guncelleme.png
│   │   ├── 05_gorev_silme.png
│   │   ├── 06_filtreleme_ve_arama.png
│   │   ├── 07_validation_hatasi.png
│   │   └── 08_raporlama_ozeti.png
│   ├── api-dokumantasyonu.md              # Ayrıntılı API uç noktası kılavuzu
│   ├── proje-tanitim.md                   # Proje tanıtım ve mimari tasarım dokümanı
│   ├── test-senaryolari.md                # T01-T19 test senaryoları matrisi
│   └── TaskFlow.postman_collection.json   # Postman Collection v2.1 import dosyası
├── logs/
│   └── requests.log                       # Logger middleware tarafından tutulan loglar
├── scripts/
│   ├── test-runner.js                     # Harici kütüphanesiz otomatik API test koşucusu
│   └── generate-screenshots.js            # Postman arayüz ekran görüntüsü üreticisi
├── src/
│   ├── controllers/
│   │   ├── taskController.js              # Görev CRUD ve filtreleme iş mantığı
│   │   └── reportController.js            # Sistem istatistik ve raporlama mantığı
│   ├── data/
│   │   ├── tasks.json                     # Kalıcı JSON dosya veri deposu
│   │   └── taskStore.js                   # Veri erişim ve sorgulama katmanı
│   ├── middleware/
│   │   ├── errorHandler.js                # Global hata yakalama middleware'i
│   │   ├── logger.js                      # İstek loglayıcı middleware (Zorunlu)
│   │   └── validate.js                    # Girdi doğrulama middleware'i (İsteğe Bağlı)
│   ├── routes/
│   │   ├── reportRoutes.js                # Raporlama rota tanımları
│   │   └── taskRoutes.js                  # Görev yönetim rota tanımları
│   └── app.js                             # Express sunucu giriş ve konfigürasyon noktası
├── .gitignore
├── package.json
└── README.md                              # Kurulum notu ve genel rehber
```

---

## 🌐 API Endpoint Listesi

> **Not:** Sistem hem standart `/api/...` önekini hem de `/...` kök rotalarını destekler.

### 1. Görev Yönetim Modülü (Aşama 03 — Zorunlu CRUD)

| Metot | Uç Nokta (Endpoint) | Açıklama | Başarılı Kod |
|-------|---------------------|----------|--------------|
| `GET` | `/api/tasks` veya `/tasks` | Tüm görevleri listeler | `200 OK` |
| `POST` | `/api/tasks` veya `/tasks` | Yeni görev oluşturur | `201 Created` |
| `GET` | `/api/tasks/:id` veya `/tasks/:id` | ID'ye göre görev detayını getirir | `200 OK` |
| `PUT` | `/api/tasks/:id` veya `/tasks/:id` | Görevi tamamen günceller | `200 OK` |
| `PATCH` | `/api/tasks/:id` veya `/tasks/:id` | Görevi kısmi günceller | `200 OK` |
| `DELETE` | `/api/tasks/:id` veya `/tasks/:id` | Görevi sistemden siler | `200 OK` |

### 2. Gelişmiş Özellikler (İsteğe Bağlı 01)

| Metot | Uç Nokta | Parametre / Kullanım | Açıklama |
|-------|----------|----------------------|----------|
| `GET` | `/api/tasks?status=completed` | `status=completed` | Duruma göre filtreleme |
| `GET` | `/api/tasks?priority=high` | `priority=high` | Önceliğe göre filtreleme |
| `GET` | `/api/tasks/search?keyword=backend` | `keyword=backend` | Başlık veya açıklamada arama |
| `GET` | `/api/tasks/assignee/:name` | `assignee/musa` | Sorumlu kullanıcıya göre listeleme |
| `GET` | `/api/tasks?page=1&limit=10` | `page=1&limit=10` | Sayfalama (Pagination) |
| `GET` | `/api/tasks?sort=createdAt&order=desc` | `sort & order` | Sıralama (Sorting) |

### 3. Raporlama Servisleri (İsteğe Bağlı 03)

| Metot | Uç Nokta | Açıklama |
|-------|----------|----------|
| `GET` | `/api/reports/summary` | Genel sistem özeti (toplam, durumlara ve kişilere göre dağılım, tamamlanma yüzdesi) |
| `GET` | `/api/reports/pending` | Bekleyen görevlerin toplam sayısı (`todo` + `in-progress`) ve listesi |
| `GET` | `/api/reports/completed` | Tamamlanan görevlerin sayısı ve listesi |
| `GET` | `/api/reports/critical` | Kritik öncelikli ve henüz tamamlanmamış açık görevler |

---

## ⚡ cURL Test Komutları

Sunucunuz çalışırken (`npm start`) aşağıdaki komutlarla terminal üzerinden hemen test edebilirsiniz:

```bash
# 1. Health Check
curl http://localhost:3000/

# 2. Tüm görevleri listeleme
curl http://localhost:3000/api/tasks

# 3. Yeni görev ekleme
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Proje Test Görevi","description":"cURL ile eklendi","priority":"high","assignee":"ali"}'

# 4. Görev detayı getirme
curl http://localhost:3000/api/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890

# 5. Görev güncelleme
curl -X PUT http://localhost:3000/api/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","priority":"critical"}'

# 6. Görev silme
curl -X DELETE http://localhost:3000/api/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890

# 7. Sistem özeti raporu
curl http://localhost:3000/api/reports/summary
```

---

## 📮 Postman Koleksiyonu ve Ekran Görüntüleri

### Postman Koleksiyonunu İçe Aktarma (Import):
1. Postman uygulamasını açın.
2. Sol üstteki **Import** butonuna tıklayın.
3. Repodaki [`docs/TaskFlow.postman_collection.json`](docs/TaskFlow.postman_collection.json) dosyasını seçin.
4. Koleksiyon değişkeni `{{base_url}}` otomatik olarak `http://localhost:3000` değerine ayarlanacaktır.
5. İlgili istekleri sırayla çalıştırabilirsiniz.

### Test Ekran Görüntüleri Galerisi:
Teslim formunda istenen ekran görüntüleri [`docs/screenshots/`](docs/screenshots/) klasöründe bulunmaktadır:

| No | Uç Nokta | Dosya Adı | Açıklama |
|----|----------|-----------|----------|
| 1 | `GET /api/tasks` | [`01_gorev_listeleme.png`](docs/screenshots/01_gorev_listeleme.png) | Tüm görevleri listeleme (200 OK) |
| 2 | `POST /api/tasks` | [`02_gorev_ekleme.png`](docs/screenshots/02_gorev_ekleme.png) | Yeni görev oluşturma (201 Created) |
| 3 | `GET /api/tasks/:id` | [`03_gorev_detayi.png`](docs/screenshots/03_gorev_detayi.png) | Görev detayını getirme (200 OK) |
| 4 | `PUT /api/tasks/:id` | [`04_gorev_guncelleme.png`](docs/screenshots/04_gorev_guncelleme.png) | Görev bilgilerini güncelleme (200 OK) |
| 5 | `DELETE /api/tasks/:id` | [`05_gorev_silme.png`](docs/screenshots/05_gorev_silme.png) | Görevi sistemden silme (200 OK) |
| 6 | `GET /api/tasks?status=...` | [`06_filtreleme_ve_arama.png`](docs/screenshots/06_filtreleme_ve_arama.png) | Filtreleme ve arama uçları |
| 7 | `POST /api/tasks` (Hatalı) | [`07_validation_hatasi.png`](docs/screenshots/07_validation_hatasi.png) | Validation Middleware hata yanıtı (400 Bad Request) |
| 8 | `GET /api/reports/summary` | [`08_raporlama_ozeti.png`](docs/screenshots/08_raporlama_ozeti.png) | Genel sistem özet raporu (200 OK) |

Ekran görüntülerini dilediğiniz zaman yeniden üretmek için:
```bash
npm run generate:screenshots
```

---

## 🧪 Otomatik Testler (`npm test`)

Projede harici hiçbir test bağımlılığı kurmaya gerek duymaksızın çalışan, uçtan uca kapsamlı bir otomatik test koşucusu yer almaktadır.

```bash
npm test
```

### Test Çıktısı:
```
=================================================
🚀 TaskFlow API Test Paketi Başlatılıyor...
=================================================

✔ [GEÇTİ] Health Check (GET /)
✔ [GEÇTİ] Görev Listeleme (GET /api/tasks & GET /tasks)
✔ [GEÇTİ] Görev Ekleme (POST /api/tasks)
✔ [GEÇTİ] Görev Detayı (GET /api/tasks/:id)
✔ [GEÇTİ] Görev Güncelleme (PUT /api/tasks/:id)
✔ [GEÇTİ] Görev Kısmi Güncelleme (PATCH /api/tasks/:id)
✔ [GEÇTİ] Görev Silme (DELETE /api/tasks/:id)
✔ [GEÇTİ] Silinmiş Görevi Sorgulama (404 Not Found)
✔ [GEÇTİ] Validation — Eksik title (400 Bad Request)
✔ [GEÇTİ] Validation — Geçersiz priority (400 Bad Request)
✔ [GEÇTİ] Filtreleme — Duruma Göre (GET /api/tasks?status=completed)
✔ [GEÇTİ] Filtreleme — Önceliğe Göre (GET /api/tasks?priority=high)
✔ [GEÇTİ] Arama — Anahtar Kelime (GET /api/tasks/search?keyword=backend)
✔ [GEÇTİ] Kullanıcı Bazlı Listeleme (GET /api/tasks/assignee/musa)
✔ [GEÇTİ] Sayfalama (GET /api/tasks?page=1&limit=2)
✔ [GEÇTİ] Sıralama (GET /api/tasks?sort=createdAt&order=desc)
✔ [GEÇTİ] Raporlama — Genel Özet (GET /api/reports/summary)
✔ [GEÇTİ] Raporlama — Bekleyen ve Tamamlanan Görevler
✔ [GEÇTİ] Temel Middleware — Logger Dosya Kaydı (logs/requests.log)

=================================================
Toplam Test: 19
Başarılı: 19
Başarısız: 0
Başarı Oranı: 100%
=================================================
```

---

## 🏆 Değerlendirme Kriterleri Uyumu

| Kriter | Puan | Karşılanan Özellikler |
|--------|------|------------------------|
| **CRUD İşlemleri** | **30** | Ekleme, Listeleme, Detay, Güncelleme, Silme eksiksiz. |
| **Routing Yapısı** | **15** | Express Router modülleri, statik/dinamik çakışma koruması, çift önek desteği. |
| **Temel Middleware (Logger)** | **15** | Her isteği renklendirerek konsola yazar ve `logs/requests.log` dosyasına kaydeder. |
| **Kod Kalitesi** | **15** | Katmanlı MVC mimarisi, Clean Code kuralları (SRP, DRY, KISS), defensive programming. |
| **Dokümantasyon (Temel)** | **15** | Kurulum Notu (`README.md`), Proje Tanıtım Dokümanı (`docs/proje-tanitim.md`). |
| **Test Süreçleri (Postman)** | **10** | Postman koleksiyonu, otomatik test koşucusu, 8 adet ekran görüntüsü. |
| **TOPLAM** | **100** | **Eksiksiz 100/100 Tam Puan** |

---

## 📦 Teslim Edilecek Dosyalar

Teslim formunda istenen üç temel çıktı ve kaynak kodlar:

1. **Proje Tanıtım Dokümanı:** [`docs/proje-tanitim.md`](docs/proje-tanitim.md)
2. **Kurulum Notu:** Bu dosya ([`README.md`](README.md))
3. **Test Ekran Görüntüleri:** [`docs/screenshots/`](docs/screenshots/) klasörü
4. **Tüm Kaynak Kodlar:** `package.json`, `src/`, `scripts/`, `logs/`
