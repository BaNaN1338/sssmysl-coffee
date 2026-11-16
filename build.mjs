import { existsSync, readFileSync } from "node:fs";

const required = [
  "index.html",
  "site.css",
  "app.js",
  "sw.js",
  "manifest.json",
  "privacy.html",
  "terms.html",
];
for (const file of required) {
  if (!existsSync(file)) {
    throw new Error(`Не найден обязательный файл: ${file}`);
  }
}

const html = readFileSync("index.html", "utf8");
if (!html.includes("site.css") || !html.includes("app.js")) {
  throw new Error("index.html не подключает site.css или app.js");
}
if (/<style[\s>]/i.test(html)) {
  throw new Error("В index.html остался inline <style> — стили должны быть в site.css");
}
if (html.includes("const STORAGE_KEY = 'smysl_qrb_menu_v3'")) {
  throw new Error("В index.html остался основной inline-скрипт — код должен быть в app.js");
}

console.log("build: OK — index.html, site.css, app.js на месте");
