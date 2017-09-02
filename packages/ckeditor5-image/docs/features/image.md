---
title: Images
category: features
---

{@snippet build-classic-source}

The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains multiple plugins that implement various image-related features:

* {@link module:image/image~Image} implements basic support for images,
* {@link module:image/imagetoolbar~ImageToolbar} adds the image feature's contextual toolbar,
* {@link module:image/imagecaption~ImageCaption} adds support for captions,
* {@link module:image/imagestyle~ImageStyle} adds support for image styles,
* {@link module:upload/imageupload~ImageUpload} adds support for uploading dropped or pasted images (note: it is currently located in the [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package but will be moved to the `@ckeditor/ckeditor5-image` package).

<info-box info>
	The first four features listed above (so all except upload support) are enabled by default in all builds. They are also included in the {@link module:presets/article~Article Article preset}.
</info-box>

## Base image support

The {@link module:image/image~Image} feature adds support for plain images with just the `alt` attribute set. This translates to the following HTML:

```html
<figure class="image">
	<img src="..." alt="...">
</figure>
```

<info-box hint>
	This feature follows the markup proposed by the [Editor Recommendations](http://ckeditor.github.io/editor-recommendations/features/images.html) project.
</info-box>

You can see the demo of an editor with the base image feature enabled below:

{@snippet features/image}

<info-box hint>
	The base image feature, unlike in CKEditor 4, does not support any user interface for inserting or managing images. Its sole purpose is to lay ground for other plugins (mentioned above) to build the target user experience. This pattern (composition of atomic features) is common for CKEditor 5 and allows the developers to build their own customized experience by implementing specific subfeatures differently.
</info-box>

## Image contextual toolbar

The {@link module:image/imagetoolbar~ImageToolbar} plugin introduces contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options such as the text alternative (which is introduced by the base image plugin) button and [image styles buttons](#image-styles).

See a demo of an editor with the contextual toolbar enabled:

{@snippet features/image-toolbar}

The image toolbar is configured to contain the image text alternative button:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			toolbar: [ 'imageTextAlternative' ]
		}
	} )
```

## Image captions

The {@link module:image/imagecaption~ImageCaption} plugin adds support for image captions:

```html
<figure class="image">
	<img src="..." alt="...">
	<figcaption>Caption goes here...</figcaption>
</figure>
```

By default, if the image caption is empty, the `<figcaption>` element is not visible to the user. You can click the image to reveal the caption. See the demo below:

{@snippet features/image-caption}

## Image styles

In simple integrations it is enough to let the user insert images, set their text alternative and the editor's job is done. An example of such a simple solution are e.g. [GitHub](https://github.com) comments. The styling of the images (e.g. their maximum width and margins) is controlled by GitHub through stylesheets.

In more advanced scenarios, the user may need to be able to decide whether the image should take the whole width (e.g. if it is the article's main photo) or it should take e.g. 50% of the width and be pulled out of the content (so called "pulled images"). Various integration scenarios require different types of images to be used.

This is what the {@link module:image/imagestyle~ImageStyle} feature is designed for.

However, unlike in CKEditor 4, the user does not set the border, alignment, margins, width, etc. separately. Instead, the user can pick one of the styles defined by the developer who prepared the editor integration. This gives the developer control over how the users style images and makes the user's life easier by setting multiple properties at once.

A style is applied to the image in form of a class. By default, the editor is configured to support two styles: "full width" (which does not apply any class &mdash; it is the default style) and "side image" (which applies the `image-style-side` class).

A normal (full width) image:

```html
<figure class="image"><img src="..." alt="..."></figure>
```

A side image:

```html
<figure class="image image-style-side"><img src="..." alt="..."></figure>
```

<info-box>
	The actual styling of the images is the developer's job. The editor comes with some default styles, but they will only be applied to images inside the editor. The developer needs to style them on the target pages.

	Here you can find the source of the default styles applied by the editor: [`ckeditor5-image/theme/theme.scss`](https://github.com/ckeditor/ckeditor5-image/blob/master/theme/theme.scss).
</info-box>

Below you can see a demo of the editor with the image styles feature enabled. The default configuration is used. You can change the styles of images through the image's contextual toolbar.

{@snippet features/image-style}

### Configuring image styles

The available image styles can be configured using the {@link module:image/image~ImageConfig#styles `image.styles`} option.

The following editor supports the default style plus left- and right-aligned images:

```js
import fullSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import alignLeftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import alignRightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			styles: [
				// This option is equal to a situation where no style is applied.
				{
					name: 'imageStyleFull',
					title: 'Full size image',
					icon: fullSizeIcon,
					value: null
				},

				// This represents an image aligned to left.
				{
					name: 'imageStyleLeft',
					title: 'Left aligned image',
					icon: alignLeftIcon,
					value: 'left',
					className: 'image-style-left'
				},

				// This represents an image aligned to right.
				{
					name: 'imageStyleRight',
					title: 'Right aligned image',
					icon: alignRightIcon,
					value: 'right',
					className: 'image-style-right'
				}
			],

			toolbar: [ 'imageTextAlternative', '|', 'imageStyleLeft', 'imageStyleFull', 'imageStyleRight' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

```css
.image-style-left {
    float: left;
    width: 50%;
    margin: 1em 1em 1em 0;
}

.image-style-right {
    float: right;
    width: 50%;
    margin: 1em 0 1em 1em;
}

```

{@snippet features/image-style-custom}

<info-box hint>
	In the example above the options used represent simple "align left" and "align right" styles. Most text editors support left, center, right alignments, however, try not to think about CKEditor 5's image styles in this way. Try to understand what use cases the system needs to support and define semantical options accordingly. Defining useful and clear styles is one of the steps towards a good user experience and clear, portable output. For example, the "side image" style can be displayed as a floated image on wide screens and as a normal image on low resolution screens.
</info-box>

## Image upload

TODO...

<!-- TODO 6 -->

## Responsive images

TODO...

<!-- TODO 6 -->

## Installation

To add the image features to your editor install the [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package:

```
npm install --save @ckeditor/ckeditor5-image
```

And add the plugins which you need to your plugin list. You also need to set the image toolbar items.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle ],
		image: {
			toolbar: [ 'imageTextAlternative', '|', 'imageStyleFull', 'imageStyleSide' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

If you are using an editor build, see how to {@link builds/guides/development/custom-builds customize builds}.

## Common API

The {@link module:image/image~Image} plugin registers:

* The `'imageTextAlternative'` button.

The {@link module:image/imagestyle~ImageStyle} plugin registers:

* A command for each defined style (based on the {@link module:image/image~ImageConfig#styles `image.styles`} configuration option) &mdash; e.g. `'imageStyleFull'` and `'imageStyleSide'`,
* A button for each defined style &mdash; e.g. `'imageStyleFull'` and `'imageStyleSide'`.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-image.
