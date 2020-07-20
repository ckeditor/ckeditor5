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
* {@link module:link/linkimage~LinkImage} adds support for linking images.

<info-box info>
	All features listed above except the image resize and image linking are enabled by default in all WYSIWYG editor builds.

	Check the documentation of each subfeature to learn more about it.
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

You can see the demo of a WYSIWYG editor with the base image feature enabled below:

{@snippet features/image}

<info-box hint>
	The base image feature, unlike in CKEditor 4, does not support any user interface for inserting or managing images. Its sole purpose is to lay ground for other plugins (mentioned above) to build the target user experience. This pattern (composition of atomic features) is common for CKEditor 5 and allows the developers to build their own customized experience by implementing specific subfeatures differently.
</info-box>

## Image contextual toolbar

The {@link module:image/imagetoolbar~ImageToolbar} plugin introduces a contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options such as the text alternative (which is introduced by the base image plugin) button and [image styles buttons](#image-styles).

See a demo of a WYSIWYG editor with the contextual toolbar enabled:

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

However, unlike in CKEditor 4, in CKEditor 5 the end user does not set the image border, alignment, margins, width, etc. separately. Instead, they can pick one of the styles defined by the developer who prepared the WYSIWYG editor integration. This gives the developer control over how the users style images and makes the user's life easier by setting multiple properties at once.

A style is applied to the image in form of a class. By default, CKEditor 5 is configured to support two styles: "full width" (which does not apply any class &mdash; it is the default style) and "side image" (which applies the `image-style-side` class).

A normal (full width) image:

```html
<figure class="image"><img src="..." alt="..."></figure>
```

A side image:

```html
<figure class="image image-style-side"><img src="..." alt="..."></figure>
```

<info-box>
	The actual styling of the images is the developer's job. CKEditor 5 WYSIWYG editor comes with some default styles, but they will only be applied to images inside the editor. The developer needs to style them appropriately on the target pages.

	You can find the source of the default styles applied by the editor here: [`ckeditor5-image/theme/imagestyle.css`](https://github.com/ckeditor/ckeditor5-image/blob/master/theme/imagestyle.css).
</info-box>

Below you can see a demo of the WYSIWYG editor with the image styles feature enabled. The default configuration is used. You can change the styles of images through the image's contextual toolbar.

{@snippet features/image-style}

### Configuring image styles

The available image styles can be configured using the {@link module:image/image~ImageConfig#styles `image.styles`} option.

The following WYSIWYG editor supports the default full image style plus left- and right-aligned images:

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
	In the example above the options represent simple "align left" and "align right" styles. Most text editors support left, center and right alignments, however, it is better not to think about CKEditor 5's image styles in this way. Try to understand what use cases the system needs to support and define semantic options accordingly. Defining useful and clear styles is one of the steps towards a good user experience and clear, portable output. For example, the "side image" style can be displayed as a floated image on wide screens and as a normal image on low resolution screens.
</info-box>

### Defining custom styles

Besides using the {@link module:image/imagestyle/utils~defaultStyles five predefined styles}:

* `'full'`,
* `'side'`,
* `'alignLeft'`,
* `'alignCenter'`,
* `'alignRight'`

you can also define your own styles or modify the existing ones.

<info-box>
	Reusing (or modifying) predefined styles has the following advantage: CKEditor 5 will use its official translations for the defined button titles.
</info-box>

You can find advanced examples in the {@link module:image/image~ImageConfig#styles `image.styles`} configuration option documentation.

<!-- TODO (live example)... -->

## Image upload

See the {@link features/image-upload Image upload} guide.

## Responsive images

Support for responsive images in CKEditor 5 is brought by the {@link features/easy-image Easy Image} feature without any additional configuration. Learn more how to use the feature in your project in the {@link features/easy-image#responsive-images Easy Image integration} guide.

## Resizing images

The [image styles](#image-styles) feature is meant to give the user the choice between a set of styling options provided by the system (so by the developer or administrator who created it). There are also scenarios where the user should be able to freely set the width of an image. And that is where the image resize feature comes to play.

It is implemented by the {@link module:image/imageresize~ImageResize} plugin and enables four "resize handles" displayed over the selected image. The user can freely resize the image by dragging them. The feature can be configured to use either percentage (default) or pixel values.

The plugin also gives you an ability to change the size of the image through the image toolbar. You can set an optional static configuration with {@link module:image/image~ImageConfig#resizeOptions} and choose whether you want to use a dropdown or set of the standalone buttons.

### Resize image using handles

{@snippet features/image-resize}

You can configure the editor for resizing images by handles in two different ways:

- By installing the {@link module:image/imageresize~ImageResize} plugin, which contains **all** needed features (`ImageResizeEditing`, `ImageResizeHandles`, `ImageResizeUI`).

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResize, ... ],
		...
	} )
	.then( ... )
	.catch( ... );
```

- Or by installing the combination of {@link module:image/imageresize/imageresizeediting~ImageResizeEditing} and {@link module:image/imageresize/imageresizehandles~ImageResizeHandles} plugins.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting';
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResizeEditing, ImageResizeHandles, ... ],
		...
	} )
	.then( ... )
	.catch( ... );
```

Both ways enable resize handles by default.


### Resize image using the plugin dropdown

```js
const imageConfiguration = {
	resizeOptions: [
		{
			name: 'imageResize:original',
			label: 'Original size',
			value: null
		},
		{
			name: 'imageResize:50',
			label: '50%',
			value: '50'
		},
		{
			name: 'imageResize:75',
			label: '75%',
			value: '75'
		}
	],
	toolbar: [ ... , 'imageResize' ]
}
```

{@snippet features/image-resizeuidropdown}

### Resize image using the standalone buttons

```js
const imageConfiguration = {
	resizeOptions: [
		{
			name: 'imageResize:original',
			label: 'Original size',
			value: null
		},
		{
			name: 'imageResize:50',
			label: '50%',
			value: '50'
		},
		{
			name: 'imageResize:75',
			label: '75%',
			value: '75'
		}
	],
	toolbar: [
		// ...,
		'imageResize:original',
		'imageResize:50',
		'imageResize:75'
	]
}
```

{@snippet features/image-resizeui}

### Disabling image resize handles

If for some reason you want to configure the editor where you can resize the images only by image toolbar UI, you can do it in two different ways.

 - Having installed {@link module:image/imageresize~ImageResize `ImageResize`} plugin you can set {@link module:image/image~ImageConfig#disableResizeHandles `image.disableResizeHandles: true`}. This setting will {@link module:core/plugin~Plugin#forceDisabled disable} the {@link module:image/imageresize/imageresizehandles~ImageResizeHandles `ImageResizeHandles`} plugin.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResize, ImageToolbar, ... ],
		image: {
			disableResizeHandles: true,
			resizeOptions: [
			{
				name: 'imageResize:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'imageResize:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'imageResize:75',
				value: '75',
				icon: 'large'
			}
		],
		toolbar: [
			// ...,
			'imageResize:50',
			'imageResize:75',
			'imageResize:original',
		]
		}
	} )
	.then( ... )
	.catch( ... );
```

- Or you can simply do not install {@link module:image/imageresize/imageresizehandles~ImageResizeHandles `ImageResizeHandles`} plugin at all. This means that your plugins setup will look like this: `plugins: [ 'ImageResizeEditing', 'ImageResizeUI', ... ]` which only enables resizing image feature by the choosen UI ([dropdown](#resize-image-using-the-plugin-dropdown) or [standalone buttons](#resize-image-using-the-standalone-buttons)) in the image toolbar.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeedititing';
import ImageResizeUI from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeui';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResizeEditing, ImageResizeUI, ImageToolbar, ... ],
		image: {
			resizeOptions: [
			{
				name: 'imageResize:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'imageResize:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'imageResize:75',
				value: '75',
				icon: 'large'
			}
		],
		toolbar: [
			// ...,
			'imageResize:50',
			'imageResize:75',
			'imageResize:original',
		]
		}
	} )
	.then( ... )
	.catch( ... );
```

### Enabling image resizing

The image resize feature is not enabled by default in any of the editor builds. In order to enable it, you need to load the {@link module:image/imageresize~ImageResize} plugin. Read more in the [Installation](#installation) section.

### Markup and styling

When you resize an image, the inline `width` style is used and the `<figure>` is assigned the `image_resized` class:

```html
<figure class="image image_resized" style="width: 75%;">
	<img src="..." alt="...">
</figure>
```

The `image_resized` class is used to disable `max-width` assigned by the [image styles](#image-styles) if one is applied to this image. For instance, the "side image" style is defined like this:

```css
.ck-content .image-style-side {
	max-width: 50%;
	float: right;
	margin-left: var(--ck-image-style-spacing);
}
```

And the `max-width` gets overridden by the following rule:

```css
.ck-content .image.image_resized {
	max-width: 100%;
}
```

Another concern when styling resized images is that by default, CKEditor 5 uses `display: table` on `<figure class="image">` to make it take the size of the `<img>` element inside it. Unfortunately, [browsers do not yet support using `max-width` and `width` on the same element if it is styled with `display: table`](https://stackoverflow.com/questions/4019604/chrome-safari-ignoring-max-width-in-table/14420691#14420691). Therefore, `display: block` needs to be used when the image is resized:

```css
.ck-content .image.image_resized {
	display: block;
	box-sizing: border-box;
}

.ck-content .image.image_resized img {
	width: 100%;
}

.ck-content .image.image_resized > figcaption {
	display: block;
}
```

### Using pixels instead of percentage width

Using percentage widths ensures that content stays responsive when displayed in different places than in the WYSIWYG editor. If the user made an image take 60% of the content's width in the editor, if you ever change the width of the target page (where this content is displayed), the image will still take 60% of that space. The same is true if the page is responsive and adjusts to the viewport's width.

If you configured the editor to use pixel values, the image could take, for example, too much space after you introduced a new layout for your website.

However, there are cases where pixel values may be preferred. You can thus configure the editor to use them by setting the {@link module:image/image~ImageConfig#resizeUnit `config.image.resizeUnit`} option:

```js
ClassicEditor
	.create( editorElement, {
		image: {
			resizeUnit: 'px'
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/image-resize-px}

## Linking images

The {@link module:link/linkimage, ... adds support for linking images. Some use cases where this is needed are:

* Linking to a high-resolution version of an image.
* Using images as thumbnails linking to an article or product page.
* Creating banners linking to other pages.

```html
<figure class="image">
	<a href="...">
		<img src="..." alt="...">
	</a>
	<figcaption>Image caption</figcaption>
</figure>
```

{@snippet features/image-link}

### Enabling image linking

The image linking feature is not enabled by default in any of the editor builds. In order to enable it, you need to load the {@link module:link/linkimage~LinkImage} plugin. Read more in the [Installation](#installation) section.

<info-box info>
	The {@link module:link/linkimage~LinkImage} plugin is available in the {@link api/link `@ckeditor/ckeditor5-link`} package.
</info-box>

## Installation

To add image features to your rich-text editor, install the [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package:

```plaintext
npm install --save @ckeditor/ckeditor5-image @ckeditor/ckeditor5-link
```

And add the plugins that you need to your plugin list. You also need to set the image toolbar items.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage ],
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative',
				'|',
				'linkImage'
			]
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

The {@link module:image/imageresize~ImageResize} plugin registers:

* The {@link module:image/imageresize/imageresizecommand~ImageResizeCommand `'imageResize'` command} which accepts the target width.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
