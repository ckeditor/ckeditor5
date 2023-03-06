---
menu-title: Styles
category: features
modified_at: 2022-07-22
---

# Styles

The style feature lets you apply pre-configured styles to elements in your content. It works by adding one or more HTML classes to an element to change its appearance or add semantic information.

## Demo

Use the demo below to test the styles feature. Select a passage or a header and try applying various styles to the content.

{@snippet features/styles}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

<details>
<summary>Configuration of the above demo</summary>

<info-box>
	See the [Configuration](#configuration) section to learn more about the configuration format.
</info-box>

The editor configuration:

```js
// ...
style: {
	definitions: [
		{
			name: 'Article category',
			element: 'h3',
			classes: [ 'category' ]
		},
		{
			name: 'Title',
			element: 'h2',
			classes: [ 'document-title' ]
		},
		{
			name: 'Subtitle',
			element: 'h3',
			classes: [ 'document-subtitle' ]
		},
		{
			name: 'Info box',
			element: 'p',
			classes: [ 'info-box' ]
		},
		{
			name: 'Side quote',
			element: 'blockquote',
			classes: [ 'side-quote' ]
		},
		{
			name: 'Marker',
			element: 'span',
			classes: [ 'marker' ]
		},
		{
			name: 'Spoiler',
			element: 'span',
			classes: [ 'spoiler' ]
		},
		{
			name: 'Code (dark)',
			element: 'pre',
			classes: [ 'fancy-code', 'fancy-code-dark' ]
		},
		{
			name: 'Code (bright)',
			element: 'pre',
			classes: [ 'fancy-code', 'fancy-code-bright' ]
		}
	]
},
// ...
```

The stylesheet:

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap');

.ck.ck-content {
	font-family: 'PT Serif', serif;
	font-size: 16px;
	line-height: 1.6;
	padding: 2em;
}

.ck-content .ck-horizontal-line {
	margin-bottom: 1em;
}

.ck.ck-content hr {
	width: 100px;
	border-top: 1px solid #aaa;
	height: 1px;
	margin: 1em auto;
}

.ck.ck-content h3.category {
	font-family: 'Bebas Neue';
	font-size: 20px;
	font-weight: bold;
	color: #d1d1d1;
	letter-spacing: 10px;
	margin: 0;
	padding: 0;
}

.ck.ck-content h2.document-title {
	font-family: 'Bebas Neue';
	font-size: 50px;
	font-weight: bold;
	margin: 0;
	padding: 0;
	border: 0;
}

.ck.ck-content h3.document-subtitle {
	font-size: 20px;
	color: #e91e63;
	margin: 0 0 1em;
	font-weight: normal;
	padding: 0;
}

.ck.ck-content p.info-box {
	--background-size: 30px;
	--background-color: #e91e63;
	padding: 1.2em 2em;
	border: 1px solid var(--background-color);
	background: linear-gradient(135deg, var(--background-color) 0%, var(--background-color) var(--background-size), transparent var(--background-size)), linear-gradient(135deg, transparent calc(100% - var(--background-size)), var(--background-color) calc(100% - var(--background-size)), var(--background-color));
	border-radius: 10px;
	margin: 1.5em 2em;
	box-shadow: 5px 5px 0 #ffe6ef;
}

.ck.ck-content blockquote.side-quote {
	font-family: 'Bebas Neue';
	font-style: normal;
	float: right;
	width: 35%;
	position: relative;
	border: 0;
	overflow: visible;
	z-index: 1;
	margin-left: 1em;
}

.ck.ck-content blockquote.side-quote::before {
	content: "“";
	position: absolute;
	top: -37px;
	left: -10px;
	display: block;
	font-size: 200px;
	color: #e7e7e7;
	z-index: -1;
	line-height: 1;
}

.ck.ck-content blockquote.side-quote p {
	font-size: 2em;
	line-height: 1;
}

.ck.ck-content blockquote.side-quote p:last-child:not(:first-child) {
	font-size: 1.3em;
	text-align: right;
	color: #555;
}

.ck.ck-content span.marker {
	background: yellow;
}

.ck.ck-content span.spoiler {
	background: #000;
	color: #000;
}

.ck.ck-content span.spoiler:hover {
	background: #000;
	color: #fff;
}

.ck.ck-content pre.fancy-code {
	border: 0;
	margin-left: 2em;
	margin-right: 2em;
	border-radius: 10px;
}

.ck.ck-content pre.fancy-code::before {
	content: "";
	display: block;
	height: 13px;
	background: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NCAxMyI+CiAgPGNpcmNsZSBjeD0iNi41IiBjeT0iNi41IiByPSI2LjUiIGZpbGw9IiNGMzZCNUMiLz4KICA8Y2lyY2xlIGN4PSIyNi41IiBjeT0iNi41IiByPSI2LjUiIGZpbGw9IiNGOUJFNEQiLz4KICA8Y2lyY2xlIGN4PSI0Ny41IiBjeT0iNi41IiByPSI2LjUiIGZpbGw9IiM1NkM0NTMiLz4KPC9zdmc+Cg==);
	margin-bottom: 8px;
	background-repeat: no-repeat;
}

