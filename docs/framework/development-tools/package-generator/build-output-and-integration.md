---
menu-title: Build output and integration
meta-title: Package generator output and integration | CKEditor 5 Framework Documentation
meta-description: See what the CKEditor 5 package generator writes to dist and how to use it with npm, ZIP, and CDN setups.
category: package-generator
order: 42
modified_at: 2026-03-24
---

# Understand the generated build output

Running `npm run build` creates two flavors of output in `dist/`: one for npm-based installations and one for direct browser loading. You can use the same generated package together with the standard CKEditor&nbsp;5 npm, ZIP, or CDN distributions.

<info-box important>
	The generated package is an add-on, not a full editor build. It does not bundle `ckeditor5`, it does not create a ZIP archive, and it does not publish anything to CKEditor Cloud CDN. You always combine it with a regular CKEditor&nbsp;5 installation.
</info-box>

This guide uses `<packageName>` as the npm package placeholder. `Callout` and `CKCallout` are example plugin and UMD global names for `ckeditor5-callout`. Your actual package, plugin, and global names depend on the values you used during generation.

## Generated project structure

The generated package has a small, predictable structure:

| Path                                                | Purpose                                                |
| --------------------------------------------------- | ------------------------------------------------------ |
| `src/`                                              | Plugin source files and the package entry point.       |
| `sample/`                                           | The local sample app loaded by `npm run start`.        |
| `tests/`                                            | Unit tests run by Vitest.                              |
| `theme/`                                            | Icons and CSS used by your plugin.                     |
| `lang/`                                             | Translation context and generated `*.po` files.        |
| `scripts/`                                          | Helper scripts, including translation synchronization. |
| `dist/`                                             | Files created by `npm run build`.                      |
| `ckeditor5-metadata.json`                           | Plugin metadata used by CKEditor&nbsp;5 tools.         |
| `vite.config.[js\|ts]`                              | Build and test configuration.                          |
| `src/augmentation.ts`, `typings/`, `tsconfig*.json` | TypeScript-only typing support.                        |

## TypeScript augmentation

When you choose the TypeScript template, the generator creates the `src/augmentation.ts` file. This is the place where the generated package augments CKEditor&nbsp;5 types such as `PluginsMap`. Update this file when you add new plugins or commands.

Depending on your plugin, you will usually augment one or more of these interfaces:

* {@link module:core/editor/editorconfig~EditorConfig} when your plugin adds configuration.
* {@link module:core/plugincollection~PluginsMap} when you want `editor.plugins.get()` to return your plugin type.
* {@link module:core/commandcollection~CommandsMap} when you add commands and want `editor.commands.get()` to return typed results.

The generated template already imports `./augmentation.js` from `src/index.ts`.

```ts
import type { Callout } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Callout.pluginName ]: Callout;
	}
}
```

## What goes into `dist/`

After `npm run build`, the output looks similar to this:

```plain
dist/
├─ index.js
├─ index.css
├─ index.d.ts                # TypeScript only
├─ callout.d.ts              # TypeScript only
├─ augmentation.d.ts         # TypeScript only, if present
└─ browser/
	├─ index.es.js
	├─ index.umd.js
	└─ index.css
```

Each file has a different job:

