# 🧪 TaskFlow API — Test Senaryoları ve Doğrulama Kılavuzu

Bu doküman; TaskFlow Görev ve Proje Yönetim Sistemi REST API'sinin tüm zorunlu ve isteğe bağlı uç noktalarının test senaryolarını, beklenen yanıtlarını ve test kanıtlarını içerir.

---

## 📮 Postman ile Test Rehberi

1. **Koleksiyonu İçe Aktarma:**  
   Postman uygulamasında sol üstteki **Import** butonuna tıklayın ve `docs/TaskFlow.postman_collection.json` dosyasını seçin.
2. **Değişkenler:**  
   Koleksiyon varsayılan olarak `{{base_url}}` = `http://localhost:3000` kullanır.
3. **Otomatik `task_id` Yakalama:**  
   `POST /api/tasks` isteği başarılı olduğunda, dönen görevin `id` değeri otomatik olarak `task_id` koleksiyon değişkenine atanır. Bu sayede ardından gelen Detay, Güncelle ve Sil istekleri manuel ID kopyalamaya gerek kalmadan tek tıkla çalıştırılabilir.

---

## 📊 Test Senaryoları Matrisi (T01 - T19)

| No | Test Senaryosu | HTTP Metot & Endpoint | Beklenen HTTP Kod | Beklenen Sonuç | Ekran Görüntüsü Kanıtı |
|:---|:---|:---|:---:|:---|:---|
| **T01** | Sağlık Kontrolü (Health Check) | `GET /` veya `GET /api` | `200 OK` | `status: "online"`, uç nokta haritası | - |
| **T02** | Tüm Görevleri Listele | `GET /api/tasks` (ve `/tasks`) | `200 OK` | `success: true`, `tasks` dizisi (en az 5 kayıt) | [`01_gorev_listeleme.png`](screenshots/01_gorev_listeleme.png) |
| **T03** | Yeni Görev Ekle (Başarılı) | `POST /api/tasks` | `201 Created` | `success: true`, üretilen UUID, `status: "todo"` | [`02_gorev_ekleme.png`](screenshots/02_gorev_ekleme.png) |
| **T04** | Görev Detayı (ID ile) | `GET /api/tasks/:id` | `200 OK` | Eklenen görevin tüm alanları ve doğru ID | [`03_gorev_detayi.png`](screenshots/03_gorev_detayi.png) |
| **T05** | Görevi Güncelle (PUT) | `PUT /api/tasks/:id` | `200 OK` | `status: "in-progress"`, güncellenmiş `updatedAt` | [`04_gorev_guncelleme.png`](screenshots/04_gorev_guncelleme.png) |
| **T06** | Görevi Kısmi Güncelle (PATCH) | `PATCH /api/tasks/:id` | `200 OK` | Yalnızca gönderilen alan değişir, diğerleri korunur | - |
| **T07** | Görevi Sil (DELETE) | `DELETE /api/tasks/:id` | `200 OK` | `success: true`, silme onay mesajı | [`05_gorev_silme.png`](screenshots/05_gorev_silme.png) |
| **T08** | Silinmiş Görevi Sorgulama | `GET /api/tasks/:silinen_id` | `404 Not Found` | `success: false`, `message: "Görev bulunamadı"` | - |
| **T09** | Doğrulama: `title` eksik | `POST /api/tasks` (`{ priority: "high" }`) | `400 Bad Request` | `errors: ["'title' alanı zorunludur."]` | [`07_validation_hatasi.png`](screenshots/07_validation_hatasi.png) |
| **T10** | Doğrulama: Geçersiz `priority` | `POST /api/tasks` (`{ title: "Test", priority: "urgent" }`) | `400 Bad Request` | `errors: ["'priority' şu değerlerden biri olmalıdır..."]` | - |
| **T11** | Doğrulama: Boş güncelleme gövdesi | `PUT /api/tasks/:id` (`{}`) | `400 Bad Request` | `message: "Güncelleme için en az bir alan gönderilmelidir."` | - |
| **T12** | Duruma Göre Filtreleme | `GET /api/tasks?status=completed` | `200 OK` | Yalnızca `completed` durumundaki görevler | [`06_filtreleme_ve_arama.png`](screenshots/06_filtreleme_ve_arama.png) |
| **T13** | Önceliğe Göre Filtreleme | `GET /api/tasks?priority=high` | `200 OK` | Yalnızca `high` öncelikli görevler | - |
| **T14** | Anahtar Kelime Arama | `GET /api/tasks/search?keyword=backend` | `200 OK` | Başlık veya açıklamada "backend" geçen görevler | - |
| **T15** | Kullanıcı Bazlı Listeleme | `GET /api/tasks/assignee/musa` | `200 OK` | Yalnızca `musa` kullanıcısına atanan görevler | - |
| **T16** | Sayfalama (Pagination) | `GET /api/tasks?page=1&limit=2` | `200 OK` | 2 adet görev, `totalPages` ve sayfa meta verisi | - |
| **T17** | Sıralama (Sorting) | `GET /api/tasks?sort=createdAt&order=desc` | `200 OK` | Tarihe göre azalan sırada görev listesi | - |
| **T18** | Raporlama — Sistem Özeti | `GET /api/reports/summary` | `200 OK` | `totalTasks`, `byStatus`, `byPriority`, `completionRate` | [`08_raporlama_ozeti.png`](screenshots/08_raporlama_ozeti.png) |
| **T19** | Temel Middleware Logger | `logs/requests.log` dosya kontrolü | `OK` | İsteklerin method, url, status ve süre ile kaydedilmesi | - |

---

## 💻 Konsol Otomasyon Testi (`npm test`)

Sunucuyu başlatmaya gerek kalmadan tüm testleri otomatik olarak çalıştırmak için terminalde:

```bash
npm test
```

Komut çalıştırıldığında tüm senaryolar sırasıyla icra edilir ve **%100 (19/19)** başarı oranıyla tamamlanır.
