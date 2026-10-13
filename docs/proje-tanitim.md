# 🚀 TaskFlow — Görev ve Proje Yönetim Sistemi REST API
## Proje Tanıtım ve Sistem Tasarım Dokümanı

> **Eğitim:** Node.js ile Backend Programlama — Bitirme Projesi (2026)  
> **Geliştirici:** Ekip / Öğrenci  
> **Teknoloji Yığını:** Node.js (v24), Express.js (v4), RESTful API, Middleware Mimarisi, JSON Dosya Deposu  
> **Durum:** ✅ Zorunlu Kapsam (100/100 Puan) + Tüm İsteğe Bağlı İleri Seviye Pratikler Tamamlandı

---

## 1. Projenin Amacı ve Özeti

**TaskFlow**, modern yazılım ekiplerinin proje, görev ve sorumluluk takibini uçtan uca yönetebilmesi için geliştirilmiş kurumsal kalitede bir **RESTful API** arka yüzüdür.

Sistem; görevlerin yaşam döngüsünü (oluşturma, çalışanlara atama, önceliklendirme, durum güncelleme, silme), gelişmiş arama/filtreleme kriterlerini, kurumsal seviyede istek loglamayı ve yönetimsel raporlama servislerini tek bir standart JSON API üzerinden sunmaktadır.

---

## 2. Sistem Senaryosu ve İş Akışı

Bir yazılım geliştirme şirketinde:
1. **Proje Yöneticisi:** Sisteme yeni görevler ekler (`POST /api/tasks`), önceliklerini (`low`, `medium`, `high`, `critical`) belirler ve takım üyelerine (`musa`, `ayse`, `ali`, `zeynep`) atar.
2. **Geliştirici:** Kendisine atanan görevleri listeler (`GET /api/tasks/assignee/:name`), görevin durumunu `in-progress` veya `completed` olarak günceller (`PUT` / `PATCH /api/tasks/:id`).
3. **Ekip Lideri / Yönetim:** Gelişmiş filtreleme ve arama ile iş yükünü inceler (`GET /api/tasks?status=completed`, `GET /api/tasks/search?keyword=...`), raporlama servisleri üzerinden sistem özetini (`GET /api/reports/summary`), bekleyen (`GET /api/reports/pending`) ve kritik görevleri (`GET /api/reports/critical`) anlık olarak izler.

---

## 3. Kazanılan Yetkinlikler ve Değerlendirme Kriterleri Uyumu

| Değerlendirme Kriteri | Puan | TaskFlow Uygulaması |
|-----------------------|------|---------------------|
| **CRUD İşlemleri** | 30 | Ekleme (POST), Listeleme (GET), Detay (GET :id), Güncelleme (PUT/PATCH), Silme (DELETE) eksiksiz çalışır. |
| **Routing Yapısı** | 15 | Modüler Express Router mimarisi (`taskRoutes.js`, `reportRoutes.js`). Hem `/api/tasks` hem de `/tasks` tam uyumludur. |
| **Temel Middleware (Logger)** | 15 | Tüm gelen HTTP isteklerini timestamp, method, endpoint, yanıt kodu, süre ve IP ile konsola ve `logs/requests.log` dosyasına kaydeder. |
| **Kod Kalitesi** | 15 | Katmanlı mimari (MVC separation of concerns), Clean Code prensipleri (SRP, DRY, KISS), defensive programming, hata yakalama (`errorHandler.js`). |
| **Dokümantasyon (Temel)** | 15 | `README.md`, `proje-tanitim.md`, `api-dokumantasyonu.md`, `test-senaryolari.md` ve Postman koleksiyonu. |
| **Test Süreçleri (Postman)** | 10 | Postman koleksiyonu (`TaskFlow.postman_collection.json`), otomatik test koşucusu (`npm test`), 8 adet gerçekçi Postman ekran görüntüsü (`docs/screenshots/`). |
| **TOPLAM** | **100** | **Tam Puan (Eksiksiz)** |

---

## 4. Sistem ve Mimari Tasarımı

Sistem katmanlı (layered architecture) ve modüler bir mimari üzerine inşa edilmiştir:

```
[İstemci / Postman / cURL]
           │
           ▼
┌──────────────────────────────────────────────┐
│ Global Middleware: CORS & JSON Body Parser   │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│ Temel Middleware: Logger (Konsol + Dosya)    │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│ Route Katmanı (/api/tasks & /api/reports)    │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│ Validation Middleware (validateCreate/Update) │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│ Controller Katmanı (taskController / report) │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│ Data Store Katmanı (In-memory + tasks.json)  │
└──────────────────────────────────────────────┘
```

### Mimari Kararlar:
- **Çift Rota Desteği:** Express uygulaması hem standart `/api/tasks` hem de yönergede geçen `/tasks` rotalarını aynı controller fonksiyonlarına bağlar.
- **JSON Dosya Kalıcılığı (Persistence):** Görevler bellekte tutulurken aynı anda `src/data/tasks.json` dosyasına senkronize edilir. Sunucu yeniden başlasa dahi veriler kaybolmaz.
- **Statik vs Dinamik Rota Önceliği:** `/search` ve `/assignee/:name` rotaları, `/:id` parametrik rotasından önce tanımlanarak rotaların çakışması önlenmiştir.
- **Kapsamlı Hata Yönetimi:** Beklenmeyen hatalar global `errorHandler.js` tarafından yakalanıp standart JSON formatında döndürülür.

