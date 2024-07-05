---
category: nim-migration
order: 60
menu-title: Migrating custom plugins
meta-title: Migrating custom plugins to new installation methods | CKEditor 5 documentation
meta-description: Learn how to upgrade custom plugins to the new installation methods.
modified_at: 2024-06-25
---

# Migrating custom plugins

If you have created and published custom plugins for CKEditor&nbsp;5, you will need to adjust them to make them work with the new installation methods. The migration process is slightly different depending on whether you only want to support the new installation methods or also maintain backward compatibility with the old installation methods.

You do not need to follow this guide if your custom plugins are used directly in your project and are not separate packages. In such cases, you can update the plugins along with the projects that use them.

<info-box warning>
	This migration guide assumes that you have created a custom plugin using our {@link framework/development-tools/package-generator/using-package-generator package generator}. If you created your plugin in a different way, you will need to adjust the steps accordingly.
</info-box>

## Prerequisites

Before you start, follow the usual upgrade path to update your plugin to use the latest version of CKEditor&nbsp;5. This will rule out any problems that may be caused by upgrading from an outdated version of CKEditor&nbsp;5.

## Migration steps

### Create a new project using the package generator

To ensure that all the dependencies are up-to-date and that the build process is correct, we recommend the following steps:

1. Create a new project using the package generator following the {@link framework/development-tools/package-generator/using-package-generator package generator guide}.
2. Copy the `src`, `tests`, and `sample` folders of your plugin into the new project.
3. Re-add all the external `dependencies`, `devDependencies`, and `peerDependencies` specific to your plugin to the `package.json` file.

When you run the CLI, you will be asked to choose whether you want to support the new installation methods only or provide backward compatibility with the old installation methods. Choose the option that best suits your needs, but be aware that the latter option will generate additional files and code that you will need to update or remove later. You should consider the legacy option if your plugin is used in projects outside your control that may still use the old installation methods, for example if your plugin is open-source.

You can learn more about the differences between the code written for the new and old installation methods in the {@link tutorials/supporting-multiple-versions Version compatibility of custom plugins} guide.

The main changes we have introduced in the new package generator are:

* Making the generated package a valid ECMAScript module,
* Updating the build process to generate bundles for the new installation methods,
* Adding new eslint rules to avoid common errors,
* Updating dependencies.

### Add missing file extensions in imports

Next, as required by the JavaScript modules (ESM), you must add the missing file extensions to all files in the `src`, `tests`, and `sample` folders during import. 

```diff
- import { Plugin } from 'ckeditor5/src/core';
+ import { Plugin } from 'ckeditor5/src/core.js';

-import SomePlugin from './src/someplugin';
+import SomePlugin from './src/someplugin.js';
```

Imports from the package roots should not be changed.

```js
// ✅
import { Plugin } from '@ckeditor/ckeditor5-core';
```

If you run the following command, the `ckeditor5-rules/require-file-extensions-in-imports` eslint rule should fix most, if not all, problems related to missing file extensions.

```bash
npm run lint -- --fix
```

### Remove `src` folders from the import paths

For some time now, we have strongly discouraged importing from the `src` folder of the `@ckeditor/ckeditor5-*` packages. Instead, you should import from the package roots because they provide better TypeScript support and because the `src` folders will be removed in the future. Importing from the `src` folder of the `ckeditor5` package is still allowed (for example `ckeditor5/src/core.js`) as it is needed for DLL build support.

```js
// ❌
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';

// ✅
import { Plugin } from '@ckeditor/ckeditor5-core';

// ✅
import { Plugin } from 'ckeditor5/src/core.js';
```

Note that the names of the exports may differ between the `src` folder and the package root. In the above example, the named `Plugin` import from `@ckeditor/ckeditor5-core/src/plugin.js` will be exported under the same name from `@ckeditor/ckeditor5-core` and `ckeditor5/src/core.js`, but this is not guaranteed. In cases where the names do not match, you will need to modify the import accordingly.

