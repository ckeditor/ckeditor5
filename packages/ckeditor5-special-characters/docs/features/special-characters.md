---
category: features
menu-title: Special characters
---

# Special characters

The {@link module:special-characters/specialcharacters~SpecialCharacters} plugin provides a possibility to insert a special character into the rich-text editor.

## Demo

Use the editor below to see the {@link module:special-characters/specialcharacters~SpecialCharacters} plugin in action.

{@snippet features/special-characters-source}

{@snippet features/special-characters}

## Special characters in the package

The `@ckeditor/ckeditor5-special-characters` package provides a few basic special characters grouped into the following categories:

- {@link module:special-characters/specialcharactersarrows~SpecialCharactersArrows} – arrows special characters,
- {@link module:special-characters/specialcharacterscurrency~SpecialCharactersCurrency} - currency special characters,
- {@link module:special-characters/specialcharacterslatin~SpecialCharactersLatin} – Latin special characters,
- {@link module:special-characters/specialcharactersmathematical~SpecialCharactersMathematical} – Mathematical special characters,
- {@link module:special-characters/specialcharacterstext~SpecialCharactersText} – Text special characters
- {@link module:special-characters/specialcharactersessentials~SpecialCharactersEssentials} – combining plugins listed above.

## Adding a new special character category

By using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function, you can define a new special characters category.

<info-box warning>
    The "All" category name is reserved by the plugin and cannot be used as a new name for special characters category.
</info-box>

Let's create a simple plugin that provides the `Emoji` category in the special characters dropdown.

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SpecialCharactersEmoji extends Plugin {
	static get pluginName() {
		return 'SpecialCharactersEmoji';
	}

	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Emoji', [
			{ title: 'smiley face', character: '😊' },
			{ title: 'rocket', character: '🚀' },
			{ title: 'basketball', character: '🏀' },
			{ title: 'floppy disk', character: '💾' },
			{ title: 'hearth', character: '❤' }
		] );
	}
}
```

After adding the above plugin into the editor, the new special characters category will be available in the dropdown.

<info-box warning>
    A title of a special character must be unique across the entire special characters set.
</info-box>

### Custom special characters category demo

Use the special character icon in the editor's toolbar then select `Emoji` in the select dropdown in order to insert a emoji into the editor.

{@snippet features/special-characters-new-category}

## Adding a new special characters to existing category

By using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function, you can also add new special characters into existing category.

```js
class SpecialCharactersArrowsExtended extends Plugin {
	static get pluginName() {
		return 'SpecialCharactersArrowsExtended';
	}

	init() {
        // The `Arrows` category is provided by the `SpecialCharactersArrows` plugin.
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
			{ title: 'simple arrow left', character: '←' },
			{ title: 'simple arrow up', character: '↑' },
			{ title: 'simple arrow right', character: '→' },
			{ title: 'simple arrow down', character: '↓' }
		] );
	}
}
```

<info-box warning>
    A title of a special character must be unique across the entire special characters set.
</info-box>

### Extending existing special characters category category demo

Use the special character icon in the editor's toolbar then select `Arrows` in the select dropdown in order to add new arrows.

{@snippet features/special-characters-extended-category}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-special-characters`](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters) package:

```plaintext
npm install --save @ckeditor/ckeditor5-special-characters
```

And add it to your plugin list configuration:

```js
// The plugin provides API for management special characters and their categories.
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';

// `SpecialCharacters` does not provide any special character. They are delivered by another plugins.
// You can import those ones that you want to use in the editor.
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency';
import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical';
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows';
import SpecialCharactersLatin from '@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext';

// Or import the plugin combining basic set of characters. The imports above can be replaced with the `SpecialCharactersEssentials` plugin.
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SpecialCharacters, ... ],
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

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-special-characters.
