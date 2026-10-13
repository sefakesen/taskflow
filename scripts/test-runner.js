/**
 * TaskFlow API — Otomatik Test Koşucusu
 * Hiçbir harici bağımlılık gerektirmeden Express uygulamasını geçici bir portta başlatır,
 * tüm uçları (Zorunlu CRUD + İsteğe Bağlı Özellikler) test eder ve sonuçları raporlar.
 */

process.env.NODE_ENV = "test";
const http = require("http");
const fs = require("fs");
const path = require("path");
const app = require("../src/app");
const taskStore = require("../src/data/taskStore");

// Testler öncesi tohum verisini sıfırla
taskStore.resetTasks();

const TEST_PORT = 3456;
let server;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: TEST_PORT,
        ...options,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on("error", (err) => reject(err));

    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// ─── TEST SENARYOLARI ──────────────────────────────────────────────

// T01: Health check
test("Health Check (GET /)", async () => {
  const res = await makeRequest({ path: "/", method: "GET" });
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.status === "online", "status 'online' olmalı");
});

// T02: Görev Listeleme (GET /api/tasks & GET /tasks)
test("Görev Listeleme (GET /api/tasks & GET /tasks)", async () => {
  const res1 = await makeRequest({ path: "/api/tasks", method: "GET" });
  assert(res1.status === 200, `Beklenen 200, gelen: ${res1.status}`);
  assert(res1.body.success === true, "success true olmalı");
  assert(Array.isArray(res1.body.tasks), "tasks dizi olmalı");
  assert(res1.body.total >= 5, "en az 5 görev listelenmeli");

  const res2 = await makeRequest({ path: "/tasks", method: "GET" });
  assert(res2.status === 200, "/tasks rotası da 200 dönmeli");
});

// T03: Görev Ekleme (POST /api/tasks)
let createdTaskId = null;
test("Görev Ekleme (POST /api/tasks)", async () => {
  const newTask = {
    title: "Birim Test Görevi",
    description: "Otomatik test koşucusu tarafından oluşturuldu",
    priority: "high",
    assignee: "musa",
  };
  const res = await makeRequest(
    {
      path: "/api/tasks",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    newTask
  );
  assert(res.status === 201, `Beklenen 201, gelen: ${res.status}`);
  assert(res.body.success === true, "success true olmalı");
  assert(res.body.task && res.body.task.id, "yeni görev id içermeli");
  assert(res.body.task.status === "todo", "varsayılan durum 'todo' olmalı");
  createdTaskId = res.body.task.id;
});

// T04: Görev Detayı (GET /api/tasks/:id)
test("Görev Detayı (GET /api/tasks/:id)", async () => {
  assert(createdTaskId, "createdTaskId mevcut olmalı");
  const res = await makeRequest({ path: `/api/tasks/${createdTaskId}`, method: "GET" });
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.success === true, "success true olmalı");
  assert(res.body.task.id === createdTaskId, "ID eşleşmeli");
  assert(res.body.task.title === "Birim Test Görevi", "Başlık eşleşmeli");
});

// T05: Görev Güncelleme (PUT /api/tasks/:id)
test("Görev Güncelleme (PUT /api/tasks/:id)", async () => {
  const updateData = {
    status: "in-progress",
    priority: "critical",
  };
  const res = await makeRequest(
    {
      path: `/api/tasks/${createdTaskId}`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    },
    updateData
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.task.status === "in-progress", "durum 'in-progress' olmalı");
  assert(res.body.task.priority === "critical", "öncelik 'critical' olmalı");
});

