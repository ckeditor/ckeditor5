---
category: setup
menu-title: Configuring features
meta-title: Configuration | CKEditor 5 documentation
meta-description: Learn how to configure CKEditor 5. 
order: 20
modified_at: 2024-05-06
---

# Configuring CKEditor&nbsp;5

## Adding features

All the features of CKEditor&nbsp;5 are implemented by plugins. You can read more about them in the {@link framework/architecture/plugins plugins} guide. To add more features and customise your builds, you {@link getting-started/setup/installing-plugins install plugins} by importing them.

Listed below is an example configuration adding the {@link features/indent block indentation} feature.

```js
import { ClassicEditor, Indent, IndentBlock, BlockQuote } from 'ckeditor5';
/* ... */

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Indent, IndentBlock, BlockQuote, /* ... */ ], // Plugins import.
	toolbar: [ 'outdent', 'indent', 'blockquote', /* ... */ ] // Toolbar configuration.
} )
.then( /* ... */ );
```

Note that some features may require more than one plugin to run. You will find the plugin-per-feature listing in the {@link framework/architecture/plugins#plugins-and-html-output Plugins and HTML output} guide.

## Configuring editor settings

When integrating an editor into your application, you can customize its features by passing a JavaScript object with configuration options to the {@link module:core/editor/editor~Editor.create `create()`} method. These settings, defined in the {@link module:core/editor/editor~Editor.create `EditorConfig`}, allow for extensive customization of the editor's functionality. Remember that customization depends on the editor setup and plugins loaded.

The available options may require loading plugins first &ndash; this is done during the setup and [Builder](https://ckeditor.com/builder?redirect=docs) is the easiest way to choose all needed features. The sample snippet below shows configuration of the toolbar, the headers feature and font family and color picker settings:

```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Font, Link, List } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
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

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options. Also, check out individual {@link features/index feature guides}, listing various configuration options available per feature.

<!-- If this section to be removed - it is linked in the following places:
features/remove-format.html
41.3.1/framework/architecture/plugins.html
getting-started/installation/react/react.html
getting-started/legacy/installation-methods/quick-start.html
getting-started/legacy/legacy-integrations/react.html
getting-started/setup/toolbar.html:
-->
## Removing features

In some cases, you may want to have different editor setups in your application, all based on the same build. For that purpose, you need to control the plugins available in the editor at runtime.

In the example below, the `Heading` plugin is removed:

```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Link, List } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
	removePlugins: [ 'Heading' ], // Remove a plugin from the setup.
	toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' , 'link' ]
} )
.catch( error => {
	console.log( error );
} );
```

You might want to delete the `Link` plugin also, as shown below:

```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Link, List } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
	removePlugins: [ 'Heading', 'Link' ], // Remove a few plugins from the setup.
	toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
} )
.catch( error => {
	console.log( error );
} );
```

However, this will result in an error thrown in the console of the browser:

```
CKEditorError: plugincollection-required {"plugin":"Link","requiredBy":"Autolink"}
Read more: https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required
```

This is a good time to remind you that some plugins in CKEditor&nbsp;5 depend on each other. In this case, the `Autolink` plugin requires the `Link` plugin to work. To make the above snippet work, the `Autolink` plugin must also be removed:

```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Autolink, Link, List } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
	removePlugins: [ 'Heading', 'Link', 'Autolink' ], // Remove a few plugins from the setup.
	toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
} )
.catch( error => {
	console.log( error );
} );
```

<info-box>
	Be careful when removing plugins from CKEditor&nbsp;5 installation using {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}. If removed plugins were providing toolbar buttons, the toolbar configuration will become invalid. In such a case, you need to provide the updated toolbar configuration as in the example above or by providing only toolbar items that need to be removed using the {@link getting-started/setup/toolbar#extended-toolbar-configuration-format `config.toolbar.removeItems`} configuration option instead.
</info-box>