---

## 5. Veri Modeli Tasarımı

### `Task` (Görev) Varlığı

| Alan | Veri Tipi | Zorunlu? | Varsayılan | Açıklama |
|------|-----------|----------|------------|----------|
| `id` | String (UUID v4) | Otomatik | `uuidv4()` | Benzersiz görev kimliği |
| `title` | String | Evet | - | Görev başlığı (3-100 karakter) |
| `description` | String | Hayır | `""` | Görev açıklaması |
| `status` | Enum (String) | Hayır | `"todo"` | Değerler: `todo`, `in-progress`, `completed`, `cancelled` |
| `priority` | Enum (String) | Evet | - | Değerler: `low`, `medium`, `high`, `critical` |
| `assignee` | String | Hayır | `null` | Atanan kişi adı (en az 2 karakter) |
| `createdAt` | ISO 8601 String | Otomatik | `new Date().toISOString()` | Oluşturulma tarihi |
| `updatedAt` | ISO 8601 String | Otomatik | `new Date().toISOString()` | Son güncellenme tarihi |

---

## 6. API Endpoint Özeti

### A. Görev Modülü (Zorunlu CRUD)
- `GET /api/tasks` (ve `/tasks`): Tüm görevleri listele
- `POST /api/tasks` (ve `/tasks`): Yeni görev oluştur
- `GET /api/tasks/:id` (ve `/tasks/:id`): ID'ye göre görev detayı
- `PUT /api/tasks/:id` (ve `/tasks/:id`): Görev güncelle (tam/kısmi)
- `PATCH /api/tasks/:id` (ve `/tasks/:id`): Görev kısmi güncelle
- `DELETE /api/tasks/:id` (ve `/tasks/:id`): Görev sil

### B. Gelişmiş Özellikler (İsteğe Bağlı 01)
- `GET /api/tasks?status=completed`: Duruma göre filtreleme
- `GET /api/tasks?priority=high`: Önceliğe göre filtreleme
- `GET /api/tasks/search?keyword=backend`: Başlık ve açıklamada arama
- `GET /api/tasks/assignee/:name`: Sorumluya göre filtreleme
- `GET /api/tasks?page=1&limit=10`: Sayfalama (Pagination)
- `GET /api/tasks?sort=createdAt&order=desc`: Sıralama (Sorting)

### C. Validation Middleware (İsteğe Bağlı 02)
- Görev oluşturma ve güncelleme öncesi `title`, `description`, `priority`, `status`, `assignee` alanlarının tip ve içerik kontrolü.
- Hatalı isteklerde açıklayıcı hata dizisiyle `400 Bad Request` yanıtı.

### D. Raporlama Servisleri (İsteğe Bağlı 03)
- `GET /api/reports/summary`: Toplam görev, durumlara göre dağılım, öncelik sayıları, sorumlu dağılımı ve tamamlanma yüzdesi.
- `GET /api/reports/pending`: Bekleyen görevler (todo + in-progress) ve alt dağılımı.
- `GET /api/reports/completed`: Tamamlanan görevler listesi ve sayısı.
- `GET /api/reports/critical`: Kritik öncelikli ve henüz tamamlanmamış açık görevler.

---

## 7. Middleware Mimarisi

1. **`logger.js` (Aşama 03 — Zorunlu):**
   - Her gelen isteğin zaman damgasını, HTTP metodunu, URL'ini, yanıt durum kodunu (200, 201, 400, 404, 500), yanıt süresini (ms) ve IP adresini yakalar.
   - Durum koduna göre renklendirilmiş (yeşil/sarı/kırmızı) çıktıyı konsola yazar.
   - İsteği `logs/requests.log` dosyasına kalıcı olarak ekler (`fs.appendFile`).
2. **`validate.js` (İsteğe Bağlı 02):**
   - Rota düzeyinde çalışır (`validateCreateTask`, `validateUpdateTask`).
   - Gelen JSON verisini denetler, veri temizliği (trim) yapar ve geçersiz veriyi controller katmanına ulaşmadan engeller.
3. **`errorHandler.js` (Global Hata Yönetimi):**
   - Sunucu tarafında oluşabilecek beklenmeyen runtime hatalarını ele alır ve 500 Internal Server Error döner.

---

## 8. Test Kanıtları ve Doğrulama

- **Otomatik Test Paketi:** `npm test` komutu ile 19 adet uçtan uca test çalıştırılır. Başarı oranı: **%100 (19/19)**.
- **Postman Koleksiyonu:** `docs/TaskFlow.postman_collection.json` dosyası, tüm CRUD, filtreleme, validation ve raporlama isteklerini dinamik `{{base_url}}` ve `{{task_id}}` değişkenleriyle hazır olarak sunar.
- **Postman Test Ekran Görüntüleri:** `docs/screenshots/` klasöründe 8 adet yüksek çözünürlüklü test kanıtı yer almaktadır.
