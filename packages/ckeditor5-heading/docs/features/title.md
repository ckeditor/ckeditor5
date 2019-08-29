---
category: features
---

# Title

The {@link module:heading/title~Title} feature add support for the title field to your document. It makes sure that there will be always a single title field at the beginning of your document.

## Demo

{@snippet features/title}

## Keyboard navigation

Title plugin let you navigate between title and body element using <kbd>Tab</kbd> and back, using <kbd>Shift</kbd> + <kbd>Tab</kbd>, providing form-line experience, as well as as use <kbd>Enter</kbd> and <kbd>Backspace</kbd> keys to move caret between title and body.

## Placehoder integration

Title plugin is integrated with the {@link features/editor-placeholder placeholder} configuration. If you define it, it will be users as the placeholder for the body element.

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

