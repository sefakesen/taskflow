# TaskFlow — Gorev ve Proje Yonetim Sistemi REST API
## Proje Tanitim ve Sistem Tasarim Dokumani

- Egitim: Node.js ile Backend Programlama — Bitirme Projesi (2026)
- Teknoloji: Node.js, Express.js, RESTful API, Middleware, JSON Veri Deposu
- Kapsam: Zorunlu CRUD Modulu ve Istege Bagli Gelismis Pratikler

---

## 1. Projenin Amaci

TaskFlow, yazilim gelistirme ekiplerinin gorevlerini, projelerini ve calisan sorumluluklarini takip etmelerini saglamak uzere gelistirilmis bir REST API arka yuzudur.

Sistem; gorev olusturma, calisanlara atama, durum takibi, oncelik yonetimi, filtreleme, arama, dogrulama (validation) ve temel raporlama mekanizmalarini tek bir standart RESTful API yapisi altinda birlestirir.

---

## 2. Sistem Senaryosu

Bir yazilim sirketinde:
1. Proje Yoneticisi: Ekip icin yeni gorevler olusturur (`POST /api/tasks`), onceliklerini (`low`, `medium`, `high`, `critical`) belirler ve calisanlara (`musa`, `ayse`, `ali`, `zeynep`) atar.
2. Gelistirici: Kendisine atanan gorevleri listeler (`GET /api/tasks/assignee/:name`), gorev detayina bakar (`GET /api/tasks/:id`) ve durumunu gunceller (`PUT /api/tasks/:id`).
3. Ekip Lideri: Gorevleri filtreler, arar (`GET /api/tasks/search?keyword=...`), raporlama servisleri uzerinden sistem ozetini (`GET /api/reports/summary`) ve bekleyen isleri (`GET /api/reports/pending`) izler.

---

## 3. Sistem Mimarisi

Uygulama, sorumluluklarin ayrilmasi (Separation of Concerns) ilkesine dayali katmanli bir mimariyle yapilandirilmistir:

```
[Istemci / Postman]
       │
       ▼
[Express JSON Body Parser]
       │
       ▼
[Logger Middleware] (logs/requests.log ve Konsol)
       │
       ▼
[Router Katmani] (/tasks ve /reports)
       │
       ▼
[Validation Middleware] (Girdi Dogrulama)
       │
       ▼
[Controller Katmani] (Is Mantigi)
       │
       ▼
[Data Store Katmani] (Bellek ici erisim + tasks.json dosya esitlemesi)
```

### Temel Tasarim Kararlari:
- Moduler Routing: Rotalar `taskRoutes.js` ve `reportRoutes.js` dosyalarinda bagimsiz moduller olarak tanimlanmistir. Hem `/api/tasks` hem de `/tasks` rotalari desteklenir.
- Rota Onceligi: Statik rotalar (`/search`, `/assignee/:name`), parametrik rotalardan (`/:id`) once tanimlanarak rota cakismasi engellenmistir.
- JSON Dosya Kaliciligi: Gorevler bellek icinde yonetilirken ayni anda `tasks.json` dosyasina yazilir; boylece sunucu yeniden baslatildiginda veriler korunur.
- Basit ve Etkili Logger: Her gelen HTTP isteginin metodu, adresi, durum kodu ve zaman damgasi konsola ve log dosyasina kaydedilir.

---

## 4. Veri Modeli Tasarimi

### Gorev (Task) Modeli

| Alan | Tip | Zorunlu | Aciklama |
|------|-----|---------|----------|
| id | String (UUID v4) | Otomatik | Benzersiz gorev kimligi |
| title | String | Evet | Gorev basligi (3 - 100 karakter) |
| description | String | Hayir | Gorev aciklamasi |
| status | String | Hayir | Durum: todo, in-progress, completed, cancelled (Varsayilan: todo) |
| priority | String | Evet | Oncelik: low, medium, high, critical |
| assignee | String | Hayir | Atanan calisan adi (en az 2 karakter) |
| createdAt | ISO 8601 String | Otomatik | Olusturulma zamani |
| updatedAt | ISO 8601 String | Otomatik | Son guncellenme zamani |

---

## 5. API Endpoint Listesi

### Zorunlu CRUD Uclari (Asama 03)
- `GET /api/tasks` — Tum gorevleri listeler
- `POST /api/tasks` — Yeni gorev olusturur
- `GET /api/tasks/:id` — Belirli gorev detayini getirir
- `PUT /api/tasks/:id` — Gorev bilgilerini gunceller
- `DELETE /api/tasks/:id` — Gorevi sistemden siler

### Gelismis Ozellikler (Istege Bagli 01)
- `GET /api/tasks?status=completed` — Duruma gore filtreleme
- `GET /api/tasks?priority=high` — Oncelige gore filtreleme
- `GET /api/tasks/search?keyword=backend` — Anahtar kelime arama
- `GET /api/tasks/assignee/:name` — Calisana gore listeleme
- `GET /api/tasks?page=1&limit=10` — Sayfalama
- `GET /api/tasks?sort=createdAt&order=desc` — Siralama

### Validation Middleware (Istege Bagli 02)
- `title`, `description`, `priority`, `status`, `assignee` alanlarinin tip ve deger kontrolleri yapilir.
- Eksik veya hatali veri gonderildiginde `400 Bad Request` kodu ve aciklayici hata mesaji iletilir.

### Raporlama Servisleri (Istege Bagli 03)
- `GET /api/reports/summary` — Genel sistem ozeti (durum ve oncelik dagilimlari, tamamlama orani)
- `GET /api/reports/pending` — Bekleyen gorev sayisi ve listesi
- `GET /api/reports/completed` — Tamamlanan gorev sayisi ve listesi

---

## 6. Test ve Teslimat Kanitlari

- Postman Koleksiyonu: `docs/TaskFlow.postman_collection.json`
- Test Ekran Goruntuleri: `docs/screenshots/` dizininde 5 temel CRUD isleminin basariyla calistigini gosteren dogrulama ekran goruntuleri yer almaktadir:
  - `01_gorev_listeleme.png` (GET /api/tasks)
  - `02_gorev_ekleme.png` (POST /api/tasks)
  - `03_gorev_detayi.png` (GET /api/tasks/:id)
  - `04_gorev_guncelleme.png` (PUT /api/tasks/:id)
  - `05_gorev_silme.png` (DELETE /api/tasks/:id)
