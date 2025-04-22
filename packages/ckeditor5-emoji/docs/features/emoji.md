---
category: features
menu-title: Emoji
meta-title: Emoji | CKEditor 5 Documentation
modified_at: 2025-01-21
---

# Emoji

The emoji feature lets you insert emojis into the document from the editor toolbar or while writing the content. The emojis are pulled from the CDN to lessen the editor load.

Since there is a large number of emojis, they have been conveniently divided into several categories for easier use, such as "Smileys & Expressions" or "Objects." You may also search for a specific emoji using the search field.

## Demo

Use the emoji toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/emoji.svg Emoji} in the editor below to open a panel with a table of selectable emojis. You may also trigger the emoji UI while writing the content by typing the pre-configured `:` marker followed by at least two letters of desired emoji name. Then, you can either choose which emoji to insert from the suggestion list or select the `Show all emoji...` option to open the full panel. The marker must be preceded by a space to work.

There is an option to set the skin tone of the emojis next to the search field, too.

The selected emoji category and skin tone are remembered by the feature, so next time you invoke the panel, you can quickly insert an emoji of similar type.

{@snippet features/emoji}

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
import { ClassicEditor, Emoji, Mention } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Emoji, Mention, /* ... */ ],
		toolbar: [ 'emoji', /* ... */ ],
		emoji: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box>
	The emoji feature requires the {@link features/mentions mentions feature} to be installed to work properly.
</info-box>

The {@link module:emoji/emoji~Emoji emoji plugin} consists of two sub-plugins:

* {@link module:emoji/emojimention~EmojiMention} &ndash; Adds support for triggering the emoji UI dropdown while writing the content when you type a pre-configured `:` marker followed by at least two letters of the desired emoji name.
* {@link module:emoji/emojipicker~EmojiPicker} &ndash; Registers the UI button component, which opens a panel with a table of selectable emojis.

You can freely choose how to load the feature: either as a whole (as shown in the example above) or select one of the sub-plugins if you need only one of the ways of inserting emojis into the document.

## Configuration

The feature can be configured via the {@link module:emoji/emojiconfig~EmojiConfig `config.emoji`} object.

* `dropdownLimit` &ndash; the number of items to appear in the emoji dropdown.

	```js
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			// ... Other configuration options ...
			emoji: {
				dropdownLimit: 5
			}
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
	```

* `skinTone` &ndash; the initial skin tone for the emojis that support skin tones.

	```js
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			// ... Other configuration options ...
			emoji: {
				skinTone: 'medium'
			}
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
	```

* `definitionsUrl` &ndash; the URL to the emoji definitions file. The URL should return a JSON array with emoji definitions specified by the {@link module:emoji/emojirepository~EmojiCdnResource `EmojiCdnResource`} interface.

	<info-box warning>
		If the `definitionsUrl` is not provided, the feature will fetch the emoji definitions from the CKEditor&nbsp;5 CDN.
	</info-box>

	```js
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			// ... Other configuration options ...
			emoji: {
				definitionsUrl: 'https://example.com/emoji-definitions.json'
			}
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
	```

* `version` &ndash; the emoji database version. By default, version 16 is used. This option is ignored if the `definitionsUrl` setting is provided.

	```js
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			// ... Other configuration options ...
			emoji: {
				version: 15
			}
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
	```

