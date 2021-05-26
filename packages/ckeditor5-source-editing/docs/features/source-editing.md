---
category: features
menu-title: Source editing
modified_at: 2021-05-26
---

# Source editing

The {@link module:source-editing/sourceediting~SourceEditing} feature provides the ability for viewing and editing the source of the document. The changes made to the document source will be applied to the editor's {@link framework/guides/architecture/editing-engine data model} only, if the editor has loaded a plugin, that understands the given syntax. For example, if editor does not have a {@link features/horizontal-line horizontal line} plugin loaded, the `<hr>` tag added in the document source will be removed upon exit from the source editing mode. The source editing plugin is a low-level document editing interface, while all the buttons and dropdowns located in a editor's toolbar are the high-level one.

<info-box>
	Currently, plugin handles the source editing mode only for the {@link examples/builds/classic-editor classic editor}.
</info-box>

## Demo

Use the editor below to see the source editing plugin in action. Toggle the source editing mode, make some changes in the HTML code, and go back to see that they are present in the document content.

{@snippet features/source-editing-imports}

{@snippet features/source-editing}

The source editing plugin also works with {@link features/markdown Markdown} output.

{@snippet features/source-editing-with-markdown}

## Related features

There is other source-related CKEditor 5 feature you may want to check:

* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-source-editing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing) package:

```plaintext
npm install --save @ckeditor/ckeditor5-source-editing
```

And add it to your plugin list configuration:

```js
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SourceEditing, ... ],
		toolbar: [ 'sourceEditing', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:source-editing/sourceediting~SourceEditing} plugin registers:

* The `'sourceEditing'` UI button component.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-source-editing.
