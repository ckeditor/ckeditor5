---
menu-title: Styles
category: features
modified_at: 2022-03-31
---

# Styles

The {@link module:style/style~Style Style} feature lets you completely control the way the edited content is presented. It lets the user apply pre-configured visual styles, allowing for control of font face, color and other {@link features/basic-styles basic text styles} of the edited content.

## Demo

TODO

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

TODO

## Common API

The {@link module:style/style~Style Style} plugin registers:

* TODO style command
* The `'style'` UI drop-down.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-style.
