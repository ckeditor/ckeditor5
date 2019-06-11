---
category: features
---

{@snippet features/build-word-count-source}

# Word count

The {@link module:wordcount/wordcount~WordCount} features provide a possibility to track the number of words and characters written in the editor.

## Demo

{@snippet features/word-count}

```html
<div id="editor">
	<p>Hello world.</p>
</div>
<div class="word-count">
</div>
```

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// configuration details
	} )
	.then( editor => {
		const wordCountPlugin = editor.plugins.get( 'WordCount' );
		const wordCountWrapper = document.querySelector( '.word-count' );

		wordCountWrapper.appendChild( wordCounterPlugin.getWordCountContainer() );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

## Configuring options

There are two options which change the output container. If there is set {@link module:wordcount/wordcount~WordCountConfig#displayWords} to `false`, then the section with word counter is removed from self-updating output container. In a similar way works second option {@link module:wordcount/wordcount~WordCountConfig#displayCharacters} with character container.

## Update event

Word count feature emits an {@link module:wordcount/wordcount~WordCount#event:update update event} whenever there is a change in a model. This allows on having own callback with customized behavior reacting on this change.

Below you can find an example, where the background color of a square is changed according to the number of characters in the editor. There is also a progress bar which indicates how many words is in it (the maximal value of the progress bar is set to 100, however, you can write further and progress bar remain in the maximal state).

{@snippet features/word-count-update}

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// configuration details
	} )
	.then( editor => {
		const wordCountPlugin = editor.plugins.get( 'WordCount' );

		wordCountPlugin.on( 'update', ( evt, payload ) => {
			// payload is an object with "words" and "characters" field
			doSthWithNewWordsNumber( payload.words );
			doSthWithNewCharactersNumber( payload.characters );
		} );

	} )
	.catch( err => {
		console.error( err.stack );
	} );
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

The {@link module:wordcount/wordcount~WordCount} plugin provides:
  * {@link module:wordcount/wordcount~WordCount#getWordCountContainer} method. It returns a self-updating HTML Element which might be used to track the current amount of words and characters in the editor. There is a possibility to remove "Words" or "Characters" counter with proper configuration of {@link module:wordcount/wordcount~WordCountConfig#displayWords} and {@link module:wordcount/wordcount~WordCountConfig#displayCharacters},
  * {@link module:wordcount/wordcount~WordCount#event:update update event} which provides more versatile option to handle changes of words' and characters' number. There is a possibility to run own callback function with updated values.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-word-count.