| File                        | Use it for                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dist/index.js`             | The npm package entry. It is ESM and keeps `ckeditor5` as an external dependency.                                                                   |
| `dist/index.css`            | The CSS file for npm consumers. Import it separately in the consuming app.                                                                          |
| `dist/*.d.ts`               | TypeScript declarations generated from `src/`. They are published together with the npm build.                                                      |
| `dist/browser/index.es.js`  | The browser ESM build for `type="module"` and import-map setups. It still expects `ckeditor5` to be provided separately.                            |
| `dist/browser/index.umd.js` | The browser UMD build for plain `<script>` setups. It expects `CKEDITOR` to exist and exposes your package on the global name chosen for the build. |
| `dist/browser/index.css`    | The CSS file for ZIP and CDN-style browser integrations.                                                                                            |

`package.json` is already configured so that publishing the package ships `dist/` and `ckeditor5-metadata.json`.

What you do not get from the generator:

* No full editor bundle with CKEditor&nbsp;5 built in.
* No ZIP archive ready to download.
* No automatic CDN hosting.

## Use the output with npm

Start from the {@link getting-started/integrations/quick-start npm or ZIP quick start} guide, then add your generated package on top.

The npm build is the right choice when your application already uses a package manager and a bundler. Publish the package to npm, install it from a local path, or use it from a workspace. In every case, the consuming project loads the package root, not `dist/browser/`.

```bash
npm install ckeditor5 <packageName>
```

```js
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
import { Callout } from '<packageName>';

import 'ckeditor5/ckeditor5.css';
import '<packageName>/index.css';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
		root: {
			initialData: '<p>Hello from CKEditor 5!</p>'
		},
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Callout ],
		toolbar: [ 'undo', 'redo', '|', 'callout' ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

TypeScript consumers automatically pick up the generated declaration files through the package `types` entry.

## Use the output with a ZIP-based setup

Start from the {@link getting-started/integrations/quick-start npm or ZIP quick start} guide, then copy `dist/browser/` to the same static assets area where you keep the extracted CKEditor&nbsp;5 ZIP files.

### Recommended: ESM with import maps

Use `dist/browser/index.es.js` when your page loads CKEditor&nbsp;5 from ESM files and import maps:

```html
<div id="editor"></div>

<link rel="stylesheet" href="./vendor/ckeditor5/ckeditor5.css" />
<link rel="stylesheet" href="./vendor/callout/index.css" />

<script type="importmap">
	{
		"imports": {
			"ckeditor5": "./vendor/ckeditor5/ckeditor5.js",
			"ckeditor5/": "./vendor/ckeditor5/",
			"<packageName>": "./vendor/callout/index.es.js"
		}
	}
</script>

<script type="module">
	import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
	import { Callout } from '<packageName>';

	ClassicEditor
		.create( {
			attachTo: document.querySelector( '#editor' ),
			root: {
				initialData: '<p>Hello from CKEditor 5!</p>'
			},
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Essentials, Paragraph, Callout ],
			toolbar: [ 'undo', 'redo', '|', 'callout' ]
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

### Alternative: UMD with script tags

Use `dist/browser/index.umd.js` when your page uses the UMD files from the ZIP package:

```html
<div id="editor"></div>

<link rel="stylesheet" href="./vendor/ckeditor5/ckeditor5.css" />
<link rel="stylesheet" href="./vendor/callout/index.css" />

<script src="./vendor/ckeditor5/ckeditor5.umd.js"></script>
<script src="./vendor/callout/index.umd.js"></script>

<script>
	const { ClassicEditor, Essentials, Paragraph } = CKEDITOR;
	const { Callout } = CKCallout;

	ClassicEditor
		.create( {
			attachTo: document.querySelector( '#editor' ),
			root: {
				initialData: '<p>Hello from CKEditor 5!</p>'
			},
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Essentials, Paragraph, Callout ],
			toolbar: [ 'undo', 'redo', '|', 'callout' ]
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

`CKCallout` is the example UMD global. If your package is `ckeditor5-callout`, this is the suggested default name. Otherwise, replace it with the global name you confirmed during generation.

## Use the output with CDN or cloud setups

Start from the {@link getting-started/integrations-cdn/quick-start CDN quick start} guide, then host your generated browser files yourself. CKEditor&nbsp;5 can come from the CDN, while your plugin still comes from your server.

### Recommended: import maps

```html
<div id="editor"></div>

<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
<link rel="stylesheet" href="/plugins/callout/index.css" />

<script type="importmap">
	{
		"imports": {
			"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
			"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/",
			"<packageName>": "/plugins/callout/index.es.js"
		}
	}
</script>

<script type="module">
	import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
	import { Callout } from '<packageName>';

	ClassicEditor
		.create( {
			attachTo: document.querySelector( '#editor' ),
			root: {
				initialData: '<p>Hello from CKEditor 5!</p>'
			},
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Essentials, Paragraph, Callout ],
			toolbar: [ 'undo', 'redo', '|', 'callout' ]
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

<info-box tip>
	If your application also uses Vite, extend the externalization setup from the {@link getting-started/integrations-cdn/quick-start CDN quick start} guide so Vite also leaves your custom package import unresolved.
</info-box>

### Alternative: UMD globals

```html
<div id="editor"></div>

<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
<link rel="stylesheet" href="/plugins/callout/index.css" />

<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
<script src="/plugins/callout/index.umd.js"></script>

<script>
	const { ClassicEditor, Essentials, Paragraph } = CKEDITOR;
	const { Callout } = CKCallout;

	ClassicEditor
		.create( {
			attachTo: document.querySelector( '#editor' ),
			root: {
				initialData: '<p>Hello from CKEditor 5!</p>'
			},
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Essentials, Paragraph, Callout ],
			toolbar: [ 'undo', 'redo', '|', 'callout' ]
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
</script>
```

## Choose the right output quickly

| If your project uses...                         | Use these generated files                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| npm and a bundler                               | `dist/index.js` and `dist/index.css`                                                     |
| ZIP files and import maps                       | `dist/browser/index.es.js` and `dist/browser/index.css`                                  |
| ZIP files and plain `<script>` tags             | `dist/browser/index.umd.js` and `dist/browser/index.css`                                 |
| CKEditor Cloud CDN plus your static hosting     | `dist/browser/index.es.js` or `dist/browser/index.umd.js`, plus `dist/browser/index.css` |
