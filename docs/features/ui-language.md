---
category: features
menu-title: UI language
---

{@snippet features/build-ui-language-source}

# Setting the UI language

You can change the language of the editor's UI. On top of 41 fully translated languages (including [38 professional translations](#list-of-available-professional-translations)), there are many other languages covered by community translators.

## Demo

See the demo of the editor in Spanish:

{@snippet features/ui-language}

<info-box info>
	All demos in this guide only present a limited set of features for clarity. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

<info-box>
	If you are interested in creating features that can be localized, check out the {@link framework/deep-dive/localization localization guide}.
</info-box>

## Right–to–left (RTL) languages support

CKEditor 5 supports right–to–left languages out–of–the–box. When one of <abbr title="right–to–left">RTL</abbr> languages is used, the WYSIWYG editor adapts its UI for the best editing experience, for instance, mirroring various elements like toolbars, dropdowns, buttons, etc.

### Demo

See the demo of the editor in Arabic:

{@snippet features/ui-language-rtl}

<info-box>
	If you want to change the language of the content only (different languages for the UI and the content), check out the [Setting the language of the content](#setting-the-language-of-the-content) section to learn more.
</info-box>

We are doing our best to deliver the best RTL support to our users and we constantly improve the editor. Check out the [RTL support](https://github.com/ckeditor/ckeditor5/issues/1151) issue on GitHub to learn more and stay up–to–date. Your feedback is much appreciated!

## Loading additional languages from CDN, npm, and a zip file

 By default, the editor will display in English. This is the language built into the `ckeditor.js` files. In order to change the language of the editor UI, you need to load additional language file(s). Check out the following sections to see how to do that:

* [CDN](#cdn),
* [npm](#npm),
* [Zip download](#zip).

Next, you can configure the editor to use the chosen language:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// The language code is defined in the https://en.wikipedia.org/wiki/ISO_639-1 standard.
		language: 'es'
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

### CDN

To use a different language than the default one (English), you need to load the editor together with the preferred language:

```html
<script src="https://cdn.ckeditor.com/ckeditor5/[version.number]/[distribution]/ckeditor.js"></script>
<script src="https://cdn.ckeditor.com/ckeditor5/[version.number]/[distribution]/translations/[lang].js"></script>
```

For example:

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/translations/de.js"></script>
```

See the {@link installation/getting-started/predefined-builds#cdn CDN installation guide} for more information.

### npm

After installing the build from npm, languages will be available in `node_modules/@ckeditor/ckeditor5-build-[name]/build/translations/[lang].js`.

A single language can be loaded directly to your code by importing e.g. `'@ckeditor/ckeditor5-build-classic/build/translations/de.js'`.

See the {@link installation/getting-started/predefined-builds#npm npm installation guide} for more information.

### Zip

All additional languages are included in the `.zip` file. You need to include the `ckeditor.js` file together with the chosen language file:

```html
<script src="[ckeditor-path]/ckeditor.js"></script>
<script src="[ckeditor-path]/translations/de.js"></script>
```

See the {@link installation/getting-started/predefined-builds#zip-download zip installation guide} for more information.

## Building the editor using a specific language

Currently, it is possible to change the UI language at the build stage and after the build. A single build of the editor supports the language which was defined in the [CKEditor 5 translations plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations)'s configuration. Check the whole translation process to see how you can change the language later.

If you use one of the {@link installation/index predefined editor builds}, refer to {@link installation/getting-started/quick-start-other#building-the-editor-from-source Creating custom builds} to learn how to change the language of your build.

If you build CKEditor 5 from scratch or integrate it directly into your application, then all you need to do is to:

1. Install the [`@ckeditor/ckeditor5-dev-translations`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations) package:

	```
	npm install --save @ckeditor/ckeditor5-dev-translations
	```

2. Add it to your webpack configuration:

	Note: The language code is defined in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) standard.

	```js
	const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );

	module.exports = {
		// Define webpack plugins.
		// ...
		
		plugins: [
			new CKEditorTranslationsPlugin( {
				// The main language that will be built into the main bundle.
				language: 'en',

				// Additional languages that will be emitted to the `outputDirectory`.
				// This option can be set to an array of language codes or `'all'` to build all found languages.
				// The bundle is optimized for one language when this option is omitted.
				additionalLanguages: 'all',

				// For more advanced options see https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-translations.
			} ),

			// Other webpack plugins.
			// ...
		]

		// Remaining webpack configuration.
		// ...
	}
	```

3. Run webpack. The CKEditor 5 plugin for webpack will emit additional files for each language specified in the `additionalLanguages` option. They will contain translations for messages from the {@link module:utils/locale~Locale#t `t()` function} calls. The files will be created in the `translations` directory (or another one if the `outputDirectory` option is specified). Translations from the language specified in the `language` option will be automatically included in the build.

4. If you want to change the language after the build ends, you will need to edit the `index.html` file, add the translation file, and set the UI language to the target one.

	```html
	<script src="../build/ckeditor.js"></script>
	<script src="../build/translations/de.js"></script>
	<script>
		ClassicEditor
			.create( document.querySelector( '#editor' ), {
				language: 'de'
			} )
			.then( editor => {
				window.editor = editor;
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	</script>
	```

<info-box>
	We are aware that the current localization method is not sufficient for some needs. It does not support different bundlers (e.g. Rollup or Browserify). We will be extending the localization possibilities in the future.
</info-box>

## Setting the language of the content

In CKEditor 5 you can separately configure the language of the UI and the language of the content. This means you can use the English UI of the editor but type your content in Arabic or Hebrew. The language of the content has an impact on the editing experience, for instance it affects screen readers and spell checkers. It is also particularly useful for typing in certain languages (e.g. [right–to–left](#righttoleft-rtl-languages-support) ones) because it changes the default alignment of the text.

Configure {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} to change the language of the content. In this example, the UI of the editor will be English but the content will be Arabic:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		language: {
			// The UI will be English.
			ui: 'en',

			// But the content will be edited in Arabic.
			content: 'ar'
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

{@snippet features/ui-language-content}

<info-box>
	If you are unsure about the language that the content will be typed in, do not set it. The language of the content will then be inherited from the {@link module:core/editor/editorconfig~EditorConfig#language language of the UI}.
</info-box>

## List of available professional translations

<style>
	td {
		text-align: center;
		vertical-align: middle;
	}
	table {
		table-layout: fixed;
	}
</style>
<table>
	<tbody>
		<tr>
			<td>
			Arabic
			</td>
			<td>
			Bengali
			</td>
			<td>
			Bulgarian
			</td>
			<td>
			Catalan
			</td>
		</tr>
		<tr>
			<td>
			Chinese (China)
			</td>
			<td>
			Chinese (Taiwan)
			</td>
			<td>
			Czech
			</td>
			<td>
			Danish
			</td>
		</tr>
		<tr>
			<td>
			Dutch
			</td>
			<td>
			English
			</td>
			<td>
			Estonian
			</td>
			<td>
			Finnish
			</td>
		</tr>
		<tr>
			<td>French</td>
			<td>
			German
			</td>
			<td>
			Greek
			</td>
			<td>
			Hebrew
			</td>
		</tr>
		<tr>
			<td>Hindi</td>
			<td>
			Indonesian
			</td>
			<td>
			Italian
			</td>
			<td>
			Japanese
			</td>
		</tr>
		<tr>
			<td>
			Korean
			</td>
			<td>
			Latvian
			</td>
			<td>
			Lithuanian
			</td>
			<td>
			Malay
			</td>
		</tr>
		<tr>
			<td>
			Norwegian
			</td>
			<td>
			Polish
			</td>
			<td>
			Portuguese (Brazilian)
			</td>
			<td>
			Portuguese
			</td>
		</tr>
		<tr>
			<td>
			Romanian
			</td>
			<td>
			Russian
			</td>
			<td>
			Serbian
			</td>
			<td>
			Slovak
			</td>
		</tr>
		<tr>
			<td>
			Spanish
			</td>
			<td>
			Swedish
			</td>
			<td>
			Thai
			</td>
			<td>
			Turkish
			</td>
		</tr>
		<tr>
			<td>
			Ukrainian
			</td>
			<td>
			Vietnamese
			</td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
	</tbody>
</table>

<info-box>
	If you want to help translate CKEditor 5 into your native language, join the [CKEditor 5 project on Transifex](https://www.transifex.com/ckeditor/ckeditor5/). Your help will be much appreciated!
</info-box>

## Related features

CKEditor 5 has other features that will help you control the content language:

* {@link features/language Text part Language}  &ndash; Set the language of the selected content part to support multilingual texts.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-translations](https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-translations).
