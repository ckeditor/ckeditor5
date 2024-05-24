---
category: nim-migration
order: 10
menu-title: Migrating to new installation methods
meta-title: Migration guide to the new installation methods
meta-description: Learn how to upgrade your CKEditor 5 project to the new installation methods.
---

# Migrating to new installation methods

<info-box hint>
This guide will help you migrate your CKEditor 5 project to the new installation methods introduced in CKEditor 5 version 42.0.0. If you created your CKEditor 5 project after the release of CKEditor 5 v42.0.0, you are likely already using the new installation methods and you can skip this guide.
</info-box>

With the introduction of the new installation methods of CKEditor 5 we greatly simplified the process of adding CKEditor 5 to your project by reducing the number of possible installation methods and eliminating most of the limitations that were present in the old methods.

This guide will show how to migrate your project from every old installation method to the new ones, but first, let's take a look how the editor installation process looks after the changes, to better understand what changed.

## New installation methods

There are two new installation methods available: **npm packages and browser builds**. Unlike before, in both methods you no longer need to add dozens of individual packages or JavaScript bundles to get the editor working. Instead, you can add `ckeditor5` package to get the editor and all of our open-source plugins and the `ckeditor5-premium-feature` package to get the features from our commercial offering.

### npm packages

The new npm packages are the recommended way to install CKEditor 5 if you are using a module bundler like Vite or webpack or any of the well known JavaScript meta-frameworks.

This is how the we can use the new npm packages to install CKEditor 5 with few plugins and features:

```js
import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import coreTranslations from 'ckeditor5/translations/pl.js';
import commercialTranslations from 'ckeditor5-premium-features/translations/pl.js';

import 'ckeditor5/index.css';
import 'ckeditor5-premium-features/index.css';

ClassicEditor.create( document.querySelector( '#editor' ), {
  plugins: [ Essentials, Bold, Italic, Paragraph, FormatPainter, SlashCommand ],
  toolbar: { /* ... */ },
  licenseKey: 'your-license-key',
  translations: [
    coreTranslations,
    commercialTranslations
  ]
} );
```

### Browser builds

The browser builds are a great way to use CKEditor 5 if you are not using a module bundler. The browser builds are available as ES6 modules and can be loaded directly in the browser using the `<script type="module">` tag.

Here's the same setup as above, but using the browser builds:

```html
<link rel="stylesheet" href="<CDN_LINK>/ckeditor5/dist/styles.css">
<link rel="stylesheet" href="<CDN_LINK>/ckeditor5-premium-features/dist/styles.css">

<script type="importmap">
{
  "imports": {
    "ckeditor5": "<CDN_LINK>/ckeditor5/dist/index.min.js",
		"ckeditor5/": "<CDN_LINK>/ckeditor5/dist/",
		"ckeditor5-premium-features": "<CDN_LINK>/ckeditor5-premium-features/dist/browser/index.js",
		"ckeditor5-premium-features/": "<CDN_LINK>/ckeditor5-premium-features/dist/"
  }
}
</script>

<script type="module">
import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import coreTranslations from 'ckeditor5/translations/pl.js';
import commercialTranslations from 'ckeditor5-premium-features/translations/pl.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Bold, Italic, Paragraph, FormatPainter, SlashCommand ],
	toolbar: { /* ... */ },
	licenseKey: 'your-license-key',
	translations: [
		coreTranslations,
		commercialTranslations
	]
} );
</script>
```

### What's new?

There are few things that stand out in both examples compared to the old installation methods:

1. Everything is imported from the `ckeditor5` and `ckeditor5-premium-features` packages. In the browser build this is achieved using [importmaps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) that map the package names to the build URLs.
2. CSS files are imported separately from the JavaScript files, which improves performance and allows you to more easily customize or remove the default editor styles.
3. The translations are imported as JavaScript objects and passed to the editor instance, instead of using side-effect imports (`import '...'`) that rely on the global state.

This is the setup that you should aim for when migrating your project to the new installation methods.

## Migrating from the old installation methods

...
