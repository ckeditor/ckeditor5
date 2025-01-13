---
category: features
menu-title: Emoji
meta-title: Emoji | CKEditor 5 Documentation
modified_at: 2025-01-03
---

{@snippet features/emoji-source}

# Emoji

The emoji feature lets you insert emojis to the document from the editor toolbar, or directly on the go while writing the content.

Since the number of emojis is very large, they have been conveniently divided into several categories for easier use, like "Smileys & Expressions" or "Objects". Besides, in order not to get lost, you may try to search for the emoji you are looking for using the search field.

## Demo

Use the emoji toolbar button {@icon @ckeditor/ckeditor5-emoji/theme/icons/emoji.svg Emoji} in the editor below to open a panel with a table of selectable emojis.

You may also trigger the emoji UI while writing the content when you type a pre-configured `:` marker followed by at least two letters of desired emoji name. Make sure to include at least one space before the marker, otherwise the emoji UI does not kick in. Then, you can either choose which emoji to insert from the suggestion list, or choose the last option &ndash; `Show all emoji...` &ndash; to open the full panel.

Additionally, there is also an option to set the skin tone of the emojis next to the search field.

The selected emoji category and the skin tone are remembered by the feature, so the next time you invoke the panel you can quickly insert an emoji of similar type.

{@snippet features/emoji}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

<info-box warning>
	Availability of emojis and their appearance depends on the operating system. If you want to standardize both the appearance and availability of emojis, please consider using an external font in your integration, such as [Noto Color Emoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji).
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

* {@link module:emoji/emojimention~EmojiMention} &ndash; Adds support for triggering the emoji UI dropdown while writing the content when you type a pre-configured `:` marker followed by at least two letters of desired emoji name.
* {@link module:emoji/emojipicker~EmojiPicker} &ndash; Registers the UI button component which opens a panel with a table of selectable emojis.

You can freely choose how to load the feature: either as a whole (as shown in the example above), or select one of the sub-plugins if you need only one of the ways of inserting emojis into the document.

## Configuration

There is one configuration setting available for the emoji feature.

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

* `skinTone` &ndash; Initial skin tone for the emoji picker.

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

<info-box info>
	The emoji feature uses the `:` marker that opens a panel with a table of selectable emojis. If you are using {@link features/mentions mentions} or {@link features/merge-fields merge fields} features, they can also show UI panels by pressing a pre-configured key, and it may conflict with the emoji feature. In such a case, the {@link module:emoji/emojimention~EmojiMention} plugin will not integrate the autocompletion mechanism.

	To prevent conflicts, make sure that {@link module:mention/mentionconfig~MentionFeed#marker mention's `marker`} and {@link module:merge-fields/mergefieldsconfig~MergeFieldsConfig#prefix merge field's `prefix`} configuration options are defined differently than `:`.
</info-box>

## Related features

In addition to enabling emoji feature, you may want to check the following related features:

* {@link features/special-characters Special characters} &ndash; Allows inserting **mathematical operators**, **currency symbols**, **punctuation**, **graphic symbols** (such as arrows or bullets), or Unicode letters typically not accessible from the keyboard (such as **umlauts** or **other diacritics**).
* {@link features/mentions Mentions} &ndash; Brings support for smart autocompletion.

## Common API

The {@link module:emoji/emojipicker~EmojiPicker} plugin registers the UI button component (`'emoji'`).

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available at GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-emoji](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-emoji).
