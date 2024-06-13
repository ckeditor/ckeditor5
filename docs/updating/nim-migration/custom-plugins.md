---
category: nim-migration
order: 50
menu-title: Migrating custom plugins
meta-title: Migrating custom plugins to new installation methods | CKEditor 5 documentation
meta-description: Learn how to upgrade custom plugins to the new installation methods.
modified_at: 2024-06-06
---

# Migrating custom plugins

If you have created custom plugins for CKEditor&nbsp;5, you will need to adjust them to make them work with the new installation methods. The migration process will be slightly different depending on whether you only want to support the new installation methods or also maintain backwards compatibility with the old installation methods.

<info-box warning>
	This migration guide assumes that you created a custom plugin using our {@link framework/development-tools/package-generator/using-package-generator package generator}. If you created your plugin in any other way, you will need to adjust the steps accordingly.
</info-box>

## Prerequisites

Before you start, follow the usual upgrade path to update your plugin to use the latest version of CKEditor&nbsp;5. This will rule out any problems that may be caused by upgrading from an outdated version of CKEditor&nbsp;5.

## Migration steps

### Create a new project using package generator

Due to the amount of minor changes in the dependencies and the build process, we recommend creating a new project using the package generator and then copy the `src`, `tests`, and `sample` folders of your plugin to the new project. This will ensure that all the dependencies are up-to-date and that the build process is correct.

See the {@link framework/development-tools/package-generator/using-package-generator Package Generator guide} for more information about how to create a new project using it.

When you run the CLI, you will be asked to choose whether you want to use JavaScript or TypeScript and whether you only want to support the new installation methods or provide backward compatibility with the old installation methods. Choose the options that best suit your needs, but be aware that the backward compatibility option will generate additional files and code that you will need to update or remove later. However, you should consider maintaining backward compatibility with the old installation methods if your plugin is used in projects that are outside your control and that may still use old installation methods, for example if your plugin is open-source.

The main changes we introduced in the new package generator are:

* making the generated package a valid ECMAScript module,
* updating the build process to generate bundle for the new installation methods,
* adding new eslint rules to help avoid common mistakes,
* updating dependencies.

### Add missing file extensions in imports

Next, add the missing file extensions in imports in all files in the `src`, `tests`, and `sample` folders. 

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

If you run the command below, the `cckeditor5-rules/require-file-extensions-in-imports` eslint rule should fix most if not all of the issues related to missing file extensions.

```bash
npm run lint -- --fix
```

### Remove imports from the `src` folders

For some time now, we highly discouraged importing data from the `src` folder of the `@ckeditor/ckeditor5-*` packages. Instead, you should import from the package roots, as they provides better TypeScript support and because the `src` folders will be removed in the future. Importing from the `src` folder of the `ckeditor5` package is still allowed (e.g. `ckeditor5/src/core`), as it's required for supporting DLL builds.

```js
// ❌
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';

// ✅
import { Plugin } from '@ckeditor/ckeditor5-core';

// ✅
import { Plugin } from 'ckeditor5/src/core.js';
```

Note that the names of the exports may differ between the `src` and the package root. In the above example, the named `Plugin` import from `@ckeditor/ckeditor5-core/src/plugin.js` is exported under the same name from `@ckeditor/ckeditor5-core` and `ckeditor5/src/core.js`, but this is not guaranteed. In cases where the name doesn't match, you must modify the import accordingly.

There may also be cases where something you imported from the `src` folder is not exported from the package root. In such cases, please create a new issue in the [CKEditor 5 repository](https://github.com/ckeditor/ckeditor5/issues/new/choose), so we can consider adding the missing export.

If you run the command below, the `ckeditor5-rules/allow-imports-only-from-main-package-entry-point` eslint rule will list all places where you need to update the imports.

```bash
npm run lint
```

### Remove imports from the `theme` folders

The same rule applies to the `theme` folder in the `@ckeditor/ckeditor5-*` packages. If you need to use icons from this folder, you can likely import from the package root.

```js
// ❌
import undo from '@ckeditor/ckeditor5-core/theme/icons/undo.svg';

console.log( undo );

// ✅
import { icons } from '@ckeditor/ckeditor5-core';

console.log( icons.undo );
```

If you run the command below, the `ckeditor5-rules/allow-imports-only-from-main-package-entry-point` eslint rule will list all places where you need to update the imports.

```bash
npm run lint
```

### Run eslint

Run the `npm run lint` command to check if there are any remaining issues that need to be fixed.

### Supporting only the new installation methods

<info-box error>
	This step is only required if you want to drop support for the old installation methods. If you want to keep supporting the old installation methods, you can skip this step.
</info-box>

If in the package generator CLI you chose to only support the new installation methods, you have to update all imports from `ckeditor5/src/*` and `@ckeditor/ckeditor5-*` to `ckeditor5`.

```diff
- import { Plugin } from 'ckeditor5/src/core.js';
- import { ButtonView } from 'ckeditor5/src/ui.js';
+ import { Plugin, ButtonView } from 'ckeditor5';
```
