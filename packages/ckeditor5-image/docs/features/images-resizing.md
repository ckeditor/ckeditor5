---
category: features-images
menu-title: Resizing images
order: 50
modified_at: 2021-06-17
---
{@snippet features/build-image-source}

# Resizing images

The image resize feature lets you change the width of images in your content. It is implemented by the {@link module:image/imageresize~ImageResize} plugin.

## Enabling image resizing

The image resize feature is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build} only. In order to enable it in other builds, you need to load the {@link module:image/imageresize~ImageResize} plugin. Read more in the {@link features/images-resizing#installation installation} section.

## Methods to resize images

The editor offers different ways to resize images either by using "resize handles" or by using dedicated UI components &mdash; either a dropdown or standalone buttons.

The {@link module:image/imageresize~ImageResize} plugin enables the four resize handles displayed over the selected image. The user can freely resize the image by dragging them. The feature can be configured to use either percentage (default) or pixel values.

The plugin also gives you an ability to change the size of the image through the on-click image toolbar. You can set an optional static configuration with {@link module:image/image~ImageConfig#resizeOptions} and choose whether you want to use a dropdown or a set of standalone buttons.

### Using resize handles

In this case, the user is able to resize images by dragging square handles displayed in each corner of the image. Once image resizing is enabled, this option does not require any additional configuration.

Use the corner handles to resize the image and adjust it to the text as needed. You can also use the alignment options from the image toolbar {@icon @ckeditor/ckeditor5-core/theme/icons/object-center.svg Image align} to achieve the desired effect.

Images can also be pre-resized using styling, as observed below (the last three images are hard-set to 28% for the visual consistency of the article).

{@snippet features/image-resize}

<info-box info>
	All demos in this guide only present a limited set of features for clarity. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

You can configure resizing images by handles in two different ways in the CKEditor 5 WYSIWYG editor:

* Either by installing the {@link module:image/imageresize~ImageResize} plugin, which contains **all** needed features (`ImageResizeEditing`, `ImageResizeHandles`, `ImageResizeButtons`) as described in the {@link features/images-resizing#installation installation} of this guide.

* Or by installing the combination of {@link module:image/imageresize/imageresizeediting~ImageResizeEditing} and {@link module:image/imageresize/imageresizehandles~ImageResizeHandles} plugins, that won't load the unnecessary `ImageResizeButtons` plugin:

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting';
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResizeEditing, ImageResizeHandles, /* ... */ ],
		// More of editor's config.
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
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
			name: 'resizeImage:40',
			value: '40',
			label: '40%'
		},
		{
			name: 'resizeImage:60',
			value: '60',
			label: '60%'
		}
	],
	toolbar: [ 'resizeImage', /* ... */ ]
}
```

Try out the live demo of the resize dropdown {@icon @ckeditor/ckeditor5-core/theme/icons/object-size-medium.svg Image resize} available in the image toolbar below.

{@snippet features/image-resize-buttons-dropdown}

<info-box hint>
Images in the example below were prepared to match the exact aspect ratios, so they can be displayed together, with equal heights.

If you want to define the possible aspect ratios of the inserted images, for example allow the user to insert 1:1 and 40% width, and 1:2 and 20% width images, you should use the {@link features/images-styles#configuring-the-styles image style feature}.

The example of CSS fixing the image aspect ratio is in the [last example](#aspect-ratio-css) of this guide.
</info-box>

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
		'resizeImage:50',
		'resizeImage:75',
		'resizeImage:original',
		// More toolbar options.
		// ...
	]
}
```
Try out the live demo of the individual resize buttons available in the image toolbar below {@icon @ckeditor/ckeditor5-core/theme/icons/object-size-large.svg Image resize}:

{@snippet features/image-resize-buttons}

## Disabling image resize handles

If, for some reason, you want to configure the editor in such a way that images can be resized only by buttons, you can do so by omitting the {@link module:image/imageresize/imageresizehandles~ImageResizeHandles `ImageResizeHandles`} plugin.

As a result, your plugin setup should look like this: `plugins: [ 'ImageResizeEditing', 'ImageResizeButtons', /* ... */ ]` as opposed to `plugins: [ 'ImageResize', /* ... */ ]`.

This will enable the image resize feature only by means of the chosen UI: either a [dropdown](#using-resize-dropdown) or [standalone buttons](#using-standalone-resize-buttons)) in the image toolbar.

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeedititing';
import ImageResizeButtons from '@ckeditor/ckeditor5-image/src/imageresize/imageresizebuttons';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResizeEditing, ImageResizeButtons, ImageToolbar, /* ... */ ],
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
			'resizeImage:50',
			'resizeImage:75',
			'resizeImage:original',
			// More toolbar options.
			// ...
		] }
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

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
			resizeUnit: 'px',
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null
				},
				{
					name: 'resizeImage:100',
					label: '100px',
					value: '100'
				},
				{
					name: 'resizeImage:200',
					label: '200px',
					value: '200'
				}
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The following demo uses CSS to set up the fixed image aspect ratio, so a 200px wide image automatically gets the same height.

<div id="aspect-ratio-css"></div>

```css
.ck.ck-content .image {
	position: relative;
}
.ck.ck-content .image img {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}
.ck.ck-content .image::before {
	content: '';
	padding-top: 100%;
	display: block;
}
```
Check out the difference in the live demo below:

{@snippet features/image-resize-px}

## Installation

The image resize feature is enabled by default in the {@link installation/getting-started/predefined-builds#document-editor document editor build} only. To enable it in other editor builds, you need to install the {@link module:image/imageresize~ImageResize} plugin, which contains **all** needed features (`ImageResizeEditing`, `ImageResizeHandles`, `ImageResizeButtons`):

```js
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageResize, /* ... */ ],
		// More of editor's config.
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Common API

The {@link module:image/imageresize~ImageResize} plugin registers:

* Image resize buttons (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imageresize/resizeimagecommand~ResizeImageCommand `'resizeImage'` command} that accepts the target width.

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
