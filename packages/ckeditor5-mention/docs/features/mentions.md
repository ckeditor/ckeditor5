---
category: features
menu-title: Mentions
meta-title: Mentions| CKEditor 5 Documentation
modified_at: 2021-10-20
---

# Mentions (autocompletion)

The mention feature enables smart autocompletion based on user input. When you type a pre-configured marker, such as `@` or `#`, a panel displays with autocomplete suggestions.

## Demo

You can type the "@" character to invoke the mention autocomplete UI. The demo below is configured to suggest a static list of names (`Barney`, `Lily`, `Marry Ann`, `Marshall`, `Robin`, and `Ted`).

{@snippet features/mention}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.

	You can also check out the {@link examples/chat-with-mentions more advanced example} of the mention feature used in a chat application.
</info-box>

You can read more about possible implementations of the mention feature in a [dedicated blog post](https://ckeditor.com/blog/mentions-in-ckeditor-5-feature-of-the-month/).

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Mention } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Mention, /* ... */ ],
		mention: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

The minimal configuration of the mention feature requires defining a {@link module:mention/mentionconfig~MentionFeed `feed`} and a {@link module:mention/mentionconfig~MentionFeed `marker`}. You can also define the `minimumCharacters` parameter, setting the number of letters after which the autocomplete panel will show up. Moreover, feed items' IDs may include whitespaces.

The code snippet below was used to configure the demo above. It defines the list of names that the editor will autocomplete after the user types the "@" character.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marry Ann', '@Marshall', '@Robin', '@Ted' ],
					minimumCharacters: 1
				}
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Additionally, you can configure:

* How the item is rendered in the autocomplete panel (via setting {@link module:mention/mentionconfig~MentionFeed `itemRenderer`}). See [Customizing the autocomplete list](#customizing-the-autocomplete-list).
* How the item is converted during the {@link framework/architecture/editing-engine#conversion conversion}. See [Customizing the output](#customizing-the-output).
* Multiple feeds. The demo above uses only one feed, which is triggered by the `'@'` character. You can define multiple feeds but they must use different markers. For example, you can use `'@'` for people and `'#'` for tags.

### Providing the feed

The {@link module:mention/mentionconfig~MentionFeed `feed`} can be provided as:

* A static array &ndash; Good for scenarios with a relatively small set of autocomplete items.
* A callback &ndash; Provides more control over the returned list of items.

When using a callback you can return a `Promise` that resolves with the list of {@link module:mention/mentionconfig~MentionFeedItem matching feed items}. These can be simple strings or plain objects with at least the `name` property. The other properties of this object can later be used when [customizing the autocomplete list](#customizing-the-autocomplete-list) or [customizing the output](#customizing-the-output).

<info-box>
	When using external resources to obtain the feed it is recommended to add some caching mechanism so subsequent calls for the same suggestion would load faster.

	You can also consider adding the `minimumCharacters` option to the feed configuration so the editor will call the feed callback after some minimum number of characters typed instead of an action on a marker alone.
</info-box>

The callback receives the query text which should be used to filter item suggestions. It should return a `Promise` and resolve it with an array of items that match the feed text.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		mention: {
			feeds: [
				{
					marker: '@',
					feed: getFeedItems
				}
			}
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );

const items = [
	{ id: '@swarley', userId: '1', name: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
	{ id: '@lilypad', userId: '2', name: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
	{ id: '@marry', userId: '3', name: 'Marry Ann Lewis', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
	{ id: '@marshmallow', userId: '4', name: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
	{ id: '@rsparkles', userId: '5', name: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
	{ id: '@tdog', userId: '6', name: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
];

function getFeedItems( queryText ) {
	// As an example of an asynchronous action, return a promise
	// that resolves after a 100ms timeout.
	// This can be a server request or any sort of delayed action.
	return new Promise( resolve => {
		setTimeout( () => {
			const itemsToDisplay = items
				// Filter out the full list of all items to only those matching the query text.
				.filter( isItemMatching )
				// Return 10 items max - needed for generic queries when the list may contain hundreds of elements.
				.slice( 0, 10 );

			resolve( itemsToDisplay );
		}, 100 );
	} );

	// Filtering function - it uses the `name` and `username` properties of an item to find a match.
	function isItemMatching( item ) {
		// Make the search case-insensitive.
		const searchString = queryText.toLowerCase();

		// Include an item in the search results if the name or username includes the current user input.
		return (
			item.name.toLowerCase().includes( searchString ) ||
			item.id.toLowerCase().includes( searchString )
		);
	}
}
```

A full, working demo with all possible customizations and its source code is available {@link features/mentions#fully-customized-mention-feed at the end of this section}.

### Customizing the autocomplete list

#### Styling

The items displayed in the autocomplete list can be customized by defining the {@link module:mention/mentionconfig~MentionFeed `itemRenderer`} callback.

This callback takes a feed item (it contains at least the `name` property) and must return a new DOM element.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		mention: {
			feeds: [
				{
					feed: [ /* ... */ ],
					// Define the custom item renderer.
					itemRenderer: customItemRenderer
				}
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );

function customItemRenderer( item ) {
	const itemElement = document.createElement( 'span' );

	itemElement.classList.add( 'custom-item' );
	itemElement.id = `mention-list-item-id-${ item.userId }`;
	itemElement.textContent = `${ item.name } `;

	const usernameElement = document.createElement( 'span' );

	usernameElement.classList.add( 'custom-item-username' );
	usernameElement.textContent = item.id;

	itemElement.appendChild( usernameElement );

	return itemElement;
}
```

A full, working demo with all possible customizations and its source code is available {@link features/mentions#fully-customized-mention-feed at the end of this section}.

#### List length

The number of items displayed in the autocomplete list can be customized by defining the {@link module:mention/mentionconfig~MentionConfig#dropdownLimit `dropdownLimit`} option.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		mention: {
			// Define the custom number of visible mentions.
			dropdownLimit: 4
			feeds: [
				{ /* ... */ }
				// More feeds.
				// ...
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

A full, working demo with all possible customizations and its source code is available {@link features/mentions#fully-customized-mention-feed at the end of this section}.

### Customizing the text inserted into the editor

You can control the text inserted into the editor when creating a mention via the {@link module:mention/mentionconfig~MentionFeedObjectItem `text`} property in the mention configuration.

```js
ClassicEditor
	.create( editorElement, {
		// ... Other configuration options ...
		mention: {
			feeds: [
				// Feed items as objects.
				{
					marker: '@',
					feed: [
						{
							id: '@Barney',
							fullName: 'Barney Stinson',
							// Custom text to be inserted into the editor
							text: 'Swarley'
						},
						// ...
					]
				},
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The string that you specify in this property will be displayed in the editor when a mention is created.

### Customizing the output

To change the markup generated by the editor for mentions, you can overwrite the default converter of the mention feature. To do that, you must specify both {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher upcast} and {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher downcast} converters using {@link module:engine/view/attributeelement~AttributeElement}.

The example below defines a plugin that overrides the default output:

```html
<span data-mention="@Ted" class="mention">@Ted</span>
```

To a link:

```html
<a class="mention" data-mention="@Ted" data-user-id="5" href="https://www.imdb.com/title/tt0460649/characters/nm1102140">@tdog</a>
```

The converters must be defined with a `'high'` priority to be executed before the {@link features/link link} feature's converter and before the default converter of the mention feature. A mention is stored in the model as a {@link framework/architecture/editing-engine#text-attributes text attribute} that stores an object (see {@link module:mention/mentionconfig~MentionFeedItem}).

To control how the mention element is wrapped by other attribute elements (like bold, italic, etc) set its {@link module:engine/view/attributeelement~AttributeElement#priority}. To replicate default plugin behavior and make mention to be wrapped by other elements set priority to `20`.

By default, attribute elements that are next to each other and have the same value will be rendered as a single HTML element. To prevent this, the model attribute value object exposes a unique ID of each inserted mention to the model as `uid`. To prevent merging subsequent mentions, set it as {@link module:engine/view/attributeelement~AttributeElement#id}.

**Note:** The feature prevents copying fragments of existing mentions. If only a part of a mention is selected, it will be copied as plain text. The internal converter with the {@link module:utils/priorities~PrioritiesType#highest `'highest'` priority} controls this behavior. We do not recommend adding mention converters with the `'highest'` priority to avoid collisions and quirky results.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		plugins: [ Mention, MentionCustomization, /* ... */ ], // Add the custom mention plugin function.
		mention: {
			// Configuration.
			// ...
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );

function MentionCustomization( editor ) {
	// The upcast converter will convert view <a class="mention" href="" data-user-id="">
	// elements to the model 'mention' text attribute.
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
				// The mention feature expects that the mention attribute value
				// in the model is a plain object with a set of additional attributes.
				// In order to create a proper object use the toMentionAttribute() helper method:
				const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem, {
					// Add any other properties that you need.
					link: viewItem.getAttribute( 'href' ),
					userId: viewItem.getAttribute( 'data-user-id' )
				} );

				return mentionAttribute;
			}
		},
		converterPriority: 'high'
	} );

	// Downcast the model 'mention' text attribute to a view <a> element.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, { writer } ) => {
			// Do not convert empty attributes (lack of value means no mention).
			if ( !modelAttributeValue ) {
				return;
			}

			return writer.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue.id,
				'data-user-id': modelAttributeValue.userId,
				'href': modelAttributeValue.link
			}, {
				// Make mention attribute to be wrapped by other attribute elements.
				priority: 20,
				// Prevent merging mentions together.
				id: modelAttributeValue.uid
			} );
		},
		converterPriority: 'high'
	} );
}
```

A full, working demo with all possible customizations and its source code is available {@link features/mentions#fully-customized-mention-feed at the end of this section}.

### Fully customized mention feed

Below is an example of a customized mention feature that:

* Uses a feed of items with additional properties (`id`, `username`, `link`).
* Renders custom item views in the autocomplete panel.
* Converts a mention to an `<a>` element instead of a `<span>`.
* Limits the number of mentions to four elements.

{@snippet features/mention-customization}

#### Source code

```js
ClassicEditor
	.create( document.querySelector( '#snippet-mention-customization' ), {
		// ... Other configuration options ...
		plugins: [ Mention, MentionCustomization, /* ... */ ],
		mention: {
			dropdownLimit: 4,
			feeds: [
				{
					marker: '@',
					feed: getFeedItems,
					itemRenderer: customItemRenderer
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function MentionCustomization( editor ) {
	// The upcast converter will convert <a class="mention" href="" data-user-id="">
	// elements to the model 'mention' attribute.
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
				// The mention feature expects that the mention attribute value
				// in the model is a plain object with a set of additional attributes.
				// In order to create a proper object, use the toMentionAttribute helper method:
				const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem, {
					// Add any other properties that you need.
					link: viewItem.getAttribute( 'href' ),
					userId: viewItem.getAttribute( 'data-user-id' )
				} );

				return mentionAttribute;
			}
		},
		converterPriority: 'high'
	} );

	// Downcast the model 'mention' text attribute to a view <a> element.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue, { writer } ) => {
			// Do not convert empty attributes (lack of value means no mention).
			if ( !modelAttributeValue ) {
				return;
			}

			return writer.createAttributeElement( 'a', {
				class: 'mention',
				'data-mention': modelAttributeValue.id,
				'data-user-id': modelAttributeValue.userId,
				'href': modelAttributeValue.link
			}, {
				// Make mention attribute to be wrapped by other attribute elements.
				priority: 20,
				// Prevent merging mentions together.
				id: modelAttributeValue.uid
			} );
		},
		converterPriority: 'high'
	} );
}

const items = [
	{ id: '@swarley', userId: '1', name: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
	{ id: '@lilypad', userId: '2', name: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
	{ id: '@marry', userId: '3', name: 'Marry Ann Lewis', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
	{ id: '@marshmallow', userId: '4', name: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
	{ id: '@rsparkles', userId: '5', name: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
	{ id: '@tdog', userId: '6', name: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
];

function getFeedItems( queryText ) {
	// As an example of an asynchronous action, return a promise
	// that resolves after a 100ms timeout.
	// This can be a server request or any sort of delayed action.
	return new Promise( resolve => {
		setTimeout( () => {
			const itemsToDisplay = items
				// Filter out the full list of all items to only those matching the query text.
				.filter( isItemMatching )
				// Return 10 items max - needed for generic queries when the list may contain hundreds of elements.
				.slice( 0, 10 );

			resolve( itemsToDisplay );
		}, 100 );
	} );

	// Filtering function - it uses `name` and `username` properties of an item to find a match.
	function isItemMatching( item ) {
		// Make the search case-insensitive.
		const searchString = queryText.toLowerCase();

		// Include an item in the search results if name or username includes the current user input.
		return (
			item.name.toLowerCase().includes( searchString ) ||
			item.id.toLowerCase().includes( searchString )
		);
	}
}

function customItemRenderer( item ) {
	const itemElement = document.createElement( 'span' );

	itemElement.classList.add( 'custom-item' );
	itemElement.id = `mention-list-item-id-${ item.userId }`;
	itemElement.textContent = `${ item.name } `;

	const usernameElement = document.createElement( 'span' );

	usernameElement.classList.add( 'custom-item-username' );
	usernameElement.textContent = item.id;

	itemElement.appendChild( usernameElement );

	return itemElement;
}
```

### Colors and styles

#### Using CSS variables

The mention feature uses the power of [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables) which are defined in the [Lark theme style sheet](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-theme-lark/theme/ckeditor5-mention/mention.css). Thanks to that, mention styles can be {@link framework/theme-customization easily customized}:

```css
:root {
	/* Make the mention background blue. */
	--ck-color-mention-background: hsla(220, 100%, 54%, 0.4);

	/* Make the mention text dark grey. */
	--ck-color-mention-text: hsl(0, 0%, 15%);
}
```

{@snippet features/custom-mention-colors-variables}

### Comments with mentions

It is possible to configure the Mentions feature to work with the {@link features/comments Comments feature}. Here you can find {@link features/annotations-custom-configuration#comment-editor-configuration detailed guidance on that matter}.

## Related features

In addition to enabling mentions, you may want to check the following productivity features:

* {@link features/text-transformation Automatic text transformation} &ndash; Lets you automatically turn snippets such as `(tm)` into `™` and `"foo"` into `“foo”`.
* {@link features/link#autolink-feature Autolink} &ndash; Turns the links and email addresses typed or pasted into the editor into active URLs.
* {@link features/autoformat Autoformatting} &ndash; Lets you quickly apply formatting to the content you are writing.
* {@link features/emoji Emoji} &ndash; Lets you quickly insert desired emoji.

## Common API

The {@link module:mention/mention~Mention} plugin registers:
* The `'mention'` command implemented by {@link module:mention/mentioncommand~MentionCommand}.

	You can insert a mention element by executing the following code:

	```js
	editor.execute( 'mention', { marker: '@', mention: '@John' } );
	```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-mention](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-mention).
