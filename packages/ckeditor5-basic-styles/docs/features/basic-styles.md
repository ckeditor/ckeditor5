---
title: Basic text styles
category: features
---

{@snippet features/build-basic-styles-source}

The {@link api/basic-styles basic styles} package provides text formatting features such as bold, italic, underline, strikethrough, subscript, superscript, and code.

<info-box info>
	All basic text styles can be removed with the {@link features/remove-format remove format} feature.
</info-box>

## Demo

{@snippet features/basic-styles}

## Available text styles

| Style feature | {@link framework/guides/architecture/core-editor-architecture#commands Command} name | {@link builds/guides/integration/configuration#toolbar-setup Toolbar} component name | Output element |
|-----|---|-----|-----|
| {@link module:basic-styles/bold~Bold} | `'bold'` | `'bold'` | `<strong>bold</strong>` |
| {@link module:basic-styles/italic~Italic} | `'italic'` | `'italic'` | `<i>italic</i>` |
| {@link module:basic-styles/underline~Underline} | `'underline'` | `'underline'` | `<u>underline</u>` |
| {@link module:basic-styles/strikethrough~Strikethrough} | `'strikethrough'` | `'strikethrough'` | `<s>strikethrough</s>` |
| {@link module:basic-styles/code~Code} | `'code'` | `'code'` | `<code>code</code>` |
| {@link module:basic-styles/subscript~Subscript} | `'subscript'` | `'subscript'` | `<sub>subscript</sub>` |
| {@link module:basic-styles/superscript~Superscript} | `'superscript'` | `'superscript'` | `<sup>superscript</sup>` |

<info-box info>
	{@link module:basic-styles/bold~Bold} and {@link module:basic-styles/italic~Italic} are available out–of–the–box in most of the {@link builds/guides/overview editor builds}.

	The {@link module:basic-styles/code~Code} feature provides support for inline code formatting. To create blocks of pre-formatted code with a specific programming language assigned, use the {@link features/code-blocks code block feature}.
</info-box>

### Supported input

By default, each feature can upcast more than one type of the content. Here's the full list of elements supported by each feature, either when pasting from the clipboard, loading data on start or using the {@link module:core/editor/utils/dataapimixin~DataApi#setData data API}.

| Style feature | Supported input elements |
|-----|---|
| {@link module:basic-styles/bold~Bold} | `<strong>`, `<b>`, `<* style="font-weight: bold">` (or numeric values that are greater or equal 600) |
| {@link module:basic-styles/italic~Italic} | `<i>`, `<em>`, `<* style="font-style: italic">` |
| {@link module:basic-styles/underline~Underline} | `<u>`, `<* style="text-decoration: underline">` |
| {@link module:basic-styles/strikethrough~Strikethrough} | `<s>`, `<del>`, `<strike>`, `<* style="text-decoration: line-through">` |
| {@link module:basic-styles/code~Code} | `<code>`, `<* style="word-wrap: break-word">` |
| {@link module:basic-styles/subscript~Subscript} | `<sub>`, `<* style="vertical-align: sub">` |
| {@link module:basic-styles/superscript~Superscript} | `<sup>`, `<* style="vertical-align: super">` |

## Typing around inline code

CKEditor 5 allows for typing both at inner and outer boundaries of code to make the editing easier for the users.

**To type inside a code element**, move the caret to its (start or end) boundary. As long as the code remains highlighted (by default: less transparent gray), typing and applying formatting will be done within its boundaries:

{@img assets/img/typing-inside-code.gif 770 The animation showing typing inside the code element in CKEditor 5 rich text editor.}

**To type before or after a code element**, move the caret to its boundary, then press the Arrow key (<kbd>→</kbd> or <kbd>←</kbd>) once. The code is no longer highlighted and whatever text you type or formatting you apply will not be enclosed by the code element:

{@img assets/img/typing-after-code.gif 770 The animation showing typing after the code element in CKEditor 5 rich text editor.}

## Installation

To add the basic styles features to your editor install the [`@ckeditor/ckeditor5-basic-styles`](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles) package:

```
npm install --save @ckeditor/ckeditor5-basic-styles
```

And add the plugins which you need to your plugin list. Then, simply configure the toolbar items to make the features available in the user interface.

```js
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript ],
		toolbar: {
			items: [ 'bold', 'italic', 'underline', 'strikethrough', 'code','subscript', 'superscript'  ]
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

Each style feature registers a [command](#available-text-styles) which can be executed from code. For example, the following snippet will apply the bold style to the current selection in the editor:

```js
editor.execute( 'bold' );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles.
