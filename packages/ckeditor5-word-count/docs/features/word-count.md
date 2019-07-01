---
category: features
---

{@snippet features/build-word-count-source}

# Word count

The {@link module:wordcount/wordcount~WordCount} feature provides a possibility to track the number of words and characters written in the editor.

## Demo

{@snippet features/word-count}

```html
<div id="editor">
	<p>Hello world.</p>
</div>
<div id="word-count">
</div>
```

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

There are two options which change the output container. If the {@link module:wordcount/wordcount~WordCountConfig#displayWords} is set to to `false`, then the section with word counter is hidden. Similarly, when the {@link module:wordcount/wordcount~WordCountConfig#displayCharacters} is set to `false` it will hide the character counter.

## Update event

Word count feature emits an {@link module:wordcount/wordcount~WordCount#event:update update event} whenever there is a change in the model. This allows implementing customized behavior that reacts to word count updates.

Below you can find an example, where the background color of a square is changed according to the number of characters in the editor. There is also a progress bar which indicates how many words is in it (the maximal value of the progress bar is set to 100, however, you can write further and progress bar remain in the maximal state).

{@snippet features/word-count-update}

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// configuration details
	} )
	.then( editor => {
		const wordCountPlugin = editor.plugins.get( 'WordCount' );

		wordCountPlugin.on( 'update', ( evt, data ) => {
			// data is an object with "words" and "characters" field
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

The {@link module:wordcount/wordcount~WordCount} plugin provides:
  * {@link module:wordcount/wordcount~WordCount#wordCountContainer} method. It returns a self-updating HTML element which is updated with the current number of words and characters in the editor. There is a possibility to remove "Words" or "Characters" counters with proper configuration of {@link module:wordcount/wordcount~WordCountConfig#displayWords} and {@link module:wordcount/wordcount~WordCountConfig#displayCharacters},
  * {@link module:wordcount/wordcount~WordCount#event:update update event} which is fired whenever the plugins update the number of counted words and characters. There is a possibility to run own callback function with updated values. Please note that update event is throttled.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-word-count.
