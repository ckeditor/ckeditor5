---
title: Basic text styles
category: features
---

{@snippet features/build-basic-styles-source}

The {@link api/basic-styles basic styles} package provides text formatting features such as bold, italic, underline, strikethrough and code.

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

<info-box info>
	{@link module:basic-styles/bold~Bold} and {@link module:basic-styles/italic~Italic} are available out–of–the–box in most of the {@link builds/guides/overview editor builds}.
</info-box>

### Supported input

By default, each feature can upcast more than one type of the content. Here's the full list of elements supported by each feature, either when pasting from the clipboard, loading data on start or using the {@link module:core/editor/utils/dataapimixin~DataApi#setData data API}.

| Style feature | Supported input elements |
|-----|---|
| {@link module:basic-styles/bold~Bold} | `<strong>`, `<b>`, `<* style="font-weight: bold">` |
| {@link module:basic-styles/italic~Italic} | `<i>`, `<em>`, `<* style="font-style: italic">` |
| {@link module:basic-styles/underline~Underline} | `<u>`, `<* style="text-decoration: underline">` |
| {@link module:basic-styles/strikethrough~Strikethrough} | `<s>`, `<del>`, `<strike>`, `<* style="text-decoration: line-through">` |
| {@link module:basic-styles/code~Code} | `<code>`, `<* style="word-wrap: break-word">` |

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

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Bold, Italic, Underline, Strikethrough, Code ],
		image: {
			toolbar: [ 'bold', 'italic', 'underline', 'strikethrough', 'code'  ]
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

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-basic-styles.
