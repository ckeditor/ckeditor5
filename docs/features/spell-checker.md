---
category: features
---

# Spelling and grammar checking

{@snippet build-classic-source}

<info-box>
	The spell checker for CKEditor 5 is a commercial solution provided by our partner, [WebSpellChecker](https://webspellchecker.com/). You can report any issues in its [GitHub repository](https://github.com/WebSpellChecker/wproofreader). The license can be purchased [here](https://ckeditor.com/contact/).
</info-box>

[WProofreader](https://webspellchecker.com/wsc-proofreader) is an innovative proofreading tool that combines the functionality of "spell check as you type" and "spell check in a dialog" in a modern, distraction-free UI. Spelling and grammar suggestions are available on hover with no clicking needed.

## Demo

Click in the editor below to enable the spelling and grammar checking. Hover an underlined word to display the proofreader suggestions for any of the spelling and grammar mistakes found.

The proofreader badge in the bottom right-hand corner shows you the number of mistakes detected. It also gives you access to proofreader settings. If you want to see an overview of all spelling and grammar mistakes, click the "Proofread in dialog" button in the badge.

{@snippet features/wproofreader}

## Supported languages

By default the spell checker supports 16 languages: American English, British English, Brazilian Portuguese, Canadian English, Canadian French, Danish, Dutch, Finnish, French, German, Greek, Italian, Norwegian Bokmal, Portuguese, Spanish and Swedish. Grammar checking is available for 14 of them &mdash; there is no grammar checking for Finnish and Norwegian.

There are also over 150 additional languages and specialized dictionaries such as medical and legal available for an additional fee. You can check the full list [here](https://webspellchecker.com/additional-dictionaries/).

## Installation

WProofreader is installed separately from CKEditor 5 and does not need to be combined into an editor build as other features. To use this tool, it is necessary to load the WProofreader script on your page and provide the configuration.

The proofreader can be used either as a [cloud solution](#wproofreader-cloud) or [hosted on your own server](#wproofreader-server).

The "Proofread in dialog" feature requires access to the editor instance to edit content. To grant access for WProofreader, it is necessary to link the editor's instance with the editable element. You can add the following configuration to the editor to use "Proofread in dialog":

```js
ClassicEditor
	.create(
		document.querySelector( '#editor' )
	)
	.then( ( editor ) => {
		editor.ui.getEditableElement( 'main' ).editor = editor;
	} );
```

### WProofreader Cloud

After signing up for a [trial](https://www.webspellchecker.net/signup/hosted-signup.html#webspellchecker-proofreader-trial) or [paid](https://www.webspellchecker.net/signup/hosted-signup.html#webspellchecker-proofreader-paid) version, you will receive your service ID which is used to activate the service.

Add the following configuration to your page:

```html
<script>
	window.WEBSPELLCHECKER_CONFIG = {
		autoSearch: true,
		enableGrammar: true,
		serviceId: 'your-service-ID'
	};
</script>
```

And then load the proofreader script:

```html
<script src="https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js"></script>
```

Refer to the [official documentation](https://github.com/WebSpellChecker/wproofreader#wproofreader-cloud) for more details about the cloud setup and available configuration options.

### WProofreader Server

After signing up for a [30-day trial](https://webspellchecker.com/free-trial/) version, you will receive access to the WebSpellChecker Server package to install on your own server.

You will need to specify the path to the service on your page:

```html
<script src="http(s)://your_host_name/spellcheck/wscbundle/wscbundle.js"></script>
```

Then add the following configuration to your page:

```html
<script>
	window.WEBSPELLCHECKER_CONFIG = {
		autoSearch: true,
		enableGrammar: true,
		servicePort: '2880',
		servicePath: '/'
	};
</script>
```

Refer to the [official documentation](https://github.com/WebSpellChecker/wproofreader#wproofreader-server) for more details about the server setup and available configuration options.

## Configuration

WProofreader configuration is set outside the CKEditor 5 configuration. Refer to the [WProofreader API](http://dev.webspellchecker.net/api/wscbundle/) for further information.

## Contribute

You can report issues and request features in the [official WProofreader repository](https://github.com/WebSpellChecker/wproofreader/issues).
