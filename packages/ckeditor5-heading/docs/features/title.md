---
category: features
menu-title: Document title
---

# Document title

The {@link module:heading/title~Title} feature enables support for adding the title field to your document. It helps ensure that there will always be a single title field at the beginning of the document.

This feature can be used to implement a rich-text editor with a clear division of content into the title and body sections, similar to solutions available in Medium, Grammarly, Slack post editor or some content management systems.

## Demo

Use the editor to create a document with clearly separated title and body sections. You can check the content of the title and body elements in the console below.

{@snippet features/title}

## Related features

There are more CKEditor 5 features that can help you structure your document better:
* {@link features/headings Headings} &ndash; Divide your content into sections.
* {@link features/indent Block indentation} &ndash; Organize your content into visually separated blocks, indent crucial paragraphs, etc.
* {@link features/editor-placeholder Editor placeholder} &ndash; Set placeholder text to display when the content is empty. It helps users locate the editor in the application and prompts to input the content.

## Keyboard navigation

The title plugin lets you move from the title to the body element using the <kbd>Tab</kbd> key, providing form-like experience. When the selection is at the beginning of the first body element, you can go back to the title element using <kbd>Shift</kbd>+<kbd>Tab</kbd>. You can also use <kbd>Enter</kbd> and <kbd>Backspace</kbd> keys to move the caret between the title and the body.

## Placeholder integration

The title plugin is integrated with the {@link features/editor-placeholder placeholder} configuration. If you define it, the placeholder text will be used for the body element.

To change the title placeholder, use the {@link module:heading/title~TitleConfig#placeholder `title.placeholder`} configuration option. For instance:

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Title, ... ],
        title: {
            placeholder: 'My custom placeholder for the title'
        },
        placeholder: 'My custom placeholder for the body'
    } )
    .then( ... )
    .catch( ... );
```

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-heading`](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading) package:

```plaintext
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
	Read more about {@link installation/getting-started/installing-plugins installing plugins}.
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

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-heading.
