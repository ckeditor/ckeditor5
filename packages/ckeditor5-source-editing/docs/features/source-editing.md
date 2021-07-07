---
category: features
menu-title: Source editing
modified_at: 2021-05-28
---
# Source editing

The {@link module:source-editing/sourceediting~SourceEditing} feature provides the ability for viewing and editing the source of the document. The source editing plugin is a low-level document editing interface, while all the buttons and dropdowns located in a editor's toolbar are high-level ones.

The changes made to the document source will be applied to the editor's {@link framework/guides/architecture/editing-engine data model} only, if the editor understands (via loaded plugins) the given syntax. You will lose all changes that the editor features cannot understand. For example, if the editor does not have a {@link features/horizontal-line horizontal line} plugin loaded, the `<hr>` tag added in the document source will be removed upon exit from the source editing mode.

<info-box>
	Currently, the source editing mode is supported in the {@link examples/builds/classic-editor classic editor}. The source editing feature may not work with [CKEditor 5 collaboration features](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/collaboration.html).
</info-box>

## Demo

Use the editor below to see the source editing plugin in action. Toggle the source editing mode, make some changes in the HTML code (i.e. add new paragraphs or unordered list), and go back to see that they are present in the document content.

{@snippet features/source-editing-imports}

{@snippet features/source-editing}

The source editing plugin also works well with the {@link features/markdown Markdown output} plugin. Please remember that Markdown syntax is very simple and it does not cover all the rich-text features. Some features provided by CKEditor 5 will thus work as intended only when output to HTML as they have no Markdown equivalent.

{@snippet features/source-editing-with-markdown}

## Related features

There are other source-related CKEditor 5 features you may want to check:

* {@link features/general-html-support General HTML support} &ndash; Allows enabling a generic support for additional HTML features.
* {@link features/html-embed HTML embed} &ndash; Allows embedding an arbitrary HTML snippet in the editor.


## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-source-editing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-source-editing) package:

```bash
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
