---
category: legacy
order: 10
meta-title: Imports in the legacy setup | Legacy CKEditor 5 documentation
modified_at: 2024-06-25
---

# Imports in the legacy setup

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users who still need to use the old methods. If you want to switch to current CKEditor&nbsp;5 installation methods, please refer to the {@link updating/nim-migration/migration-to-new-installation-methods Migrating to new installation methods} guide.
</info-box>

Starting with CKEditor&nbsp;5 v42.0.0, we introduced new installation methods. We changed the way plugins are shipped and hence the format of the import paths. This guide will help you learn how to import packages using legacy methods.

## Old vs new import methods

Before version 42.0.0, the plugins were imported from individual packages, like this:

```js
// Each individual feature has its own package.
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Code } from '@ckeditor/ckeditor5-basic-styles';
import { AIAssistant } from '@ckeditor/ckeditor5-ai';
```

Please note, that some packages contain more than one feature, like in the case of the `basic-styles` package above.

The new installation methods introduced two main packages, namely `ckeditor5` for open-source plugins, and `ckeditor5-premium-plugins` for premium features. Now, all plugins are only imported from the corresponding packages, like this:

```js
import { Autoformat, Bold, Code } from 'ckeditor5'; 		// Open-source features.
import { AIAssistant } from 'ckeditor5-premium-plugins';	// Premium features.
```

Our documentation now primarily shows the new method for simplicity. If you do not wish to {@link updating/nim-migration/migration-to-new-installation-methods migrate to new installation methods} yet, you can still use individual imports to load CKEditor&nbsp;5 plugins. Check the section below for instructions.

## Finding individual packages

If you need to find the package name in the legacy methods to import plugins from it, follow the steps below:

1. Look for the feature in our {@link features/index features section}.
2. There are two options:
    1. Via the plugins' documentation:
        1. Go to the {@link framework/architecture/plugins#plugins-and-html-output plugins and HTML output} guide.
        2. Find the plugin name there.
        3. The source file path will show you the package name.
			{@img assets/img/legacy-import-1.png Screenshot of package name in the path.}
    2. Or via the API documentation:
        1. Go to the {@link api/index API documentation}.
        2. Search for the plugin's name and navigate to its pages.
        3. On the page of the package, you will see a chip with the link to the npm repository.
			{@img assets/img/legacy-import-2.png Screenshot of npm link in the API documentation.}
        4. On any other page of this package, you will see the path, which also contains the name of the npm package.
			{@img assets/img/legacy-import-3.png Screenshot of a package name in the pack in the API documentation.}
