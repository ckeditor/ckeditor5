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
* By specifying where the word count feature should insert its container which can be done by using {@link module:word-count/wordcount~WordCountConfig#container `config.wordCount.container`}.

The word count plugin renders its output as:

```html
<div class="ck ck-word-count">
	<div class="ck-word-count__words">Words: %%</div>
	<div class="ck-word-count__characters">Characters: %%</div>
</div>
```

If you wish to render the statistics differently, see the [`update` event](#reacting-to-updates).

### Changing the output

There are two configuration options available that change the output of the word count and character count features:

* If the {@link module:word-count/wordcount~WordCountConfig#displayWords `config.wordCount.displayWords`} option is set to `false`, the word counter will be hidden.
* If the {@link module:word-count/wordcount~WordCountConfig#displayCharacters `config.wordCount.displayCharacters`} option is set to `false`, the character counter will be hidden.

### Reacting to updates

You can execute your custom callback every time content statistics change by defining {@link module:word-count/wordcount~WordCountConfig#onUpdate `config.wordCount.onUpdate`} in the editor configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ WordCount, ... ],
		wordCount: {
			onUpdate: stats => {
				// Prints the current content statistics.
				console.log( `Characters: ${ stats.characters }\nWords: ${ stats.words }` );
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

**Note**: For performance reasons, your callback will be throttled and may not be up–to–date. Use the {@link module:word-count/wordcount~WordCount#characters} and {@link module:word-count/wordcount~WordCount#words} plugin properties to retrieve the precise numbers on demand.

Below you can play with a demo post editor with a soft 120 characters limit and a progress chart below indicating how many characters are in the content. The progress chart changes its color as the limit is near or exceeded. Type in the editor to see the feature in action. See the code used to create the demo listed below in this section.

{@snippet features/word-count-update}

```js
const maxCharacters = 120;
const container = document.querySelector( '.demo-update' );
const progressCircle = document.querySelector( '.demo-update__chart__circle' );
const charactersBox = document.querySelector( '.demo-update__chart__characters' );
const wordsBox = document.querySelector( '.demo-update__words' );
const circleCircumference = Math.floor( 2 * Math.PI * progressCircle.getAttribute( 'r' ) );
const sendButton = document.querySelector( '.demo-update__send' );

BalloonEditor
	.create( document.querySelector( '#demo-update__editor' ), {
		// Editor configuration.
		wordCount: {
			onUpdate: stats => {
				const charactersProgress = stats.characters / maxCharacters * circleCircumference;
				const isLimitExceeded = stats.characters > maxCharacters;
				const isCloseToLimit = !isLimitExceeded && stats.characters > maxCharacters * .8;
				const circleDashArray = Math.min( charactersProgress, circleCircumference );

				// Set the stroke of the circle to show how many characters were typed.
				progressCircle.setAttribute( 'stroke-dasharray', `${ circleDashArray },${ circleCircumference }` );

				// Display the number of characters in the progress chart. When the limit is exceeded,
				// display how many characters should be removed.
				if ( isLimitExceeded ) {
					charactersBox.textContent = `-${ stats.characters - maxCharacters }`;
				} else {
					charactersBox.textContent = stats.characters;
				}

				wordsBox.textContent = `Words in the post: ${ stats.words }`;

				// If the content length is close to the character limit, add a CSS class to warn the user.
				container.classList.toggle( 'demo-update__limit-close', isCloseToLimit );

				// If the character limit is exceeded, add a CSS class that makes the content's background red.
				container.classList.toggle( 'demo-update__limit-exceeded', isLimitExceeded );

				// If the character limit is exceeded, disable the send button.
				sendButton.toggleAttribute( 'disabled', isLimitExceeded );
			}
		}
	} )
	.catch( ... );
```

Here is the HTML structure used to create the customized word and character count implementation above:

```html
<style>
	.demo-update {
		border: 1px solid var(--ck-color-base-border);
		border-radius: var(--ck-border-radius);
		box-shadow: 2px 2px 0px hsla( 0, 0%, 0%, 0.1 );
		margin: 1.5em 0;
		padding: 1em;
	}

	.demo-update h3 {
		font-size: 18px;
		font-weight: bold;
		margin: 0 0 .5em;
		padding: 0;
	}

	.demo-update .ck.ck-editor__editable_inline {
		border: 1px solid hsla( 0, 0%, 0%, 0.15 );
		transition: background .5s ease-out;
		min-height: 6em;
		margin-bottom: 1em;
	}

	.demo-update__controls {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.demo-update__chart {
		margin-right: 1em;
	}

	.demo-update__chart__circle {
		transform: rotate(-90deg);
		transform-origin: center;
	}

	.demo-update__chart__characters {
		font-size: 13px;
		font-weight: bold;
	}

	.demo-update__words {
		flex-grow: 1;
		opacity: .5;
	}

	.demo-update__limit-close .demo-update__chart__circle {
		stroke: hsl( 30, 100%, 52% );
	}

	.demo-update__limit-exceeded .ck.ck-editor__editable_inline {
		background: hsl( 0, 100%, 97% );
	}

	.demo-update__limit-exceeded .demo-update__chart__circle {
		stroke: hsl( 0, 100%, 52% );
	}

	.demo-update__limit-exceeded .demo-update__chart__characters {
		fill: hsl( 0, 100%, 52% );
	}
</style>

<div class="demo-update">
	<h3>Post editor with word count</h3>
	<div id="demo-update__editor">
		<p>Tourists frequently admit that <a href="https://en.wikipedia.org/wiki/Taj_Mahal">Taj Mahal</a> “simply cannot be described with words”.</p>
	</div>
	<div class="demo-update__controls">
		<span class="demo-update__words"></span>
		<svg class="demo-update__chart" viewbox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
			<circle stroke="hsl(0, 0%, 93%)" stroke-width="3" fill="none" cx="20" cy="20" r="17" />
			<circle class="demo-update__chart__circle" stroke="hsl(202, 92%, 59%)" stroke-width="3" stroke-dasharray="134,534" stroke-linecap="round" fill="none" cx="20" cy="20" r="17" />
			<text class="demo-update__chart__characters" x="50%" y="50%" dominant-baseline="central" text-anchor="middle"></text>
		</svg>
		<button type="button" class="demo-update__send">Send post</button>
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

	Alternatively, you can use [`config.wordCount.onUpdate`](#reacting-to-updates) to register a similar callback via the editor configuration.

	**Note**: For performance reasons, the `update` event is throttled so the statistics may not be up–to–date. Use the {@link module:word-count/wordcount~WordCount#characters} and {@link module:word-count/wordcount~WordCount#words} plugin properties to retrieve the precise numbers on demand.
* The {@link module:word-count/wordcount~WordCount#characters} and {@link module:word-count/wordcount~WordCount#words} properties from which you can retrieve the stats at any moment.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-word-count.
