/**
 * TaskFlow API — Otomatik Test Kosucusu
 * Express uygulamasini gecici bir portta baslatir ve
 * tum temel ve ileri seviye uclari test eder.
 */

process.env.NODE_ENV = "test";
const http = require("http");
const fs = require("fs");
const path = require("path");
const app = require("../src/app");
const taskStore = require("../src/data/taskStore");

// Testler oncesi veriyi varsayilana dondur
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
    throw new Error(message || "Dogrulama basarisiz");
  }
}

// T01: Saglik Kontrolu
test("Saglik Kontrolu (GET /)", async () => {
  const res = await makeRequest({ path: "/", method: "GET" });
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(res.body.status === "active", "status 'active' olmalidir");
});

// T02: Gorev Listeleme
test("Gorev Listeleme (GET /api/tasks ve GET /tasks)", async () => {
  const res1 = await makeRequest({ path: "/api/tasks", method: "GET" });
  assert(res1.status === 200, `Beklenen: 200, Gelen: ${res1.status}`);
  assert(res1.body.success === true, "success true olmalidir");
  assert(Array.isArray(res1.body.tasks), "tasks dizi olmalidir");

  const res2 = await makeRequest({ path: "/tasks", method: "GET" });
  assert(res2.status === 200, "/tasks rotasi 200 donmelidir");
});

// T03: Gorev Ekleme
let createdTaskId = null;
test("Gorev Ekleme (POST /api/tasks)", async () => {
  const newTask = {
    title: "Birim Test Gorevi",
    description: "Otomatik test kosucusu tarafindan olusturuldu",
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
  assert(res.status === 201, `Beklenen: 201, Gelen: ${res.status}`);
  assert(res.body.success === true, "success true olmalidir");
  assert(res.body.task && res.body.task.id, "gorev id icermelidir");
  createdTaskId = res.body.task.id;
});

// T04: Gorev Detayi
test("Gorev Detayi (GET /api/tasks/:id)", async () => {
  assert(createdTaskId, "createdTaskId tanimli olmalidir");
  const res = await makeRequest({ path: `/api/tasks/${createdTaskId}`, method: "GET" });
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(res.body.task.id === createdTaskId, "ID eslesmelidir");
});

// T05: Gorev Guncelleme
test("Gorev Guncelleme (PUT /api/tasks/:id)", async () => {
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
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(res.body.task.status === "in-progress", "durum 'in-progress' olmalidir");
});

// T06: Gorev Silme
test("Gorev Silme (DELETE /api/tasks/:id)", async () => {
  const res = await makeRequest(
    { path: `/api/tasks/${createdTaskId}`, method: "DELETE" }
  );
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(res.body.success === true, "silme basarili olmalidir");
});

// T07: Silinmis Gorevi Sorgulama
test("Silinmis Gorevi Sorgulama (404 Not Found)", async () => {
  const res = await makeRequest(
    { path: `/api/tasks/${createdTaskId}`, method: "GET" }
  );
  assert(res.status === 404, `Beklenen: 404, Gelen: ${res.status}`);
  assert(res.body.success === false, "success false olmalidir");
});

// T08: Dogrulama: Eksik title (400 Bad Request)
test("Dogrulama: Eksik title (400 Bad Request)", async () => {
  const res = await makeRequest(
    {
      path: "/api/tasks",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { priority: "high" }
  );
  assert(res.status === 400, `Beklenen: 400, Gelen: ${res.status}`);
  assert(res.body.success === false, "success false olmalidir");
});

// T09: Dogrulama: Gecersiz priority (400 Bad Request)
test("Dogrulama: Gecersiz priority (400 Bad Request)", async () => {
  const res = await makeRequest(
    {
      path: "/api/tasks",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { title: "Test Gorevi", priority: "invalid_priority" }
  );
  assert(res.status === 400, `Beklenen: 400, Gelen: ${res.status}`);
});

// T10: Filtreleme: Duruma Gore
test("Filtreleme: Duruma Gore (GET /api/tasks?status=completed)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?status=completed", method: "GET" }
  );
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(
    res.body.tasks.every((t) => t.status === "completed"),
    "tum gorevler completed olmalidir"
  );
});