.ck.ck-content pre.fancy-code-dark {
	background: #272822;
	color: #fff;
	box-shadow: 5px 5px 0 #0000001f;
}

.ck.ck-content pre.fancy-code-bright {
	background: #dddfe0;
	color: #000;
	box-shadow: 5px 5px 0 #b3b3b3;
}
```

</details>

## Installation

<info-box info>
	The style feature is not available in any of the {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-style`](https://www.npmjs.com/package/@ckeditor/ckeditor5-style) package:

```plaintext
npm install --save @ckeditor/ckeditor5-style
```

Then add it to the editor configuration:

```js
import Style from '@ckeditor/ckeditor5-style/src/style';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Style, /* ... */ ],
		toolbar: {
			items: [
				'style',
				// More toolbar items.
				// ...
			],
		},
		style: {
			definitions: [
				// Styles definitions. 
				// ...
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Configuration

Configuring the styles feature takes two steps. First you need to define the styles in the configuration file, for example:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Style, /* ... */ ],
		toolbar: {
			items: [
				'style',
				// More toolbar items.
				// ...
			],
		},
		style: {
			definitions: [
				{
					name: 'Article category',
					element: 'h3',
					classes: [ 'category' ]
				},
				{
					name: 'Info box',
					element: 'p',
					classes: [ 'info-box' ]
				},
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );

```

Then, corresponding CSS styles need to be defined for the document:

```css
.ck.ck-content h3.category {
	font-family: 'Bebas Neue';
	font-size: 20px;
	font-weight: bold;
	color: #d1d1d1;
	letter-spacing: 10px;
	margin: 0;
	padding: 0;
}

.ck.ck-content p.info-box {
	padding: 1.2em 2em;
	border: 1px solid #e91e63;
	border-left: 10px solid #e91e63;
	border-radius: 5px;
	margin: 1.5em;
}
```

Note that the editor will automatically distinguish text and block styles and group them in the dropdown.

## Known issues

At present, the style feature may clash with other features that bring in similar content (e.g. headings). Problems with overlapping styles applied to the same element may also occur.

## Related features

Check out also these CKEditor 5 features to gain better control over your content style and format:
* {@link features/basic-styles Basic text styles} &ndash; Apply the most frequently used formatting such as bold, italic, underline, etc.
* {@link features/font Font styles} &ndash; Easily and efficiently control the font {@link features/font#configuring-the-font-family-feature family}, {@link features/font#configuring-the-font-size-feature size}, {@link features/font#configuring-the-font-color-and-font-background-color-features text or background color}.
* {@link features/headings Headings} &ndash; Divide your content into sections.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.
* {@link features/general-html-support General HTML support} &ndash; Allows enabling additional HTML, such as `<style>` and `<classes>` attributes.

## Common API

The {@link module:style/style~Style Style} plugin registers:

* The `'style'` command implemented by {@link module:style/stylecommand~StyleCommand}.
* The `'style'` UI drop-down.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Applies the style to the selected content.
// Executing the command again will remove the style from the selected content.
editor.execute( 'style', 'Article category' );
```

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-style](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-style).
