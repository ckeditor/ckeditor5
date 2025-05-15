---
category: features
menu-title: Special characters
meta-title: Special characters | CKEditor 5 Documentation
---

# Special characters

The special characters feature lets you insert **mathematical operators**, **currency symbols**, **punctuation**, **graphic symbols** (such as arrows or bullets), or Unicode letters typically not accessible from the keyboard (such as **umlauts** or **other diacritics**). The feature also supports **emojis**.

## Demo

Use the special characters toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/special-characters.svg Special characters} in the editor below to open a [configurable](#configuration) panel with a table of selectable special characters.

{@snippet features/special-characters}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
// Core plugin provides the API for the management of special characters and their categories.
// The other provide a basic set of special characters.
import { ClassicEditor, SpecialCharacters, SpecialCharactersEssentials } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ SpecialCharacters, SpecialCharactersEssentials, /* ... */ ],
		toolbar: [ 'specialCharacters', /* ... */ ],
		specialCharacters: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

By default, a few categories of special characters have been defined. You can easily customize the special characters available in your WYSIWYG editor installation by adding new categories, extending the existing ones, or removing them altogether.

### Adding a new category

You can define a new special characters category using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function.

For example, the following plugin adds the "Emoji" category to the special characters dropdown.

```js
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
		// ... Other configuration options ...
		plugins: [
			SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersEmoji,
		],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

After adding the above plugin to the editor configuration, the new category will become available in the special characters dropdown.

<info-box>
	The title of a special character must be unique across the entire special characters set.
</info-box>

<info-box>
	The third argument of the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} method is optional. You can use it to specify a label displayed as a category name. It is useful when your editor uses a language other than English. Check out the {@link getting-started/setup/ui-language UI language guide} to learn more.
</info-box>

Below you can see a demo based on the example shown above. Use the special characters toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/special-characters.svg Special characters} and then select "Emoticons" from the dropdown. This will let you insert an emoji into the content.

{@snippet features/special-characters-new-category}

<info-box>
	You may also check out the ready-to-use {@link features/emoji Emoji feature} in order to quickly insert desired emoji into the document.
</info-box>

### Adding characters to an existing category

By using the {@link module:special-characters/specialcharacters~SpecialCharacters#addItems `SpecialCharacters#addItems()`} function you can also add new special characters to an existing category.

```js
function SpecialCharactersExtended( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Mathematical', [
		{ title: 'alpha', character: 'α' },
		{ title: 'beta', character: 'β' },
		{ title: 'gamma', character: 'γ' }
	] );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		plugins: [
			SpecialCharacters, SpecialCharactersEssentials, SpecialCharactersExtended,
		],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box>
	The title of a special character must be unique across the entire special characters set.
</info-box>

Below you can see a demo based on the example shown above. Use the special characters toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/special-characters.svg Special characters} and then select "Mathematical" from the dropdown. You will see that the category now contains the additional Greek letters introduced by the configuration above.

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

<code-switcher>
```js
import { ClassicEditor, SpecialCharacters, SpecialCharactersCurrency, SpecialCharactersMathematical } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		plugins: [
			SpecialCharacters, SpecialCharactersCurrency, SpecialCharactersMathematical,
		],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

Below you can see a demo based on the example shown above. After clicking the special characters toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/special-characters.svg Special characters}, you can see that it contains fewer categories compared to the other editors on this page.

{@snippet features/special-characters-limited-categories}

### Ordering categories

The order of categories in the UI is determined by the order in which they were registered. However, depending on the context in which you use the editor, you might want to change this order, to make it easier to access frequently used characters.

The categories order can be customized using the {@link module:special-characters/specialcharactersconfig~SpecialCharactersConfig#order `order`} array.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
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
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Common API

The {@link module:special-characters/specialcharacters~SpecialCharacters} plugin registers the UI button component (`'specialCharacters'`).

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available at GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-special-characters](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-special-characters).
