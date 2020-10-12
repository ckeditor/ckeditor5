---
category: features
menu-title: Spelling and grammar checking
---

# Proofreading, spelling and grammar checking

<info-box>
	The spell checker for CKEditor 5 is a commercial solution provided by our partner, [WebSpellChecker](https://webspellchecker.com/). You can report any issues in its [GitHub repository](https://github.com/WebSpellChecker/wproofreader). The license can be purchased [here](https://ckeditor.com/contact/).
</info-box>

[WProofreader](https://webspellchecker.com/wsc-proofreader) is an innovative proofreading tool that combines the functionality of "spell check as you type" and "spell check in a dialog" in a modern, distraction-free UI. Spelling and grammar suggestions are available on hover with no clicking needed.

## Demo

Click in the editor below to enable the spelling and grammar checking. Hover an underlined word to display the proofreader suggestions for any of the spelling and grammar mistakes found.

The proofreader badge in the bottom right-hand corner shows you the number of mistakes detected. It also gives you access to proofreader settings. If you want to see an overview of all spelling and grammar mistakes, click the "Proofread in dialog" icon in the badge.

{@snippet features/wproofreader}

## Supported languages

By default the spell checker supports 17 languages: American English, British English, Brazilian Portuguese, Canadian English, Canadian French, Danish, Dutch, Finnish, French, German, Greek, Italian, Norwegian Bokmal, Portuguese, Spanish, Swedish and Ukrainian. Grammar checking is available for 15 of them &mdash; there is no grammar checking for Finnish and Norwegian.

There are also over 150 additional languages and specialized dictionaries such as medical and legal available for an additional fee. You can check the full list [here](https://webspellchecker.com/additional-dictionaries/).

## Installation

WProofreader is delivered as a CKEditor 5 plugin, so it could be combined into an editor build as other features. To add this feature to your rich-text editor, install the [`@webspellchecker/wproofreader-ckeditor5`](https://www.npmjs.com/package/@webspellchecker/wproofreader-ckeditor5) package:

```bash
npm install --save @webspellchecker/wproofreader-ckeditor5
```

Then, add it to your plugin list:

```js
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';
// ...

ClassicEditor
	.create( editorElement, {
		plugins: [ ..., WProofreader ],
		// ...
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
// ...

ClassicEditor
	.create( editorElement, {
		plugins: [ ..., WProofreader ],
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
// ...

ClassicEditor
	.create( editorElement, {
		plugins: [ ..., WProofreader ],
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

WProofreader configuration is set inside the CKEditor 5 configuration in `wproofreader` object. Refer to the [WProofreader API](https://webspellchecker.com/docs/api/wscbundle/Options.html) for further information.

## Contribute

You can report issues and request features in the [official WProofreader for CKEditor 5 repository](https://github.com/WebSpellChecker/wproofreader-ckeditor5/issues).
