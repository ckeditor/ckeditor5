---
category: nim-migration
order: 10
menu-title: Migrating to new installation methods
meta-title: Migrating to new installation methods | CKEditor5 documentation
meta-description: Learn how to upgrade your CKEditor5 project to the new installation methods.
modified_at: 2024-06-25
---

# Migrating to new installation methods

In this guide, we will explore the new installation methods introduced in CKEditor&nbsp;5 v42.0.0. These methods make CKEditor&nbsp;5 much easier to use by reducing the number of possible installation paths and removing most of the limitations of the old methods. Links to migration guides for specific installation methods can be found in the table of contents on the left <span class="navigation-hint_mobile">or under the **main menu button in the upper-left corner** on mobile </span>and at the end of this document.

Let's start by comparing the new installation methods to the old ones to better understand what has changed.

## Legacy installation methods

Prior to version 42.0.0, there were several ways to install CKEditor&nbsp;5, each with its own limitations and quirks that made it difficult or impossible to use in certain scenarios. It was also difficult for us to properly document all possible setups without making the documentation overly complex, as these setups were so different from each other.

Here is a code example showing one of the possible setups using the old installation methods:

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

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Paragraph, Mention, FormatPainter, SlashCommand ],
		toolbar: [ /* ... */ ],
		licenseKey: '<LICENSE_KEY>',

		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	} );
```

It may seem strange to show the webpack configuration in an example of the old installation methods, but it was a necessary part of the setup to handle translations, CSS, and SVG files. This setup could be even more complex if you wanted to use TypeScript.

## New installation methods

In the new installation methods we have reduced the number of possible paths to just two: **npm packages and browser builds**. Unlike before, both methods no longer require you to add dozens of individual packages or JavaScript bundles to get the editor up and running. Instead, you can import the editor and all our open source plugins from the `ckeditor5` package and the premium features from `ckeditor5-premium-features`. You also do not need to worry about a specific webpack or Vite configurations, as the new installation methods are designed to work out-of-the-box with any modern bundler or JavaScript meta-framework like Next.js.

### npm packages

The new npm packages are the recommended way to install CKEditor&nbsp;5 if you use a module bundler like Vite or webpack or one of the popular JavaScript meta-frameworks.

This is what the new npm setup looks like when using the open-source and commercial features and translations:

```js
import { ClassicEditor, Essentials, Bold, Italic, Paragraph, Mention } from 'ckeditor5';
import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';

import coreTranslations from 'ckeditor5/translations/pl.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/pl.js';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Paragraph, Mention, FormatPainter, SlashCommand ],
		toolbar: [ /* ... */ ],
		licenseKey: '<LICENSE_KEY>',
		translations: [
			coreTranslations,
			premiumFeaturesTranslations
		]
	} );
```

### Browser builds

The browser builds are a great way to use CKEditor&nbsp;5 if you do not want to build JavaScript with a module bundler. The browser builds are available as JavaScript modules and can be loaded directly in the browser using the `<script type="module">` tag.

Here is the same editor setup as above, but using the browser builds:

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
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/pl.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Paragraph, Mention, FormatPainter, SlashCommand ],
		toolbar: [ /* ... */ ],
		licenseKey: '<LICENSE_KEY>',
		translations: [
			coreTranslations,
			premiumFeaturesTranslations
		]
	} );
</script>
```

### What's new?

There are a few things that stand out in both examples compared to the old installation methods:

1. Everything is imported from the `ckeditor5` and `ckeditor5-premium-features` packages only. In the browser, this is done using [importmaps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap), which maps the package names to the build URLs.
2. CSS files are imported separately from the JavaScript files, which improves performance and allows you to more easily customize or remove the default editor styles.
3. Translations are imported as JavaScript objects and passed to the editor instance, instead of using side-effect imports (`import '...'`) that rely on the global state.
4. You no longer need to maintain a CKEditor&nbsp;5-specific webpack or Vite configuration, and can use CKEditor&nbsp;5 with any modern bundler or JavaScript meta-framework.

The setups we presented above are what you should aim for when migrating your project to the new installation methods.

### Feature comparison

Here is a visual comparison of the features available in the new npm and CDN builds and the old installation methods:

