---
category: features
menu-title: Emoji
meta-title: Emoji | CKEditor 5 Documentation1
modified_at: 2024-11-26
---

# Emoji

The emoji feature lets you insert emojis from the editor toolbar, or directly on the go while writing the content.

## Demo

Use the emoji toolbar button {@icon @ckeditor/ckeditor5-emoji/theme/icons/emoji.svg Emoji} in the editor below to open a panel with a table of selectable emojis.

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

## Configuration

There are two configuration settings available.

* `marker` &ndash; the trigger character to evoke the emoji dropdown during edition. By default it is `:`.
* `dropdownLimit` &ndash; the number of items to appear in the emoji dropdown.

<!-- Please update the configuration snippet -->

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		emoji: {
			marker: :,
			dropdownLimit: 5
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Common API

The {@link module:emoji/emoji~Emoji} plugin registers the UI button component (`'emoji'`).

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available at GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-emoji](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-emoji).
