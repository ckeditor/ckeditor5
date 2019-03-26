---
category: features
---

{@snippet features/build-mention-source}

# Mention

The {@link module:mention/mention~Mention} feature brings support for smart completion based on user input. When user types a pre-configured marker, such as `@` or `#`, they get an autocomplete suggestions in a balloon panel displayed next to the caret. The selected suggestion is then inserted into the content.

## Demo

You can type `'@'` character to invoke mention auto-complete UI. The below demo is configured as static list of names.

{@snippet features/mention}

## Configuration

The minimal configuration of a mention requires defining a {@link module:mention/mention~MentionFeed `feed`} and a {@link module:mention/mention~MentionFeed `marker`} (if not using the default `@` character). You can define also `minimumCharacters` after which the auto-complete panel will be shown. 

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Mention, ... ],
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ 'Barney', 'Lily', 'Marshall', 'Robin', 'Ted' ],
					minimumCharacters: 1
				}
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

Additionally you can configure:
- How the item is rendered in the auto-complete panel.
- How the item is converted during the conversion.

### Providing the feed

The {@link module:mention/mention~MentionFeed `feed`} can be provided as:

- static array - good for scenarios with relatively small set of auto-complete items.
- a callback - which provides more control over the returned list of items.

If using a callback you can return a `Promise` that resolves with list of {@link module:mention/mention~MentionFeedItem mention feed items}. Those can be simple stings used as mention text or plain objects with at least one `name` property. The other parameters can be used either when {@link features/mention#customizing-the-auto-complete-list customizing the auto-complete list} {@link features/mention#customizing-the-output customizing the output}.

<info-box>
When using external resources to obtain the feed it is recommended to add some caching mechanism so subsequent calls for the same suggestoin would load faster.
</info-box>

The callback receives a matched text which should be used to filter item suggestions. It should return a `Promise` and resolve it with an array of items that match to the feed text.

<info-box>
Consider adding the `minimumCharacters` option to the feed config so the editor will call the feed callback after a minimum characters typed instead of action on marker alone. 
</info-box>

```js
const items = [
	{ id: '1', name: 'Barney Stinson', username: 'swarley', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
	{ id: '2', name: 'Lily Aldrin', username: 'lilypad', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
	{ id: '3', name: 'Marshall Eriksen', username: 'marshmallow', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
	{ id: '4', name: 'Robin Scherbatsky', username: 'rsparkles', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
	{ id: '5', name: 'Ted Mosby', username: 'tdog', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
];

function getFeedItems( feedText ) {
	// As an example of asynchronous action return a promise that resolves after a 100ms timeout.
	return new Promise( resolve => {
		setTimeout( () => {
			const itemsToDisplay = items
				// Filter out the full list of all items to only those matching feedText.
				.filter( isItemMatching )
				// Return at most 10 items - notably for generic queries when the list may contain hundreds of elements.
				.slice( 0, 10 );

			resolve( itemsToDisplay );
		}, 100 );
	} );

	// Filtering function - it uses `name` and `username` properties of an item to find a match.
	function isItemMatching( item ) {
		// Make search case-insensitive.
		const searchString = feedText.toLowerCase();

		// Include an item in the search results if name or username includes the current user input.
		return textIncludesSearchSting( item.name, searchString ) || textIncludesSearchSting( item.username, searchString );
	}

	function textIncludesSearchSting( text, searchString ) {
		return text.toLowerCase().includes( searchString );
	}
}
```

The full working demo with all customization possible is {@link features/mention#fully-customized-mention-feed  at the end of this section}.

<info-box>
The mention feature does not limit items displayed in the mention suggestion list when using the callback. You should limit the output by yourself. 
</info-box>

### Customizing the auto-complete list

The items displayed in auto-complete list can be customized by defining the {@link module:mention/mention~MentionFeed `itemRenderer`} callback.

This callback takes a plain object feed item (at least with `name` parameter - even when feed items are defined as strings). The item renderer function must return a new DOM element.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Mention, ... ],
		mention: {
			feeds: [
				{ 
					feed: [ ... ],
					// Define the custom item renderer:
					itemRenderer: customItemRenderer
				}
			]
		}
	} )
	.then( ... )
	.catch( ... );

