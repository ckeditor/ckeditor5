---
title: Basic text styles
meta-title: Basic text styles | CKEditor 5 Documentation
category: features
---

The basic styles feature lets you apply the most essential formatting such as bold, italic, underline, strikethrough, subscript, superscript, and code. Coupled with more [formatting features](#related-features), these serve as a base for any WYSIWYG editor toolset.

## Demo

You may apply basic formatting options with toolbar buttons. You can also make use of the {@link features/autoformat autoformatting feature} that changes Markdown code to formatted text as you type. Use one of these to format text:

* Bold &ndash; Use the bold toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/bold.svg Bold} or type `**text**` or `__text__`.
* Italic &ndash; Use the italic toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/italic.svg Italic} or type `*text*` or `_text_`.
* Code &ndash; Use the code toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/code.svg Code} or type ``` `text` ```.
* Strikethrough &ndash; Use the strikethrough toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/strikethrough.svg Strikethrough} or type `~~text~~`.

{@snippet features/basic-styles}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Available text styles

| Style feature | {@link framework/architecture/core-editor-architecture#commands Command} name | {@link getting-started/setup/toolbar Toolbar} component name | Output element |
|-----|---|-----|-----|
| {@link module:basic-styles/bold~Bold} | `'bold'` | `'bold'` | `<strong>bold</strong>` |
| {@link module:basic-styles/italic~Italic} | `'italic'` | `'italic'` | `<i>italic</i>` |
| {@link module:basic-styles/underline~Underline} | `'underline'` | `'underline'` | `<u>underline</u>` |
| {@link module:basic-styles/strikethrough~Strikethrough} | `'strikethrough'` | `'strikethrough'` | `<s>strikethrough</s>` |
| {@link module:basic-styles/code~Code} | `'code'` | `'code'` | `<code>code</code>` |
| {@link module:basic-styles/subscript~Subscript} | `'subscript'` | `'subscript'` | `<sub>subscript</sub>` |
| {@link module:basic-styles/superscript~Superscript} | `'superscript'` | `'superscript'` | `<sup>superscript</sup>` |

<info-box info>
	The {@link module:basic-styles/code~Code} feature provides support for inline code formatting. To create blocks of pre-formatted code with a specific programming language assigned, use the {@link features/code-blocks code block feature}.
</info-box>

### Supported input

By default, each feature can upcast more than one type of content. Here is the full list of elements supported by each feature, either when pasting from the clipboard, loading data on start, or using the {@link module:core/editor/editor~Editor#setData data API}.

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

CKEditor&nbsp;5 allows for typing both at the inner and outer boundaries of code to make editing easier for the users.

**To type inside a code element**, move the caret to its (start or end) boundary. As long as the code remains highlighted (by default: less transparent gray), typing and applying formatting will be done within its boundaries:

{@img assets/img/typing-inside-code.gif 770 The animation showing typing inside the code element in CKEditor&nbsp;5 rich text editor.}

**To type before or after a code element**, move the caret to its boundary, then press the Arrow key (<kbd>→</kbd> or <kbd>←</kbd>) once. The code is no longer highlighted and whatever text you type or formatting you apply will not be enclosed by the code element:

{@img assets/img/typing-after-code.gif 770 The animation showing typing after the code element in CKEditor&nbsp;5 rich text editor.}

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the plugins which you need to your plugin list. Then, simply configure the toolbar items to make the features available in the user interface.

<code-switcher>
```js
import { ClassicEditor, Bold, Code, Italic, Strikethrough, Subscript, Superscript, Underline } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Bold, Code, Italic, Strikethrough, Subscript, Superscript, Underline ],
		toolbar: {
			items: [ 'bold', 'italic', 'underline', 'strikethrough', 'code', 'subscript', 'superscript'  ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Related features

Check out also these CKEditor&nbsp;5 features to gain better control over your content style and format:
* {@link features/font Font styles} &ndash; Easily and efficiently control the font {@link features/font#configuring-the-font-family-feature family}, {@link features/font#configuring-the-font-size-feature size}, {@link features/font#configuring-the-font-color-and-font-background-color-features text or background color}.
* {@link features/style Styles} &ndash; Apply pre-configured styles to existing elements in the editor content.
* {@link features/text-alignment Text alignment} &ndash; Because it does matter whether the content is left, right, centered, or justified.
* {@link features/case-change Case change} &ndash; Turn a text fragment or block into uppercase, lowercase, or title case.
* {@link features/code-blocks Code blocks}  &ndash; Insert longer, multiline code listings, expanding the inline code style greatly.
* {@link features/highlight Highlight} &ndash; Mark important words and passages, aiding a review or drawing attention to specific parts of the content.
* {@link features/format-painter Format painter} &ndash; Easily copy text formatting and apply it in a different place in the edited document.
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
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles).
