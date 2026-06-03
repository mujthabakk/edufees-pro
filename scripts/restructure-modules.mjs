#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const ROLE_ROUTES = {
  "super-admin": "super-admin",
  accountant: "accountant",
  parent: "parent",
  teacher: "teacher",
};

const SCHOOL_ADMIN_ROUTES = [
  "dashboard",
  "students",
  "academic",
  "fee-structure",
  "payments",
  "invoices",
  "reports",
  "coupons",
  "notifications",
  "settings",
];

const LAYOUT_MOVES = [
  ["components/layout/super-admin-sidebar.tsx", "modules/super-admin/_layout/components/sidebar.tsx"],
  ["components/layout/accountant-sidebar.tsx", "modules/accountant/_layout/components/sidebar.tsx"],
  ["components/layout/teacher-sidebar.tsx", "modules/teacher/_layout/components/sidebar.tsx"],
  ["components/layout/parent-nav.tsx", "modules/parent/_layout/components/parent-nav.tsx"],
  ["components/layout/sidebar.tsx", "modules/school-admin/_layout/components/sidebar.tsx"],
  ["components/layout/topbar.tsx", "modules/shared/layout/topbar.tsx"],
  ["components/ui/button.tsx", "modules/shared/ui/button.tsx"],
  ["components/ui/card.tsx", "modules/shared/ui/card.tsx"],
  ["components/ui/badge.tsx", "modules/shared/ui/badge.tsx"],
  ["components/dashboard/stat-card.tsx", "modules/shared/components/stat-card.tsx"],
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function moveFile(from, to) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, to);
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dest));
  fs.renameSync(src, dest);
  return true;
}

function createRoleLayout(role, sidebarExport, sidebarName) {
  const layoutPath = path.join(ROOT, `modules/${role}/_layout/components/role-layout.tsx`);
  writeFile(
    layoutPath,
    `import { ${sidebarName} } from "./sidebar";
export function ${role.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("")}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <${sidebarName} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
`
  );
}

function createParentLayout() {
  writeFile(
    path.join(ROOT, "modules/parent/_layout/components/role-layout.tsx"),
    `import { ParentNav } from "./parent-nav";
export function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentNav />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
`
  );
}

function getModulePath(appRelPath) {
  const parts = appRelPath.replace(/^app\//, "").split("/");
  const fileName = parts.pop(); // page.tsx or layout.tsx
  if (fileName !== "page.tsx") return null;

  const first = parts[0];
  if (ROLE_ROUTES[first]) {
    const role = ROLE_ROUTES[first];
    const moduleParts = parts.slice(1);
    if (moduleParts.length === 0) return null;
    const moduleName = moduleParts.join("-").replace(/\[id\]/g, "detail");
    return { role, module: moduleName, routeParts: parts };
  }

  if (parts.length === 0) return null;

  if (SCHOOL_ADMIN_ROUTES.includes(first)) {
    const moduleName = parts.join("-").replace(/\[id\]/g, "detail");
    return { role: "school-admin", module: moduleName, routeParts: parts };
  }

  return null;
}

function componentName(moduleName) {
  return moduleName
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("") + "Page";
}

function processPage(appPagePath) {
  const rel = path.relative(ROOT, appPagePath);
  const info = getModulePath(rel);
  if (!info) return;

  const content = fs.readFileSync(appPagePath, "utf8");
  const comp = componentName(info.module);
  const moduleDir = path.join(ROOT, "modules", info.role, info.module);
  ensureDir(path.join(moduleDir, "components"));
  ensureDir(path.join(moduleDir, "ui"));
  ensureDir(path.join(moduleDir, "types"));

  const compPath = path.join(moduleDir, "components", `${info.module}-page.tsx`);
  let updated = content.replace(/@\/components\/ui\//g, "@/modules/shared/ui/");
  updated = updated.replace(/@\/components\/layout\/topbar/g, "@/modules/shared/layout/topbar");
  updated = updated.replace(/@\/components\/dashboard\/stat-card/g, "@/modules/shared/components/stat-card");
  updated = updated.replace(/export default function \w+/, `export function ${comp}`);

  fs.writeFileSync(compPath, updated);

  writeFile(
    path.join(moduleDir, "index.ts"),
    `export { ${comp} } from "./components/${info.module}-page";\n`
  );

  const wrapper = `export { ${comp} as default } from "@/modules/${info.role}/${info.module}";\n`;
  fs.writeFileSync(appPagePath, wrapper);
}

function updateImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  const replacements = [
    [/@\/components\/ui\//g, "@/modules/shared/ui/"],
    [/@\/components\/layout\/topbar/g, "@/modules/shared/layout/topbar"],
    [/@\/components\/dashboard\/stat-card/g, "@/modules/shared/components/stat-card"],
    [/@\/components\/layout\/super-admin-sidebar/g, '@/modules/super-admin/_layout/components/sidebar'],
    [/@\/components\/layout\/accountant-sidebar/g, '@/modules/accountant/_layout/components/sidebar'],
    [/@\/components\/layout\/teacher-sidebar/g, '@/modules/teacher/_layout/components/sidebar'],
    [/@\/components\/layout\/parent-nav/g, '@/modules/parent/_layout/components/parent-nav'],
    [/@\/components\/layout\/sidebar/g, '@/modules/school-admin/_layout/components/sidebar'],
    [/SuperAdminSidebar/g, "Sidebar"],
    [/AccountantSidebar/g, "Sidebar"],
    [/TeacherSidebar/g, "Sidebar"],
  ];
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(filePath, content);
}

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

// 1. Move shared & layout files
for (const [from, to] of LAYOUT_MOVES) {
  moveFile(from, to);
}

// Rename exports in sidebars
const sidebarUpdates = {
  "modules/super-admin/_layout/components/sidebar.tsx": { old: "SuperAdminSidebar", new: "Sidebar" },
  "modules/accountant/_layout/components/sidebar.tsx": { old: "AccountantSidebar", new: "Sidebar" },
  "modules/teacher/_layout/components/sidebar.tsx": { old: "TeacherSidebar", new: "Sidebar" },
};

for (const [file, { old, new: newName }] of Object.entries(sidebarUpdates)) {
  const p = path.join(ROOT, file);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, "utf8");
    c = c.replace(new RegExp(`export function ${old}`), `export function ${newName}`);
    fs.writeFileSync(p, c);
  }
}

