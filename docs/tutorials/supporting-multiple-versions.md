---
category: tutorials
order: 40
menu-title: Compatibility of custom plugins
meta-title: Version compatibility of custom plugins | CKEditor 5 Documentation
meta-description: Learn how to make your CKEditor 5 plugin compatible with multiple versions of CKEditor 5.
modified_at: 2024-06-18
---

# Version compatibility of custom plugins

This guide explains how to make your custom CKEditor&nbsp;5 plugin compatible with multiple versions of CKEditor&nbsp;5. It is important to ensure that your plugin works with the latest CKEditor&nbsp;5 version, but it is also a good practice to make it compatible with older versions. This way, users who cannot upgrade to the latest version will still be able to use your plugin.

## Different builds and versions

CKEditor&nbsp;5 is available via different installation methods and versions. Fortunately, the only difference between the versions is the way the editor and its plugins are imported. All other APIs remain the same.

The currently supported installation method introduced in version 42.0.0 requires importing the editor and its open-source plugins using the `ckeditor5` package and importing the premium features using the `ckeditor5-premium-features` package. Prior to version 42.0.0, CKEditor&nbsp;5 had multiple builds that required importing the editor and its plugin using different import paths.

## Choosing the right support strategy

First, you need to decide which versions of CKEditor&nbsp;5 you want to support as it will define the imports you need to use.

You should consider supporting wide range of versions if your plugin is used in projects outside your control that may use legacy installation methods, for example if your plugin is open-source. If you are developing a plugin for a specific project, you can choose to support only the installation method you are using in that project.

However, be aware that supporting the legacy installation methods requires you to use old imports that will be deprecated in the future. You will need to update your plugin once the legacy installation methods are deprecated.

## Only supporting version 42.0.0 and later

If you want to support only the latest versions of CKEditor&nbsp;5, you can use the `ckeditor5` package to import the editor and its plugins.

If you choose this approach, you will not need to make any changes to your plugin once the old installation methods are deprecated, at the cost of not supporting versions older than 42.0.0.

```js
import { Plugin, ButtonView } from 'ckeditor5';
```

If you need to use premium features, you can import them using the `ckeditor5-premium-features` package.

```js
import { AIAssistant } from 'ckeditor5-premium-features';
```

## Supporting legacy versions

If you want to support legacy versions of CKEditor&nbsp;5, you cannot import from the `ckeditor5` and `ckeditor5-premium-features`, but use the old import paths instead. There are three rules you need to follow:

1. If you need to import code from any of the following packages, you must use the `ckeditor5/src/*` import instead of the name of the package:
	 * `@ckeditor/ckeditor5-clipboard`,
	 * `@ckeditor/ckeditor5-core`,
	 * `@ckeditor/ckeditor5-engine`,
	 * `@ckeditor/ckeditor5-enter`,
	 * `@ckeditor/ckeditor5-paragraph`,
	 * `@ckeditor/ckeditor5-select-all`,
	 * `@ckeditor/ckeditor5-typing`,
	 * `@ckeditor/ckeditor5-ui`,
	 * `@ckeditor/ckeditor5-undo`,
	 * `@ckeditor/ckeditor5-upload`,
	 * `@ckeditor/ckeditor5-utils`,
	 * `@ckeditor/ckeditor5-watchdog`,
	 * `@ckeditor/ckeditor5-widget`.

	 For example, to import the code from the `@ckeditor/ckeditor5-core` package, you need to use the `ckeditor5/src/core.js` import.

2. If you need to import code from the `@ckeditor/ckeditor5-collaboration-core` package, you must use the `ckeditor5-collaboration/src/core.js` import.

3. In all other cases, you can use the package name as the import path. You should only import from the main package entry points, not from the subfolders.

	 ```js
	 // ✅
	 import { Table } from '@ckeditor/ckeditor5-table';

	 // ❌
	 import Table from '@ckeditor/ckeditor5-table/src/table';

	 // ❌
	 import TableRowIcon from '@ckeditor/ckeditor5-table/theme/icons/table-row.svg';
	 ```

During the build process, these imports will be used as-is when generating the bundles for the legacy versions of CKEditor&nbsp;5, but will be replaced with `ckeditor5` and `ckeditor5-premium-features` in the bundles for the latest version.
