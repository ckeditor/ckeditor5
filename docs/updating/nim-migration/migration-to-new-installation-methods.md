---
category: nim-migration
order: 10
menu-title: Migrating to new installation methods
meta-title: Migrating to new installation methods | CKEditor5 documentation
meta-description: Learn how to upgrade your CKEditor5 project to the new installation methods.
modified_at: 2024-06-06
---

# Migrating to new installation methods

In this guide, we will explore the new installation methods introduced in CKEditor&nbsp;5 v42.0.0. These methods make CKEditor&nbsp;5 much easier to use by reducing the number of possible installation paths and removing most of the limitations of the old methods. Links to migration guides for specific installation methods can be found at the end of this document.

Let's start by comparing the new installation methods to the old ones to better understand what has changed.

## Legacy installation methods

Prior to version 42.0.0, there were several ways to install CKEditor&nbsp;5, each with its own limitations and quirks that made it difficult or impossible to use in certain scenarios. It was also difficult for us to properly document all possible setups without making the documentation overly complex, as these setups were so different from each other.

Here is the code example showing one of the possible setups using the old installation methods.

```js
// webpack.config.js
const path = require( 'path' );
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},
	plugins: [
		new CKEditorTranslationsPlugin( {
			language: 'en'
		} )
	],
	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			}
		]
	}
};
```

```js
// src/index.js
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { FormatPainter } from '@ckeditor/ckeditor5-format-painter';
import { SlashCommand } from '@ckeditor/ckeditor5-slash-command';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Bold, Italic, Paragraph, Mention, FormatPainter, SlashCommand ],
	toolbar: { /* ... */ },
	licenseKey: '<LICENSE_KEY>',

	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
} );
```

It may seem unfair to show the webpack configuration in an example of the old installation methods, but for many it was a necessary part of the setup to handle translations, CSS, and SVG files. This setup could be even more complex if you wanted to use TypeScript.

## New installation methods

In the new installation methods we have reduced the number of possible paths to just two: **npm packages and browser builds**. Unlike before, both methods no longer require you to add dozens of individual packages or JavaScript bundles to get the editor up and running. Instead, you can import the editor and all our open source plugins from `ckeditor5` and the premium features from `ckeditor5-premium-feature`. You also don't need to worry about webpack or Vite configurations, as the new installation methods are designed to work out-of-the-box with any modern bundler or JavaScript meta-framework.

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
4. You no longer need to maintain a CKEditor&nbsp;5-specific webpack or Vite configuration and can use CKEditor&nbsp;5 with any modern bundler or JavaScript meta-framework.

The setups we presented above are what you should aim for when migrating your project to the new installation methods.

### Feature comparison

Here's a visual comparison of the features available in the new and old installation methods:

| Feature                                       | npm build | CDN build | Predefined builds | Custom build | DLL builds |
|-----------------------------------------------|-----------|-----------|-------------------|--------------|------------|
| No build step                                 | 🟥        | 🟩        | 🟩                | 🟥           | 🟩         |
| Works with any bundler or metaframework       | 🟩        | 🟥        | 🟥                | 🟥           | 🟥         |
| Plugin customization                          | 🟩        | 🟩        | 🟥                | 🟩           | 🟩         |
| Style customization                           | 🟩        | 🟩        | 🟥                | 🟨           | 🟥         |
| Icon customization                            | 🟥 \[1\]  | 🟥 \[1\]  | 🟥                | 🟩           | 🟥         |
| Doesn't rely on global state                  | 🟩        | 🟩        | 🟥                | 🟥           | 🟥         |
| Provides editor- and content-only stylesheets | 🟩        | 🟩        | 🟥                | 🟥           | 🟥         |
| CSS separate from JavaScript                  | 🟩        | 🟩        | 🟥                | 🟨           | 🟥         |
| Can be optimized to reduce bundle size        | 🟩        | 🟥        | 🟥                | 🟩           | 🟩         |

1. Support for customizing icons is planned for future releases. See this [GitHub issue](https://github.com/ckeditor/ckeditor5/issues/16546) for more information.

## Sunset of old installation methods and deprecation timelines

//TODO

## Migrating from the old installation methods

To migrate your project to the new installation methods, you can follow the instructions below.

If you maintain custom plugins for CKEditor 5, you need to update them first.

* {@link updating/nim-migration/custom-plugins Migrating custom plugins}

After you have updated your custom plugins, you can proceed with migrating your project, depending on the old installation method you are using.

* {@link updating/nim-migration/predefined-builds Migrating from predefined builds}
* {@link updating/nim-migration/customized-builds Migrating from customized builds}
* {@link updating/nim-migration/dll-builds Migrating from DLL builds}

If you encounter any issues during the migration process, please refer to this [GitHub issue containing common errors](https://github.com/ckeditor/ckeditor5/issues/16511). If your issue is not listed there, feel free to open a new issue in our [GitHub repository](https://github.com/ckeditor/ckeditor5).
