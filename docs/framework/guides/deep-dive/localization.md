---
category: framework-deep-dive
---

# Localization

## Introduction

The CKEditor 5 ecosystem support message localization. It means that the UI of any feature can be translated for various languages and regions depending on the user's preferences. Starting with the 19.0.0 release of the CKEditor 5 packages and CKEditor 5 dev tools we opened the translation system for 3rd-party plugins, provided a way for adding missing or fixing invalid translations to the editor and we introduced support for translating plural forms.

<info-box warning>
	Make sure to use up-to-date CKEditor 5 dev-tool packages. Older versions of developer tools do not provide support for features described in this guide.
</info-box>

### Open API

The CKEditor 5 localization system focuses on the following points:

- adding support for localizing 3rd-party plugins,
- allowing passing own translations for fixing missing or invalid translations,
- generating deterministic builds,
- exposing easy-to-use APIs for providing translations and writing localizable content,
- supporting plural forms in each step of the localization system for more fluent translations.

### Glossary of terms

Before we start, let's explain the meaning of terms that are crucial for the translation process:

- *message* - a string or an object that should be translated, the string version works as a shortcut for the `{ id: message, string: message }` object form,
- *message ID* - a property used to distinguish messages, useful for short messages, where a collision can occur, like `%0 images`,
- *message string* - the default (English) form of the message, the default singular version when the message is supposed to support plural versions,
- *message plural* - an optional plural (English) version of the message, the presence of this property indicates that the message should support both, singular and plural forms,
- *PO file (.po)* - A file containing translations for the language in the [PO format](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html). All CKEditor 5 localizable packages contain such files in the `lang/translations/` directory.
- *POT file (.pot)* - A file containing source messages (English sentences) that will be translated,
- *translation asset* - a JS file or part of the file with generated translations for one language.

## Writing localizable UI

All *messages* needing localization should be passed to the special CKEditor 5's `t()` function. This function can be retrieved from the editor's `locale` instance: `const { t } = editor.locale;` or from any view method `const t = this.t;`

The `t()` function as the first argument accepts either a string literal, which will be at the same time the *message ID* and the message string or an object literal containing `id`, `string`, and optional `plural` property.

As the second argument, the translation function accepts a value or an array of values. These "values" will be used to fill the placeholders in the more advanced translation scenarios. And if the `plural` property is specified then the first value will be used as quantity determining the plural form.

When using the `t()` function, you can create your own *localizable messages* or reuse *messages* created in CKEditor 5 packages your project depends on. In case of reusing *messages*, you won't have to worry about translating them as all work will be done by the CKEditor 5 team and Transifex translators anyway (but your help in translating still will be appreciated).

For simple *localizable messages* use the string form for simplicity:

```js
const emojiName = 'cat';

// Let's assume that the English language was picked:
t( 'insert emoji' ); // "insert emoji"
t( 'insert %0 emoji', emojiName ); // "insert cat emoji"
t( 'insert %0 emoji', [ emojiName ] ); // "insert cat emoji"
```

For more advanced scenarios use plain objects forms:

```js
const quantity = 3;

// Let's assume that the English language was picked:
t( { string: '%0 emoji', id: 'INSERT_EMOJI' }, 'insert' ); // "insert emoji"
t( { string: '%0 emoji', plural: '%0 emojis', id: 'EMOJI' }, quantity ); // "3 emojis"
t( { string: '%1 %0 emoji', plural: '%1 %0 emojis', id: 'INSERT_EMOJIS' }, [ quantity, 'Insert' ] ); // "Insert 3 emojis"
```

<info-box warning>
	Note that the `t()` function should not be used as the `Locale` class method because during the translation process a static code analyzer catches *localizable messages* only from function forms. For the same reason its first argument accepts only a string literal or an object literal. `Locale#t()` method calls and incompatible expressions passed to the `t()` calls will produce build-time warnings.
</info-box>

### Examples

#### Localizing UI of plugins:

```js
// ...
editor.ui.componentFactory.add( 'smilingFaceEmoji', locale => {
	const command = editor.commands.get( 'insertSmilingFaceEmoji' );
	const buttonView = new ButtonView( locale );

	// The translation function.
	const { t } = editor.locale;

	// The localized label.
	const label = t( 'insert smiling face emoji' );

	buttonView.set( {
		label,
		icon: emojiIcon,
		tooltip: true
	} );

	buttonView.on( 'execute', () => {
		editor.execute( 'insertSmilingFaceEmoji' );
		editor.editing.view.focus();
	} );
} );
// ...
```

#### Localizing aria attributes:

```js
editingView.change( writer => {
	const editingView = this._editingView;
	const t = this.t;

	editingView.change( writer => {
		const viewRoot = editingView.document.getRoot( this.name );

		writer.setAttribute( 'aria-label', t( 'Rich Text Editor, %0', [ this.name ] ), viewRoot );
	} );
} );
```

#### Localizing pending actions

Pending actions are used to inform the user that the action is in progress and we will lost data while exiting the editor - see {@link module:core/pendingactions~PendingActions the `PendingActions` class}.

