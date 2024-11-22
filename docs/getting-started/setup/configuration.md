---
category: setup
menu-title: Configuring features
meta-title: Configuring editor features | CKEditor 5 Documentation
meta-description: Learn how to configure CKEditor 5 features.
order: 30
modified_at: 2024-06-25
---

# Configuring CKEditor&nbsp;5 features

The functionality of CKEditor&nbsp;5 is provided by specialized features, accessible via a configurable toolbar or keyboard shortcuts. Some of these features are only available with certain {@link getting-started/setup/editor-types editor types}.

<info-box>
	The best tool for experimenting with different features is [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs). You can test various possibilities and setups.

	Additionally, almost all features offer multiple configuration options and APIs. For detailed information, consult the {@link features/index feature pages}.
</info-box>

## Adding features

All the {@link features/index features of CKEditor&nbsp;5} are implemented by plugins. You add plugins by importing them from the main CKEditor&nbsp;5 package, named `ckeditor5`.

Listed below is an example configuration adding the {@link features/indent block indentation} feature.

<code-switcher>
```js
import { ClassicEditor, Indent, IndentBlock, BlockQuote } from 'ckeditor5';
/* ... */

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Indent, IndentBlock, BlockQuote, /* ... */ ], // Plugins import.
		toolbar: [ 'outdent', 'indent', 'blockquote', /* ... */ ] // Toolbar configuration.
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

Note that some features may require more than one plugin to run, as shown above. This granular approach lets the integrators adjust available features to their specific needs. It is done during the setup and [Builder](https://ckeditor.com/ckeditor-5/builder/?redirect=docs) is the easiest way to choose all needed features.

### Adding premium features

CKEditor&nbsp;5 premium features are imported in the same way. However, they have their own package, named `ckeditor5-premium-features`, to import from. These also {@link getting-started/licensing/license-key-and-activation require a license}. Please see an example below, adding the PDF export feature and configuring it.

<code-switcher>
```js
import { ClassicEditor } from 'ckeditor5';
import { ExportPdf } from 'ckeditor5-premium-features';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ ExportPdf, /* ... */ ],
		toolbar: [ 'exportPdf', '|', /* ... */ ],
		exportPdf: {
			tokenUrl: 'https://example.com/cs-token-endpoint',
			stylesheets: [
				'./path/to/fonts.css',
				'EDITOR_STYLES',
				'./path/to/style.css'
			],
			fileName: 'my-file.pdf',
			converterOptions: {
				format: 'A4',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '12mm',
				margin_left: '12mm',
				page_orientation: 'portrait'
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuring editor settings

When integrating an editor into your application, you can customize its features by passing a JavaScript object with configuration options to the {@link module:core/editor/editor~Editor.create `create()`} method. These settings, defined in the {@link module:core/editor/editor~Editor.create `EditorConfig`}, allow for extensive customization of the editor's functionality. Remember that customization depends on the editor setup and plugins loaded. The sample snippet below shows the configuration of the toolbar, the headings feature, font family, and color picker settings:

<code-switcher>
```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Font, Link, List } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'fontSize',
			'fontFamily',
			'fontColor',
			'|',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote'
			],
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		},
		fontFamily: {
			options: [
				'default',
				'Ubuntu, Arial, sans-serif',
				'Ubuntu Mono, Courier New, Courier, monospace'
			]
		},
		fontColor: {
			colorPicker: {
				// Use 'hex' format for output instead of 'hsl'.
				format: 'hex'
			}
		},
	} )
	.catch( error => {
		console.log( error );
	} );
```
</code-switcher>

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options. Also, check out individual {@link features/index feature guides}, listing various configuration options available per feature.

### Why does the editor filter out content such as styles, classes or HTML elements?

CKEditor&nbsp;5 implements a custom {@link framework/architecture/editing-engine data model}. This means that the editor needs to convert every piece of loaded content to that model and then render it back to the view.

Each kind of content must be handled by a plugin. For example, the [`ckeditor5-basic-styles`](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles) package handles HTML elements such as `<b>`, `<i>`, `<u>`, etc. along with their representation in the model. The feature defines the two–way conversion between the HTML (view) and the editor model.

If you try to load some content unknown to the editor &ndash; without a feature loaded to handle it &ndash; the editor will drop it.

If you want the editor to handle the HTML5 elements not covered by available feature plugins, you need to write plugins to support them. You can also use the {@link features/general-html-support General HTML Support (GHS)} feature. Once you do that, CKEditor&nbsp;5 will not filter anything out. However, GHS needs to be carefully and precisely configured to ensure stability and security of the implementation.

## Removing features

In some cases, you may want to have different editor setups in your application, all based on the same build. For that purpose, you need to control the plugins available in the editor at runtime.

In the example below, the `Heading` plugin is removed:

<code-switcher>
```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Link, List } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading' ], // Remove a plugin from the setup.
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' , 'link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```
</code-switcher>

You might want to delete the `Link` plugin also, as shown below:

<code-switcher>
```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Link, List } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading', 'Link' ], // Remove a few plugins from the setup.
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```
</code-switcher>

However, this will result in an error thrown in the console of the browser:

```plain
CKEditorError: plugincollection-required {"plugin":"Link","requiredBy":"Autolink"}
Read more: https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required
```

This is a good time to remind you that some plugins in CKEditor&nbsp;5 depend on each other. In this case, the `Autolink` plugin requires the `Link` plugin to work. To make the above snippet work, the `Autolink` plugin must also be removed:

<code-switcher>
```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Autolink, Link, List } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading', 'Link', 'Autolink' ], // Remove a few plugins from the setup.
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```
</code-switcher>

<info-box>
	Be careful when removing plugins from CKEditor&nbsp;5 installation using {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}. If removed plugins were providing toolbar buttons, the toolbar configuration will become invalid. In such a case, you need to provide the updated toolbar configuration as in the example above or by providing only toolbar items that need to be removed using the {@link getting-started/setup/toolbar#extended-toolbar-configuration-format `config.toolbar.removeItems`} configuration option instead.
</info-box>
