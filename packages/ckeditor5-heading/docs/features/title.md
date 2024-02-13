---
category: features
menu-title: Document title
meta-title: Document title | CKEditor 5 Documentation
---

# Document title

The title feature lets you add a single title field at the beginning of your document. This way you can clearly divide your content into the title and body sections.

## Demo

Use the editor below to create a document with distinct title and body sections. You can check the content of the title and body elements in the console below.

{@snippet features/title}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Keyboard navigation

The title plugin lets you move from the title to the body element using the <kbd>Tab</kbd> key, providing form-like experience. When the selection is at the beginning of the first body element, you can go back to the title element using <kbd>Shift</kbd>+<kbd>Tab</kbd>. You can also use <kbd>Enter</kbd> and <kbd>Backspace</kbd> keys to move the caret between the title and the body.

## Placeholder integration

The title plugin is integrated with the {@link features/editor-placeholder placeholder} configuration. If you define it, the placeholder text will be used for the body element.

To change the title placeholder, use the {@link module:heading/title~TitleConfig#placeholder `title.placeholder`} configuration option. For instance:

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Title, /* ... */ ],
        title: {
            placeholder: 'My custom placeholder for the title'
        },
        placeholder: 'My custom placeholder for the body'
    } )
    .then( /* ... */ )
    .catch( /* ... */ );
```

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-heading`](https://www.npmjs.com/package/@ckeditor/ckeditor5-heading) package:

```plaintext
npm install --save @ckeditor/ckeditor5-heading
```

Then add the `Title` plugin to your plugin list:

```js
import { Title } from '@ckeditor/ckeditor5-heading';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Title, /* ... */ ]
    } )
    .then( /* ... */ )
    .catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## HTML structure

When you call {@link module:core/editor/editor~Editor#function-getData `editor.getData()`}, the document title will be represented as the following HTML:

```html
<h1>Feasibility Study</h1>
```

### Model representation

In the CKEditor&nbsp;5 data model the document title is represented as follows:

```html
<title>
	<title-content>
		Feasibility Study
	</title-content>
</title>
```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Related features

CKEditor&nbsp;5 has more features that can help you structure your document better:
* {@link features/headings Headings} &ndash; Divide your content into sections.
* {@link features/indent Block indentation} &ndash; Organize your content into visually separated blocks, indent crucial paragraphs, etc.
* {@link features/editor-placeholder Editor placeholder} &ndash; Set placeholder text to display when the content is empty. It helps users locate the editor in the application and prompts to input the content.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-heading](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-heading).
