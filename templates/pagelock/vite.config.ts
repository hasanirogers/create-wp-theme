import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Packages provided by WordPress at runtime. They resolve to globals instead
// of node_modules so blocks share the editor's data stores. @wordpress/element
// is WordPress's React, so react maps to it as well.
const wpGlobals: Record<string, string> = {
  '@wordpress/blocks': 'window.wp.blocks',
  '@wordpress/block-editor': 'window.wp.blockEditor',
  '@wordpress/components': 'window.wp.components',
  '@wordpress/element': 'window.wp.element',
  '@wordpress/i18n': 'window.wp.i18n',
  '@wordpress/data': 'window.wp.data',
  'react': 'window.wp.element',
};

const externalSpecifiers = Object.keys(wpGlobals)
  .map((specifier) => specifier.replace(/[/.]/g, '\\$&'))
  .join('|');

const identifier = '[A-Za-z_$][\\w$]*';
// The clause may span lines (multi-line named imports) but must not cross
// statement boundaries, or a preceding non-external import gets swallowed.
const clausePattern = '((?:(?!["\';]|\\bimport\\b|\\bfrom\\b)[\\s\\S])*?)';
const importPattern = new RegExp(
  `\\bimport\\s*(?:${clausePattern}\\s+from\\s+)?["'](${externalSpecifiers})["']\\s*;?`,
  'g'
);
const namedExportPattern = new RegExp(
  `export\\s+\\{([\\s\\S]*?)\\}\\s+from\\s+["'](${externalSpecifiers})["']\\s*;?`,
  'g'
);
const dynamicImportPattern = new RegExp(
  `import\\s*\\(\\s*["'](${externalSpecifiers})["']\\s*\\)`,
  'g'
);

function toGlobals(clause: string | undefined, expression: string): string {
  if (clause === undefined) {
    return `void ${expression};`;
  }

  const statements: string[] = [];
  const defaultImport = clause.match(new RegExp(`^\\s*(${identifier})\\s*(?=,|$)`));
  const namespaceImport = clause.match(new RegExp(`\\*\\s+as\\s+(${identifier})`));
  const namedImports = clause.match(/\{([\s\S]*?)\}/);

  if (defaultImport) {
    statements.push(`const ${defaultImport[1]} = ${expression};`);
  }
  if (namespaceImport) {
    statements.push(`const ${namespaceImport[1]} = ${expression};`);
  }
  if (namedImports) {
    const names = namedImports[1]
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) =>
        name.replace(new RegExp(`^(${identifier})\\s+as\\s+(${identifier})$`), '$1: $2')
      );
    if (names.length) {
      statements.push(`const { ${names.join(', ')} } = ${expression};`);
    }
  }

  return statements.join(' ');
}

function wordpressGlobals(): Plugin[] {
  return [
    {
      // react/jsx-runtime has a fixed API, so it becomes a virtual module
      // that builds JSX elements with WordPress's React (wp.element).
      name: 'wordpress-jsx-runtime',
      enforce: 'pre',
      resolveId: (source) => {
        if (source === 'react/jsx-runtime' || source === 'react/jsx-dev-runtime') {
          return '\0wordpress-jsx-runtime';
        }
        return null;
      },
      load: (id) => {
        if (id !== '\0wordpress-jsx-runtime') {
          return null;
        }
        return `
const wpElement = window.wp.element;
const create = (type, props, key) =>
  wpElement.createElement(type, key == null ? props : { ...props, key });
export const Fragment = wpElement.Fragment;
export const jsx = create;
export const jsxs = create;
export const jsxDEV = create;
export default wpElement;
`;
      },
    },
    {
      // Runs after the TS/JSX transforms so imports injected by
      // @vitejs/plugin-react are visible too. Rewrites externalized package
      // imports into global lookups, which also keeps dev mode on the same
      // @wordpress/data registry as the editor.
      name: 'wordpress-external-globals',
      enforce: 'post',
      transform: (code, id) => {
        if (!/\.[cm]?[jt]sx?([?#]|$)/.test(id)) {
          return null;
        }

        const transformed = code
          .replace(dynamicImportPattern, (_match, specifier: string) =>
            `Promise.resolve(${wpGlobals[specifier]})`
          )
          .replace(namedExportPattern, (_match, list: string, specifier: string) => {
            const expression = wpGlobals[specifier];
            const pairs = list
              .split(',')
              .map((name) => name.trim())
              .filter(Boolean)
              .map((name) => {
                const aliased = name.match(
                  new RegExp(`^(${identifier})\\s+as\\s+(${identifier})$`)
                );
                return aliased
                  ? { local: aliased[1], exported: aliased[2] }
                  : { local: name, exported: name };
              });
            const declarations = pairs
              .map((pair) => `const ${pair.local} = ${expression}.${pair.local};`)
              .join(' ');
            const specifiers = pairs
              .map((pair) => (pair.local === pair.exported ? pair.local : `${pair.local} as ${pair.exported}`))
              .join(', ');
            return `${declarations} export { ${specifiers} };`;
          })
          .replace(importPattern, (match, clause: string | undefined, specifier: string) =>
            clause?.trim().startsWith('type ') ? match : toGlobals(clause, wpGlobals[specifier])
          );

        return transformed === code ? null : { code: transformed, map: null };
      },
    },
  ];
}

export default defineConfig({
  plugins: [react(), ...wordpressGlobals()],
  build: {
    outDir: 'build',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        admin: path.resolve(import.meta.dirname, 'src/admin.ts'),
        blocks: path.resolve(import.meta.dirname, 'src/blocks.ts'),
        frontend: path.resolve(import.meta.dirname, 'src/frontend.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        format: 'es',
        codeSplitting: true,
      },
      // Anything the transform misses stays external and fails loudly
      // (bare specifier) instead of silently bundling a second registry.
      external: Object.keys(wpGlobals),
    },
  },
  optimizeDeps: {
    exclude: [...Object.keys(wpGlobals), 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  server: {
    host: true,
    allowedHosts: ['host.docker.internal'],
    cors: true,
    strictPort: true,
    port: 5173,
    hmr: {
      host: 'localhost',
    },
  },
});
