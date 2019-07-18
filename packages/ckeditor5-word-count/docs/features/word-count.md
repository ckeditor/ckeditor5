---
category: features
menu-title: Word and character count
---

{@snippet features/build-word-count-source}

# Word count and character count

The {@link module:word-count/wordcount~WordCount} feature provides a possibility to track the number of words and characters written in the rich-text editor.

## Demo

{@snippet features/word-count}

The example above was created by using the following HTML page structure:

```html
<div id="editor">
	<p>Hello world.</p>
</div>
<div id="word-count">
</div>
```

You can use the code below to set up the WYSIWYG editor with the word and character count features as in the example above.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Configuration details.
	} )
	.then( editor => {
		const wordCountPlugin = editor.plugins.get( 'WordCount' );
		const wordCountWrapper = document.getElementById( 'word-count' );

		wordCountWrapper.appendChild( wordCountPlugin.wordCountContainer );
	} )
	.catch( ... );
```

## Configuration options

There are two configuration options available that change the output container of the word count and character count features:

* If the {@link module:word-count/wordcount~WordCountConfig#displayWords} option is set to to `false`, the word counter will be hidden.
* If the {@link module:word-count/wordcount~WordCountConfig#displayCharacters} option is set to `false`, the character counter will be hidden.

## Update event

The Word count and character count feature emits an {@link module:word-count/wordcount~WordCount#event:update `update` event} whenever there is a change in the model. This allows implementing customized behaviors that react to word and character count updates.

Below you can find an example where the background color of the circle is changed according to the number of characters in the editor. There is also a progress bar which indicates how many words are in it. The maximum value of the progress bar is set to 100, however, you can write further and the progress bar will remain in the maximum state.

{@snippet features/word-count-update}

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Configuration details.
	} )
	.then( editor => {
		const wordCountPlugin = editor.plugins.get( 'WordCount' );

		wordCountPlugin.on( 'update', ( evt, data ) => {
			// "data" is an object with "words" and "characters" fields.
			doSthWithNewWordsNumber( data.words );
			doSthWithNewCharactersNumber( data.characters );
		} );

	} )
	.catch( ... );
```

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-word-count`](https://www.npmjs.com/package/@ckeditor/ckeditor5-word-count) package:

```bash
npm install --save @ckeditor/ckeditor5-word-count
```

And add it to your plugin list configuration:

```js
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ WordCount, ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:word-count/wordcount~WordCount} plugin provides:
  
  * The {@link module:word-count/wordcount~WordCount#wordCountContainer} method. It returns a self-updating HTML element which is updated with the current number of words and characters in the editor. You can remove the "Words" or "Characters" counters with a proper configuration of the {@link module:word-count/wordcount~WordCountConfig#displayWords} and {@link module:word-count/wordcount~WordCountConfig#displayCharacters} options.
  * The {@link module:word-count/wordcount~WordCount#event:update `update` event}, fired whenever the plugins update the number of counted words and characters. You can run a custom callback function with updated values. Please note that the `update` event is throttled.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-word-count.
