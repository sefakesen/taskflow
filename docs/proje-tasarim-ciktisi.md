# TaskFlow — Görev ve Proje Yönetim Sistemi REST API
## Backend Geliştirme Proje Envanteri — Tasarım Çıktısı

- **Eğitim:** Node.js ile Backend Programlama — Bitirme Projesi (2026)
- **Geliştirici:** Sefa Kesen
- **Teknoloji Yığını:** Node.js, Express.js, REST API, JSON Veri Deposu
- **Teslim Türü:** Tasarım Çıktısı (Aşama 01 ve Sistem Tasarımı)

---

## 1. Projenin Amacı ve İhtiyaç Analizi

TaskFlow; yazılım geliştirme şirketlerinin ekip içerisindeki iş dağılımını, görevlerin durumlarını, öncelik seviyelerini ve çalışan sorumluluklarını merkezi olarak takip edebilmeleri amacıyla tasarlanmış bir RESTful API arka yüzüdür.

Sistem, yazılım projelerindeki görev takibini dijitalleştirerek:
- Görevlerin kolayca oluşturulmasını ve çalışanlara atanmasını,
- Görev durumlarının anlık olarak izlenmesini ve güncellenmesini,
- Kritik işlerin önceliklendirilmesini,
- Filtreleme, arama ve istatistiksel raporlama süreçlerinin tek bir standart arayüz üzerinden yürütülmesini sağlar.

---

## 2. Sistem Senaryosu ve İş Akışı

1. **Görev Tanımlama:** Proje yöneticisi sisteme yeni bir görev ekler (`POST /api/tasks`). Görevin başlığını, açıklamasını, öncelik derecesini (`low`, `medium`, `high`, `critical`) ve atanacak çalışan adını belirler.
2. **Görev İnceleme ve Takip:** Geliştiriciler kendilerine atanan görevleri listeler (`GET /api/tasks/assignee/:name`) veya tüm aktif işleri sorgular (`GET /api/tasks`).
3. **Durum Güncelleme:** Geliştirici göreve başladığında durumunu `in-progress`, tamamladığında ise `completed` olarak günceller (`PUT /api/tasks/:id`).
4. **Görev Kapatma ve Silme:** Tamamlanan veya iptal edilen görevler gerektiğinde sistemden silinir (`DELETE /api/tasks/:id`).
5. **Yönetimsel İzleme ve Raporlama:** Ekip liderleri sistem özeti (`GET /api/reports/summary`) üzerinden toplam görev sayısını, durum dağılımını ve genel tamamlanma oranını inceler.

---

## 3. Mimari Tasarım ve Katmanlı Yapı

Sistem, sorumlulukların ayrılması (Separation of Concerns) prensibi gözetilerek katmanlı bir mimari üzerinde inşa edilmiştir:

```
[İstemci / Postman]
       │
       ▼
[JSON Body Parser Middleware] (express.json)
       │
       ▼
[Logger Middleware] (logs/requests.log ve Konsol Çıktısı)
       │
       ▼
[Router Katmanı] (taskRoutes.js & reportRoutes.js)
       │
       ▼
[Validation Middleware] (validateCreateTask & validateUpdateTask)
       │
       ▼
[Controller Katmanı] (taskController.js & reportController.js)
       │
       ▼
[Data Store Katmanı] (taskStore.js: Bellek İçi Erişim + tasks.json Senkronizasyonu)
```

### Mimari Kararlar:
- **Modüler Rota Yapısı:** Rotalar görev ve raporlama olarak bağımsız router dosyalarına ayrılmıştır. Sistem hem `/api/...` önekli kurumsal rotaları hem de `/...` doğrudan rotalarını destekler.
- **Statik ve Dinamik Rota Önceliği:** Dinamik ID rotaları (`/:id`) yerine `/search` ve `/assignee/:name` gibi statik rotalar dosyanın üst kısımlarında tanımlanarak rota çakışmaları engellenmiştir.
- **Kalıcı JSON Veri Deposu:** Görevler bellek içinde tutulurken aynı zamanda `src/data/tasks.json` dosyasına yazılır. Sunucu yeniden başladığında veriler korunur.
- **Merkezi Hata Yönetimi:** Beklenmeyen sunucu hataları global `errorHandler.js` üzerinden yakalanarak istemciye standart hata mesajı iletilir.

---

## 4. Veri Modeli Tasarımı

### Görev (Task) Varlığı

