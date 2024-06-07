---
category: setup
menu-title: Configuring the editor
meta-title: Configuring editor features and types | CKEditor 5 documentation
meta-description: Learn how to configure CKEditor 5.
order: 30
toc-limit: 1
modified_at: 2024-06-06
---

# Configuring CKEditor&nbsp;5

The editor's user interface is mostly dependent on the editor types. Functionality of the editor is provided by specialized features, accessible via a configurable toolbar or keyboard shortcuts. Some of these features are only available with certain editor types. This guide will explain the configuration of these options.

<info-box>
	All of these elements can most easily be configured with [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs).
</info-box>

## Configuring editor types

There are five available editor types (see below) available for CKEditor&nbsp;5. They offer different functional approach to editing as well as different UI solutions. Editor types are imported from the main package, the same way features are imported, as shown in the {@link getting-started/quick-start Quick start} guide.

For example, this code will import the classic editor type and some basic text formatting plugins. It also provides configuration of the {@link getting-started/setup/toolbar main editor toolbar}.

```js
import { ClassicEditor, Bold, Italic, Link } from 'ckeditor5'; // Imports.

ClassicEditor // Editor type declaration.
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bold, Italic, Link ], // Plugins import.
		toolbar: [ 'bold', 'italic', 'link' ] // Toolbar configuration.
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

You can learn more and see a more advanced code sample in the [Configuring editor setting](#configuring-editor-settings) section of this guide.

### Classic editor

Classic editor is what most users traditionally learnt to associate with a rich-text editor &ndash; a toolbar with an editing area placed in a specific position on the page, usually as a part of a form that you use to submit some content to the server.

See an {@link examples/builds/classic-editor example of the classic editor} in action.

### Inline editor

Inline editor comes with a floating toolbar that becomes visible when the editor is focused (for example, by clicking it). A common scenario for using inline editor is offering users the possibility to edit content (such as headings and other small areas) in its real location on a web page instead of doing it in a separate administration section.

See an {@link examples/builds/inline-editor example of the classic editor} in action.

### Balloon editor and balloon block editor

Balloon editor is similar to inline editor. The difference between them is that the {@link getting-started/setup/toolbar#block-toolbar toolbar appears in a balloon} next to the selection (when the selection is not empty).

See an {@link examples/builds/balloon-editor example of the classic editor} in action.

Balloon block is essentially the balloon editor with an extra block toolbar which can be accessed using the button attached to the editable content area and following the selection in the document. The toolbar gives an access to additional, block–level editing features.

See an {@link examples/builds/balloon-block-editor example of the classic editor} in action.

### Decoupled editor (document)

The document editor is focused on rich-text editing experience similar to that of large editing packages such as Google Docs or Microsoft Word. It works best for creating documents which are usually later printed or exported to PDF files.

See an {@link examples/builds/document-editor example of the classic editor} in action.

### Multi-root editor

Multi-root editor is an editor type that features multiple, separate editable areas. The main difference between using a multi-root editor and using multiple separate editors is the fact that in a multi-root editor all editable areas belong to the same editor instance share the same configuration, toolbar and the undo stack, and produce one document.

See an {@link examples/builds/multi-root-editor example of the multi-root editor} in action.

<info-box>
	At this time, the multi-root editor is not yet available via the Builder.
</info-box>

## Adding features

All the {@link features/index features of CKEditor&nbsp;5} are implemented by plugins. You add plugins by importing them from the main CKEditor&nbsp;5 package, named `ckeditor5`.

Listed below is an example configuration adding the {@link features/indent block indentation} feature.

```js
import { ClassicEditor, Indent, IndentBlock, BlockQuote } from 'ckeditor5';
/* ... */

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Indent, IndentBlock, BlockQuote, /* ... */ ], // Plugins import.
		toolbar: [ 'outdent', 'indent', 'blockquote', /* ... */ ] // Toolbar configuration.
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Note that some features may require more than one plugin to run, as shown above. This granular approach lets the integrators adjust available features to their specific needs. It is done during the setup and [Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs) is the easiest way to choose all needed features.

## Adding premium features

CKEditor&nbsp;5 premium features are imported in the same way. However, the have their own package, named `ckeditor5-premium-features`, to import from. These also {@link getting-started/setup/license-key-and-activation require a license}. Please see an example below, adding the PDF export feature and configuring it.

```js
import { ClassicEditor } from 'ckeditor5';
import { ExportPdf } from 'ckeditor5-premium-features';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
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

## Removing features

In some cases, you may want to have different editor setups in your application, all based on the same build. For that purpose, you need to control the plugins available in the editor at runtime.

In the example below, the `Heading` plugin is removed:

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

You might want to delete the `Link` plugin also, as shown below:

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

However, this will result in an error thrown in the console of the browser:

```
CKEditorError: plugincollection-required {"plugin":"Link","requiredBy":"Autolink"}
Read more: https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-plugincollection-required
```

This is a good time to remind you that some plugins in CKEditor&nbsp;5 depend on each other. In this case, the `Autolink` plugin requires the `Link` plugin to work. To make the above snippet work, the `Autolink` plugin must also be removed:

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

<info-box>
	Be careful when removing plugins from CKEditor&nbsp;5 installation using {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}. If removed plugins were providing toolbar buttons, the toolbar configuration will become invalid. In such a case, you need to provide the updated toolbar configuration as in the example above or by providing only toolbar items that need to be removed using the {@link getting-started/setup/toolbar#extended-toolbar-configuration-format `config.toolbar.removeItems`} configuration option instead.
</info-box>

## Configuring editor settings

When integrating an editor into your application, you can customize its features by passing a JavaScript object with configuration options to the {@link module:core/editor/editor~Editor.create `create()`} method. These settings, defined in the {@link module:core/editor/editor~Editor.create `EditorConfig`}, allow for extensive customization of the editor's functionality. Remember that customization depends on the editor setup and plugins loaded. The sample snippet below shows configuration of the toolbar, the headers feature and font family and color picker settings:

```js
import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Font, Link, List } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
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
