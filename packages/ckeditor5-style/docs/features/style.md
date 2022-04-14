---
menu-title: Styles
category: features
modified_at: 2022-03-31
---

# Styles

The {@link module:style/style~Style Style} feature lets you completely control the way the edited content is presented. It adds a dropdown to the CKEditor 5 toolbar which lets the user apply pre-configured visual styles, allowing for control of font face, color and other {@link features/basic-styles basic text styles} of the edited content. The {@link features/remove-format remove formatting} feature can be used to clear those styles.

## Demo

<info-box>
	The styles feature is experimental and **still in development**.
</info-box>

Use the demo below to test applying various styles to content.

{@snippet features/styles}

## Related features

Check out also these CKEditor 5 features to gain better control over your content style and format:
* {@link features/basic-styles Basic text styles} &ndash; Apply the most frequently used formatting such as bold, italic, underline, etc.
* {@link features/font Font styles} &ndash; Easily and efficiently control the font {@link features/font#configuring-the-font-family-feature family}, {@link features/font#configuring-the-font-size-feature size}, {@link features/font#configuring-the-font-color-and-font-background-color-features text or background color}.
* {@link features/remove-format Remove format} &ndash; Easily clean basic text formatting.
* {@link features/general-html-support General HTML support} &ndash; Allows enabling additional HTML, such as `<style>` and `<classes>` attributes.

### Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-style`](https://www.npmjs.com/package/@ckeditor/ckeditor5-style) package:

```plaintext
npm install --save @ckeditor/ckeditor5-style
```

Then add it to the editor configuration:

```js
import Style from '@ckeditor/ckeditor5-style/src/style';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Style, ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link installation/getting-started/installing-plugins installing plugins}.
</info-box>

## Configuration

Configuring the styles feature takes two steps. First you need to define the styles in the configuration file, for example:

```js
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
},

```

The, the css styles need to be defined for the document:

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

## Common API

The {@link module:style/style~Style Style} plugin registers:

* TODO style command
* The `'styleDropdown'` UI drop-down.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-style.