```js
class FileRepository {
	// ...
	updatePendingAction() {
		// ...
		const pendingActions = this.editor.plugins.get( PendingActions );

		// ...
		const t = this.editor.t;
		const getMessage = value => t( 'Upload in progress (%0%).', value ); // Upload in progress (12%).

		this._pendingAction = pendingActions.add( getMessage( this.uploadedPercent ) );
		this._pendingAction.bind( 'message' ).to( this, 'uploadedPercent', getMessage );
	}
}
```

<info-box warning>
	Note that these samples lacks a few parts. Check {@link framework/guides/creating-simple-plugin how to create a complete plugin} to have a better understanding about creating CKEditor 5 plugins.
</info-box>

## Adding translations and localizing the editor UI

First of all, if you have found a missing or an incorrect translation in the CKEditor 5 translations, {@link framework/guides/contributing/contributing#translating check how you can contribute to the project}! Your help will be appreciated by others!

Adding translations to the editor can be done in three ways to satisfy various needs.

- by adding translations via {@link module:utils/translation-service.add the translation-service's `add()` function} - it can be done before initiating the CKEditor 5 editor instance, but requires importing a CKEditor 5 utility function,
- by extending the global `window.CKEDITOR_TRANSLATIONS` object - it can be done before initiating the CKEditor 5 editor instance,
- by creating `.po` files with translations in the `lang/translations/` directory of the published package like other CKEditor 5 packages do - this option will be useful for 3rd-party plugin creators as this allows bundling translations only for needed languages during the webpack compilation.

The first option of adding translations is via the {@link module:utils/translation-service.add the translation-service's `add()` helper}. This utility adds translations to the `window.CKEDITOR_TRANSLATIONS` object by extending it. Since it needs to be imported It works only before building the editor. Starting with the 19.0.0 release, it started accepting the `getPluralForm` function as the third argument and started accepting an array of translations for a *message* if the *message* should support singular and plural forms.

```js
add( 'pl', {
	'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
} );

// Let's assume that the Polish language was picked:
t( { string: 'Add space', plural: 'Add %0 spaces' }, 1 ) // "Dodaj spację"
t( { string: 'Add space', plural: 'Add %0 spaces' }, 2 ) // "Dodaj 2 spacje"
t( { string: 'Add space', plural: 'Add %0 spaces' }, 5 ) // "Dodaj 5 spacji"
```

The second option is adding translations via the `window.CKEDITOR_TRANSLATIONS` object. For each language that should be supported, the `dictionary` property of this object should be extended and the `getPluralForm` function should be provided if missing. The `dictionary` property is a `message ID ⇒ translations` map, where the `translations` can be either one sentence (a string) or an array of translations with plural forms for the given language if the message should support plural forms as well. The `getPluralForm` property should be a function that for given quantity returns the plural form index. Note that while using CKEditor 5 translations this property will be defined by *CKEditor5 translation assets*.

Let's check an example below that demonstrate a part of the `window.CKEDITOR_TRANSLATIONS` object with Polish translations for the `Cancel` and `Add space` *message IDs*:

```js
{
	// Each key should be a valid language code.
	pl: {
		// A map of translations for the 'pl' language.
		dictionary: {
			'Cancel': 'Anuluj',
			'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
		},

		// A function that returns the plural form index for the given language.
		// getPluralForm: n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2
	}
	// Other languages...
}
```

If you add a new language, remember to set the `getPluralForm` function which should return a number (or a boolean for languages with simple plural rules like English) that indicates which form should be used for which value.

The 3rd option of adding plugins should fit mostly plugin owners containing many localizable messages. Using that option you need to create a `.po` file per each language code in the `lang/translations/` directory containing translations that follow the [PO file format](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html).

```
# lang/translations/es.po

msgid ""
msgstr ""
"Language: es\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\n"

msgid "Align left"
msgstr "Alinear a la izquierda"
```

<info-box warning>
	Note that the [CKEditorWebpackPlugin](https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-webpack-plugin) is configured to parse by default only the CKEditor 5 source code when looking for *localizable messages* and generating *translation assets*. If you develop your own plugin outside of CKEditor 5 ecosystem and localize it via creating *PO files*, you should override both, the `sourceFilesPattern` and the `packageNamePattern` options to allow `CKEditorWebpackPlugin` analyzing the code and finding *messages* with corresponding translations. You should also mention these webpack plugin changes in your package README to make other users build the localized CKEditor 5 editor with your plugin correctly. This obstacle may be simplified in the future when the localization feature gets more popular.
</info-box>

To build and configure the localized editor follow the steps from the {@link features/ui-language Setting UI language guide}.

## Known limitations

- Currently it is impossible to change the chosen editor's language at a runtime without destroying the editor.
- Currently it is impossible to add more than one language to the bundle using the `CKEditorWebpackPlugin`. In case where multiple *translation assets* should be added to the application, they should be added using the `<script>` tags or imports to the generated *translation assets*
