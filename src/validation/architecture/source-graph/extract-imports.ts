import ts from 'typescript';

import type { SourceImportEdge } from './types';

export function extractSourceImports(
  file: SourceFileSnapshotInput,
): readonly SourceImportEdge[] {
  const sourceBlocks = file.sourcePath.endsWith('.astro')
    ? extractAstroSourceBlocks(file.source)
    : [file.source];
  const specifiers: string[] = [];

  for (const source of sourceBlocks) {
    const sourceFile = ts.createSourceFile(
      file.sourcePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      getScriptKind(file.sourcePath),
    );

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;

        if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
          specifiers.push(moduleSpecifier.text);
        }
      }

      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        node.arguments[0] !== undefined &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        specifiers.push(node.arguments[0].text);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return Object.freeze(
    [...new Set(specifiers)]
      .sort(compareText)
      .map((specifier) => Object.freeze({ sourcePath: file.sourcePath, specifier })),
  );
}

export interface SourceFileSnapshotInput {
  readonly sourcePath: string;
  readonly source: string;
}

function extractAstroSourceBlocks(source: string): readonly string[] {
  const blocks: string[] = [];
  const frontmatterMatch = source.match(/(?:^|\r?\n)\s*---\s*\r?\n([\s\S]*?)\r?\n\s*---/);

  if (frontmatterMatch?.[1] !== undefined) {
    blocks.push(frontmatterMatch[1]);
  }

  const scriptPattern = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptPattern.exec(source)) !== null) {
    if (match[1] !== undefined) {
      blocks.push(match[1]);
    }
  }

  return blocks;
}

function getScriptKind(sourcePath: string): ts.ScriptKind {
  if (sourcePath.endsWith('.js') || sourcePath.endsWith('.mjs')) {
    return ts.ScriptKind.JS;
  }

  return ts.ScriptKind.TS;
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
