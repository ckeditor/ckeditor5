---
category: features
---

# Lists

The {@link module:list/list~List} feature allows creating ordered and unordered lists in the editor.

<info-box info>
	The feature is enabled by default in all CKEditor 5 WYSIWYG editor builds.
</info-box>

{@snippet features/lists-source}

## Ordered and unordered lists

Use the editor below to see the list feature plugin in action.

### Demo

{@snippet features/lists-basic}

## List styles

The {@link module:list/liststyle~ListStyle list styles} feature allows customizing the list's marker. 

### Demo

Use the editor below to see the list styles feature plugin in action.

{@snippet features/lists-style}

### Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package:

```bash
npm install --save @ckeditor/ckeditor5-list
```

Then add the `ListStyle` plugin to your plugin list and the toolbar configuration:

```js
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ListStyle, ... ],
		toolbar: [ 'bulletedList', 'numberedList', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

<info-box warning>
	The {@link module:list/liststyle~ListStyle} feature overrides implementations from the {@link module:list/listui~ListUI} because they share the same names.
</info-box>

## To-do list

You can read more about the feature in the {@link features/todo-lists To-do lists} feature guide.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list.