// T06: Görev Kısmi Güncelleme (PATCH /api/tasks/:id)
test("Görev Kısmi Güncelleme (PATCH /api/tasks/:id)", async () => {
  const patchData = { assignee: "zeynep" };
  const res = await makeRequest(
    {
      path: `/api/tasks/${createdTaskId}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
    patchData
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.task.assignee === "zeynep", "assignee 'zeynep' olmalı");
});

// T07: Görev Silme (DELETE /api/tasks/:id)
test("Görev Silme (DELETE /api/tasks/:id)", async () => {
  const res = await makeRequest(
    { path: `/api/tasks/${createdTaskId}`, method: "DELETE" }
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.success === true, "silme başarılı olmalı");
});

// T08: Silinmiş Görevi Sorgulama (404 Not Found)
test("Silinmiş Görevi Sorgulama (404 Not Found)", async () => {
  const res = await makeRequest(
    { path: `/api/tasks/${createdTaskId}`, method: "GET" }
  );
  assert(res.status === 404, `Beklenen 404, gelen: ${res.status}`);
  assert(res.body.success === false, "success false olmalı");
});

// T09: Validation Middleware — Eksik title (400 Bad Request)
test("Validation — Eksik title (400 Bad Request)", async () => {
  const res = await makeRequest(
    {
      path: "/api/tasks",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { priority: "high" }
  );
  assert(res.status === 400, `Beklenen 400, gelen: ${res.status}`);
  assert(res.body.success === false, "success false olmalı");
  assert(Array.isArray(res.body.errors), "errors dizisi dönmeli");
});

// T10: Validation Middleware — Geçersiz priority (400 Bad Request)
test("Validation — Geçersiz priority (400 Bad Request)", async () => {
  const res = await makeRequest(
    {
      path: "/api/tasks",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { title: "Geçersiz Görev", priority: "urgent" }
  );
  assert(res.status === 400, `Beklenen 400, gelen: ${res.status}`);
});

// T11: Filtreleme — Duruma göre (GET /api/tasks?status=completed)
test("Filtreleme — Duruma Göre (GET /api/tasks?status=completed)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?status=completed", method: "GET" }
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(
    res.body.tasks.every((t) => t.status === "completed"),
    "tüm görevler completed olmalı"
  );
});

// T12: Filtreleme — Önceliğe göre (GET /api/tasks?priority=high)
test("Filtreleme — Önceliğe Göre (GET /api/tasks?priority=high)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?priority=high", method: "GET" }
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(
    res.body.tasks.every((t) => t.priority === "high"),
    "tüm görevler high olmalı"
  );
});

// T13: Arama — Anahtar kelime (GET /api/tasks/search?keyword=backend)
test("Arama — Anahtar Kelime (GET /api/tasks/search?keyword=backend)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks/search?keyword=backend", method: "GET" }
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(Array.isArray(res.body.tasks), "tasks dizi olmalı");
});

// T14: Kullanıcı Bazlı Listeleme (GET /api/tasks/assignee/musa)
test("Kullanıcı Bazlı Listeleme (GET /api/tasks/assignee/musa)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks/assignee/musa", method: "GET" }
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(
    res.body.tasks.every((t) => t.assignee && t.assignee.toLowerCase() === "musa"),
    "tüm görevler musa'ya ait olmalı"
  );
});

// T15: Sayfalama (GET /api/tasks?page=1&limit=2)
test("Sayfalama (GET /api/tasks?page=1&limit=2)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?page=1&limit=2", method: "GET" }
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.tasks.length === 2, "sayfa limiti 2 olmalı");
  assert(res.body.page === 1, "sayfa 1 olmalı");
});

// T16: Sıralama (GET /api/tasks?sort=createdAt&order=desc)
test("Sıralama (GET /api/tasks?sort=createdAt&order=desc)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?sort=createdAt&order=desc", method: "GET" }
  );
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.tasks.length > 0, "görevler dönmeli");
});

// T17: Raporlama — Genel Sistem Özeti (GET /api/reports/summary & /reports/summary)
test("Raporlama — Genel Özet (GET /api/reports/summary)", async () => {
  const res = await makeRequest({ path: "/api/reports/summary", method: "GET" });
  assert(res.status === 200, `Beklenen 200, gelen: ${res.status}`);
  assert(res.body.summary && res.body.summary.totalTasks, "özet totalTasks içermeli");
  assert(res.body.summary.byStatus, "özet byStatus içermeli");
  assert(res.body.summary.completionRate, "özet completionRate içermeli");
});

// T18: Raporlama — Bekleyen ve Tamamlanan (GET /api/reports/pending & /completed)
test("Raporlama — Bekleyen ve Tamamlanan Görevler", async () => {
  const resPending = await makeRequest({ path: "/api/reports/pending", method: "GET" });
  assert(resPending.status === 200, "pending 200 dönmeli");
  assert(typeof resPending.body.count === "number", "pending count sayı olmalı");

  const resComp = await makeRequest({ path: "/api/reports/completed", method: "GET" });
  assert(resComp.status === 200, "completed 200 dönmeli");
  assert(typeof resComp.body.count === "number", "completed count sayı olmalı");
});

// T19: Temel Middleware — Logger Dosya Kaydı
test("Temel Middleware — Logger Dosya Kaydı (logs/requests.log)", async () => {
  const logFile = path.join(__dirname, "../logs/requests.log");
  // res.on('finish') logunun diske yazılması için ufak bir bekleme
  await new Promise((r) => setTimeout(r, 200));
  assert(fs.existsSync(logFile), "requests.log dosyası mevcut olmalı");
  const content = fs.readFileSync(logFile, "utf-8");
  assert(content.length > 0, "requests.log dosyası boş olmamalı");
});

// ─── KOŞUCU ────────────────────────────────────────────────────────
async function runAll() {
  console.log("=================================================");
  console.log("🚀 TaskFlow API Test Paketi Başlatılıyor...");
  console.log("=================================================\n");

  server = app.listen(TEST_PORT);
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`\x1b[32m✔ [GEÇTİ]\x1b[0m ${name}`);
      passed++;
    } catch (err) {
      console.log(`\x1b[31m✖ [BAŞARISIZ]\x1b[0m ${name}`);
      console.log(`   └─ Hata: ${err.message}`);
      failed++;
    }
  }

  server.close();
  // Testler bitince tohum verisine geri dön
  taskStore.resetTasks();

  console.log("\n=================================================");
  console.log(`Toplam Test: ${tests.length}`);
  console.log(`Başarılı: \x1b[32m${passed}\x1b[0m`);
  console.log(`Başarısız: ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(`Başarı Oranı: ${Math.round((passed / tests.length) * 100)}%`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error("Test paketi çalıştırılırken kritik hata:", err);
  if (server) server.close();
  process.exit(1);
});