// 2. Create role layouts
createRoleLayout("super-admin", "Sidebar", "Sidebar");
createRoleLayout("accountant", "Sidebar", "Sidebar");
createRoleLayout("teacher", "Sidebar", "Sidebar");
createRoleLayout("school-admin", "Sidebar", "Sidebar");
createParentLayout();

// Export barrels for layouts
for (const role of ["super-admin", "accountant", "teacher", "school-admin"]) {
  const name = role.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("") + "Layout";
  writeFile(
    path.join(ROOT, `modules/${role}/_layout/index.ts`),
    `export { ${name} } from "./components/role-layout";\nexport { Sidebar } from "./components/sidebar";\n`
  );
}
writeFile(
  path.join(ROOT, "modules/parent/_layout/index.ts"),
  `export { ParentLayout } from "./components/role-layout";\nexport { ParentNav } from "./components/parent-nav";\n`
);

// 3. Process all pages
walk(path.join(ROOT, "app"), (file) => {
  if (file.endsWith("page.tsx")) processPage(file);
});

// 4. Update app layouts to use role layouts
const layoutMap = {
  "app/super-admin": "SuperAdminLayout",
  "app/accountant": "AccountantLayout",
  "app/teacher": "TeacherLayout",
  "app/parent": "ParentLayout",
};

for (const [prefix, layoutName] of Object.entries(layoutMap)) {
  const role = prefix.replace("app/", "");
  walk(path.join(ROOT, prefix), (file) => {
    if (!file.endsWith("layout.tsx")) return;
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("modules/")) return;
    if (role === "parent") {
      updateImportsInFile(file);
      return;
    }
    fs.writeFileSync(
      file,
      `import { ${layoutName} } from "@/modules/${role}/_layout";\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <${layoutName}>{children}</${layoutName}>;\n}\n`
    );
  });
}

// School admin layouts
const schoolAdminRoutes = [
  "dashboard", "students", "students/import", "students/[id]",
  "academic", "fee-structure", "payments", "invoices", "reports",
  "coupons", "notifications", "settings",
];
for (const route of schoolAdminRoutes) {
  const layoutFile = path.join(ROOT, "app", route, "layout.tsx");
  if (fs.existsSync(layoutFile)) {
    fs.writeFileSync(
      layoutFile,
      `import { SchoolAdminLayout } from "@/modules/school-admin/_layout";\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <SchoolAdminLayout>{children}</SchoolAdminLayout>;\n}\n`
    );
  }
}

// 5. Update remaining files
walk(ROOT, (file) => {
  if (file.endsWith(".tsx") || file.endsWith(".ts")) updateImportsInFile(file);
});

// 6. Clean empty old dirs
function rmEmpty(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) rmEmpty(full);
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}
rmEmpty(path.join(ROOT, "components"));

// 7. Move login page to auth module
const loginPage = path.join(ROOT, "app/page.tsx");
if (fs.existsSync(loginPage)) {
  const loginContent = fs.readFileSync(loginPage, "utf8");
  ensureDir(path.join(ROOT, "modules/auth/components"));
  ensureDir(path.join(ROOT, "modules/auth/ui"));
  fs.writeFileSync(
    path.join(ROOT, "modules/auth/components/login-page.tsx"),
    loginContent.replace("export default function LoginPage", "export function LoginPage")
  );
  writeFile(
    path.join(ROOT, "modules/auth/index.ts"),
    `export { LoginPage } from "./components/login-page";\n`
  );
  fs.writeFileSync(loginPage, `export { LoginPage as default } from "@/modules/auth";\n`);
}

// 8. Shared module index
writeFile(
  path.join(ROOT, "modules/shared/index.ts"),
  `export * from "./ui/button";\nexport * from "./ui/card";\nexport * from "./ui/badge";\nexport * from "./layout/topbar";\nexport * from "./components/stat-card";\n`
);

console.log("Module restructure complete.");
