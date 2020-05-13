---
category: framework-deep-dive
---

# Localization

## Introduction

All CKEditor 5 WYSIWYG editor features support message localization. It means that the user interface of any feature can be translated into various languages and regions depending on the user's preferences.

CKEditor 5 translation system is open to third-party plugins. Any custom features that you introduce can be localized. The system also provides a way to add missing or overwrite existing translations and supports translating plural forms.

<info-box warning>
	Make sure to use up-to-date CKEditor 5 development tool packages. Versions of the tools older than v19.0.1 do not provide support for features described in this guide.
</info-box>

### Open API

The CKEditor 5 localization system focuses on the following points:

- Adding support for localizing third-party plugins.
- Allowing passing your own translations to fix missing or invalid localizations.
- Generating deterministic builds.
- Exposing easy-to-use APIs for providing translations and writing localizable content.
- Supporting plural forms in each step of the localization system for more fluent translations.

### Glossary of terms

Before we start, let us explain the meaning of terms that are crucial for the translation process:

- *A message* &ndash; A string or an object that should be translated.
	The string version works as a shortcut for the `{ id: message, string: message }` object form.
- *A message ID* &ndash; A property used to distinguish messages.
	It is useful for short messages where a collision might occur, like `%0 images`.
- *A message string* &ndash; The default (English) form of the message.
	When the message is supposed to support plural versions, this is the default singular version.
- *A message plural* &ndash; An optional plural (English) version of the message.
	The presence of this property indicates that the message should support both singular and plural forms.
- *A PO file (`.po`)* &ndash; A file containing translations for the language in the [PO format](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html).
	All CKEditor 5 localizable packages contain such files in the `lang/translations/` directory.
- *A POT file (`.pot`)* &ndash; A file containing source messages (English sentences) that will be translated.
- *A translation asset* &ndash; A JavaScript file or part of the file with generated translations for one language.

## Writing a localizable UI

All *messages* that need localization should be passed to the special CKEditor 5's {@link module:utils/locale~Locale#t `t()` function}. This function can be retrieved from the editor's {@link module:utils/locale~Locale} instance: `const { t } = editor.locale;` or from any view method: `const t = this.t;`.

As the first argument, the `t()` function accepts either a string literal or an object literal containing the `id`, `string` and `plural` (optional) properties. The string literal will serve as both the *message ID* and the *message string*.

As the second argument, the translation function accepts a value or an array of values. These values will be used to fill the placeholders in more advanced translation scenarios. If the `plural` property is specified, the first value will be used as the quantity determining the plural form.

<info-box warning>
	Note that the `t()` function should not be used as a method of the `Locale` class because during the translation process a static code analyzer catches *localizable messages* only from function forms. For the same reason its first argument accepts only a string literal or an object literal. `Locale#t()` method calls and incompatible expressions passed to the `t()` calls will produce build-time warnings.
</info-box>

