---
category: features
menu-title: Horizontal line
---

# Horizontal line

The {@link module:horizontal-line/horizontalline~HorizontalLine} plugin provides the possibility to insert a horizontal line into the rich-text editor.

## Demo

Use the editor below to see the {@link module:horizontal-line/horizontalline~HorizontalLine} plugin in action.

{@snippet features/horizontal-line}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-horizontal-line`](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line) package:

```plaintext
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

The {@link module:horizontal-line/horizontalline~HorizontalLine} plugin registers:
* the UI button component (`'horizontalLine'`),
* the `'horizontalLine'` command implemented by {@link module:horizontal-line/horizontallinecommand~HorizontalLineCommand}. 

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts a horizontal line into the selected content.
editor.execute( 'horizontalLine' );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-horizontal-line.
