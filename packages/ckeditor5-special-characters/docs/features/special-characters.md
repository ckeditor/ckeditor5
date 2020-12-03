---
category: features
menu-title: Special characters
---

# Special characters

The {@link module:special-characters/specialcharacters~SpecialCharacters} plugin provides a possibility to insert a special character into the rich-text editor.

## Demo

Use the editor below to see the special characters plugin in action.

{@snippet features/special-characters-source}

{@snippet features/special-characters}

## Configuration

By default, a few categories of special characters have been defined. You can easily customize the special characters available in your WYSIWYG editor installation by adding new categories, extending the existing ones or removing them altogether.

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
	] );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersEmoji,

			// Other plugins...
		],
		toolbar: [ 'specialCharacters', ... ],
	} )
	.then( ... )
	.catch( ... );
```

After adding the above plugin to the editor configuration, the new category will become available in the special characters dropdown.

<info-box>
	The title of a special character must be unique across the entire special characters set.
</info-box>

Below you can see a demo based on the example shown above. Use the special characters icon in the editor toolbar and then select "Emoji" in the select dropdown in order to insert an emoji into the WYSIWYG editor.

{@snippet features/special-characters-new-category}

### Adding characters to an existing category

By using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function you can also add new special characters into an existing category.

```js
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

function SpecialCharactersArrowsExtended( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
		{ title: 'simple arrow left', character: '←' },
		{ title: 'simple arrow up', character: '↑' },
		{ title: 'simple arrow right', character: '→' },
		{ title: 'simple arrow down', character: '↓' }
	] );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersArrowsExtended,

			// Other plugins...
		],
		toolbar: [ 'specialCharacters', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box>
	The title of a special character must be unique across the entire special characters set.
</info-box>

Below, you can see a demo based on the example shown above. Use the special characters icon in the editor toolbar and then select "Arrows" in the select dropdown. You will see that the category now contains the additional arrow characters added in the configuration above.

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

			// Other plugins...
		],
		toolbar: [ 'specialCharacters', ... ],
	} )
	.then( ... )
	.catch( ... );
```

Below, you can see a demo based on the example shown above. After clicking the special character icon in the editor toolbar you can see that it contains fewer categories compared to other editors on this page.

{@snippet features/special-characters-limited-categories}

## Installation

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
		plugins: [ SpecialCharacters, SpecialCharactersEssentials, ... ],
		toolbar: [ 'specialCharacters', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:special-characters/specialcharacters~SpecialCharacters} plugin registers the UI button component (`'specialCharacters'`).

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-special-characters.
