---
category: setup
menu-title: UI language
meta-title: Setting the UI language | CKEditor 5 Documentation
meta-description: Configuring and handling the language of the editor user interface and content.
order: 60
modified_at: 2024-06-25
---

# Setting the UI language

You can change the language of the editor's UI. On top of 41 fully translated languages (including [38 professional translations](#list-of-available-professional-translations)), there are many other languages covered by community translators.

## Demo

See the demo of the editor in Spanish:

{@snippet features/ui-language}

<info-box info>
	All demos in this guide only present a limited set of features for clarity. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

<info-box>
	If you are interested in creating features that can be localized, check out the {@link framework/deep-dive/localization localization guide}.
</info-box>

## Right–to–left (RTL) languages support

CKEditor&nbsp;5 supports right–to–left languages out–of–the–box. When one of <abbr title="right–to–left">RTL</abbr> languages is used, the WYSIWYG editor adapts its UI for the best editing experience, for instance, mirroring various elements like toolbars, dropdowns, buttons, etc.

### Demo

See the demo of the editor in Arabic:

{@snippet features/ui-language-rtl}

<info-box>
	If you want to change the language of the content only (different languages for the UI and the content), check out the [Setting the language of the content](#setting-the-language-of-the-content) section to learn more.
</info-box>

We are doing our best to deliver the best RTL support to our users and we constantly improve the editor. Check out the [RTL support](https://github.com/ckeditor/ckeditor5/issues/1151) issue on GitHub to learn more and stay up–to–date. Your feedback is much appreciated!

## Loading additional languages from npm or CDN

 By default, the editor will display in American English. This is the language built into the `ckeditor.js` files. To change the language of the editor UI, you need to load additional language file(s). Check out the following sections to see how to do that:

* [npm](#npm)
* [CDN](#cdn)

### npm

After installing the editor from npm, translations can be imported from `ckeditor5/translations/[lang].js` and must be passed to the editor configuration.

For example, to use Polish, import `'ckeditor5/translations/pl.js'` and pass the translation object to the editor configuration. Please note that if you use premium features, you need to separately import their translations from the proper package.

```js
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from 'ckeditor5';
import { TableOfContents } from 'ckeditor5-premium-features';

import coreTranslations from 'ckeditor5/translations/pl.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/pl.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [
			Essentials,
			Paragraph,
			Bold,
			Italic,
			TableOfContents
		],
		toolbar: {
			items: [ 'undo', 'redo', 'bold', 'italic', 'tableOfContents' ]
		},
		translations: [
			coreTranslations,
			premiumFeaturesTranslations
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

See the {@link getting-started/integrations/quick-start#installing-ckeditor-5-using-npm npm installation guide} for more information.

### CDN

Load translation scripts alongside editor scripts to use the editor with a language different than English. Note that you do not need to pass the translations to the configuration. The editor from CDN will automatically load translations from the attached scripts.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>CKEditor 5 - Quick start CDN</title>

		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css">
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css">
		<!-- Scripts with translations -->
		<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/translations/es.umd.js"></script>
		<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/translations/es.umd.js"></script>

		<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
		<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
	</head>
	<body>
		<div id="editor"></div>    

		<script>
			const { ClassicEditor, Essentials, Paragraph, Bold, Italic } = CKEDITOR;
			const { TableOfContents } = CKEDITOR_PREMIUM_FEATURES;

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					licenseKey: '<YOUR_LICENSE_KEY>',
					plugins: [
						Essentials,
						Paragraph,
						Bold,
						Italic
					],
					toolbar: {
						items: [ 'undo', 'redo', 'bold', 'italic', 'tableOfContents' ]
					}
				} )
				.then( /* ... */ )
				.catch( /* ... */ );
		</script>
	</body>
</html>
```

See the {@link getting-started/integrations-cdn/quick-start#installing-ckeditor-5-from-cdn CDN installation guide} for more information.

## Setting the language of the content

In CKEditor&nbsp;5 you can separately configure the language of the UI and the language of the content. This means you can use the English UI of the editor but type your content in Arabic or Hebrew. The language of the content has an impact on the editing experience, for instance it affects screen readers and spell checkers. It is also particularly useful for typing in certain languages (like [right–to–left](#righttoleft-rtl-languages-support) ones) because it changes the default alignment of the text.

Configure {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} to change the language of the content. In this example, the UI of the editor will be in English but the content will be in Arabic:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other con figuration options ...
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

### Demo

{@snippet features/ui-language-content}

<info-box>
	If you are unsure about the language that the content will be typed in, do not set it. The language of the content will then be inherited from the {@link module:core/editor/editorconfig~EditorConfig#language language of the UI}.

	You can also employ the {@link features/language text part language} feature to produce multi-language content.
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
			English (American)
			</td>
			<td>
			Estonian
			</td>
			<td>
			Finnish
			</td>
		</tr>
		<tr>
			<td>
			French
			</td>
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
			<td>
			Hindi
			</td>
			<td>
			Hungarian
			</td>
			<td>
			Indonesian
			</td>
			<td>
			Italian
			</td>
		</tr>
		<tr>
			<td>
			Japanese
			</td>
			<td>
			Korean
			</td>
			<td>
			Latvian
			</td>
			<td>
			Lithuanian
			</td>
		</tr>
		<tr>
			<td>
			Malay
			</td>
			<td>
			Norwegian
			</td>
			<td>
			Polish
			</td>
			<td>
			Portuguese (Brazilian)
			</td>
		</tr>
		<tr>
			<td>
			Portuguese
			</td>
			<td>
			Romanian
			</td>
			<td>
			Russian
			</td>
			<td>
			Serbian
			</td>
		</tr>
		<tr>
			<td>
			Slovak
			</td>
			<td>
			Spanish
			</td>
			<td>
			Swedish
			</td>
			<td>
			Thai
			</td>
		</tr>
		<tr>
			<td>
			Turkish
			</td>
			<td>
			Ukrainian
			</td>
			<td>
			Vietnamese
			</td>
			<td>&nbsp;</td>
		</tr>
	</tbody>
</table>

There are community translations available for Australian and British variations of English, too, as well as various others.

<info-box>
	You can help {@link framework/contributing/contributing#translating translating} CKEditor&nbsp;5 into your native language. You do not need to be a programmer to contribute to the project. Your help will be much appreciated!
</info-box>

## Related features

Other features that will help you control the content language:

* {@link features/language Text part Language}  &ndash; Set the language of the selected content part to support multilingual texts.