There may also be cases where something you imported from the `src` folder is not exported from the package root. In such cases, please create a new issue in the [CKEditor 5 repository](https://github.com/ckeditor/ckeditor5/issues/new/choose) so we can consider adding the missing exports.

If you run the following command, the `ckeditor5-rules/allow-imports-only-from-main-package-entry-point` eslint rule will list all the places where you need to update the imports.

```bash
npm run lint
```

### Remove `theme` folders from the import paths

The same rule applies to the `theme` folder in the `@ckeditor/ckeditor5-*` packages. If you need to use icons from this folder, you can likely import them from the package root.

```js
// ❌
import undo from '@ckeditor/ckeditor5-core/theme/icons/undo.svg';

console.log( undo );

// ✅
import { icons } from '@ckeditor/ckeditor5-core';

console.log( icons.undo );
```

If you run the following command, the `ckeditor5-rules/allow-imports-only-from-main-package-entry-point` eslint rule will list all the places where you need to update the imports.

```bash
npm run lint
```

### Update imports to the `ckeditor5` package

<info-box error>
	This step is only required if you want to stop supporting the old installation methods. If you want to continue to support the old installation methods, you can skip this step.
</info-box>

If you have chosen to only support the new installation methods in the package generator CLI, you will need to update all imports from `ckeditor5/src/*` and `@ckeditor/ckeditor5-*` to `ckeditor5`.

```diff
- import { Plugin } from 'ckeditor5/src/core.js';
- import { ButtonView } from 'ckeditor5/src/ui.js';
+ import { Plugin, ButtonView } from 'ckeditor5';
```

If you run the following command, the `ckeditor5-rules/no-legacy-imports` eslint rule will list all the places where you need to update the imports.

```bash
npm run lint
```

### Run eslint

Run the `npm run lint` command to see if there are any remaining problems that need to be fixed.

## Generate and validate the bundle

Once you have updated all the imports, it is time to build and validate the bundle for the new installation methods.

1. Build the plugin with the following command. It will create the `dist` folder with the plugin bundles for the new installation methods.

	```bash
	npm run prepare
	```

2. Inspect the imports at the top of the `dist/index.js` file.

	* If you have chosen to only support the new installation methods, you should only see imports from `ckeditor5` (not from `ckeditor5/src/*`) and optionally from other external dependencies.

	* If you have chosen to provide backward compatibility with the old installation methods, you should see your CKEditor imports rewritten to end with `/dist/index.js`. For example, imports from `ckeditor5/src/core.js` should be rewritten to `@ckeditor/ckeditor5-core/dist/index.js`. You may also see imports from other external dependencies if you have used any, but they should not be modified.

3. Repeat the above step for the `dist/browser/index.js` file, but this time you should only see imports from `ckeditor5` or `ckeditor5-premium-features`. All other imports including external dependencies should be bundled with the plugin

If you see imports in the second or third step that are not explicitly mentioned, check where the imports come from in the source code and if they have been updated according to the above migration steps. If this is the case and the imports in the generated bundle are still incorrect, please create a new issue in the [CKEditor 5 repository](https://github.com/ckeditor/ckeditor5/issues/new/choose).

## How to use your plugin in new installation methods?

How your plugin is used in the new installation methods depends on whether you have chosen to support the new installation methods only or also provide backward compatibility with the old installation methods.

If you support the new installation methods only:

* The code can be imported from the package root.
* If your plugin contains styles, they can be imported using the package name followed by `/index.css` (`import '<PLUGIN_NAME>/index.css'`).
* If your plugin provides translations, they can be imported using the package name followed by `/translations/<LANGUAGE>.js` (`import '<PLUGIN_NAME>/translations/<LANGUAGE>.js'`).

```js
// Importing the plugin code.
import { /* Plugin code */ } from '<PACKAGE_NAME>';

// Optionally importing the styles.
import '<PACKAGE_NAME/index.css';

// Optionally importing the translations.
import pluginTranslations from '<PACKAGE_NAME>/translations/<LANGUAGE>.js';
```

If you decided to provide backward compatibility with the old installation methods, the code can be imported using the package name followed by `/dist/index.js`. The styles and translations can be imported in the same way as above.

```js
// Importing the plugin code.
import { /* Plugin code */ } from '<PACKAGE_NAME>/dist/index.js';

// Optionally importing the styles.
import '<PACKAGE_NAME/index.css';

// Optionally importing the translations.
import pluginTranslations from '<PACKAGE_NAME>/translations/<LANGUAGE>.js';
```

The `/dist/index.js` part of the path will be removed in the future when support for the old installation methods is dropped.