function customItemRenderer( item ) {
	const span = document.createElement( 'span' );

	span.classList.add( 'custom-item' );
	span.id = `mention-list-item-id-${ item.id }`;

	// Add child nodes to the main span or just set innerHTML.
	span.innerHTML = `${ item.name } <span class="custom-item-username">@${ item.username }</span>`;

	return span;
}
```

The full working demo with all customization possible is {@link features/mention#fully-customized-mention-feed  at the end of this section}.

### Customizing the output

In order to have full control over the markup generated by the editor you can overwrite the conversion process. To do that you must specify both {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher upcast} and {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher downcast} converters.

Below is an example of a plugin that overrides the default output:

```html
<span data-mention="Ted" class="mention">@Ted</span>
```

To a link:

```html
<a class="mention" data-mention="Ted Mosby" data-user-id="5" href="https://www.imdb.com/title/tt0460649/characters/nm1102140">@Ted Mosby</a>
```

The below converters must have priority higher then link attribute converter. The mention item in the model must be stored as a plain object with `name` attribute.

```js
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

// The link plugin using highest priority in conversion pipeline.
const HIGHER_THEN_HIGHEST = priorities.highest + 50;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Mention, CustomMention, ... ],    // Add custom mention plugin function.
		mention: {
			// configuration...
		}
	} )
	.then( ... )
	.catch( ... );

function CustomMention( editor ) {
	// The upcast converter will convert <a class="mention"> elements to the model 'mention' attribute.
	editor.conversion.for( 'upcast' ).elementToAttribute( {
		view: {
			name: 'a',
			key: 'data-mention',
			classes: 'mention',
			attributes: {
				href: true,
				'data-user-id': true
			}
		},
		model: {
			key: 'mention',
			value: viewItem => {
				// Optionally: do not convert partial mentions.
				if ( !isFullMention( viewItem ) ) {
					return;
				}

				// The mention feature expects that mention attribute value in the model is a plain object:
				const mentionValue = {
					// The name attribute is required by mention editing.
					name: viewItem.getAttribute( 'data-mention' ),
					// Add any other properties as required.
					link: viewItem.getAttribute( 'href' ),
					id: viewItem.getAttribute( 'data-user-id' )
				};

				return mentionValue;
			}
		},
		converterPriority: HIGHER_THEN_HIGHEST
	} );

	function isFullMention( viewElement ) {
		const textNode = viewElement.getChild( 0 );
		const dataMention = viewElement.getAttribute( 'data-mention' );

		// Do not parse empty mentions.
		if ( !textNode || !textNode.is( 'text' ) ) {
			return false;
		}

		const mentionString = textNode.data;

		// Assume that mention is set as marker + mention name.
		const name = mentionString.slice( 1 );

		// Do not upcast partial mentions - might come from copy-paste of partially selected mention.
		return name == dataMention;
	}

	// Don't forget to define a downcast converter as well:
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, viewWriter ) => {
			if ( !modelAttributeValue ) {
				// Do not convert empty attributes.
				return;
			}

			return viewWriter.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue.name,
				'data-user-id': modelAttributeValue.id,
				'href': modelAttributeValue.link
			} );
		},
		converterPriority: HIGHER_THEN_HIGHEST
	} );
}
```

The full working demo with all customization possible is {@link features/mention#fully-customized-mention-feed  at the end of this section}.

# Fully customized mention feed

Below is an example of a customized mention feature that:

- Returns a feed of items with extended properties.
- Renders custom DOM view in auto-complete suggestion in panel view.
- Converts mention to an `<a>` element instead of `<span>`.

{@snippet features/mention-customization}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-mention`](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention) package:

```bash
npm install --save @ckeditor/ckeditor5-mention
```

Then add `Mention` to your plugin list and {@link module:mention/mention~MentionConfig configure} the feature (if needed):

```js
import Mention from '@ckeditor/ckeditor5-mention/src/mention';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Mention, ... ],
		mention: {
			// configuration...
		}
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:mention/mention~Mention} plugin registers:
* the `'mention'` command implemented by {@link module:mention/mentioncommand~MentionCommand}.

	You can insert a mention element by executing the following code:

	```js
	editor.execute( 'mention', { marker: '@', mention: 'John' } );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-mention.
