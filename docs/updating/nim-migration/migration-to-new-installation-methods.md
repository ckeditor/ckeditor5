---
category: nim-migration
order: 10
menu-title: Migrating to new installation methods
meta-title: Migrating to new installation methods | CKEditor5 documentation
meta-description: Learn how to upgrade your CKEditor5 project to the new installation methods.
modified_at: 2024-06-06
---

# Migrating to new installation methods

<info-box hint>
This guide will help you migrate your CKEditor&nbsp;5 project to the new installation methods introduced in CKEditor&nbsp;5 version 42.0.0. If you created your project after the release of CKEditor&nbsp;5 v42.0.0, you likely already use the new installation methods and can skip this guide.
</info-box>

With the introduction of the new installation methods, we have greatly simplified the process of using CKEditor&nbsp;5 in your project by reducing the number of possible installation paths and eliminating most of the limitations that were present in the old methods.

This guide will show you how to migrate your project from the old installation methods to one of the new ones. First, let's take a look at what the new editor installation looks like to better understand what has changed.

## New installation methods

We have reduced the number of possible installation methods to just two: **npm packages and browser builds**. Unlike before, both methods no longer require you to add dozens of individual packages or JavaScript bundles to get the editor up and running. Instead, you can import the editor and all our open source plugins from `ckeditor5` and the premium features from `ckeditor5-premium-feature`.

### npm packages

The new npm packages are the recommended way to install CKEditor&nbsp;5 if you use a module bundler like Vite or webpack or one of the popular JavaScript meta-frameworks.

This is how the new npm setup looks like when using the open-source and commercial features and translations:

```js
import { ClassicEditor, Essentials, Bold, Italic, Paragraph, Mention } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import coreTranslations from 'ckeditor5/translations/pl.js';
import commercialTranslations from 'ckeditor5-premium-features/translations/pl.js';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

ClassicEditor.create( document.querySelector( '#editor' ), {
  plugins: [ Essentials, Bold, Italic, Paragraph, Mention, FormatPainter, SlashCommand ],
  toolbar: { /* ... */ },
  licenseKey: '<LICENSE_KEY>',
  translations: [
    coreTranslations,
    commercialTranslations
  ]
} );
```

### Browser builds

The browser builds are a great way to use CKEditor&nbsp;5 if you do not use a module bundler. The browser builds are available as JavaScript modules and can be loaded directly in the browser using the `<script type="module">` tag.

Here is the same setup as above, but using the browser builds:

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />

<script type="importmap">
{
	"imports": {
		"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
		"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/",
		"ckeditor5-premium-features": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.js",
		"ckeditor5-premium-features/": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/"
	}
}
</script>

<script type="module">
import { ClassicEditor, Essentials, Bold, Italic, Paragraph, Mention } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import coreTranslations from 'ckeditor5/translations/pl.js';
import commercialTranslations from 'ckeditor5-premium-features/translations/pl.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Bold, Italic, Paragraph, Mention, FormatPainter, SlashCommand ],
	toolbar: { /* ... */ },
	licenseKey: '<LICENSE_KEY>',
	translations: [
		coreTranslations,
		commercialTranslations
	]
} );
</script>
```

### What's new?

There are a few things that stand out in both examples compared to the old installation methods:

1. Everything is imported from the `ckeditor5` and `ckeditor5-premium-features` packages. In the browser, this is done using [importmaps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap), which maps the package names to the build URLs.
2. CSS files are imported separately from the JavaScript files, which improves performance and allows you to more easily customize or remove the default editor styles.
3. Translations are imported as JavaScript objects and passed to the editor instance, instead of using side-effect imports (`import '...'`) that rely on the global state.

Additionally, you no longer need to maintain a CKEditor&nbsp;5-specific webpack or Vite configuration and can use CKEditor&nbsp;5 with any modern bundler or JavaScript meta-framework.

The setups we presented above are what you should aim for when migrating your project to the new installation methods.

## Migrating from the old installation methods

To migrate your project to the new installation methods, you can follow the instructions below, depending on the old installation method you are using:

* {@link updating/nim-migration/predefined-builds Migrating from predefined builds}
* {@link updating/nim-migration/customized-builds Migrating from customized builds}
* {@link updating/nim-migration/dll-builds Migrating from DLL builds}
