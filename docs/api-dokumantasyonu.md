# TaskFlow API — Dokümantasyon

## 📌 Temel Bilgiler

- **Base URL:** `http://localhost:3000/api` veya `http://localhost:3000`
- **Alternatif:** Tüm uç noktalar hem `/api/...` (örn: `/api/tasks`) hem de `/...` (örn: `/tasks`) üzerinden erişilebilir.
- **Content-Type:** `application/json`
- **Tüm yanıtlar:** `{ "success": true/false, ... }` formatında

---

## 🗂️ GÖREV ENDPOINTLERİ

---

### GET /api/tasks
Tüm görevleri listeler. Query parametreleriyle filtreleme, arama, sıralama ve sayfalama desteklenir.

**Query Parametreleri (hepsi isteğe bağlı):**

| Parametre  | Tip    | Açıklama                                                    |
|------------|--------|-------------------------------------------------------------|
| `status`   | string | `todo`, `in-progress`, `completed`, `cancelled`             |
| `priority` | string | `low`, `medium`, `high`, `critical`                         |
| `assignee` | string | Sorumlu adı (büyük/küçük harf duyarsız)                     |
| `keyword`  | string | Başlık veya açıklamada arama                                |
| `page`     | number | Sayfa numarası (varsayılan: 1)                              |
| `limit`    | number | Sayfa başına kayıt (varsayılan: tümü)                       |
| `sort`     | string | Sıralama alanı: `createdAt`, `updatedAt`, `title`, `priority` |
| `order`    | string | `asc` (varsayılan) veya `desc`                              |

**Örnek İstekler:**
```
GET /api/tasks
GET /api/tasks?status=completed
GET /api/tasks?priority=high&sort=createdAt&order=desc
GET /api/tasks?page=1&limit=3
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "total": 5,
  "tasks": [
    {
      "id": "a1b2c3d4-...",
      "title": "API endpoint'lerini geliştir",
      "description": "TaskFlow REST API...",
      "status": "in-progress",
      "priority": "high",
      "assignee": "musa",
      "createdAt": "2026-10-01T09:00:00.000Z",
      "updatedAt": "2026-10-05T14:30:00.000Z"
    }
  ]
}
```

---

### GET /api/tasks/:id
Belirli bir görevi ID ile getirir.

**URL Parametresi:** `id` — Görevin UUID'si

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "task": { ... }
}
```

**Hata (404):**
```json
{
  "success": false,
  "message": "Görev bulunamadı: ID abc-123"
}
```

---

### POST /api/tasks
Yeni görev oluşturur.

**Request Body:**
```json
{
  "title": "Yeni görev başlığı",
  "description": "Açıklama (isteğe bağlı)",
  "priority": "high",
  "assignee": "ali"
}
```

**Alan Kuralları:**
| Alan          | Zorunlu | Kural                                           |
|---------------|---------|-------------------------------------------------|
| `title`       | ✅       | string, 3-100 karakter                          |
| `priority`    | ✅       | `low`, `medium`, `high`, `critical`             |
| `description` | ❌       | string                                          |
| `assignee`    | ❌       | string, min 2 karakter                          |

**Başarılı Yanıt (201):**
```json
{
  "success": true,
  "message": "Görev başarıyla oluşturuldu.",
  "task": { "id": "yeni-uuid", "status": "todo", ... }
}
```

**Validation Hatası (400):**
```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [
    "'title' alanı zorunludur.",
    "'priority' şu değerlerden biri olmalıdır: low, medium, high, critical"
  ]
}
```

---

### PUT /api/tasks/:id
Görevi günceller. Yalnızca gönderilen alanlar değişir (kısmi güncelleme).

**Request Body (tüm alanlar isteğe bağlı, en az biri zorunlu):**
```json
{
  "title": "Güncellenen başlık",
  "status": "completed",
  "priority": "low",
  "assignee": "zeynep"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Görev başarıyla güncellendi.",
  "task": { ... }
}
```

---

### PATCH /api/tasks/:id
Görevi kısmi günceller (PUT ile aynı işlevi görür). Tek bir alan değiştirmek için idealdir.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Görev başarıyla güncellendi.",
  "task": { ... }
}
```

---

### DELETE /api/tasks/:id
Görevi sistemden kaldırır.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Görev başarıyla silindi: ID abc-123"
}
```

---

### GET /api/tasks/search?keyword=...
Başlık veya açıklamada anahtar kelimeyle arar.

```
GET /api/tasks/search?keyword=backend
```

---

### GET /api/tasks/assignee/:name
Belirli bir kişiye atanan görevleri listeler.

```
GET /api/tasks/assignee/musa
```

---

## 📊 RAPORLAMA ENDPOINTLERİ

---

### GET /api/reports/summary
Genel sistem özeti.

**Yanıt:**
```json
{
  "success": true,
  "summary": {
    "totalTasks": 5,
    "byStatus": {
      "todo": 2,
      "in-progress": 1,
      "completed": 1,
      "cancelled": 1
    },
    "byPriority": {
      "low": 1,
      "medium": 1,
      "high": 2,
      "critical": 1
    },
    "byAssignee": {
      "musa": 2,
      "ayse": 1,
      "ali": 1,
      "zeynep": 1
    },
    "completionRate": "20%"
  }
}
```

---

### GET /api/reports/completed
Tamamlanan görevlerin listesi.

### GET /api/reports/pending
Bekleyen görevler (todo + in-progress).

### GET /api/reports/critical
Kritik öncelikli ve henüz tamamlanmamış görevler.
