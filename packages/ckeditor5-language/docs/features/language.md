---
category: features
menu-title: Language
---

# Text Part Language

The {@link module:language/textpartlanguage~TextPartLanguage} feature makes working with multilingual content very convenient by providing the ability to set the text direction as well as mark the language of selected text fragments.

This ensures that user agents can correctly present content written in multiple languages.

The feature is especially useful when your text content includes text parts written in different text directions, e.g. when the whole content is written in English but includes some citations in Arabic.

The text part language feature implements [WCAG 3.1.2 Language of Parts](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html) specification.

## Demo

Use the editor below to see the text part language plugin in action.

{@snippet features/textpartlanguage}

## Related features

Here are some other CKEditor 5 features that also affects editor language:

* {@link features/ui-language UI Language}  &ndash; Set the UI language.

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-langauge`](https://www.npmjs.com/package/@ckeditor/ckeditor5-langauge) package:

```plaintext
npm install --save @ckeditor/ckeditor5-langauge
```

And add it to your plugin list configuration:

```js
import TextPartLanguage from '@ckeditor/ckeditor5-langauge/src/textpartlanguage';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ TextPartLanguage, ... ],
		toolbar: [ 'textPartLanguage', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:langauge/textpartlanguage~TextPartLanguage} plugin registers:

* the `'textPartLanguage'` UI dropdown component implemented by the {@link module:langauge/textpartlanguageui~TextPartLanguageUI text part language UI feature},
* the `'textPartLanguage'` command implemented by the {@link module:langauge/textpartlanguageediting~TextPartLanguageEditing text part language editing feature}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Applies language to the selected text part with the given language code.
editor.execute( 'textPartLanguage', { languageCode: 'es' } );

// Optionally, you can also provide text direction information ('ltr' or 'rtl'),
// however, note that the feature will resolve text direction by itself, so in most
// cases this option is redundant.
editor.execute( 'textPartLanguage', {
	languageCode: 'ar',
	textDirection: 'rtl' // Optional text direction.
} );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-language.
