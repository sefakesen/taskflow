# TaskFlow API — Test Senaryolari ve Dogrulama Kilavuzu

Bu dokuman; TaskFlow Gorev ve Proje Yonetim Sistemi REST API'sinin Postman test senaryolarini, beklenen sonuclari ve test kanitlarini icerir.

---

## 1. Postman Test Rehberi

1. Koleksiyonu Ice Aktarma:
   Postman uygulamasinda Import secenegini kullanarak `docs/TaskFlow.postman_collection.json` dosyasini secin.
2. Degiskenler:
   Koleksiyon icerisindeki `base_url` degiskeni varsayilan olarak `http://localhost:3000` adresine ayarlidir.
3. Otomatik ID Yakalama:
   `POST /api/tasks` istegi calistirildiginda donen gorevin `id` degeri otomatik olarak `task_id` degiskenine atanir. Bu sayede sonraki detay, guncelleme ve silme istekleri dogrudan calistirilabilir.

---

## 2. Test Senaryolari Tablosu

| No | Senaryo | HTTP Metot ve Endpoint | Beklenen Kod | Beklenen Sonuc | Ekran Goruntusu |
|---|---|---|:---:|---|---|
| T01 | Saglik Kontrolu | GET / | 200 OK | status: "active" | - |
| T02 | Tum Gorevleri Listele | GET /api/tasks | 200 OK | success: true, tasks listesi | 01_gorev_listeleme.png |
| T03 | Yeni Gorev Olustur | POST /api/tasks | 201 Created | success: true, task nesnesi | 02_gorev_ekleme.png |
| T04 | Gorev Detayi (ID ile) | GET /api/tasks/:id | 200 OK | Gorev bilgileri | 03_gorev_detayi.png |
| T05 | Gorev Guncelle (PUT) | PUT /api/tasks/:id | 200 OK | Guncellenmis gorev nesnesi | 04_gorev_guncelleme.png |
| T06 | Gorev Sil (DELETE) | DELETE /api/tasks/:id | 200 OK | Silme onay mesaji | 05_gorev_silme.png |
| T07 | Silinen Gorevi Sorgula | GET /api/tasks/:id | 404 Not Found | success: false, hata mesaji | - |
| T08 | Dogrulama: Eksik title | POST /api/tasks | 400 Bad Request | errors dizisi | - |
| T09 | Dogrulama: Gecersiz priority | POST /api/tasks | 400 Bad Request | errors dizisi | - |
| T10 | Duruma Gore Filtrele | GET /api/tasks?status=completed | 200 OK | completed olan gorevler | - |
| T11 | Oncelige Gore Filtrele | GET /api/tasks?priority=high | 200 OK | high olan gorevler | - |
| T12 | Anahtar Kelime Arama | GET /api/tasks/search?keyword=backend | 200 OK | Eslenen gorevler | - |
| T13 | Calisana Gore Listele | GET /api/tasks/assignee/musa | 200 OK | musa'ya ait gorevler | - |
| T14 | Sayfalama | GET /api/tasks?page=1&limit=2 | 200 OK | 2 adet kayit | - |
| T15 | Siralama | GET /api/tasks?sort=createdAt&order=desc | 200 OK | Sirali liste | - |
| T16 | Genel Sistem Ozeti | GET /api/reports/summary | 200 OK | Ozet istatistikler | - |
| T17 | Bekleyen Gorevler | GET /api/reports/pending | 200 OK | Bekleyen gorev sayisi | - |
| T18 | Tamamlanan Gorevler | GET /api/reports/completed | 200 OK | Tamamlanan gorev sayisi | - |

---

## 3. Ekran Goruntuleri

Teslim edilen 5 zorunlu temel CRUD test ekran goruntuleri:

### 1. Tum Gorevleri Listeleme (GET /api/tasks - 200 OK)
![Tum Gorevleri Listeleme](screenshots/01_gorev_listeleme.png)

### 2. Yeni Gorev Olusturma (POST /api/tasks - 201 Created)
![Yeni Gorev Olusturma](screenshots/02_gorev_ekleme.png)

### 3. Gorev Detayi (GET /api/tasks/:id - 200 OK)
![Gorev Detayi](screenshots/03_gorev_detayi.png)

### 4. Gorev Guncelleme (PUT /api/tasks/:id - 200 OK)
![Gorev Guncelleme](screenshots/04_gorev_guncelleme.png)

### 5. Gorev Silme (DELETE /api/tasks/:id - 200 OK)
![Gorev Silme](screenshots/05_gorev_silme.png)
