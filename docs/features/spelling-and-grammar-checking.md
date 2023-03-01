---
category: features
menu-title: Spell and grammar checker
modified_at: 2022-10-05
badges: [ premium ]
---

# Spelling, grammar, and punctuation checking

[WProofreader SDK](https://webspellchecker.com/wsc-proofreader) is an AI-driven, multi-language text correction tool. Spelling, grammar, and punctuation suggestions appear on hover as you type or in a separate dialog aggregating all mistakes and replacement suggestions in one place.

<info-box>
	This is a premium feature that is additionally payable on top of CKEditor 5 commercial license fee and delivered by our partner, [WebSpellChecker](https://webspellchecker.com/). Please [contact us](https://ckeditor.com/contact/) if you have any feedback or questions.

	You can report any issues in the WebSpellChecker [GitHub repository](https://github.com/WebSpellChecker/wproofreader).
</info-box>

## Demo

Use the toolbar button {@icon @webspellchecker/wproofreader-ckeditor5/theme/icons/wproofreader.svg Spell and grammar check} to test the spell and grammar check feature in the editor below.

{@snippet features/wproofreader}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

The WProofreader badge in the bottom-right corner shows you the total number of mistakes detected. Hover an underlined word to display the WProofreader suggestions for any of the spelling and grammar mistakes found. The suggestion card allows the user to employ the feature on the go. If you want to see an overview of all mistakes found, click the "Proofread in dialog" option in the toolbar dropdown. It will invoke a detached floating dialog, which is easy to navigate and perfect for dedicated proofreading sessions.

You can access the WProofreader settings from the toolbar, too. Set the primary language, create a spelling dictionary, and tweak some additional proofreading settings.

<info-box><!-- Consider deprecation time for this info box -->
	The toolbar button has been introduced in version 2.x of WProofreader. Read more about configuring UI items in the {@link features/toolbar toolbar guide}. If you are still using version 1.x, the available settings and dialog options can be accessed through the bottom-right corner badge instead.
</info-box>

## Additional feature information

You can fine-tune WProofreader via the dedicated settings menu. Choose a primary language from a set of available ones. Create and manage additional custom dictionaries. Words can be added to the user dictionary directly from the suggestion card, too. If needed, you can easily disable the spell checker and enable it again with one click.

After reading this guide, you may find additional interesting details and examples in the [Spell and grammar check in CKEditor 5](https://ckeditor.com/blog/feature-of-the-month-spell-and-grammar-check-in-ckeditor-5/) blog post.

## Multi-language support

The {@link features/language text part language} feature lets the user set different languages to different portions of the content. The spell and grammar check feature offers full support for multilingual content. If the WProofreader language is set to Auto Detect (or the `auto` language is set in the configuration), the feature will automatically recognize the language for a given sentence and suggest spelling and grammar corrections specifically for that language, as shown in the demo above.

{@img assets/img/spellcheck-dictionary.png 770 Setting the spell checker dictionary to auto.}

## Check types

WProofreader checks texts for spelling, grammar, and punctuation mistakes. The auto detect feature facilitates the correction of multilingual texts. Users do not have to manually switch languages to proofread combo docs. Handy spelling autocorrect validates user texts on the fly. Autocomplete suggestions for English make the proofreading process fast and smooth. The predictive text can be accepted with a right <kbd>→</kbd> arrow key.

## Supported languages and dictionaries

### Language support

The most popular languages used with WProofreader include: American English, Australian English, Arabic, Brazilian Portuguese, British English, Canadian English, Canadian French, Danish, Dutch, Finnish, French, German, Greek, Hebrew, Italian, Indonesian, Norwegian Bokmål, Norwegian Nynorsk, Portuguese, Spanish, Swedish, Turkish, and Ukrainian.

There are, however, more languages available from the WebSpellChecker site. Grammar checking is available for over 20 languages.

The AI-driven tools approach for English, German, and Spanish is a recent addition to the software. It offers a far better checking quality and generates proofreading suggestions based on the context of a sentence. It provides more suitable suggestions that address mistakes with 3 times the accuracy compared to a traditional mechanism.

Here you can check the [full list of available languages](https://webspellchecker.com/additional-dictionaries/).

### Specialized dictionaries

Apart from the language dictionaries, WebSpellChecker offers two specialized dictionaries: medical and legal.

### Custom dictionaries

Custom dictionaries can be used in two ways.

One is the **user-level dictionary** that can be expanded during regular use by adding new words. This is a perfect solution for users working on specific content that may contain slang or professional jargon.

The other is the so-called **company-level dictionary**. These premade dictionaries can be uploaded by system administrators or CKEditor 5 integrators and made available across the company, accessible for all users. This way all benefits of a user-generated dictionary can be shared among the team, making the proofreading process more structured and controlled.

## Accessibility

The WProofreader UI is designed and oriented toward comfort and ease of use. The proofreading floating dialog can be easily moved around, addressing the needs of left-handed editors and right-to-left language users. The clear, simple design is more readable for users with vision impairments. The dialog can also be navigated and operated with a keyboard, eliminating the need to use a mouse or another pointing device.

The spell and grammar check is compliant with WCAG 2.1 and Section 508 accessibility standards.

## Installation

<info-box info>
	The spell and grammar check feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.

	This is a premium feature that requires a commercial license. If you do not have one yet, please [contact us](https://ckeditor.com/contact/).
</info-box>

WProofreader is delivered as a CKEditor 5 plugin, so it can be combined into an editor build just like other features. To add this feature to your rich-text editor, install the [`@webspellchecker/wproofreader-ckeditor5`](https://www.npmjs.com/package/@webspellchecker/wproofreader-ckeditor5) package:

```
npm install --save @webspellchecker/wproofreader-ckeditor5
```

Then, add it to your plugin list and the toolbar configuration:

```js
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

ClassicEditor
	.create( editorElement, {
		plugins: [ WProofreader, /* ...], */
		toolbar: [ 'wproofreader', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Please be aware that when you try to build CKEditor 5 from source with WProofreader included, you need to adjust the example `webpack.config.js` provided in the {@link installation/getting-started/quick-start-other#building-the-editor-from-source building from source guide}. It needs to also allow including icons and styling from the WProofreader package. There are two way to do this.

The first configuration option is simpler:

```js
	///[...]
	module: {
		rules: [
			{
                test: /\.svg$/,

                use: [ 'raw-loader' ]
            },
            {
                test: /\.css$/,

                use: [
                    {
						loader: 'style-loader',
						///[...]
					}
				]
			}
			///[...]
		]
	}
```
However, this approach can affect `.svg` and `.css` files included from outside of CKEdtor5-related packages.

Therefore, the best option is to use the other config solution. This one will only load `.svg` and `.css` files imported from CKEdtor5-related packages:

```js
	// ...
	module: {
		rules: [
			{
				test: /ckeditor5([^\/\\]+)?[\/\\]theme[\/\\]icons[\/\\][^\/\\]+\.svg$/,

				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5([^\/\\]+)?[\/\\]theme[/\\].+\.css$/,

				use: [
					{
						loader: 'style-loader',
						// ...
					}
				]
			}
			// ...
		]
	}
```

With this modification to the `webpack.config.js`, it is possible to build CKEditor 5 from source with WProofreader included.

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

At this step, it is required to provide a proper configuration. WProofreader can be used either as a [cloud solution](#wproofreader-cloud) or [hosted on your server](#wproofreader-on-premise) (on-premise or in a private cloud).

### WProofreader Cloud

After signing up for a [trial or paid version](https://ckeditor.com/contact/), you will receive your service ID on your email which is used to activate the service.

Add the following configuration to your editor:

```js
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

ClassicEditor
	.create( editorElement, {
		plugins: [ WProofreader, /* ... */ ],
		toolbar: [ 'wproofreader', /* ... */ ]
		wproofreader: {
			serviceId: 'your-service-ID',
			srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
		}
	} )
```

Refer to the [official documentation](https://github.com/WebSpellChecker/wproofreader-ckeditor5#install-instructions) for more details about the cloud setup and available configuration options.

### WProofreader On-premise

After signing up for a [trial or paid version](https://ckeditor.com/contact/), you will receive access to the WebSpellChecker On-premise package to install it on your own server.

You will need to add the following configuration to your editor:

```js
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

ClassicEditor
	.create( editorElement, {
		plugins: [ WProofreader, /* ... */ ],
		toolbar: [ 'wproofreader', /* ... */ ]
		wproofreader: {
			serviceProtocol: 'https',
			serviceHost: 'localhost',
			servicePort: '443',
			servicePath: 'virtual_directory/api/',
			srcUrl: 'https://host_name/virtual_directory/wscbundle/wscbundle.js'
		}
	} )
```

Refer to the [official documentation](https://github.com/WebSpellChecker/wproofreader-ckeditor5#install-instructions) for more details about the server setup and available configuration options.

## Configuration

WProofreader configuration is set inside the CKEditor 5 configuration in the `wproofreader` object. Refer to the [WProofreader API](https://webspellchecker.com/docs/api/wscbundle/Options.html) for further information.

## Contribute

You can report issues and request features in the [official WProofreader for CKEditor 5 repository](https://github.com/WebSpellChecker/wproofreader-ckeditor5/issues).
