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

## Configuration

### Adding a new special character category

You can define a new special characters category using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function.

For example, the following plugin adds the "Emoji" category in the special characters dropdown.

```js
function SpecialCharactersEmoji( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Emoji', [
		{ title: 'smiley face', character: '😊' },
		{ title: 'rocket', character: '🚀' },
		{ title: 'basketball', character: '🏀' },
		{ title: 'floppy disk', character: '💾' },
		{ title: 'hearth', character: '❤' }
	] );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersEmoji, ... ],
		toolbar: [ 'specialCharacters', ... ],
	} )
	.then( ... )
	.catch( ... );
```

After adding the above plugin into the editor, the new category will be available in the special characters dropdown.

<info-box>
	A title of a special character must be unique across the entire special characters set.
</info-box>

#### Adding special characters category demo

Use the special characters icon in the editor's toolbar then select "Emoji" in the select dropdown in order to insert a emoji into the editor.

{@snippet features/special-characters-new-category}

### Adding a new special characters to an existing category

By using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function, you can also add new special characters into existing category.

```js
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
		plugins: [ SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersArrowsExtended, ... ],
		toolbar: [ 'specialCharacters', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box>
	A title of a special character must be unique across the entire special characters set.
</info-box>

#### Extending an existing special characters category demo

Use the special characters icon in the editor's toolbar then select "Arrows" in the select dropdown. You'll see that it contains more arrows than the other instances.

{@snippet features/special-characters-extended-category}

### Removing special character categories

Special characters feature exposes each category as a separate plugin. While `SpecialCharactersEssentials` plugin can be used to conveniently include all of them, you can customize the category list by adding individual plugins.

The `@ckeditor/ckeditor5-special-characters` package provides special characters grouped into the following categories:

- {@link module:special-characters/specialcharactersarrows~SpecialCharactersArrows} – arrows special characters,
- {@link module:special-characters/specialcharacterscurrency~SpecialCharactersCurrency} - currency special characters,
- {@link module:special-characters/specialcharacterslatin~SpecialCharactersLatin} – Latin special characters,
- {@link module:special-characters/specialcharactersmathematical~SpecialCharactersMathematical} – Mathematical special characters,
- {@link module:special-characters/specialcharacterstext~SpecialCharactersText} – text special characters,
- {@link module:special-characters/specialcharactersessentials~SpecialCharactersEssentials} – combining plugins listed above.

For example, you can limit categories to "Mathematical" and "Currency" only by picking following plugins:

```js
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/SpecialCharactersCurrency';
import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/SpecialCharactersMathematical';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SpecialCharacters, SpecialCharactersCurrency, SpecialCharactersMathematical, ... ],
		toolbar: [ 'specialCharacters', ... ],
	} )
	.then( ... )
	.catch( ... );
```

#### Removing special character categories demo

After clicking special character icon in the editor's toolbar you can see that only few categories are available compared to other instances.

{@snippet features/special-characters-limited-categories}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-special-characters`](https://www.npmjs.com/package/@ckeditor/ckeditor5-special-characters) package:

```plaintext
npm install --save @ckeditor/ckeditor5-special-characters
```

And add it to your plugin list configuration:

```js
// Core plugin that provides the API for management special characters and their categories.
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
// Plugin that combines the basic set of special characters.
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

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-special-characters.
