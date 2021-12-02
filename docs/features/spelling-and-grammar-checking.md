---
category: features
menu-title: Spelling and grammar checking
modified_at: 2021-05-07
badges: [ premium ]
---

# Proofreading, spelling and grammar checking

<info-box>
	The spell checker for CKEditor 5 is a commercial solution provided by our partner, [WebSpellChecker](https://webspellchecker.com/). You can report any issues in its [GitHub repository](https://github.com/WebSpellChecker/wproofreader). The license can be purchased [here](https://ckeditor.com/contact/).
</info-box>

[WProofreader](https://webspellchecker.com/wsc-proofreader) is an innovative, multi-language proofreading tool that combines the functionality of "spell check as you type" and "spell check in a dialog" in a modern, distraction-free UI. Spelling, punctuation and grammar suggestions are available on hover with no clicking needed or as a convenient dialog, both with additional in-place replacement suggestions.

You can fine-tune the spell checking rules via the dedicated settings menu. You can choose from a set of predefined languages (easily chosen and added as language packs) and manage additional custom dictionaries. Words can be added to the user dictionary directly from the suggestion card, too. If needed, the spell checker can be easily disabled and enabled again with a click.

After reading this guide, you may find additional interesting details and examples in the [Spell and grammar check in CKEditor 5](https://ckeditor.com/blog/feature-of-the-month-spell-and-grammar-check-in-ckeditor-5/) blog post.

## Demo

Use the toolbar button {@icon @webspellchecker/wproofreader-ckeditor5/theme/icons/wproofreader.svg Spelling and grammar check} to test the spelling and grammar checking feature in the editor below.

{@snippet features/wproofreader}

The proofreader badge in the bottom-right corner shows you the total number of mistakes detected. Hover an underlined word to display the proofreader suggestions for any of the spelling and grammar mistakes found. The hovercard allows the user to employ the feature on the go. If you want to see an overview of all mistakes, click the "Proofread in dialog" option in the toolbar dropdown. It will invoke a detached floating panel, easy to navigate and perfect for dedicated proofreading sessions.

You can access the proofreader settings from the toolbar, too. These can be used to set the language dictionary and some additional proofreading settings.

<info-box>
	The toolbar button has been introduced in version 2.x of the WProofreader. Read more about configuring UI items in the {@link features/toolbar toolbar guide}. If you are still using version 1.x, the available settings and dialog options can be accessed through the bottom-right corner badge instead.
</info-box>

## Multi-language support

The {@link features/language text part language} feature lets the user set different languages to different portions of the content. The spell checking and grammar feature offers full support for such a multilingual content. If the proofreader language is set to Auto Detect (or the `auto` language is set in the configuration), the feature will automatically recognize the text language and suggest error corrections and grammar specifically for that language, as shown in the demo above.

{@img assets/img/spellcheck-dictionary.png 770 Setting the spell checker dictionary to auto.}

## Supported languages and dictionaries

### Language support

The most popular languages used with WProofreader include: American English, British English, Canadian English, Canadian French, French, German, Italian, Greek, Spanish, Finnish, Danish, Dutch, Portuguese, Swedish, Ukrainian, Norwegian Bokmål, Brazilian Portuguese. There are, however, over 160 languages altogether, available for download from the WebSpellChecker site. Grammar checking is available for over 20 languages.

A recent addition to the software are AI-driven tools. Smart algorithms employed in the AI-based language dictionaries offer a far better checking quality, generating proofreading suggestions based on the context of the sentence. They provide more suitable suggestions that address mistakes with thrice the accuracy of traditional dictionaries. The AI-based support is currently available for English and German.

Here you can check the [full list of available languages](https://webspellchecker.com/additional-dictionaries/).

### Custom dictionaries

Apart from the language dictionaries, WebSpellChecker offers two specialized dictionaries: a **medical** and a **legal** one, available for an additional fee.

There are also two types of custom dictionaries available.

One is the **user dictionary** that can be expanded and will grow during the regular use of the feature simply by adding new words to the dictionary. This is a perfect solution for editors and writers working on specific content that may contain slang or professional jargon.

The other is the so-called **company-wide dictionary**. These premade dictionaries can be uploaded by the system administrators or CKEditor 5 integrators and can be made available company-wide, accessible for all users. This way all benefits of a user-generated dictionary can be shared among the team, making the proofreading process more structured and controlled.

## Accessibility

The feature's UI is designed and oriented toward the comfort and ease of use. The proofreading floating dialog can be easily moved around, addressing the needs of left-handed editors and right-to-left language users. The clear, simple design is more readable for users with vision impairments. The dialog can also be navigated and operated with keyboard, eliminating the need to use a mouse or another pointing device.

The feature is compliant with WCAG 2.1 and Section 508 accessibility standards.

## Installation

WProofreader is delivered as a CKEditor 5 plugin, so it can be combined into an editor build as other features. To add this feature to your rich-text editor, install the [`@webspellchecker/wproofreader-ckeditor5`](https://www.npmjs.com/package/@webspellchecker/wproofreader-ckeditor5) package:

```
npm install --save @webspellchecker/wproofreader-ckeditor5
```

Then, add it to your plugin list and the toolbar configuration:

```js
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

ClassicEditor
	.create( editorElement, {
		plugins: [ ..., WProofreader ],
		toolbar: [ ..., 'wproofreader' ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

At this step, it is required to provide a proper configuration. The proofreader can be used either as a [cloud solution](#wproofreader-cloud) or [hosted on your own server](#wproofreader-server).

### WProofreader Cloud

After signing up for a [trial or paid version](https://ckeditor.com/contact/), you will receive your service ID which is used to activate the service.

Add the following configuration to your editor:

```js
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

ClassicEditor
	.create( editorElement, {
		plugins: [ ..., WProofreader ],
		toolbar: [ ..., 'wproofreader' ]
		wproofreader: {
			serviceId: 'your-service-ID',
			srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
		}
	} )
```

Refer to the [official documentation](https://github.com/WebSpellChecker/wproofreader-ckeditor5#install-instructions) for more details about the cloud setup and available configuration options.

### WProofreader Server

After signing up for a [trial or paid version](https://ckeditor.com/contact/), you will receive access to the WebSpellChecker Server package to install on your own server.

You will need to add the following configuration to your editor:

```js
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

ClassicEditor
	.create( editorElement, {
		plugins: [ ..., WProofreader ],
		toolbar: [ ..., 'wproofreader' ]
		wproofreader: {
			serviceProtocol: 'https',
			serviceHost: 'localhost',
			servicePort: '2880',
			servicePath: '/',
			srcUrl: 'https://host_name/virtual_directory/wscbundle/wscbundle.js'
		}
	} )
```

Refer to the [official documentation](https://github.com/WebSpellChecker/wproofreader-ckeditor5#install-instructions) for more details about the server setup and available configuration options.

## Configuration

WProofreader configuration is set inside the CKEditor 5 configuration in the `wproofreader` object. Refer to the [WProofreader API](https://webspellchecker.com/docs/api/wscbundle/Options.html) for further information.

## Contribute

You can report issues and request features in the [official WProofreader for CKEditor 5 repository](https://github.com/WebSpellChecker/wproofreader-ckeditor5/issues).
