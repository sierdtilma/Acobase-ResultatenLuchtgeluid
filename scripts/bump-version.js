const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const packageJson = readJson(packageJsonPath);
const version = packageJson.version;

if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Ongeldig versienummer in package.json: ${version}`);
}

const [major, minor, patch, build] = version.split(".").map((v) => Number(v));
const nextVersion = `${major}.${minor}.${patch}.${build + 1}`;

packageJson.version = nextVersion;
writeJson(packageJsonPath, packageJson);

console.log(`Versie opgehoogd: ${version} -> ${nextVersion}`);
