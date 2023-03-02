---
category: features
menu-title: Block quote
---
{@snippet features/block-quote-source}

# Block quote

The block quote feature lets you easily include block quotations or pull quotes in your content. It's also an attractive way to draw the readers' attention to selected parts of the text.

## Demo

Use the block quote toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/quote.svg Insert block quote} in the editor below to see the feature in action. You can also precede the quotation with the `>` inline code (followed by a space) to format it on the go thanks to the {@link features/autoformat autoformatting} feature.

{@snippet features/block-quote}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Nested block quotes

Starting from version 27.1.0, CKEditor 5 will properly display a block quote nested in another block quote. This sort of structure is indispensable in email editors or discussion forums. The ability to cite previous messages and preserve a correct quotation structure is often crucial to maintain the flow of communication. Nested block quotes may also prove useful for scientific or academic papers, but articles citing sources and referring to previous writing would often use it, too.

Support for nested block quotes is provided as backward compatibility for loading pre-existing content, for example created in CKEditor 4. Additionally, pasting content with nested block quotes is supported. You can also nest a block quote in another block quote using the {@link features/drag-drop drag and drop} mechanism &mdash; just select an existing block quote and drag it into another.

{@snippet features/nested-block-quote}

<info-box>
	If you would want to block the possibility to nest block quotes in your editor, refer to the {@link features/block-quote#disallow-nesting-block-quotes Disallow nesting block quotes} section to learn how to disable this functionality.
</info-box>

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-block-quote`](https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote) package:

```plaintext
npm install --save @ckeditor/ckeditor5-block-quote
```

And add it to your plugin list configuration:

```js
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ BlockQuote, /* ... */ ],
		toolbar: [ 'blockQuote', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Configuration

### Disallow nesting block quotes

By default, the editor supports inserting a block quote into another block quote.

To disallow nesting block quotes, you need to register an additional schema rule. It needs to be added before the data is loaded into the editor, hence it is best to implement it as a plugin:

```js
function DisallowNestingBlockQuotes( editor ) {
	editor.model.schema.addChildCheck( ( context, childDefinition ) => {
		if ( context.endsWith( 'blockQuote' ) && childDefinition.name == 'blockQuote' ) {
			return false;
		}
	} );
}

// Pass it via config.extraPlugins or config.plugins:

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		extraPlugins: [ DisallowNestingBlockQuotes ],

		// The rest of the configuration.
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box>
	Check the {@link framework/creating-simple-plugin-timestamp plugin development guide} if you need more information about the technical side of this solution.
</info-box>

## Related features

Here are some other CKEditor 5 features that you can use similarly to the block quote plugin to structure your text better:

* {@link features/indent Block indentation} &ndash; Set indentation for text blocks such as paragraphs or lists.
* {@link features/code-blocks Code block} &ndash; Insert longer, multiline code listings.
* {@link features/text-alignment Text alignment} &ndash; Align your content left, right, center it, or justify.
* {@link features/autoformat Autoformatting} &ndash; Add formatting elements (such as block quotes) as you type with Markdown code.

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
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-block-quote](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-block-quote).
