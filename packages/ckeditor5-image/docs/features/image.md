---
title: Images
category: features
---

{@snippet features/build-image-source}

The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains multiple plugins that implement various image-related features:

* {@link module:image/image~Image} implements basic support for images.
* {@link module:image/imagetoolbar~ImageToolbar} adds the image feature's contextual toolbar.
* {@link module:image/imagecaption~ImageCaption} adds support for captions.
* {@link module:image/imagestyle~ImageStyle} adds support for image styles.
* {@link module:image/imagetextalternative~ImageTextAlternative} adds support for adding text alternative.
* {@link module:image/imageupload~ImageUpload} adds support for uploading dropped or pasted images (see: {@link features/image-upload Image upload}).
* {@link module:image/imageresize~ImageResize} adds support for resizing images.

<info-box info>
	All features listed above expect image resize are enabled by default in all builds.

	Check the documentation of each sub-feature to learn more about it.
</info-box>

## Base image support

The {@link module:image/image~Image} feature adds support for plain images with just the `alt` attribute set. This translates to the following HTML:

```html
<figure class="image">
	<img src="..." alt="...">
</figure>
```

<info-box hint>
	This feature follows the markup proposed by the [Editor Recommendations](https://ckeditor.github.io/editor-recommendations/features/image.html) project.
</info-box>

You can see the demo of an editor with the base image feature enabled below:

{@snippet features/image}

<info-box hint>
	The base image feature, unlike in CKEditor 4, does not support any user interface for inserting or managing images. Its sole purpose is to lay ground for other plugins (mentioned above) to build the target user experience. This pattern (composition of atomic features) is common for CKEditor 5 and allows the developers to build their own customized experience by implementing specific subfeatures differently.
</info-box>

## Image contextual toolbar

The {@link module:image/imagetoolbar~ImageToolbar} plugin introduces a contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options such as the text alternative (which is introduced by the base image plugin) button and [image styles buttons](#image-styles).

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

In simple integrations it is enough to let the user insert images, set their text alternative and the editor's job is done. An example of such a simple solution are e.g. [GitHub](https://github.com) comments. The styling of the images (for example, their maximum width and margins) is controlled by GitHub through stylesheets.

In more advanced scenarios, the user may need to be able to decide whether the image should take the whole width (if it is the article's main photo) or it should take, for example, 50% of the width and be pulled out of the content (so called "pulled images"). Various integration scenarios require different types of images to be used.

This is what the {@link module:image/imagestyle~ImageStyle} feature is designed for.

However, unlike in CKEditor 4, in CKEditor 5 the end user does not set the image border, alignment, margins, width, etc. separately. Instead, they can pick one of the styles defined by the developer who prepared the editor integration. This gives the developer control over how the users style images and makes the user's life easier by setting multiple properties at once.

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
	The actual styling of the images is the developer's job. The editor comes with some default styles, but they will only be applied to images inside the editor. The developer needs to style them appropriately on the target pages.

	You can find the source of the default styles applied by the editor here: [`ckeditor5-image/theme/imagestyle.css`](https://github.com/ckeditor/ckeditor5-image/blob/master/theme/imagestyle.css).
</info-box>

Below you can see a demo of the editor with the image styles feature enabled. The default configuration is used. You can change the styles of images through the image's contextual toolbar.

{@snippet features/image-style}

### Configuring image styles

The available image styles can be configured using the {@link module:image/image~ImageConfig#styles `image.styles`} option.

The following editor supports the default full image style plus left- and right-aligned images:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			// You need to configure the image toolbar, too, so it uses the new style buttons.
			toolbar: [ 'imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight' ],

			styles: [
				// This option is equal to a situation where no style is applied.
				'full',

				// This represents an image aligned to the left.
				'alignLeft',

				// This represents an image aligned to the right.
				'alignRight'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

The code sample above uses predefined image styles: `'full'`, `'alignLeft'` and `'alignRight'`. The latter two apply, respectively, the `.image-style-align-left` and  `.image-style-align-right` classes to the `<figure>` element.

See the result below:

{@snippet features/image-style-custom}

<info-box hint>
	In the example above the options used represent simple "align left" and "align right" styles. Most text editors support left, center and right alignments, however, try not to think about CKEditor 5's image styles in this way. Try to understand what use cases the system needs to support and define semantic options accordingly. Defining useful and clear styles is one of the steps towards a good user experience and clear, portable output. For example, the "side image" style can be displayed as a floated image on wide screens and as a normal image on low resolution screens.
</info-box>

### Defining custom styles

Besides using the {@link module:image/imagestyle/utils~defaultStyles 5 predefined styles}:

* `'full'`,
* `'side'`,
* `'alignLeft'`,
* `'alignCenter'`,
* `'alignRight'`

you can also define your own styles or modify the existing ones.

<info-box>
	Reusing (or modifying) predefined styles has this advantage that CKEditor 5 will use its official translations for the defined button titles.
</info-box>

You can find advanced examples in the {@link module:image/image~ImageConfig#styles `image.styles`} configuration option documentation.

<!-- TODO (live example)... -->

## Image upload

See the {@link features/image-upload Image upload} guide.

## Responsive images

Responsive images support in CKEditor 5 is brought by the {@link features/easy-image Easy Image} feature without any additional configuration. Learn more how to use the feature in your project in the {@link features/easy-image#responsive-images "Easy Image integration"} guide.

## Resizing images

TODO:

* overview
* markup
* styling concerns
* installation
* note about it not being enabled by default
* a note about followups? a dialog, a toggle predefined sizes (e.g. 40%, 50%, 75%, 100%)

{@snippet features/image-resize}

### Using pixels instead of percentage width

TODO:

* overview
* downsides
* configuration

{@snippet features/image-resize-px}

## Installation

To add image features to your editor, install the [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package:

```bash
npm install --save @ckeditor/ckeditor5-image
```

And add the plugins that you need to your plugin list. You also need to set the image toolbar items.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle ],
		image: {
			toolbar: [ 'imageTextAlternative', '|', 'imageStyle:full', 'imageStyle:side' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:image/image~Image} plugin registers:

* The `'imageTextAlternative'` button.
* The {@link module:image/imagetextalternative/imagetextalternativecommand~ImageTextAlternativeCommand `'imageTextAlternative'` command}
* The {@link module:image/image/imageinsertcommand~ImageInsertCommand `'imageInsert'` command} which accepts a source (e.g. an URL) of an image to insert.

The {@link module:image/imagestyle~ImageStyle} plugin registers:

* A button for each defined style &mdash; e.g. `'imageStyle:full'` and `'imageStyle:side'`.
* The {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand `'imageStyle'` command} which accepts a value based on the {@link module:image/image~ImageConfig#styles `image.styles`} configuration option (e.g. `'full'` and `'side'`):

	```js
	editor.execute( 'imageStyle', { value: 'side' } );
	```

The {@link module:image/imageupload~ImageUpload} plugin registers:

* The `'imageUpload'` button which opens the native file browser to let you upload a file directly from your disk.
* The {@link module:image/imageupload/imageuploadcommand~ImageUploadCommand `'imageUpload'` command} which accepts the file to upload.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-image.
