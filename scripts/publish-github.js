const { spawnSync } = require("child_process");
const path = require("path");

const visualRoot = path.resolve(__dirname, "..");
const sourcePaths = [
  ".gitignore",
  "README.md",
  "LICENSE",
  "PRIVACY.md",
  "SUPPORT.md",
  "CERTIFICATION.md",
  "assets",
  "capabilities.json",
  "eslint.config.mjs",
  "package-lock.json",
  "package.json",
  "pbiviz.json",
  "scripts",
  "src",
  "style",
  "tsconfig.json"
];

function git(args, options = {}) {
  const result = spawnSync("git", ["-c", "gc.auto=0", ...args], {
    cwd: options.cwd || visualRoot,
    encoding: options.capture ? "utf8" : undefined,
    stdio: options.capture ? "pipe" : "inherit",
    shell: false
  });

  if (result.error) {
    throw result.error;
  }
  if (!options.allowFailure && result.status !== 0) {
    process.exit(result.status || 1);
  }
  return result;
}

function output(args) {
  const result = git(args, { capture: true });
  return (result.stdout || "").trim();
}

if (process.env.SKIP_GITHUB_PUSH === "1") {
  console.log("GitHub-update overgeslagen (SKIP_GITHUB_PUSH=1). ");
  process.exit(0);
}

const repositoryRoot = output(["rev-parse", "--show-toplevel"]);
const branch = output(["branch", "--show-current"]);
if (!branch) {
  console.error("GitHub-update gestopt: HEAD staat niet op een branch.");
  process.exit(1);
}

git(["fetch", "origin", branch], { cwd: repositoryRoot });
const remoteRef = `origin/${branch}`;
const remoteIsAncestor = git(
  ["merge-base", "--is-ancestor", remoteRef, "HEAD"],
  { cwd: repositoryRoot, allowFailure: true }
);
if (remoteIsAncestor.status !== 0) {
  console.error(
    `GitHub-update gestopt: ${remoteRef} bevat commits die lokaal ontbreken. Haal de wijzigingen eerst handmatig op.`
  );
  process.exit(1);
}

const relativeVisualRoot = path
  .relative(repositoryRoot, visualRoot)
  .split(path.sep)
  .join("/");
const pathspecs = sourcePaths.map((entry) => relativeVisualRoot ? `${relativeVisualRoot}/${entry}` : entry);

git(["add", "--", ...pathspecs], { cwd: repositoryRoot });
const hasChanges = git(
  ["diff", "--cached", "--quiet", "HEAD", "--", ...pathspecs],
  { cwd: repositoryRoot, allowFailure: true }
).status !== 0;

if (hasChanges) {
  const version = require("../package.json").version;
  git(
    ["commit", "--only", "-m", `ResultatenLuchtgeluid v${version}`, "--", ...pathspecs],
    { cwd: repositoryRoot }
  );
} else {
  console.log("Geen gewijzigde bronbestanden om te committen.");
}

git(["push", "origin", branch], { cwd: repositoryRoot });
console.log(`ResultatenLuchtgeluid is bijgewerkt op origin/${branch}.`);