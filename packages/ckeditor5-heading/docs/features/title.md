---
category: features
menu-title: Document title
---

# Document title

The {@link module:heading/title~Title} feature enables support for adding the title field to your document. It helps ensure that there will always be a single title field at the beginning of your document.

## Demo

{@snippet features/title}

## Keyboard navigation

The title plugin lets you move from the title to the body element using the <kbd>Tab</kbd> key, providing form-like experience. When the selection is at the beginning of the first body element, you can go back to the title element using <kbd>Shift</kbd>+<kbd>Tab</kbd>. You can also use <kbd>Enter</kbd> and <kbd>Backspace</kbd> keys to move the caret between the title and the body.

## Placeholder integration

The title plugin is integrated with the {@link features/editor-placeholder placeholder} configuration. If you define it, the placeholder text will be used for the body element.

At the moment the placeholder of the title section is hardcoded. If you would like it to be configurable, add 👍 to the [relevant issue on GitHub](https://github.com/ckeditor/ckeditor5/issues/2020).

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-heading`](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading) package:

```bash
npm install --save @ckeditor/ckeditor5-heading
```

Then add the `Title` plugin to your plugin list:

```js
import Title from '@ckeditor/ckeditor5-heading/src/title';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Title, ... ]
    } )
    .then( ... )
    .catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## HTML structure

When you call {@link module:core/editor/utils/dataapimixin~DataApi#function-getData `editor.getData()`}, the document title will be represented as the following HTML:

```html
<h1>Feasibility Study</h1>
```

### Model representation

In the CKEditor 5 data model the document title is represented as follows:

```html
<title>
	<title-content>
		Feasibility Study
	</title-content>
</title>
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-heading.
