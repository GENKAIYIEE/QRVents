import { Project, SyntaxKind, Node } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const pages = project.getSourceFiles("src/app/**/page.tsx");
const layouts = project.getSourceFiles("src/app/**/layout.tsx");
const components = project.getSourceFiles("src/components/**/*.tsx");

console.log(`Found ${pages.length} pages, ${layouts.length} layouts, ${components.length} components.`);

function resetComponentReturn(file: any, template: string) {
  const defaultExport = file.getDefaultExportSymbol()?.getDeclarations()[0];
  if (!defaultExport) return;
  
  let funcDecl = defaultExport;
  if (Node.isExportAssignment(defaultExport)) {
    funcDecl = defaultExport.getExpression();
  }

  if (Node.isFunctionDeclaration(funcDecl) || Node.isArrowFunction(funcDecl)) {
    const returnStatements = funcDecl.getDescendantsOfKind(SyntaxKind.ReturnStatement);
    for (const ret of returnStatements) {
      const expr = ret.getExpression();
      if (expr && (Node.isJsxElement(expr) || Node.isJsxFragment(expr) || Node.isParenthesizedExpression(expr))) {
        ret.replaceWithText(`return ${template};`);
      }
    }
  }
}

// 1. Process layouts
layouts.forEach(file => {
  resetComponentReturn(file, `(<div>{children}</div>)`);
  file.saveSync();
});

// 2. Process non-auth pages
pages.forEach(file => {
  const filePath = file.getFilePath();
  if (filePath.includes("login") || filePath.includes("register")) {
    return; // handle manually or differently
  }
  
  let title = "Page";
  if (filePath.includes("dashboard")) title = "Dashboard";
  
  const template = `(
    <div>
      <h1>${title}</h1>
      <p>This page will be redesigned.</p>
    </div>
  )`;
  
  resetComponentReturn(file, template);
  file.saveSync();
});

// 3. Process components
components.forEach(file => {
  const filePath = file.getFilePath();
  if (filePath.includes("LoginForm") || filePath.includes("RegisterForm")) {
    return; // manual
  }
  resetComponentReturn(file, `null`);
  file.saveSync();
});

console.log("Done running automated TS-Morph updates.");
