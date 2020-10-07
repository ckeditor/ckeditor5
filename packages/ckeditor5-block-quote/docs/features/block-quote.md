---
category: features
menu-title: Block quote
---

# Block quote

The {@link module:block-quote/blockquote~BlockQuote} feature allows you to easily include block quotations or pull quotes in the rich-text content. This provides an attractive way to draw the readers' attention to selected parts of text. It also helps organize the content in a structured, elegant way and to manage the flow better.

## Demo

Use the editor below to see the block quote plugin in action.

{@snippet features/block-quote}

## Related features

Here are some other CKEditor 5 features that you can use similarly to the block quote plugin to structure your text better:

* The {@link features/indent block indentation feature} allows you to set indentation for text blocks such as paragraphs or lists.
* The {@link features/code-blocks code block feature} allows for insertion of various code listings.

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-block-quote`](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote) package:

```plaintext
npm install --save @ckeditor/ckeditor5-block-quote
```

And add it to your plugin list configuration:

```js
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ BlockQuote, ... ],
		toolbar: [ 'blockQuote', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:block-quote/blockquote~BlockQuote} plugin registers:

* the `'blockQuote'` UI button component implemented by the {@link module:block-quote/blockquoteui~BlockQuoteUI block quote UI feature},
* the `'blockQuote'` command implemented by the {@link module:block-quote/blockquoteediting~BlockQuoteEditing block quote editing feature}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Applies block quote to the selected content.
editor.execute( 'blockQuote' );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-block-quote.