| Alan | Veri Tipi | Zorunlu | Varsayılan | Açıklama |
|---|---|:---:|---|---|
| `id` | String (UUID v4) | Evet | `uuidv4()` | Benzersiz görev kimliği |
| `title` | String | Evet | - | Görev başlığı (3 - 100 karakter) |
| `description` | String | Hayır | `""` | Görev açıklaması |
| `status` | Enum (String) | Hayır | `"todo"` | Değerler: `todo`, `in-progress`, `completed`, `cancelled` |
| `priority` | Enum (String) | Evet | - | Değerler: `low`, `medium`, `high`, `critical` |
| `assignee` | String | Hayır | `null` | Atanan çalışan adı (en az 2 karakter) |
| `createdAt` | ISO 8601 String | Evet | Güncel Zaman | Görevin oluşturulma tarihi |
| `updatedAt` | ISO 8601 String | Evet | Güncel Zaman | Görevin son güncellenme tarihi |

---

## 5. API Tasarımı ve Endpoint Envanteri

### A. Temel CRUD Modülü (Zorunlu — Aşama 03)

| Metot | Endpoint | İstek Gövdesi | Başarılı Yanıt | Açıklama |
|---|---|---|:---:|---|
| `GET` | `/api/tasks` | Boş | `200 OK` | Tüm görevleri listeler |
| `POST` | `/api/tasks` | JSON (title, priority zorunlu) | `201 Created` | Yeni görev oluşturur |
| `GET` | `/api/tasks/:id` | Boş | `200 OK` | Belirtilen ID'ye ait görevi getirir |
| `PUT` | `/api/tasks/:id` | JSON (güncellenecek alanlar) | `200 OK` | Görev bilgilerini günceller |
| `DELETE` | `/api/tasks/:id` | Boş | `200 OK` | Görevi sistemden siler |

### B. Gelişmiş Özellikler (İsteğe Bağlı Pratik 01)

| Metot | Endpoint | Parametre / Query | Açıklama |
|---|---|---|---|
| `GET` | `/api/tasks?status=completed` | `status` | Duruma göre filtreleme |
| `GET` | `/api/tasks?priority=high` | `priority` | Önceliğe göre filtreleme |
| `GET` | `/api/tasks/search?keyword=backend` | `keyword` | Başlık veya açıklamada arama |
| `GET` | `/api/tasks/assignee/:name` | `:name` (URL Param) | Sorumlu çalışana göre listeleme |
| `GET` | `/api/tasks?page=1&limit=10` | `page`, `limit` | Sayfalama (Pagination) |
| `GET` | `/api/tasks?sort=createdAt&order=desc` | `sort`, `order` | Sıralama (Sorting) |

### C. Raporlama Servisleri (İsteğe Bağlı Pratik 03)

| Metot | Endpoint | Dönen Veri Yapısı | Açıklama |
|---|---|---|---|
| `GET` | `/api/reports/summary` | `totalTasks`, `byStatus`, `byPriority`, `completionRate` | Genel sistem özeti |
| `GET` | `/api/reports/pending` | `count`, `breakdown`, `tasks` | Bekleyen görev sayısı ve listesi |
| `GET` | `/api/reports/completed` | `count`, `tasks` | Tamamlanan görev sayısı ve listesi |

---

## 6. Ara Katmanlar (Middleware) ve Güvenlik

1. **Temel İstek Loglayıcı (`logger.js`):**  
   Tüm gelen API isteklerinin zaman damgasını, HTTP metodunu, erişilen uç noktayı ve dönen yanıt durum kodunu yakalayarak hem konsola hem de `logs/requests.log` dosyasına kalıcı olarak yazar.
   - Örnek Format: `[2026-10-14T16:36:01.426Z] POST /api/tasks -> 201`
2. **Girdi Doğrulama (`validate.js`):**  
   İstemciden gelen verilerin veri tipi, karakter sınırları ve enum uygunluklarını kontrol eder. Hatalı isteklerde açıklayıcı bir hata dizisi ile `400 Bad Request` yanıtı döner.
3. **Hata Yakalama (`errorHandler.js`):**  
   Beklenmeyen istisnaları yakalayarak sunucunun çökmesini engeller ve `500 Sunucu hatasi` mesajı iletir.

---

## 7. Test ve Doğrulama Özeti

- **Postman Testleri:** 5 temel CRUD işlemi (Ekleme, Listeleme, Detay, Güncelleme, Silme) Postman üzerinde çalıştırılmış ve yanıtlar `docs/screenshots/` dizininde görsel olarak kayıt altına alınmıştır.
- **Otomasyon Testleri:** Proje kök dizininde `npm test` komutu ile çalıştırılabilen 18 adet otomatik uçtan uca test bulunmaktadır.