* `useCustomFont` &ndash; if you customize the {@link features/emoji#emoji-availability-and-appearance emoji availability and appearance}. It that case, it is highly recommended to disable the filtering mechanism because it uses a font built-in to your system.

	```js
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			// ... Other configuration options ...
			emoji: {
				useCustomFont: true
			}
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
	```

### Emoji availability and appearance

The availability of the emoji depends on the operating system. Different systems will have different Unicode support. You may decide to lower the number of newer emoji by setting a lower {@link module:emoji/emojiconfig~EmojiConfig#version `version`} of Unicode of the emoji repository (CKEditor&nbsp;5 hosts v15 and v16) or by providing a custom emoji repository using the {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `definitionsUrl`}. This way, the users with newer systems will not be able to use newer emojis. Keep in mind that this only affects the editor feature. A user will still be able to use the native emoji insertion methods. The availability may also increase with the usage of a custom font.

If you want to standardize the appearance of emoji accross operating systems, please consider using an external font in your integration, such as [Noto Color Emoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji). In the setup make sure to:

1. Set the `font-family` for the content, this way the emoji in the editable will use the custom font. For example:

	```css
	body {
		font-family: 'Lato', 'Noto Color Emoji', sans-serif;
	}
	```

2. Update the `--ck-font-face` variable, so that emoji in the picker and mention will use the custom font.

	```css
	:root {
		--ck-font-face: Helvetica, Arial, Tahoma, Verdana, 'Noto Color Emoji';
	}
	```
	
3. Update the {@link module:core/editor/editorconfig~EditorConfig editor configuration} by adding the {@link module:emoji/emojiconfig~EmojiConfig#useCustomFont `emoji.useCustomFont`} option.

	```js
	{
		// ... Other configuration options ...
		emoji: {
			useCustomFont: true
		}
	}
	```

### Emoji source

The database of English emoji is loaded by default from our CDN. Make sure that your {@link getting-started/setup/csp CSP rules} are correctly set up.

If you do not want to use our distribution and prefer to self-host emoji, you can use the {@link module:emoji/emojiconfig~EmojiConfig#definitionsUrl `definitionsUrl`} option. You can download the data directly from the package mentioned above or from our CDN, and place it under a static assets URL, for example:

1. Download the latest emoji database from [https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json](https://cdn.ckeditor.com/ckeditor5/data/emoji/16/en.json), or download version 15 for older Unicode versions.
2. Place the downloaded file in your application's assets folder, for example `public/emoji/en.json`. The specific location may vary depending on your framework and setup.
3. Update the configuration option `definitionsUrl` to point to the URL of your assets, for example: `https://example.com/emoji/en.json`.

You can prepare your own database with a different emoji set, but it must have an identical structure as ours. Otherwise, the Emoji feature will not work.

### Marker conflicts

The emoji feature uses the `:` marker that opens a panel with a table of selectable emojis. If you use the {@link features/mentions mentions} or {@link features/merge-fields merge fields} features, they can also show UI panels by pressing a pre-configured key. Those keys may conflict with the emoji feature. In such a case, the {@link module:emoji/emojimention~EmojiMention} plugin will not integrate the autocompletion mechanism.

To prevent conflicts, make sure that the {@link module:mention/mentionconfig~MentionFeed#marker mention's `marker`} and {@link module:merge-fields/mergefieldsconfig~MergeFieldsConfig#prefix merge field's `prefix`} configuration options are not defined as `:`.

## Troubleshooting

If you are experiencing issues with the emoji feature in CKEditor&nbsp;5 and the `emoji-repository-empty` is displayed in the console, it may be due to missing system support for emoji fonts or problems loading the emoji repository. Below are some common issues and their solutions.

### No emoji font installed

**Problem**:
The system does not have an emoji font installed, preventing the emoji feature from rendering emoji correctly.

**Solution**:
To use the emoji feature, install an emoji font on your operating system:

* macOS: `Apple Color Emoji`
* Windows: `Segoe UI Emoji`
* Linux: `Noto Color Emoji` (or an alternative like `Twemoji`)

Once installed, restart your browser and reload the editor.

### Server error when loading the emoji repository

**Problem**:
The request to load the emoji repository was completed, but the server returned an error (such as `404 Not Found`, or `500 Internal Server Error`).

**Solution**:

* Ensure the emoji repository URL is correct and accessible.
* If using a custom emoji repository, verify that it is properly configured.

### Network issues preventing the emoji repository from loading

**Problem**:
The emoji repository could not be loaded due to a network issue, CORS restriction, or blocked request.

**Solution**:

* Verify that the URL is correct and accessible.
* Check your internet connection.
* If applicable, update your Content Security Policy (CSP) settings to allow connections to the emoji repository.

For more details on configuring CSP, see the {@link getting-started/setup/csp Content Security Policy} guide.

By following these steps, you should be able to resolve common issues with the emoji plugin in CKEditor&nbsp;5. If problems persist, check your browser console for additional error messages or consult the CKEditor 5 [GitHub repository for support](https://github.com/ckeditor/ckeditor5/issues).

## Related features

In addition to enabling the emoji feature, you may want to check the following related features:

* {@link features/special-characters Special characters} &ndash; Allows inserting **mathematical operators**, **currency symbols**, **punctuation**, **graphic symbols** (such as arrows or bullets), or Unicode letters typically not accessible from the keyboard (such as **umlauts** or **other diacritics**).
* {@link features/mentions Mentions} &ndash; Brings support for smart autocompletion.

## Common API

The {@link module:emoji/emojipicker~EmojiPicker} plugin registers the UI button component (`'emoji'`) and the command (`'emoji'`) that allows opening the emoji picker UI.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor, such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available at GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-emoji](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-emoji).
