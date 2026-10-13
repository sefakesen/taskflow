# TaskFlow API — Teknik Dokumantasyon

## Temel Bilgiler

- Base URL: `http://localhost:3000/api` veya `http://localhost:3000`
- Content-Type: `application/json`
- Tum basarili ve basarisiz yanitlar standart JSON formatindadir.

---

## Gorev Yonetim Uclari (Tasks)

### 1. Tum Gorevleri Listele
- Metot: `GET`
- Endpoint: `/api/tasks` veya `/tasks`
- Query Parametreleri:
  - `status`: todo, in-progress, completed, cancelled
  - `priority`: low, medium, high, critical
  - `assignee`: Sorumlu calisan adi
  - `keyword`: Baslik veya aciklamada arama
  - `page`: Sayfa numarasi (varsayilan: 1)
  - `limit`: Sayfa basina kayit sayisi
  - `sort`: Siralama alani (createdAt, priority, title vb.)
  - `order`: asc veya desc (varsayilan: asc)

Ornek Istek:
```
GET /api/tasks?status=completed&sort=createdAt&order=desc
```

Basarili Yanit (200 OK):
```json
{
  "success": true,
  "total": 1,
  "tasks": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "title": "Veritabani semasi tasarla",
      "description": "PostgreSQL icin tablo ve iliski yapisini tasarla.",
      "status": "completed",
      "priority": "critical",
      "assignee": "ayse",
      "createdAt": "2026-10-02T08:00:00.000Z",
      "updatedAt": "2026-10-03T17:00:00.000Z"
    }
  ]
}
```

---

### 2. Yeni Gorev Olustur
- Metot: `POST`
- Endpoint: `/api/tasks` veya `/tasks`
- Headers: `Content-Type: application/json`

Istek Govdesi (Body):
```json
{
  "title": "Yeni gorev basligi",
  "description": "Gorev aciklamasi",
  "priority": "high",
  "assignee": "musa"
}
```

Alan Kurallari:
- `title`: Zorunlu, metin, 3-100 karakter.
- `priority`: Zorunlu, su degerlerden biri olmalidir: low, medium, high, critical.
- `description`: Istege bagli, metin.
- `assignee`: Istege bagli, metin, en az 2 karakter.
- `status`: Istege bagli (varsayilan: todo).

Basarili Yanit (201 Created):
```json
{
  "success": true,
  "message": "Gorev basariyla olusturuldu.",
  "task": {
    "id": "c1d2e3f4-5678-90ab-cdef-1234567890ab",
    "title": "Yeni gorev basligi",
    "description": "Gorev aciklamasi",
    "status": "todo",
    "priority": "high",
    "assignee": "musa",
    "createdAt": "2026-10-13T20:00:00.000Z",
    "updatedAt": "2026-10-13T20:00:00.000Z"
  }
}
```

Dogrulama Hatasi (400 Bad Request):
```json
{
  "success": false,
  "message": "Dogrulama hatasi",
  "errors": [
    "'title' alani zorunludur.",
    "'priority' su degerlerden biri olmalidir: low, medium, high, critical"
  ]
}
```

---

### 3. Gorev Detayi
- Metot: `GET`
- Endpoint: `/api/tasks/:id` veya `/tasks/:id`

Basarili Yanit (200 OK):
```json
{
  "success": true,
  "task": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "API endpoint'lerini gelistir",
    "description": "TaskFlow REST API endpoint'lerinin tamamini yaz ve test et.",
    "status": "in-progress",
    "priority": "high",
    "assignee": "musa",
    "createdAt": "2026-10-01T09:00:00.000Z",
    "updatedAt": "2026-10-05T14:30:00.000Z"
  }
}
```

Bulunamadi Hatasi (404 Not Found):
```json
{
  "success": false,
  "message": "Gorev bulunamadi: ID gecersiz-id"
}
```

---

### 4. Gorev Guncelleme
- Metot: `PUT`
- Endpoint: `/api/tasks/:id` veya `/tasks/:id`
- Headers: `Content-Type: application/json`

Istek Govdesi (Body):
```json
{
  "status": "in-progress",
  "priority": "critical"
}
```

Basarili Yanit (200 OK):
```json
{
  "success": true,
  "message": "Gorev basariyla guncellendi.",
  "task": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "API endpoint'lerini gelistir",
    "description": "TaskFlow REST API endpoint'lerinin tamamini yaz ve test et.",
    "status": "in-progress",
    "priority": "critical",
    "assignee": "musa",
    "createdAt": "2026-10-01T09:00:00.000Z",
    "updatedAt": "2026-10-13T20:05:00.000Z"
  }
}
```

---

### 5. Gorev Silme
- Metot: `DELETE`
- Endpoint: `/api/tasks/:id` veya `/tasks/:id`

Basarili Yanit (200 OK):
```json
{
  "success": true,
  "message": "Gorev basariyla silindi: ID a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

### 6. Anahtar Kelime ile Arama
- Metot: `GET`
- Endpoint: `/api/tasks/search?keyword=backend`

Basarili Yanit (200 OK):
```json
{
  "success": true,
  "total": 1,
  "page": 1,
  "limit": 1,
  "totalPages": 1,
  "tasks": [ ... ]
}
```

---

### 7. Calisana Gore Listeleme
- Metot: `GET`
- Endpoint: `/api/tasks/assignee/:name`

Ornek: `GET /api/tasks/assignee/musa`

---

## Raporlama Uclari (Reports)

### 1. Genel Sistem Ozeti
- Metot: `GET`
- Endpoint: `/api/reports/summary` veya `/reports/summary`

Basarili Yanit (200 OK):
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

### 2. Tamamlanan Gorevler
- Metot: `GET`
- Endpoint: `/api/reports/completed` veya `/reports/completed`

Basarili Yanit (200 OK):
```json
{
  "success": true,
  "count": 1,
  "tasks": [ ... ]
}
```

---

### 3. Bekleyen Gorevler
- Metot: `GET`
- Endpoint: `/api/reports/pending` veya `/reports/pending`

Basarili Yanit (200 OK):
```json
{
  "success": true,
  "count": 3,
  "breakdown": {
    "todo": 2,
    "in-progress": 1
  },
  "tasks": [ ... ]
}
```