When using the `t()` function, you can create your own *localizable messages* or reuse *messages* created in CKEditor 5 packages that your project depends on. In case of reusing *messages*, you will not need to worry about translating them as all work will be done by the CKEditor 5 team and [Transifex translators](https://www.transifex.com/ckeditor/ckeditor5/). Obviously, your help in translating will still be appreciated!

For simple *localizable messages*, use the string form for simplicity:

```js
const emojiName = 'cat';

// Assuming that the English language was picked:
t( 'insert emoji' ); // "insert emoji"
t( 'insert %0 emoji', emojiName ); // "insert cat emoji"
t( 'insert %0 emoji', [ emojiName ] ); // "insert cat emoji"
```

For more advanced scenarios, use plain object forms:

```js
const quantity = 3;

// Assuming that the English language was picked:
t( { string: '%0 emoji', id: 'INSERT_EMOJI' }, 'insert' ); // "insert emoji"
t( { string: '%0 emoji', plural: '%0 emojis', id: 'EMOJI' }, quantity ); // "3 emojis"
t( { string: '%1 %0 emoji', plural: '%1 %0 emojis', id: 'INSERT_EMOJIS' }, [ quantity, 'Insert' ] ); // "Insert 3 emojis"
```

### Example: Localizing the plugin UI

This example shows how to create a localizable user interface of a plugin. Let's create a button that will insert smiling face emoji. The button will have a localizable tooltip.

```js
// ...
editor.ui.componentFactory.add( 'smilingFaceEmoji', locale => {
	const buttonView = new ButtonView( locale );

	// The translation function.
	const { t } = editor.locale;

	// The localized label.
	const label = t( 'Insert smiling face emoji' );

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

<info-box warning>
	See {@link framework/guides/creating-simple-plugin how to create a complete plugin} to have a better understanding about creating CKEditor 5 plugins.
</info-box>

### Example: Localizing pending actions

{@link module:core/pendingactions~PendingActions Pending actions} are used to inform the user that an action is in progress and they will lose data if they exit the editor at the given moment. Here is how you can localize them:

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

## Adding translations and localizing the editor UI

First of all, if you have found a missing or incorrect translation in any of CKEditor 5 features, {@link framework/guides/contributing/contributing#translating see how you can contribute to the project}! CKEditor 5 is an Open Source project used by people from all around the world, so your help will be appreciated by others.

Adding translations to the editor can be done in three ways to satisfy various needs.

- By [adding translations via the translation-service's `add()` function](#using-the-add-function).
	This can be done before initiating the CKEditor 5 editor instance but it requires importing the CKEditor 5 utility function.
- By [extending the global `window.CKEDITOR_TRANSLATIONS` object](#using-the-windowckeditor_translations-object).
	This can be done before initiating the CKEditor 5 editor instance.
- By [creating `.po` files with translations](#creating-po-files) in the `lang/translations/` directory of the published package like other CKEditor 5 packages do.
	This option will be useful for third-party plugin creators as it allows bundling translations only for needed languages during the webpack compilation.

### Using the `add()` function

The first option for adding translations is via {@link module:utils/translation-service.add the translation-service's `add()` helper}. This utility adds translations to the `window.CKEDITOR_TRANSLATIONS` object by extending it. Since it needs to be imported, it works only before building the editor.

Starting with the CKEditor 5 v19.0.0 release, it now accepts the `getPluralForm()` function as the third argument. It also accepts an array of translations for a *message* if the *message* should support singular and plural forms.

```js
add( 'pl', {
	'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
} );

// Assuming that the Polish language was picked:
t( { string: 'Add space', plural: 'Add %0 spaces' }, 1 ) // "Dodaj spację"
t( { string: 'Add space', plural: 'Add %0 spaces' }, 2 ) // "Dodaj 2 spacje"
t( { string: 'Add space', plural: 'Add %0 spaces' }, 5 ) // "Dodaj 5 spacji"
```

### Using the `window.CKEDITOR_TRANSLATIONS` object

The second option is adding translations via the global `window.CKEDITOR_TRANSLATIONS` object.

For each language that should be supported, the `dictionary` property of this object should be extended and the `getPluralForm` function should be provided if missing.

The `dictionary` property is a `message ID ⇒ translations` map, where the `translations` can be either one sentence (a string) or an array of translations with plural forms for the given language if the message should support plural forms as well.

The `getPluralForm` property should be a function that returns the plural form index for a given quantity. Note that when using CKEditor 5 translations, this property will be defined by *CKEditor 5 translation assets*.

Check an example below that demonstrates a part of the `window.CKEDITOR_TRANSLATIONS` object with Polish translations for the `Cancel` and `Add space` *message IDs*:

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
		// Note that you only need to pass this function when you add translations for new language.
		getPluralForm: n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2
	}
	// Other languages...
}
```

If you add a new language, remember to set the `getPluralForm` function which should return a number (or a Boolean for languages with simple plural rules like English) that indicates which form should be used for which value.

### Creating `.po` files

The third option of adding plugins should fit mostly owners of plugins that contain many localizable messages. Using this option you need to create a `.po` file per each language code in the `lang/translations/` directory containing translations that follow the [PO file format](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html).

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
	Note that the [CKEditor webpack plugin](https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-webpack-plugin) is configured to parse by default only the CKEditor 5 source code when looking for *localizable messages* and generating *translation assets*.

	If you develop your own plugin outside the CKEditor 5 ecosystem and localize it by creating *PO files*, you should override both the `sourceFilesPattern` and the `packageNamePattern` options to allow the CKEditor webpack plugin to analyze the code and find *messages* with corresponding translations. You should also mention these webpack plugin changes in your package README to make other users build the localized CKEditor 5 editor with your plugin correctly. This obstacle may be simplified in the future when the localization feature gets more popular.
</info-box>

To build and configure a localized editor, follow the steps from the {@link features/ui-language Setting the UI language guide}.

## Known limitations

- Currently it is impossible to change the chosen editor's language at runtime without destroying the editor.
- Currently it is impossible to add more than one language to the bundle using the the CKEditor webpack plugin. In case where multiple *translation assets* should be added to the application, they should be added using the `<script>` tags or imports to the generated *translation assets*.