<table>
	<thead>
		<tr>
			<th rowspan="2" style="text-align: center; vertical-align: middle;">Installation methods</th>
			<th colspan="2">New methods</th>
			<th colspan="3">Legacy methods</th>
		</tr>
		<tr>
			<th>npm</th>
			<th>CDN</th>
			<th><abbr title="Predefined builds include the `@ckeditor/ckeditor5-build-*` npm packages and their CDN equivalents">Predefined</abbr></th>
			<th><abbr title="Custom builds include packages built from source and from the legacy Online Builder">Custom</abbr></th>
			<th><abbr title="DLL builds generated by webpack">DLL</abbr></th>
		</tr>
	</thead>
	<tbody style="text-align: center; vertical-align: middle;">
		<tr>
			<td>No build step</td>
			<td>❌</td>
			<td>✅</td>
			<td>✅</td>
			<td>❌</td>
			<td>✅</td>
		</tr>
		<tr>
			<td>Can be used with any modern bundler</td>
			<td>✅</td>
			<td>❌</td>
			<td>✅</td>
			<td>❌</td>
			<td>❌</td>
		</tr>
		<tr>
			<td>Allows adding plugins</td>
			<td>✅</td>
			<td>✅</td>
			<td>❌</td>
			<td>✅</td>
			<td>✅</td>
		</tr>
		<tr>
			<td>Style customization</td>
			<td>✅</td>
			<td>✅</td>
			<td>❌</td>
			<td>⚠️ <sup>[2]</sup></td>
			<td>❌</td>
		</tr>
		<tr>
			<td>Icon customization</td>
			<td>⚠️ <sup>[1]</sup></td>
			<td>⚠️ <sup>[1]</sup></td>
			<td>❌</td>
			<td>✅</td>
			<td>❌</td>
		</tr>
		<tr>
			<td>Does not rely on global state</td>
			<td>✅</td>
			<td>✅</td>
			<td>❌</td>
			<td>❌</td>
			<td>❌</td>
		</tr>
		<tr>
			<td>Provides editor- and content-only style sheets</td>
			<td>✅</td>
			<td>✅</td>
			<td>❌</td>
			<td>❌</td>
			<td>❌</td>
		</tr>
		<tr>
			<td>Style sheets separate from JavaScript</td>
			<td>✅</td>
			<td>✅</td>
			<td>❌</td>
			<td>⚠️<sup>[3]</sup></td>
			<td>❌</td>
		</tr>
		<tr>
			<td>Can be optimized to reduce bundle size</td>
			<td>✅</td>
			<td>❌</td>
			<td>❌</td>
			<td>✅</td>
			<td>✅</td>
		</tr>
	</tbody>
</table>

\[1\] Support for customizing icons is planned for future releases. See this [GitHub issue](https://github.com/ckeditor/ckeditor5/issues/16546) for more information.
\[2\] Style customization is partially supported via webpack configuration.
\[3\] CSS can be separated from JavaScript using custom webpack configuration.

## Sunset of old installation methods and deprecation timelines

With the release of version 42.0.0, we have decided to deprecate the older methods of setting up CKEditor&nbsp;5. The new experience introduced in v42.0.0 is far superior.

However, we understand that migrating to a new setup, even if easy, requires planning and work allocation. We would rather not block anyone from receiving bug fixes and improvements due to a deprecated update path. Therefore, we will support all existing methods according to the timelines given below.

### Deprecation of the predefined builds and custom builds

The setup methods, which were “webpack-first” or provided predefined editors without the possibility of extending them will be supported until **the end of Q1 (March), 2025**.

What we will sunset on this date:

1. The documentation for the predefined builds, superbuild, and custom builds will be removed.
2. No more new versions of predefined builds packages will be published to npm.
3. New versions of npm packages published after this date will not have the `src` directory. It will not be possible to import files from those destinations, as `dist` will become the main folder.
4. Deprecation of `@ckeditor/ckeditor5-dev-translations` package, as it will not be needed anymore.
5. We will update our environment to target ES2022 (or newer), thus dropping the support for webpack 4.

### Deprecation of DLLs

This is an advanced setup method that we provided, that was used to dynamically create the editor and its configuration on the browser side. As this is now provided out-of-the-box with our browser builds, this method will also be deprecated. As DLLs are used in complex CMSes, this deprecation timeline is significantly longer.

The DLLs will be supported until **the end of 2025**.

What we will sunset on this date:

1. The documentation for DLLs will be removed.
2. New versions of npm packages published after this date will not have `build` directory. It will not be possible to import files from those destinations.

<info-box>
	If any of the above worries you, reach out to our support or inform us via the [GitHub issue tracker](https://github.com/ckeditor/ckeditor5/issues/new?assignees=&labels=type:question&projects=&template=8-question.md&title=). We are open to discussing the timelines or potential cases that you would need us to support.
</info-box>


## Migrating from the old installation methods

To migrate your project to the new installation methods, you can follow the instructions below.

First, if you maintain any CKEditor&nbsp;5 custom plugins as separate packages, whether in a monorepo setup or published to npm, you need to migrate them:

* {@link updating/nim-migration/custom-plugins Migrating custom plugins}.

Second, proceed with migrating your project, depending on the old installation method you are using.

* {@link updating/nim-migration/predefined-builds Migrating from predefined builds}.
* {@link updating/nim-migration/customized-builds Migrating from customized builds}.
* {@link updating/nim-migration/dll-builds Migrating from DLL builds}.

Finally, if you use our React, Vue or Angular integrations, you also need to update them:

* Update the `@ckeditor/ckeditor5-react` package to version `^8.0.0`. Please refer to the [package's changelog](https://github.com/ckeditor/ckeditor5-react/blob/master/CHANGELOG.md), because of the minor breaking change introduced in this version.
* Update the `@ckeditor/ckeditor5-vue` package to version `^6.0.0`.
* Update the `@ckeditor/ckeditor5-angular` package to version `^8.0.0`.

If you encounter any issues during the migration process, please refer to this [GitHub issue containing common errors](https://github.com/ckeditor/ckeditor5/issues/16511). If your issue is not listed there, feel free to open a new issue in our [GitHub repository](https://github.com/ckeditor/ckeditor5/issues/new/choose).

<style>
	table tbody td sup {
		top: -0.5em;
		position: relative;
		font-size: 75%;
		line-height: 0;
		vertical-align: baseline;
	}
</style>