// T11: Filtreleme: Oncelige Gore
test("Filtreleme: Oncelige Gore (GET /api/tasks?priority=high)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?priority=high", method: "GET" }
  );
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(
    res.body.tasks.every((t) => t.priority === "high"),
    "tum gorevler high olmalidir"
  );
});

// T12: Arama: Anahtar Kelime
test("Arama: Anahtar Kelime (GET /api/tasks/search?keyword=backend)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks/search?keyword=backend", method: "GET" }
  );
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(Array.isArray(res.body.tasks), "tasks dizi olmalidir");
});

// T13: Kullanici Bazli Listeleme
test("Kullanici Bazli Listeleme (GET /api/tasks/assignee/musa)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks/assignee/musa", method: "GET" }
  );
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(
    res.body.tasks.every((t) => t.assignee && t.assignee.toLowerCase() === "musa"),
    "tum gorevler musa'ya ait olmalidir"
  );
});

// T14: Sayfalama
test("Sayfalama (GET /api/tasks?page=1&limit=2)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?page=1&limit=2", method: "GET" }
  );
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(res.body.tasks.length === 2, "sayfa limiti 2 olmalidir");
});

// T15: Siralama
test("Siralama (GET /api/tasks?sort=createdAt&order=desc)", async () => {
  const res = await makeRequest(
    { path: "/api/tasks?sort=createdAt&order=desc", method: "GET" }
  );
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(res.body.tasks.length > 0, "gorev listesi donmelidir");
});

// T16: Raporlama: Genel Ozet
test("Raporlama: Genel Ozet (GET /api/reports/summary)", async () => {
  const res = await makeRequest({ path: "/api/reports/summary", method: "GET" });
  assert(res.status === 200, `Beklenen: 200, Gelen: ${res.status}`);
  assert(res.body.summary && res.body.summary.totalTasks, "ozet totalTasks icermelidir");
});

// T17: Raporlama: Bekleyen ve Tamamlanan Gorevler
test("Raporlama: Bekleyen ve Tamamlanan Gorevler", async () => {
  const resPending = await makeRequest({ path: "/api/reports/pending", method: "GET" });
  assert(resPending.status === 200, "pending 200 donmelidir");

  const resComp = await makeRequest({ path: "/api/reports/completed", method: "GET" });
  assert(resComp.status === 200, "completed 200 donmelidir");
});

// T18: Temel Middleware: Logger Dosya Kaydi
test("Temel Middleware: Logger Dosya Kaydi (logs/requests.log)", async () => {
  const logFile = path.join(__dirname, "../logs/requests.log");
  await new Promise((r) => setTimeout(r, 200));
  assert(fs.existsSync(logFile), "requests.log dosyasi mevcut olmalidir");
  const content = fs.readFileSync(logFile, "utf-8");
  assert(content.length > 0, "requests.log dosyasi bos olmamalidir");
});

async function runAll() {
  console.log("-------------------------------------------------");
  console.log("TaskFlow API Test Paketi Baslatiliyor...");
  console.log("-------------------------------------------------\n");

  server = app.listen(TEST_PORT);
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`[BASARILI] ${name}`);
      passed++;
    } catch (err) {
      console.log(`[BASARISIZ] ${name}`);
      console.log(`   Hata: ${err.message}`);
      failed++;
    }
  }

  server.close();
  taskStore.resetTasks();

  console.log("\n-------------------------------------------------");
  console.log(`Toplam Test: ${tests.length}`);
  console.log(`Basarili: ${passed}`);
  console.log(`Basarisiz: ${failed}`);
  console.log(`Basari Orani: ${Math.round((passed / tests.length) * 100)}%`);
  console.log("-------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error("Test calistirma hatasi:", err);
  if (server) server.close();
  process.exit(1);
});
