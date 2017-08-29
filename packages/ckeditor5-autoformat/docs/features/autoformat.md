---
title: Autoformatting
category: features
---

{@snippet build-classic-source}

The {@link module:autoformat/autoformat~Autoformat} feature allows you to quickly apply formatting to the content you are writing.

<info-box info>
	This feature is enabled by default in all builds.
</info-box>

## Block formatting

The following block formatting options are available:

* Bulleted list &ndash; Start a line with `*` or `-` followed by a space.
* Numbered list &ndash; Start a line with `1.` or `1)` followed by a space.
* Headings &ndash; Start a line with `#` or `##` or `###` followed by a space to create a heading 1, heading 2 or heading 3 (up to heading 6 if {@link module:heading/heading~HeadingConfig#options} defines more headings).
* Block quote &ndash; Start a line with `>` followed by a space.

## Inline formatting

The following inline formatting options are available:

* Bold &ndash; Type `**text**` or `__text__`.
* Italic &ndash; Type `*text*` or `_text_`.

## Autoformatting sample

Example:

1. Delete all editor content.
2. Press <kbd>#</kbd> and then <kbd>Space</kbd>.
3. The current line will be turned into a heading.

{@snippet examples/classic-editor-short}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor install the [`@ckeditor/ckeditor5-autoformat`](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat) package:

```
npm install --save @ckeditor/ckeditor5-autoformat
```

And add it to your plugin list:

```js
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Autoformat, ... ],
		toolbar: [ ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box hint>

Remember to add proper features to the editor configuration. Autoformatting will be enabled only for the commands that are included in the actual configuration. For example: `bold` autoformatting will not work if there is no `bold` command registered in the editor.
</info-box>

## Creating custom autoformatters

The {@link module:autoformat/autoformat~Autoformat} feature bases on {@link module:autoformat/blockautoformatengine~BlockAutoformatEngine} and {@link module:autoformat/inlineautoformatengine~InlineAutoformatEngine} tools to create the autoformatters mentioned above.

You can use these tools to create your own autoformatters. Check the [`Autoformat` feature's code](https://github.com/ckeditor/ckeditor5-autoformat/blob/master/src/autoformat.js) as an example.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-autoformat.
