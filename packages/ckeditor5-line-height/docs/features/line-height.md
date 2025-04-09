# Line height

The {@link module:line-height/lineheight~LineHeight} feature lets you control line spacing in your document. It introduces the line height dropdown in the toolbar.

## Demo

Use the toolbar dropdown to change the line height of paragraphs in the editor below.

## Configuration

### Available options

By default, users can choose from 5 different line height options: 0.5, 1, 1.5, 2, and 2.5 times the default line height.

You can customize the available line heights by configuring the feature through {@link module:core/editor/editorconfig~EditorConfig#lineHeight `config.lineHeight`}.

For example, the following editor will offer line height values starting from 1 up to 2 in 0.25 increments:

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        lineHeight: {
            options: [ 1, 1.25, 1.5, 1.75, 2 ]
        },
        toolbar: [
            'heading', 'bulletedList', 'numberedList', 'lineHeight', 'undo', 'redo'
        ]
    } )
    .then( ... )
    .catch( ... );
```

You can also use a more verbose configuration format to provide custom UI texts for the dropdown options:

```js
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        lineHeight: {
            options: [
                { title: 'Single', model: 1 },
                { title: 'One and a half', model: 1.5 },
                { title: 'Double', model: 2 }
            ]
        },
        toolbar: [
            'heading', 'bulletedList', 'numberedList', 'lineHeight', 'undo', 'redo'
        ]
    } )
    .then( ... )
    .catch( ... );
```

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-line-height`](https://www.npmjs.com/package/@ckeditor/ckeditor5-line-height) package:

```bash
npm install --save @ckeditor/ckeditor5-line-height
```

Then add the `LineHeight` plugin to your plugin list:

```js
import { LineHeight } from '@ckeditor/ckeditor5-line-height';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ LineHeight, ... ],
        toolbar: [ 'lineHeight', ... ]
    } )
    .then( ... )
    .catch( ... );
```

## Common API

The {@link module:line-height/lineheight~LineHeight} plugin registers:

* The `'lineHeight'` UI dropdown component implemented using the {@link module:line-height/lineheightui~LineHeightUI} plugin.
* The {@link module:line-height/lineheightcommand~LineHeightCommand command} that can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Sets the line height to 1.5 times the default.
editor.execute( 'lineHeight', { value: 1.5 } );

// Removes the line height attribute from the selection.
editor.execute( 'lineHeight' );
```

## Contribute

The source code of this feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-line-height](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-line-height).
