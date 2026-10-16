const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const pbivizJsonPath = path.join(rootDir, "pbiviz.json");
const visualTsPath = path.join(rootDir, "src", "visual.ts");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

const packageJson = readJson(packageJsonPath);
const version = packageJson.version;

if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Ongeldig versienummer in package.json: ${version}`);
}

const pbivizJson = readJson(pbivizJsonPath);
pbivizJson.version = version;
if (!pbivizJson.visual) {
  pbivizJson.visual = {};
}
pbivizJson.visual.version = version;
writeJson(pbivizJsonPath, pbivizJson);

const packageLockPath = path.join(rootDir, "package-lock.json");
if (fs.existsSync(packageLockPath)) {
  const packageLock = readJson(packageLockPath);
  packageLock.version = version;
  if (packageLock.packages?.[""]) {
    packageLock.packages[""].version = version;
  }
  fs.writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`, "utf8");
}

const visualTs = fs.readFileSync(visualTsPath, "utf8");
const visualVersionPattern = /private static readonly VisualVersion = "[^"]+";/;
if (!visualVersionPattern.test(visualTs)) {
  throw new Error("Kon VisualVersion-regel niet vinden in src/visual.ts");
}

const updatedVisualTs = visualTs.replace(
  visualVersionPattern,
  `private static readonly VisualVersion = "${version}";`
);

fs.writeFileSync(visualTsPath, updatedVisualTs, "utf8");
console.log(`Versies gesynchroniseerd naar ${version}`);
