---
category: features
menu-title: Horizontal line
---

# Horizontal line

The {@link module:horizontal-line/horizontalline~HorizontalLine} plugin provides a possibility to insert a horizontal line in the rich-text editor.

## Demo

Use the editor below to see the {@link module:horizontal-line/horizontalline~HorizontalLine} plugin in action.

{@snippet features/horizontal-line}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-horizontal-line`](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line) package:

```bash
npm install --save @ckeditor/ckeditor5-horizontal-line
```

And add it to your plugin list configuration:

```js
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ HorizontalLine, ... ],
		toolbar: [ 'horizontalLine', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:horizontal-line/horizontalline~HorizontalLine} plugin registers the UI button component (`'horizontalLine'`) and the `'horizontalLine'` command implemented by {@link module:horizontal-line/horizontallinecommand~HorizontalLineCommand}. 

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts the horizontal line to the selected content.
editor.execute( 'horizontalLine' );
```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-horizontal-line.
