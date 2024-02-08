---
# Scope:
# * Introduction to setting configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

category: setup
menu-title: Configuration
meta-title: Configuration | CKEditor 5 documentation
order: 10
modified_at: 2024-02-08
---

# CKEditor&nbsp;5 configuration options

## Configuring various editor settings

When creating an editor on your page, it is possible to set up {@link module:core/editor/editorconfig~EditorConfig configuration options} that change many of its aspects. The configuration is set by a simple JavaScript object passed to the `create()` method.

The sample snippet below shows configuration of the toolbar, the headers feature and font color picker setting:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
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

The available options may require loading plugins first &ndash; this is done during the setup and Builder is the easiest way to choose all needed features.

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options. Also, check out individual {@link features/index feature guides}, listing various configuration options available per feature.

## Editor toolbars

{@img assets/img/full-toolbar.png 938 Sample CKEditor&nbsp;5 toolbar.} 

CKEditor&nbsp;5 comes with a flexible, fully configurable toolbar which lets the integrators set the UI buttons for various features. A simple, basic setup is shown in the snippet above. However, the toolbar configuration can get really advanced, and for the best UX, there are two of these: the {@link getting-started/setup/toolbar editor toolbar} and the {@link features/blocktoolbar block toolbar}. Some features also sport their own dedicated toolbars, like the {@link features/images-overview#image-contextual-toolbar image toolbar} or the {@link features/tables#toolbars table toolbars}. You will find all information about the latter ones in the {@link features/index respective feature guides}.

## Managing editor features

### Adding features

All the features of CKEditor 5 all implemented by plugins. You can read more about them in the {@link framework/plugins/plugins plugins} guide. To add more features you can {@link framework/plugins/installing-plugins install plugins} to customise your builds. Listed below is an example configuration adding the {@link features/indent block indentation} feature. Note that some features may require more than one plugin to run. You will find the plugin-per-feature listing in the {@link framework/plugins/features-html-output-overview Plugins and HTML output} guide.


```js
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Indent, IndentBlock, /* ... */ ], // plugins import
		toolbar: [ 'outdent', 'indent', /* ... */ ] // toolbar items configuration
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Removing features

In some cases, you may want to have different editor setups in your application, all based on the same build. For that purpose, you need to control the plugins available in the editor at runtime.

In the example below, the `Heading` plugin is removed:

```js
// Remove a plugin from the default setup.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading' ],
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' , 'link' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

You might want to delete the `Link` plugin also, as shown below:

```js
// Remove a few plugins from the default setup.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading', 'Link' ],
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

However, using this snippet with the official classic build of CKEditor 5 will result in an error thrown in the console of the browser:

```
CKEditorError: plugincollection-required {"plugin":"Link","requiredBy":"CKFinder"}`
Read more: [https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required](https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required)
```
This is a good time to remind you that some plugins in CKEditor 5 depend on each other. In this case, the `CKFinder` plugin requires the `Link` plugin to work. To make the above snippet work, the `CKFinder` plugin must also be deleted:

```js
// Remove a few plugins from the default setup.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Heading', 'Link', 'CKFinder' ],
		toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.catch( error => {
		console.log( error );
	} );
```

<info-box>
	Be careful when removing plugins from CKEditor builds using {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}. If removed plugins were providing toolbar buttons, the toolbar configuration included in a build will become invalid. In such a case, you need to provide the {@link getting-started/setup/toolbar updated toolbar configuration} as in the example above or by providing only toolbar items that need to be removed using `config.toolbar.removeItems`.
</info-box>
