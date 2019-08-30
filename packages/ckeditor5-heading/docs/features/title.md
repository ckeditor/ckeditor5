---
category: features
---

# Title

The {@link module:heading/title~Title title} feature adds support for the title field to your document. It makes sure that there will be always a single title field at the beginning of your document.

## Demo

{@snippet features/title}

## Keyboard navigation

Title plugin lets you navigate between title and body elements using <kbd>Tab</kbd> key and back, using <kbd>Shift</kbd> + <kbd>Tab</kbd>, providing form-like experience. You can also use <kbd>Enter</kbd> and <kbd>Backspace</kbd> keys to move caret between title and body.

## Placeholder integration

Title plugin is integrated with the {@link features/editor-placeholder placeholder} configuration. If you define it, it will be used as the placeholder for the body element.

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

