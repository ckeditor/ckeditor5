---
category: features-images
menu-title: Resizing images
order: 50
---
{@snippet features/build-image-source}

# Resizing images

The {@link features/images-styles image styles} feature is meant to give the user a choice between a set of styling options provided by the system (i.e. by the developer or administrator who created it). There are also scenarios where the user should be able to freely set the width of an image. And that is where the image resize feature comes into play. It is implemented by the {@link module:image/imageresize~ImageResize} plugin.

## Methods to resize images

The editor offers different ways to resize images either by using "resize handles" or by using dedicated UI components &mdash; either a dropdown or standalone buttons.

The {@link module:image/imageresize~ImageResize} plugin enables the four resize handles displayed over the selected image. The user can freely resize the image by dragging them. The feature can be configured to use either percentage (default) or pixel values.

The plugin also gives you an ability to change the size of the image through the on-click image toolbar. You can set an optional static configuration with {@link module:image/image~ImageConfig#resizeOptions} and choose whether you want to use a dropdown or a set of standalone buttons.

### Using resize handles

In this case, the user is able to resize images by dragging square handles displayed in each corner of the image. Once [image resizing is enabled](#enabling-image-resizing), this option does not require any additional configuration.

Use the corner handles to resize the image and adjust it to the text as needed. Yu can also use the alignment options from the image toolbar to achieve the desired effect.

Images can also be pre-resized using styling, as observed below (the bottom image is hard-set to 60%).

{@snippet features/image-resize}

You can configure resizing images by handles in two different ways in the CKEditor 5 WYSIWYG editor:

* Either by installing the {@link module:image/imageresize~ImageResize} plugin, which contains **all** needed features (`ImageResizeEditing`, `ImageResizeHandles`, `ImageResizeButtons`):

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

* Or by installing the combination of {@link module:image/imageresize/imageresizeediting~ImageResizeEditing} and {@link module:image/imageresize/imageresizehandles~ImageResizeHandles} plugins:

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

### Using resize dropdown

In this case, the user is able to choose from a set of predefined options. These options can be displayed in form of a dropdown in the image toolbar available after the user clicks the image.

To use this option, you need to [enable image resizing](#enabling-image-resizing) and configure the available {@link module:image/image~ImageConfig#resizeOptions resize options}. Then add the dropdown to the image toolbar configuration.

```js
const imageConfiguration = {
	resizeOptions: [
		{
			name: 'resizeImage:original',
			value: null,
			label: 'Original'
		},
		{
			name: 'resizeImage:50',
			value: '50',
			label: '50%'
		},
		{
			name: 'resizeImage:75',
			value: '75',
			label: '75%'
		}
	],
	toolbar: [ ..., 'resizeImage' ]
}
```

Try out the live demo of the resize dropdown available in the image toolbar below.

{@snippet features/image-resize-buttons-dropdown}

### Using standalone resize buttons

In this case, the resize options are displayed in the form of separate buttons. The benefit of this solution is the smoothest UX as the user needs just one click to resize an image.

To use this option, you need to [enable image resizing](#enabling-image-resizing) and configure the available {@link module:image/image~ImageConfig#resizeOptions resize options}. Then add appropriate buttons to the image toolbar configuration.

```js
const imageConfiguration = {
	resizeOptions: [
		{
			name: 'resizeImage:original',
			value: null,
			icon: 'original'
		},
		{
			name: 'resizeImage:50',
			value: '50',
			icon: 'medium'
		},
		{
			name: 'resizeImage:75',
			value: '75',
			icon: 'large'
		}
	],
	toolbar: [
		...,
		'resizeImage:50',
		'resizeImage:75'
		'resizeImage:original',
	]
}
```
Try out the live demo of the individual resize buttons available in the image toolbar below:

{@snippet features/image-resize-buttons}

## Disabling image resize handles

If, for some reason, you want to configure the editor in such a way that images can be resized only by buttons, you can do so by omitting the {@link module:image/imageresize/imageresizehandles~ImageResizeHandles `ImageResizeHandles`} plugin.

As a result, your plugin setup should look like this: `plugins: [ 'ImageResizeEditing', 'ImageResizeButtons', ... ]` as opposed to `plugins: [ 'ImageResize', ... ]`.

This will enable the image resize feature only by means of the chosen UI: either a [dropdown](#using-resize-dropdown) or [standalone buttons](#using-standalone-resize-buttons)) in the image toolbar.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeedititing';
import ImageResizeButtons from '@ckeditor/ckeditor5-image/src/imageresize/imageresizebuttons';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResizeEditing, ImageResizeButtons, ImageToolbar, ... ],
		image: {
			resizeOptions: [
			{
				name: 'resizeImage:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'resizeImage:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'resizeImage:75',
				value: '75',
				icon: 'large'
			}
		],
		toolbar: [
			// ...,
			'resizeImage:50',
			'resizeImage:75',
			'resizeImage:original',
		]
		}
	} )
	.then( ... )
	.catch( ... );
```

## Enabling image resizing

The image resize feature is not enabled by default in any of the editor builds. In order to enable it, you need to load the {@link module:image/imageresize~ImageResize} plugin. Read more in the {@link features/images-installation installation} section.

## Markup and styling

When you resize an image, the inline `width` style is used and the `<figure>` element is assigned the `image_resized` class:

```html
<figure class="image image_resized" style="width: 75%;">
	<img src="..." alt="...">
</figure>
```

The `image_resized` class is used to disable `max-width` assigned by the {@link features/images-styles image styles} if one is applied to this image. For instance, the "side image" style is defined like this:

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

Another concern when styling resized images is that by default, CKEditor 5 uses `display: table` on `<figure class="image">` elements to make it take up the size of the `<img>` element inside it. Unfortunately, [browsers do not yet support using `max-width` and `width` on the same element if it is styled with `display: table`](https://stackoverflow.com/questions/4019604/chrome-safari-ignoring-max-width-in-table/14420691#14420691). Therefore, `display: block` needs to be used when the image is resized:

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

## Using pixels instead of percentage width

Using percentage widths ensures that the content stays responsive when displayed in places other than the WYSIWYG editor. When the user made an image take up, for example, 60% of the content's width in the editor, if you ever change the width of the target page (where this content is displayed), the image will still take up 60% of that space. The same is true if the page is responsive and adjusts to the viewport's width.

If you configured the editor to use pixel values, the image could take up, for example, too much space after you introduced a new layout for your website.

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

Check out the difference in the live demo below:

{@snippet features/image-resize-px}

## Installation

The image resize feature is enabled by default in the {@link builds/guides/overview#document-editor document editor build} only. Please refer to the {@link features/images-installation installation} guide to learn how to enable it in other editor builds.

## Common API

The {@link module:image/imageresize~ImageResize} plugin registers:

* Image resize buttons (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imageresize/resizeimagecommand~ResizeImageCommand `'resizeImage'` command} that accepts the target width.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
