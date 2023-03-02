---
title: Basic text styles
category: features
---

{@snippet features/build-basic-styles-source}

The basic styles feature lets you apply the most essential formatting such as bold, italic, underline, strikethrough, subscript, superscript, and code. Coupled with more [formatting features](#related-features), these serve as a base for any WYSIWYG editor toolset.

## Demo

You may apply basic formatting options with toolbar buttons (pictured below) or thanks to the {@link features/autoformat autoformatting feature} with Markdown code as you type. Use one of these to format the text:
* Bold &ndash; Use the bold toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/bold.svg Bold} or type `**text**` or `__text__`
* Italic &ndash; Use the italic toolbar button {@icon @ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg Italic} or type `*text*` or `_text_`
* Code &ndash; Use the code toolbar button {@icon @ckeditor/ckeditor5-basic-styles/theme/icons/code.svg Code} or type ``` `text` ```
* Strikethrough &ndash; Use the strikethrough toolbar button {@icon @ckeditor/ckeditor5-basic-styles/theme/icons/strikethrough.svg Strikethrough} or type `~~text~~`.

{@snippet features/basic-styles}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Available text styles

| Style feature | {@link framework/architecture/core-editor-architecture#commands Command} name | {@link features/toolbar Toolbar} component name | Output element |
|-----|---|-----|-----|
| {@link module:basic-styles/bold~Bold} | `'bold'` | `'bold'` | `<strong>bold</strong>` |
| {@link module:basic-styles/italic~Italic} | `'italic'` | `'italic'` | `<i>italic</i>` |
| {@link module:basic-styles/underline~Underline} | `'underline'` | `'underline'` | `<u>underline</u>` |
| {@link module:basic-styles/strikethrough~Strikethrough} | `'strikethrough'` | `'strikethrough'` | `<s>strikethrough</s>` |
| {@link module:basic-styles/code~Code} | `'code'` | `'code'` | `<code>code</code>` |
| {@link module:basic-styles/subscript~Subscript} | `'subscript'` | `'subscript'` | `<sub>subscript</sub>` |
| {@link module:basic-styles/superscript~Superscript} | `'superscript'` | `'superscript'` | `<sup>superscript</sup>` |

<info-box info>
	{@link module:basic-styles/bold~Bold} and {@link module:basic-styles/italic~Italic} are available out–of–the–box in most of the {@link installation/getting-started/predefined-builds editor builds}.

	The {@link module:basic-styles/code~Code} feature provides support for inline code formatting. To create blocks of pre-formatted code with a specific programming language assigned, use the {@link features/code-blocks code block feature}.
</info-box>

### Supported input

By default, each feature can upcast more than one type of content. Here is the full list of elements supported by each feature, either when pasting from the clipboard, loading data on start, or using the {@link module:core/editor/utils/dataapimixin~DataApi#setData data API}.

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

CKEditor 5 allows for typing both at the inner and outer boundaries of code to make editing easier for the users.

**To type inside a code element**, move the caret to its (start or end) boundary. As long as the code remains highlighted (by default: less transparent gray), typing and applying formatting will be done within its boundaries:

{@img assets/img/typing-inside-code.gif 770 The animation showing typing inside the code element in CKEditor 5 rich text editor.}

**To type before or after a code element**, move the caret to its boundary, then press the Arrow key (<kbd>→</kbd> or <kbd>←</kbd>) once. The code is no longer highlighted and whatever text you type or formatting you apply will not be enclosed by the code element:

{@img assets/img/typing-after-code.gif 770 The animation showing typing after the code element in CKEditor 5 rich text editor.}

## Installation

<info-box info>
	Bold and italic styles are enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. Strikethrough and underline are available in the {@link installation/getting-started/predefined-builds#document-editor document editor build} and {@link installation/getting-started/predefined-builds#superbuild superbuild} only. The code style is present in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only. These installation instructions are for developers interested in building their own, custom editor.
</info-box>

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
			items: [ 'bold', 'italic', 'underline', 'strikethrough', 'code', 'subscript', 'superscript'  ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Related features

Check out also these CKEditor 5 features to gain better control over your content style and format:
* {@link features/font Font styles} &ndash; Easily and efficiently control the font {@link features/font#configuring-the-font-family-feature family}, {@link features/font#configuring-the-font-size-feature size}, {@link features/font#configuring-the-font-color-and-font-background-color-features text or background color}.
* {@link features/style Styles} &ndash; Apply pre-configured styles to existing elements in the editor content.
* {@link features/text-alignment Text alignment} &ndash; Because it does matter whether the content is left, right, centered, or justified.
* {@link features/code-blocks Code blocks}  &ndash; Insert longer, multiline code listings, expanding the inline code style greatly.
* {@link features/highlight Highlight} &ndash; Mark important words and passages, aiding a review or drawing attention to specific parts of the content.
* {@link features/autoformat Autoformatting} &ndash; Format the text on the go with Markdown code.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.

<info-box info>
	You can remove all basic text styles with the {@link features/remove-format remove format} feature.
</info-box>

## Common API

Each style feature registers a [command](#available-text-styles) which can be executed from code. For example, the following snippet will apply the bold style to the current selection in the editor:

```js
editor.execute( 'bold' );
```

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles).
