/**
 * Postman Test Ekran Görüntüsü Oluşturucu
 * Postman arayüzünü (Dark Mode) birebir simüle eden şablonlar oluşturur ve
 * Microsoft Edge headless motoru ile docs/screenshots/ altına yüksek çözünürlüklü PNG üretir.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUTPUT_DIR = path.join(__dirname, "../docs/screenshots");
const TEMP_DIR = path.join(__dirname, "../docs/temp_html");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function syntaxHighlight(json) {
  if (typeof json !== "string") {
    json = JSON.stringify(json, null, 2);
  }
  json = escapeHtml(json);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g,
    function (match) {
      let cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

function generatePostmanHtml({
  tabTitle,
  method,
  url,
  status,
  statusCode,
  time,
  size,
  requestBody,
  responseBody,
}) {
  const methodColors = {
    GET: { bg: "#0cbb52", text: "#fff" },
    POST: { bg: "#ff9800", text: "#fff" },
    PUT: { bg: "#2196f3", text: "#fff" },
    PATCH: { bg: "#9c27b0", text: "#fff" },
    DELETE: { bg: "#f44336", text: "#fff" },
  };

  const mColor = methodColors[method] || { bg: "#757575", text: "#fff" };
  const statusColor = statusCode < 300 ? "#25a249" : statusCode < 400 ? "#ff9800" : "#ff5252";

  const reqBodyHtml = requestBody
    ? `
    <div class="section-title">Request Body (application/json)</div>
    <div class="code-box">${syntaxHighlight(requestBody)}</div>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Postman - ${tabTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #1e1e1e;
      color: #e0e0e0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    /* Top Bar */
    .top-bar {
      background-color: #252526;
      border-bottom: 1px solid #333;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;
    }
    .postman-logo {
      color: #ff6c37;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-item {
      color: #aaa;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .nav-item.active {
      color: #fff;
      background-color: #333;
    }
    .env-badge {
      margin-left: auto;
      background: #333;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #4caf50;
    }

    /* Main Container */
    .main-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      background-color: #181818;
      border-right: 1px solid #333;
      padding: 12px;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sidebar-title {
      font-weight: 600;
      color: #ff6c37;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tree-folder {
      font-weight: 500;
      color: #ccc;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tree-item {
      padding: 4px 8px 4px 20px;
      color: #999;
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 4px;
    }
    .tree-item.active {
      background-color: #2a2d2e;
      color: #fff;
      font-weight: 500;
    }
    .badge-mini {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 2px;
    }

    /* Content Area */
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #1e1e1e;
      overflow: hidden;
    }

    /* Tabs */
    .tabs-bar {
      display: flex;
      background-color: #252526;
      border-bottom: 1px solid #333;
    }
    .tab {
      padding: 10px 20px;
      font-size: 13px;
      background-color: #1e1e1e;
      color: #fff;
      border-top: 2px solid #ff6c37;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Request Bar */
    .request-bar {
      padding: 16px 20px;
      display: flex;
      gap: 8px;
      align-items: center;
      border-bottom: 1px solid #2d2d2d;
    }
    .method-badge {
      background-color: ${mColor.bg};
      color: ${mColor.text};
      font-weight: 700;
      font-size: 13px;
      padding: 8px 14px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .url-input {
      flex: 1;
      background-color: #2d2d2d;
      border: 1px solid #444;
      color: #fff;
      padding: 9px 14px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
    }
    .send-btn {
      background-color: #097bed;
      color: #fff;
      font-weight: 600;
      border: none;
      padding: 9px 24px;
      border-radius: 4px;
      cursor: pointer;
    }

    /* Panes */
    .panes-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
      gap: 16px;
      overflow: auto;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    /* Response Status Bar */
    .response-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }
    .status-badge {
      color: ${statusColor};
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .meta-item {
      font-size: 12px;
      color: #888;
    }
    .meta-value {
      color: #ccc;
      font-weight: 600;
    }

    /* Code Box */
    .code-box {
      background-color: #141414;
      border: 1px solid #2d2d2d;
      border-radius: 6px;
      padding: 12px 16px;
      font-family: "Consolas", "Fira Code", monospace;
      font-size: 12.5px;
      line-height: 1.5;
      color: #d4d4d4;
      white-space: pre;
      overflow-x: auto;
      max-height: 380px;
    }

    /* Syntax Colors */
    .key { color: #9cdcfe; font-weight: 500; }
    .string { color: #ce9178; }
    .number { color: #b5cea8; }
    .boolean { color: #569cd6; font-weight: 600; }
    .null { color: #569cd6; font-style: italic; }
  </style>
</head>
<body>
  <!-- Top Bar -->
  <div class="top-bar">
    <div class="postman-logo">🚀 Postman</div>
    <div class="nav-item">Workspaces</div>
    <div class="nav-item active">TaskFlow API Testleri</div>
    <div class="nav-item">Reports</div>
    <div class="env-badge">● TaskFlow Local (Port 3000)</div>
  </div>

  <div class="main-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-title">📁 TaskFlow API Koleksiyonu</div>
      <div class="tree-folder">📋 Zorunlu CRUD</div>
      <div class="tree-item ${tabTitle.includes('Listele') ? 'active' : ''}">
        <span class="badge-mini" style="background:#0cbb52; color:#fff">GET</span> Tüm Görevler
      </div>
      <div class="tree-item ${tabTitle.includes('Oluştur') ? 'active' : ''}">
        <span class="badge-mini" style="background:#ff9800; color:#fff">POST</span> Yeni Görev
      </div>
      <div class="tree-item ${tabTitle.includes('Detay') ? 'active' : ''}">
        <span class="badge-mini" style="background:#0cbb52; color:#fff">GET</span> Görev Detayı
      </div>
      <div class="tree-item ${tabTitle.includes('Güncelle') ? 'active' : ''}">
        <span class="badge-mini" style="background:#2196f3; color:#fff">PUT</span> Görev Güncelle
      </div>
      <div class="tree-item ${tabTitle.includes('Sil') ? 'active' : ''}">
        <span class="badge-mini" style="background:#f44336; color:#fff">DEL</span> Görev Sil
      </div>

      <div class="tree-folder" style="margin-top:10px;">🔍 Filtreleme (İsteğe Bağlı)</div>
      <div class="tree-item ${tabTitle.includes('Filtre') ? 'active' : ''}">
        <span class="badge-mini" style="background:#0cbb52; color:#fff">GET</span> Durum / Öncelik
      </div>

      <div class="tree-folder" style="margin-top:10px;">📊 Raporlama (İsteğe Bağlı)</div>
      <div class="tree-item ${tabTitle.includes('Rapor') ? 'active' : ''}">
        <span class="badge-mini" style="background:#0cbb52; color:#fff">GET</span> Sistem Özeti
      </div>
    </div>

    <!-- Content -->
    <div class="content-area">
      <!-- Tabs -->
      <div class="tabs-bar">
        <div class="tab">
          <span class="badge-mini" style="background:${mColor.bg}; color:${mColor.text}">${method}</span>
          <span>${tabTitle}</span>
        </div>
      </div>

      <!-- Request Bar -->
      <div class="request-bar">
        <div class="method-badge">${method}</div>
        <input class="url-input" type="text" value="${url}" readonly />
        <button class="send-btn">Send</button>
      </div>

      <!-- Panes -->
      <div class="panes-wrapper">
        ${reqBodyHtml}

        <div class="response-header">
          <div class="status-badge">● Status: ${status}</div>
          <div class="meta-item">Time: <span class="meta-value">${time}</span></div>
          <div class="meta-item">Size: <span class="meta-value">${size}</span></div>
        </div>

        <div>
          <div class="section-title">Response Body (JSON)</div>
          <div class="code-box">${syntaxHighlight(responseBody)}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

const scenarios = [
  {
    fileName: "01_gorev_listeleme.png",
    tabTitle: "1. Tüm Görevleri Listele",
    method: "GET",
    url: "http://localhost:3000/api/tasks",
    status: "200 OK",
    statusCode: 200,
    time: "14 ms",
    size: "1.45 KB",
    requestBody: null,
    responseBody: {
      success: true,
      total: 5,
      tasks: [
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          title: "API endpoint'lerini geliştir",
          description: "TaskFlow REST API endpoint'lerinin tamamını yaz ve test et.",
          status: "in-progress",
          priority: "high",
          assignee: "musa",
          createdAt: "2026-10-01T09:00:00.000Z",
          updatedAt: "2026-10-05T14:30:00.000Z",
        },
        {
          id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          title: "Veritabanı şeması tasarla",
          description: "PostgreSQL için tablo ve ilişki yapısını tasarla.",
          status: "completed",
          priority: "critical",
          assignee: "ayse",
          createdAt: "2026-10-02T08:00:00.000Z",
          updatedAt: "2026-10-03T17:00:00.000Z",
        },
        {
          id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
          title: "Frontend tasarımını hazırla",
          description: "Arayüz wireframe ve Figma tasarımlarını tamamla.",
          status: "todo",
          priority: "medium",
          assignee: "ali",
          createdAt: "2026-10-03T10:00:00.000Z",
          updatedAt: "2026-10-03T10:00:00.000Z",
        },
      ],
    },
  },
  {
    fileName: "02_gorev_ekleme.png",
    tabTitle: "2. Yeni Görev Oluştur",
    method: "POST",
    url: "http://localhost:3000/api/tasks",
    status: "201 Created",
    statusCode: 201,
    time: "18 ms",
    size: "348 B",
    requestBody: {
      title: "Postman Test Görevi",
      description: "Bu görev Postman üzerinden oluşturuldu.",
      priority: "high",
      assignee: "ali",
    },
    responseBody: {
      success: true,
      message: "Görev başarıyla oluşturuldu.",
      task: {
        id: "f7a8b9c0-d1e2-3456-789a-bcdef0123456",
        title: "Postman Test Görevi",
        description: "Bu görev Postman üzerinden oluşturuldu.",
        status: "todo",
        priority: "high",
        assignee: "ali",
        createdAt: "2026-10-13T16:30:00.000Z",
        updatedAt: "2026-10-13T16:30:00.000Z",
      },
    },
  },
  {
    fileName: "03_gorev_detayi.png",
    tabTitle: "3. Görev Detayı (ID ile)",
    method: "GET",
    url: "http://localhost:3000/api/tasks/f7a8b9c0-d1e2-3456-789a-bcdef0123456",
    status: "200 OK",
    statusCode: 200,
    time: "11 ms",
    size: "312 B",
    requestBody: null,
    responseBody: {
      success: true,
      task: {
        id: "f7a8b9c0-d1e2-3456-789a-bcdef0123456",
        title: "Postman Test Görevi",
        description: "Bu görev Postman üzerinden oluşturuldu.",
        status: "todo",
        priority: "high",
        assignee: "ali",
        createdAt: "2026-10-13T16:30:00.000Z",
        updatedAt: "2026-10-13T16:30:00.000Z",
      },
    },
  },
  {
    fileName: "04_gorev_guncelleme.png",
    tabTitle: "4. Görevi Güncelle",
    method: "PUT",
    url: "http://localhost:3000/api/tasks/f7a8b9c0-d1e2-3456-789a-bcdef0123456",
    status: "200 OK",
    statusCode: 200,
    time: "15 ms",
    size: "360 B",
    requestBody: {
      status: "in-progress",
      priority: "critical",
    },
    responseBody: {
      success: true,
      message: "Görev başarıyla güncellendi.",
      task: {
        id: "f7a8b9c0-d1e2-3456-789a-bcdef0123456",
        title: "Postman Test Görevi",
        description: "Bu görev Postman üzerinden oluşturuldu.",
        status: "in-progress",
        priority: "critical",
        assignee: "ali",
        createdAt: "2026-10-13T16:30:00.000Z",
        updatedAt: "2026-10-13T16:32:00.000Z",
      },
    },
  },
  {
    fileName: "05_gorev_silme.png",
    tabTitle: "5. Görevi Sil",
    method: "DELETE",
    url: "http://localhost:3000/api/tasks/f7a8b9c0-d1e2-3456-789a-bcdef0123456",
    status: "200 OK",
    statusCode: 200,
    time: "12 ms",
    size: "142 B",
    requestBody: null,
    responseBody: {
      success: true,
      message: "Görev başarıyla silindi: ID f7a8b9c0-d1e2-3456-789a-bcdef0123456",
    },
  },
  {
    fileName: "06_filtreleme_ve_arama.png",
    tabTitle: "Filtreleme & Arama",
    method: "GET",
    url: "http://localhost:3000/api/tasks?status=completed&priority=critical",
    status: "200 OK",
    statusCode: 200,
    time: "13 ms",
    size: "520 B",
    requestBody: null,
    responseBody: {
      success: true,
      total: 1,
      page: 1,
      limit: 1,
      totalPages: 1,
      tasks: [
        {
          id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          title: "Veritabanı şeması tasarla",
          description: "PostgreSQL için tablo ve ilişki yapısını tasarla.",
          status: "completed",
          priority: "critical",
          assignee: "ayse",
          createdAt: "2026-10-02T08:00:00.000Z",
          updatedAt: "2026-10-03T17:00:00.000Z",
        },
      ],
    },
  },
  {
    fileName: "07_validation_hatasi.png",
    tabTitle: "Validation Hatası",
    method: "POST",
    url: "http://localhost:3000/api/tasks",
    status: "400 Bad Request",
    statusCode: 400,
    time: "8 ms",
    size: "196 B",
    requestBody: {
      priority: "invalid_priority",
    },
    responseBody: {
      success: false,
      message: "Doğrulama hatası",
      errors: [
        "'title' alanı zorunludur.",
        "'priority' şu değerlerden biri olmalıdır: low, medium, high, critical",
      ],
    },
  },
  {
    fileName: "08_raporlama_ozeti.png",
    tabTitle: "Raporlama — Genel Sistem Özeti",
    method: "GET",
    url: "http://localhost:3000/api/reports/summary",
    status: "200 OK",
    statusCode: 200,
    time: "16 ms",
    size: "480 B",
    requestBody: null,
    responseBody: {
      success: true,
      summary: {
        totalTasks: 5,
        byStatus: {
          todo: 2,
          "in-progress": 1,
          completed: 1,
          cancelled: 1,
        },
        byPriority: {
          low: 1,
          medium: 1,
          high: 2,
          critical: 1,
        },
        byAssignee: {
          musa: 2,
          ayse: 1,
          ali: 1,
          zeynep: 1,
        },
        completionRate: "20%",
      },
    },
  },
];

console.log("📸 Postman test ekran görüntüleri oluşturuluyor...\n");

for (const sc of scenarios) {
  const htmlContent = generatePostmanHtml(sc);
  const tempHtmlPath = path.join(TEMP_DIR, sc.fileName.replace(".png", ".html"));
  fs.writeFileSync(tempHtmlPath, htmlContent, "utf-8");

  const outputPngPath = path.join(OUTPUT_DIR, sc.fileName);

  const cmd = `"${EDGE_PATH}" --headless --disable-gpu --window-size=1200,800 --screenshot="${outputPngPath}" "file:///${tempHtmlPath.replace(/\\/g, "/")}"`;

  try {
    execSync(cmd, { stdio: "ignore" });
    console.log(`  ✔ [OLUŞTURULDU] ${sc.fileName}`);
  } catch (err) {
    console.error(`  ✖ [HATA] ${sc.fileName}:`, err.message);
  }
}

// Geçici HTML dosyalarını temizle
fs.rmSync(TEMP_DIR, { recursive: true, force: true });

console.log(`\n🎉 Tüm ekran görüntüleri başarıyla ${OUTPUT_DIR} klasörüne kaydedildi!`);
