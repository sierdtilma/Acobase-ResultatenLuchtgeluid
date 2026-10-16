const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
let failures = 0;

function check(condition, message) {
    console.log(`${condition ? "PASS" : "FAIL"} ${message}`);
    if (!condition) failures++;
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(path.join(rootDir, file), "utf8"));
}

function runNode(title, script, args = []) {
    console.log(`\n=== ${title} ===`);
    const result = spawnSync(process.execPath, [script, ...args], {
        cwd: rootDir,
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
        shell: false
    });
    if (result.stdout) console.log(result.stdout);
    if (result.stderr) console.error(result.stderr);
    if (result.error) console.error(result.error.message);
    check(result.status === 0, title);
}

function sourceFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? sourceFiles(file) : [file];
    });
}

function isPublicHttps(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password
            && !/example\.(com|org|net)$|localhost|^127\./i.test(url.hostname);
    } catch {
        return false;
    }
}

console.log("=== Lokale pre-certificering (geen Microsoft-goedkeuring) ===");
for (const file of [".gitignore", "README.md", "LICENSE", "SUPPORT.md", "PRIVACY.md", "CERTIFICATION.md",
    "capabilities.json", "pbiviz.json", "package.json", "package-lock.json", "tsconfig.json", "eslint.config.mjs"]) {
    check(fs.existsSync(path.join(rootDir, file)), `${file} aanwezig`);
}
if (failures) process.exit(1);

const manifest = readJson("pbiviz.json");
const packageJson = readJson("package.json");
const lock = readJson("package-lock.json");
const capabilities = readJson("capabilities.json");
const api = readJson("node_modules/powerbi-visuals-api/package.json");
const visualSource = fs.readFileSync(path.join(rootDir, "src/visual.ts"), "utf8");
const version = packageJson.version;
check(/^\d+\.\d+\.\d+\.\d+$/.test(version), "Versie bestaat uit vier numerieke delen");
check(manifest.visual.version === version && manifest.version === version
    && lock.version === version && lock.packages?.[""].version === version
    && visualSource.includes(`private static readonly VisualVersion = "${version}";`), "Alle versienummers zijn gelijk");
check(manifest.apiVersion === api.version, "Manifest gebruikt de geinstalleerde API-versie");
check(/^[A-Za-z][A-Za-z0-9]*[A-Fa-f0-9]{32}$/.test(manifest.visual.guid), "Visual-GUID bestaat uit een naam en 32 hexadecimale tekens");
check(Boolean(manifest.visual.description?.trim()), "Visual heeft een omschrijving");
check(Boolean(manifest.author.name?.trim()), "Auteur is ingevuld");
check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manifest.author.email)
    && !/example\.(com|org|net)$/i.test(manifest.author.email), "Auteur heeft een niet-placeholder e-mailadres");
check(isPublicHttps(manifest.visual.supportUrl), "Support-URL heeft een geldig HTTPS-formaat");
check(isPublicHttps(manifest.visual.gitHubUrl), "Broncode-URL heeft een geldig HTTPS-formaat");
check(packageJson.repository?.url?.replace(/\.git$/, "") === manifest.visual.gitHubUrl, "Repository-URL en manifest komen overeen");
check(!manifest.externalJS?.length, "Geen externe JavaScript-resources");
check(Array.isArray(capabilities.privileges) && capabilities.privileges.length === 0, "Geen ongebruikte of externe privileges");
for (const dependency of ["typescript", "eslint", "eslint-plugin-powerbi-visuals", "powerbi-visuals-tools"]) {
    check(Boolean(packageJson.devDependencies?.[dependency] || packageJson.dependencies?.[dependency]), `${dependency} is gedeclareerd`);
}
check(Boolean(packageJson.scripts.eslint), "npm run eslint is beschikbaar voor reviewers");

const ignore = fs.readFileSync(path.join(rootDir, ".gitignore"), "utf8").split(/\r?\n/).map((line) => line.trim());
for (const directory of ["node_modules", ".tmp", "dist"]) {
    check(ignore.some((entry) => [directory, `${directory}/`, `/${directory}/`].includes(entry)), `${directory} wordt genegeerd door Git`);
}
const iconPath = path.join(rootDir, manifest.assets.icon);
check(fs.existsSync(iconPath), "Visual-icoon bestaat");
if (fs.existsSync(iconPath)) {
    const icon = fs.readFileSync(iconPath);
    const png = icon.length >= 24 && icon.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    check(png && icon.readUInt32BE(16) === 20 && icon.readUInt32BE(20) === 20, "Visual-icoon is een PNG van 20 x 20 pixels");
}

console.log("\n=== Broncode en externe resources ===");
const forbidden = [
    [/\b(?:fetch|eval|Function)\s*\(/, "fetch/eval/Function"],
    [/\b(?:XMLHttpRequest|WebSocket|localStorage|sessionStorage)\b/, "Netwerk- of browseropslag-API"],
    [/\.(?:innerHTML|outerHTML|insertAdjacentHTML)\b/, "Onveilige HTML-injectie"],
    [/document\.(?:write|cookie)\b/, "document.write/cookie"],
    [/\b(?:setTimeout|setInterval)\s*\(\s*["'`]/, "Timer met uitvoerbare tekst"]
];
for (const file of sourceFiles(path.join(rootDir, "src")).filter((file) => /\.[jt]s$/.test(file))) {
    const content = fs.readFileSync(file, "utf8");
    for (const [pattern, label] of forbidden) {
        check(!pattern.test(content), `${path.relative(rootDir, file)}: geen ${label}`);
    }
}
for (const file of sourceFiles(path.join(rootDir, "style"))) {
    const content = fs.readFileSync(file, "utf8");
    check(!/(?:url\s*\(\s*["']?\s*(?:https?:)?\/\/|@import\s+["']\s*(?:https?:)?\/\/)/i.test(content),
        `${path.relative(rootDir, file)}: geen externe stylesheets, fonts of afbeeldingen`);
}

runNode("ESLint", path.join(rootDir, "node_modules/eslint/bin/eslint.js"), [".", "--max-warnings=0"]);
runNode("TypeScript", path.join(rootDir, "node_modules/typescript/bin/tsc"), ["--noEmit", "--skipLibCheck"]);
runNode("Regressietests", path.join(rootDir, "scripts/visual-validation.test.js"));
const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
runNode("Dependency audit (ook moderate blokkeert)", npmCli, ["audit", "--audit-level=moderate"]);
runNode("Power BI certificeringsaudit en packagebuild", path.join(rootDir, "node_modules/powerbi-visuals-tools/bin/pbiviz.js"),
    ["package", "--certification-audit"]);

console.log(`\n${failures} mislukte lokale controle(s).`);
console.log("Handmatig vereist: test-PBIX, Desktop/Service/embedded, PDF-export na certificering, listing en privacyreview.");
console.log("Controleer de bereikbaarheid van alle publicatie-URL's; deze check valideert alleen hun formaat.");
console.log("Publiceer exact deze broncode op de branch certification; zie CERTIFICATION.md.");
process.exitCode = failures ? 1 : 0;