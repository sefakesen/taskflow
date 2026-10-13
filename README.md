# TaskFlow — Gorev ve Proje Yonetim Sistemi REST API

Node.js Backend Programlama Egitimi Bitirme Projesi (2026)

Bu proje, bir yazilim sirketinin ekip icerisindeki gorevlerini, projelerini ve calisan sorumluluklarini takip etmesini saglayan REST API backend uygulamasidir.

---

## 1. Sistem Gereksinimleri

- Node.js: v18.0.0 veya uzeri (Onerilen: v20+)
- npm: v8.0.0 veya uzeri
- Postman: API testleri icin

---

## 2. Kurulum ve Calistirma

### Adim 1: Proje Dizinine Gecin
```bash
cd taskflow
```

### Adim 2: Bagimliliklari Yukleyin
```bash
npm install
```

### Adim 3: Sunucuyu Baslatin
```bash
# Uretim modu
npm start

# Gelistirme modu (nodemon ile otomatik yeniden baslatma)
npm run dev
```

Sunucu baslatildiginda varsayilan olarak http://localhost:3000 adresinde calisir.

---

## 3. Klasor Yapisi

```
taskflow/
├── docs/
│   ├── screenshots/                       # Postman test ekran goruntuleri
│   ├── api-dokumantasyonu.md              # Ayrintili API ucnokta dokumantasyonu
│   ├── proje-tanitim.md                   # Proje tanitim ve mimari dokumani
│   ├── test-senaryolari.md                # Test senaryolari ve dogrulama listesi
│   └── TaskFlow.postman_collection.json   # Postman test koleksiyonu
├── logs/
│   └── requests.log                       # Logger middleware kayit dosyasi
├── scripts/
│   └── test-runner.js                     # Otomatik test kosucusu
├── src/
│   ├── controllers/
│   │   ├── taskController.js              # Gorev CRUD ve filtreleme is mantigi
│   │   └── reportController.js            # Raporlama servisleri is mantigi
│   ├── data/
│   │   ├── tasks.json                     # JSON dosya tabanli veri deposu
│   │   └── taskStore.js                   # Veri erisim katmani
│   ├── middleware/
│   │   ├── errorHandler.js                # Global hata yakalama katmani
│   │   ├── logger.js                      # Istek loglama middleware'i
│   │   └── validate.js                    # Girdi dogrulama middleware'i
│   ├── routes/
│   │   ├── reportRoutes.js                # Raporlama rotalari
│   │   └── taskRoutes.js                  # Gorev rotalari
│   └── app.js                             # Express sunucu giris noktasi
├── package.json
└── README.md
```

---

## 4. API Endpoint Listesi

Not: Sistem hem `/api/...` hem de dogrudan `/...` rotalarini destekler.

### Zorunlu CRUD Islemleri (Asama 03)

| Metot | Endpoint | Aciklama | Durum Kodu |
|-------|----------|----------|------------|
| GET | /api/tasks | Tum gorevleri listeler | 200 OK |
| POST | /api/tasks | Yeni gorev olusturur | 201 Created |
| GET | /api/tasks/:id | Belirli gorevi getirir | 200 OK / 404 Not Found |
| PUT | /api/tasks/:id | Gorevi gunceller | 200 OK / 404 Not Found |
| DELETE | /api/tasks/:id | Gorevi siler | 200 OK / 404 Not Found |

### Gelismis Ozellikler (Istege Bagli 01)

| Metot | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /api/tasks?status=completed | Duruma gore filtreleme |
| GET | /api/tasks?priority=high | Oncelige gore filtreleme |
| GET | /api/tasks/search?keyword=backend | Baslik ve aciklamada arama |
| GET | /api/tasks/assignee/:name | Sorumlu calisana gore listeleme |
| GET | /api/tasks?page=1&limit=10 | Sayfalama (Pagination) |
| GET | /api/tasks?sort=createdAt&order=desc | Siralama (Sorting) |

### Raporlama Servisleri (Istege Bagli 03)

| Metot | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /api/reports/summary | Genel sistem ozeti (durum ve oncelik dagilimi, tamamlama orani) |
| GET | /api/reports/pending | Bekleyen gorev sayisi ve listesi |
| GET | /api/reports/completed | Tamamlanan gorev sayisi ve listesi |

---

## 5. Middleware Mimarisi

- Logger Middleware (Zorunlu): Gelen tum isteklerin metodunu, adresini, durum kodunu ve zaman damgasini konsola ve `logs/requests.log` dosyasina kaydeder.
- Validation Middleware (Istege Bagli): POST ve PUT isteklerinde `title`, `description`, `priority`, `status` ve `assignee` alanlarini denetler; eksik veya hatali veride 400 Bad Request doner.
- Error Handler Middleware: Beklenmeyen hatalari yakalar ve 500 kodu ile standart JSON mesaji iletir.

---

## 6. Postman ile Test ve Ekran Goruntuleri

### Koleksiyonun Ice Aktarilmasi:
1. Postman uygulamasini acin.
2. Import secenegine tiklayin.
3. `docs/TaskFlow.postman_collection.json` dosyasini secin.
4. `base_url` degiskeni varsayilan olarak `http://localhost:3000` degerindedir.

### Test Ekran Goruntuleri:
Teslim formunda istenen test ekran goruntuleri `docs/screenshots/` dizininde yer almaktadir:
- `01_gorev_listeleme.png` - GET /api/tasks
- `02_gorev_ekleme.png` - POST /api/tasks
- `03_gorev_detayi.png` - GET /api/tasks/:id
- `04_gorev_guncelleme.png` - PUT /api/tasks/:id
- `05_gorev_silme.png` - DELETE /api/tasks/:id
- `06_filtreleme_ve_arama.png` - Filtreleme ve arama islemleri
- `07_validation_hatasi.png` - Dogrulama hatasi (400 Bad Request)
- `08_raporlama_ozeti.png` - GET /api/reports/summary

---

## 7. cURL Test Komutlari

```bash
# Tum gorevleri listele
curl http://localhost:3000/api/tasks

# Yeni gorev ekle
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Proje Testi","priority":"high","assignee":"musa"}'

# Raporlama ozetini goruntule
curl http://localhost:3000/api/reports/summary
```

---

## 8. Otomatik Test Paketi

Projede yer alan test kosucusunu calistirmak icin:

```bash
npm test
```
