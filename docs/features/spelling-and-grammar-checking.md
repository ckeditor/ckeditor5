---
category: features
menu-title: Spelling and grammar checking
---

# Proofreading, spelling and grammar checking

<info-box>
	The spell checker for CKEditor 5 is a commercial solution provided by our partner, [WebSpellChecker](https://webspellchecker.com/). You can report any issues in its [GitHub repository](https://github.com/WebSpellChecker/wproofreader). The license can be purchased [here](https://ckeditor.com/contact/).
</info-box>

[WProofreader](https://webspellchecker.com/wsc-proofreader) is an innovative, multi-language proofreading tool that combines the functionality of "spell check as you type" and "spell check in a dialog" in a modern, distraction-free UI. Spelling and grammar suggestions are available on hover with no clicking needed or as a convenient dialog, both with additional in-place replacement suggestions.

You can fine-tune the spell checking rules via the dedicated settings menu. You can choose from a set of predefined languages (more may be added as language packs) and manage additional dictionaries. Words can be added to the user dictionary directly from the suggestion card, too.

If needed, the spell checker can be easily disabled and enabled again with a click.

## Demo

See the spelling and grammar checking in the editor below.

The proofreader badge in the bottom-right corner shows you the number of mistakes detected. Hover an underlined word to display the proofreader suggestions for any of the spelling and grammar mistakes found. If you want to see an overview of all mistakes, click the "Proofread in dialog" option in the toolbar dropdown. You can access the proofreader settings from the toolbar, too.

<info-box>
	The toolbar button has been introduced in version 2.x of the WProofreader. Read more about configuring UI items in the {@link features/toolbar toolbar guide}. If you are still using version 1.x, the available settings and dialog options can be accessed through the bottom-right badge.
</info-box>

{@snippet features/wproofreader}

## Supported languages

By default the spell checker supports 18 languages: AI-based English (default), American English, Brazilian Portuguese, British English, Canadian English, Canadian French, Danish, Dutch, Finnish, French, German, Greek, Italian, Norwegian Bokmål, Portuguese, Spanish, Swedish and Ukrainian. Grammar checking is available for 16 of them &mdash; there is no grammar checking for Finnish and Norwegian.

There are also over 150 additional languages and specialized dictionaries such as medical and legal available for an additional fee. You can check the full list [here](https://webspellchecker.com/additional-dictionaries/).

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
