---
category: features
menu-title: Special characters
---

# Special characters

The special characters feature lets you insert **mathematical operators**, **currency symbols**, **punctuation**, **graphic symbols** (such as arrows or bullets), or Unicode letters typically not accessible from the keyboard (such as **umlauts** or **other diacritics**). The feature also supports **emojis**.

## Demo

Use the toolbar button {@icon @ckeditor/ckeditor5-special-characters/theme/icons/specialcharacters.svg Special characters} in the editor below to gain access to a [configurable](#configuration) panel with a table of selectable special characters.

{@snippet features/special-characters-source}

{@snippet features/special-characters}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Configuration

By default, a few categories of special characters have been defined. You can easily customize the special characters available in your WYSIWYG editor installation by adding new categories, extending the existing ones, or removing them altogether.

### Adding a new category

You can define a new special characters category using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function.

For example, the following plugin adds the "Emoji" category to the special characters dropdown.

```js
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

function SpecialCharactersEmoji( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Emoji', [
		{ title: 'smiley face', character: '😊' },
		{ title: 'rocket', character: '🚀' },
		{ title: 'wind blowing face', character: '🌬️' },
		{ title: 'floppy disk', character: '💾' },
		{ title: 'heart', character: '❤️' }
	], { label: 'Emoticons' } );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersEmoji,
			// More plugins.
			// ...
		],
		toolbar: [ 'specialCharacters', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

After adding the above plugin to the editor configuration, the new category will become available in the special characters dropdown.

<info-box>
	The title of a special character must be unique across the entire special characters set.
</info-box>

<info-box>
	The third argument of the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} method is optional. You can use it to specify a label displayed as a category name. It is useful when your editor uses a language other than English. Check out the {@link features/ui-language UI language guide} to learn more.
</info-box>

Below you can see a demo based on the example shown above. Use the special characters icon in the editor toolbar and then select "Emoji" in the select dropdown in order to insert an emoji into the WYSIWYG editor.

{@snippet features/special-characters-new-category}

### Adding characters to an existing category

By using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function you can also add new special characters to an existing category.

```js
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

function SpecialCharactersExtended( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Mathematical', [
		{ title: 'alpha', character: 'α' },
		{ title: 'beta', character: 'β' },
		{ title: 'gamma', character: 'γ' }
	] );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersExtended,

			// More plugins.
			// ...
		],
		toolbar: [ 'specialCharacters', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box>
	The title of a special character must be unique across the entire special characters set.
</info-box>

Below, you can see a demo based on the example shown above. Use the special characters icon in the editor toolbar and then select "Mathematical" in the select dropdown. You will see that the category now contains the additional greek letters added in the configuration above.

{@snippet features/special-characters-extended-category}

### Removing categories

The special characters feature exposes each category as a separate plugin. While the {@link module:special-characters/specialcharactersessentials~SpecialCharactersEssentials} plugin can be used to conveniently include all of them, you can customize the category list by adding individual plugins with particular categories.

By default, the `@ckeditor/ckeditor5-special-characters` package provides special characters grouped into the following categories:

* {@link module:special-characters/specialcharactersarrows~SpecialCharactersArrows} &ndash; Arrows special characters.
* {@link module:special-characters/specialcharacterscurrency~SpecialCharactersCurrency} &ndash; Currency special characters.
* {@link module:special-characters/specialcharacterslatin~SpecialCharactersLatin} &ndash; Latin special characters.
* {@link module:special-characters/specialcharactersmathematical~SpecialCharactersMathematical} &ndash; Mathematical special characters.
* {@link module:special-characters/specialcharacterstext~SpecialCharactersText} &ndash; Text special characters.
* {@link module:special-characters/specialcharactersessentials~SpecialCharactersEssentials} &ndash; Combines the plugins listed above.

For example, you can limit the categories to "Mathematical" and "Currency" only by picking the {@link module:special-characters/specialcharactersmathematical~SpecialCharactersMathematical} and {@link module:special-characters/specialcharacterscurrency~SpecialCharactersCurrency} plugins, like so:

```js
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency';
import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			SpecialCharacters, SpecialCharactersCurrency, SpecialCharactersMathematical,

			// More plugins.
			// ...
		],
		toolbar: [ 'specialCharacters', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Below, you can see a demo based on the example shown above. After clicking the special character icon in the editor toolbar you can see that it contains fewer categories compared to other editors on this page.

{@snippet features/special-characters-limited-categories}

### Ordering categories

The order of categories in the UI is determined by the order in which they were registered. However, depending on the context in which you use the editor, you might want to change this order, to make it easier to access frequently used characters.

The categories order can be customized using the {@link module:special-characters/specialcharacters~SpecialCharactersConfig#order `order`} array.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SpecialCharacters, SpecialCharactersEssentials, ... ],
		specialCharacters: {
			order: [
				'Text',
				'Latin',
				'Mathematical',
				'Currency',
				'Arrows'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

## Installation

<info-box info>
	The special characters feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-special-characters`](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters) package:

```plaintext
npm install --save @ckeditor/ckeditor5-special-characters
```

And add it to your plugin list configuration:

```js
// Core plugin that provides the API for the management of special characters and their categories.
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
// A plugin that combines a basic set of special characters.
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SpecialCharacters, SpecialCharactersEssentials, /* ... */ ],
		toolbar: [ 'specialCharacters', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:special-characters/specialcharacters~SpecialCharacters} plugin registers the UI button component (`'specialCharacters'`).

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available at GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-special-characters](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-special-characters).
