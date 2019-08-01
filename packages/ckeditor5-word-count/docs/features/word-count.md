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
<div id="word-count"></div>
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

## Configuration

The word count and character count feature is quite flexible and there are a few configuration options available.

### Configuring the container

There are two ways how you can inject the word count statistics into your page:

* By using the {@link module:word-count/wordcount~WordCount#wordCountContainer `WordCount#wordCountContainer`} property as shown in the example above.
* Or, by specifying where the word count feature should insert its container which can be done by using {@link module:word-count/wordcount~WordCountConfig#container `config.wordCount.container`}.

The word count plugin renders its output as:

```html
<div class="ck ck-word-count">
	<div class="ck-word-count__words">Words: %%</div>
	<div class="ck-word-count__characters">Characters: %%</div>
</div>
```

If you wish to render the statistics differently, see the [`update` event](#the-update-event).

### Changing the output

There are two configuration options available that change the output of the word count and character count features:

* If the {@link module:word-count/wordcount~WordCountConfig#displayWords `config.wordCount.displayWords`} option is set to `false`, the word counter will be hidden.
* If the {@link module:word-count/wordcount~WordCountConfig#displayCharacters `config.wordCount.displayCharacters`} option is set to `false`, the character counter will be hidden.

### Reacting to changes in statistics

You can execute your custom callback every time content statistics change by defining {@link module:word-count/wordcount~WordCountConfig#onUpdate `config.wordCount.onUpdate`} in the editor configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ WordCount, ... ],
		wordCount: {
			onUpdate: stats => {
				// Prints the current content statistics.
				console.log( `Characters: ${ stats.characters }\nWords:      ${ stats.words }` );
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

**Note**: For performance reasons, your callback will be throttled and may not be up–to–date. Use {@link module:word-count/wordcount~WordCount#characters} and {@link module:word-count/wordcount~WordCount#words} plugin properties to retrieve the precise numbers on demand.

## The `update` event

The {@link module:word-count/wordcount~WordCount WordCount} plugin emits the {@link module:word-count/wordcount~WordCount#event:update `update` event}. It allows implementing customized behaviors that react to word and character count updates.

Below you can find an example where the color of the circle goes from green to red as you approach the limit of 120 characters. The progress bar indicates the number of words.

{@snippet features/word-count-update}

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Configuration details.
	} )
	.then( editor => {
		const wordCountPlugin = editor.plugins.get( 'WordCount' );

		const progressBar = document.querySelector( '.word-count progress' );
		const colorBox = document.querySelector( '.word-count__color-box' );

		wordCountPlugin.on( 'update', ( evt, data ) => {
			const charactersHue = calculateHue( {
				characters: data.characters,
				greenUntil: 70,
				maxCharacters: 120
			} );

			progressBar.value = data.words;
			colorBox.style.setProperty( '--hue', charactersHue );
		} );

		// Calculates the hue based on the number of characters.
		//
		// For the character counter:
		//
		// * below greenUntil - Returns green.
		// * between greenUntil and maxCharacters - Returns a hue between green and red.
		// * above maxCharacters - Returns red.
		function calculateHue( { characters, greenUntil, maxCharacters } ) {
			const greenHue = 70;
			const redHue = 0;
			const progress = Math.max( 0, Math.min( 1, ( characters - greenUntil ) / ( maxCharacters - greenUntil ) ) ); // 0-1
			const discreetProgress = Math.floor( progress * 10 ) / 10; // 0, 0.1, 0.2, ..., 1

			return ( redHue - greenHue ) * discreetProgress + greenHue;
		}
	} )
	.catch( ... );
```

The HTML structure used to create the customized word and character count implementation above:

```html
<style>
	.word-count__color-box {
		width: 20px;
		height: 20px;
		background-color: hsl( var( --hue ), 100%, 50% );
		display: inline-block;
		vertical-align: middle;
		border-radius: 100%;
	}
</style>

<div class="word-count">
	<div class="word-count__words">
		<label>
			<span>Words:</span>
			<progress max="20"></progress>
		</label>
	</div>
	<div class="word-count__characters">
		<span>Characters:</span>
		<div class="word-count__color-box"></div>
	</div>
</div>
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

* The {@link module:word-count/wordcount~WordCount#wordCountContainer} property. It returns a self-updating HTML element which is updated with the current number of words and characters in the editor. You can remove the "Words" or "Characters" counters with a proper configuration of the {@link module:word-count/wordcount~WordCountConfig#displayWords `config.wordCount.displayWords`} and {@link module:word-count/wordcount~WordCountConfig#displayCharacters `config.wordCount.displayCharacters`} options.
* The {@link module:word-count/wordcount~WordCount#event:update `update` event}, fired whenever the plugins update the number of counted words and characters. You can use it to run a custom callback function with updated values:

	```js
	editor.plugins.get( 'WordCount' ).on( 'update', ( evt, stats ) => {
		// Prints the current content statistics.
		console.log( `Characters: ${ stats.characters }\nWords:      ${ stats.words }` );
	} );
	```

	Alternatively, you can use [`editor.config.wordCount.onUpdate`](#reacting-to-changes-in-statistics) to register a similar callback in editor configuration.

	**Note**: For performance reasons, the `update` event is throttled so the statistics may not be up–to–date. Use {@link module:word-count/wordcount~WordCount#characters} and {@link module:word-count/wordcount~WordCount#words} plugin properties to retrieve the precise numbers on demand.
* The {@link module:word-count/wordcount~WordCount#characters} and {@link module:word-count/wordcount~WordCount#words} properties from which you can retrieve the stats at any moment.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-word-count.
