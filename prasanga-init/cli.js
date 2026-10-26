#!/usr/bin/env node

import { execSync } from "child_process";
import { cpSync, existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const appName = process.argv[2];
const pkgMeta = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
const CLI_VERSION = pkgMeta.version;

function log(message) {
  console.log(message);
}

function error(message) {
  console.error(message);
}

function printUsage() {
  log("");
  log("Usage: npx prasanga-init <project-directory>");
  log("");
  log("Options:");
  log("  -h, --help     Show this help message");
  log("  -v, --version  Show CLI version");
  log("");
  log("Example:");
  log("  npx prasanga-init MyNewApp");
  log("");
}

if (process.argv.includes("-h") || process.argv.includes("--help")) {
  printUsage();
  process.exit(0);
}

if (process.argv.includes("-v") || process.argv.includes("--version")) {
  log(`prasanga-init v${CLI_VERSION}`);
  process.exit(0);
}

if (!appName || appName.startsWith("-")) {
  printUsage();
  process.exit(1);
}

if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(appName)) {
  error("");
  error("Error: Invalid project name.");
  error("Use letters, numbers, hyphens, or underscores. Must start with a letter.");
  error("");
  process.exit(1);
}

const targetDir = resolve(process.cwd(), appName);
const templateDir = join(__dirname, "template");

if (existsSync(targetDir)) {
  error("");
  error(`Error: Directory "${appName}" already exists.`);
  error("");
  process.exit(1);
}

if (!existsSync(templateDir)) {
  error("");
  error("Error: Starter template not found in prasanga-init package.");
  error("");
  process.exit(1);
}

log("");
log(`Creating a new Prasanga app in ${targetDir}`);
log("");

try {
  log("- copying starter files");
  cpSync(templateDir, targetDir, { recursive: true });

  const pkgPath = join(targetDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = appName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const appJsonPath = join(targetDir, "app.json");
  const appJson = JSON.parse(readFileSync(appJsonPath, "utf8"));
  appJson.expo.name = appName;
  appJson.expo.slug = pkg.name;
  writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

  log("- updating project metadata");
  log("");
  log("Installing dependencies with npm:");
  log("  prasanga-ui, expo, react, react-native");
  log("");

  execSync("npm install --legacy-peer-deps", { cwd: targetDir, stdio: "inherit" });

  log("");
  log("Success! Created project at:");
  log(`  ${targetDir}`);
  log("");
  log("Inside that directory, you can run:");
  log("");
  log("  npx expo start");
  log("    Start the Expo development server.");
  log("");
  log("  npm run ios");
  log("    Run on iOS simulator.");
  log("");
  log("  npm run android");
  log("    Run on Android emulator.");
  log("");
  log("We suggest starting with:");
  log("");
  log(`  cd ${appName}`);
  log("  npx expo start");
  log("");
  log("Documentation:");
  log("  https://prasangakit.smmv.shop");
  log("  https://www.npmjs.com/package/prasanga-ui");
  log("");
} catch (err) {
  error("");
  error("Error: Failed to create project.");
  if (err instanceof Error && err.message) {
    error(err.message);
  }
  error("");
  process.exit(1);
}
