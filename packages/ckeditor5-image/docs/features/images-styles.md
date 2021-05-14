---
category: features-images
menu-title: Image styles
order: 60
---
{@snippet features/build-image-source}

# Image styles

In simple integrations it is enough to let the user insert images, set their text alternative and the editor's job is done. An example of such a simple solution are, for example, [GitHub](https://github.com/) comments. The styling of the images (for example, their maximum width and margins) is controlled by GitHub through stylesheets.

In more advanced scenarios, the user may need to be able to decide about the image's width. Should it take up the whole width (if it is the article's main photo) or should it take up, for example, 50% of the width and be pulled out of the content (so called "pulled images")? Various integration scenarios require different types of images to be used.

Finally, in certain situations, the user should be able to granularly control how an image is presented thanks to the ability to set the size and alignment separately.

The {@link module:image/imagestyle~ImageStyle} feature solves the last two scenarios. The former is handled by so-called ["semantical styles"](#semantical-styles) and the latter by ["presentational styles"](#presentational-styles) in combination with the {@link features/images-resizing image resize} feature. This is part of the wider approach to controling styles and content, as described in the {@link builds/guides/integration/content-styles content styles} guide.

The available image styles can be configured using the {@link module:image/image~ImageConfig#styles `config.image.styles`} option. Respective buttons should also be added to the image toolbar via {@link module:image/image~ImageConfig#toolbar `config.image.toolbar`}.

### Semantical styles

A semantical style lets the user choose from predefined "types" of images. The user is not able to set the image border, alignment, margins, width, etc. separately. Instead, they can pick one of the styles defined by the developer who prepared the WYSIWYG editor integration. This gives the developer control over how the users style their images and makes the user's life easier by setting multiple properties at once.

A style is applied to the image in form of a class. By default, CKEditor 5 is configured to support two default semantical styles: **"full width"** (which does not apply any class &mdash; it is the default style) and **"side image"** (which applies the `image-style-side` class).

A normal (full width) image:

```html
<figure class="image"><img src="..." alt="..."></figure>
```

A side image:

```html
<figure class="image image-style-side"><img src="..." alt="..."></figure>
```

<info-box>
	The actual styling of the images is the integrator's job. CKEditor 5 WYSIWYG editor comes with some default styles, but they will only be applied to the images inside the editor. The integrator needs to style them appropriately on the target pages.

	You can find the source of the default styles applied by the editor here: [`ckeditor5-image/theme/imagestyle.css`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/theme/imagestyle.css).

	Read more about {@link builds/guides/integration/content-styles styling the content of the editor}.
</info-box>

Below you can find a demo of the WYSIWYG editor with the semantical image styles. The "full" and "side" styles are the default value of {@link module:image/image~ImageConfig#styles `config.image.styles`} so you do not need to set it.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle ],
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			],

			// The default value.
			styles: [
				'full',
				'side'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

See the result in the WYSIWYG editor below. You can change the style of an image through the image's contextual toolbar.

{@snippet features/image-style}

<info-box hint>
	Try to understand what use cases the system needs to support and define semantic options accordingly. Defining useful and clear styles is one of the steps towards a good user experience and clear, portable output. For example, the "side image" style can be displayed as a floated image on wide screens and as a normal image on low resolution screens (e.g. mobile browsers).
</info-box>

<info-box warning>
	While semantical styles can be combined with manual {@link features/images-resizing image resizing}, these features were not designed to be used together.

	If you want to enable image resizing, use [presentational image styles](#presentational-styles).
</info-box>

### Presentational styles

Presentational styles do not add any special meaning to the content. They directly control the visual aspect of an image.

Currently, the available presentational styles are "align center", "align left" and "align right".

<info-box warning>
	Presentational image styles should be combined with the optional {@link features/images-resizing image resizing feature} as these features were designed to be used together. The image width is then controlled by the image resize feature.

	If you do not enable the image resize feature in your setup using the default presentational styles, your images will always take up 100% of the editor width so the alignment may not be visible.

	If you do not want to enable image resizing, use [semantical image styles](#semantical-styles).
</info-box>

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			// Configure the available styles.
			styles: [
				'alignLeft', 'alignCenter', 'alignRight'
			],

			// Configure the available image resize options.
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],

			// You need to configure the image toolbar, too, so it shows the new style
			// buttons as well as the resize buttons.
			toolbar: [
				'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
				'|',
				'resizeImage',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

The code sample above uses predefined presentational image styles: `'alignLeft'`, `'alignCenter'` and `'alignRight'`. They apply, respectively, the `.image-style-align-left`, `.image-style-align-center` and  `.image-style-align-right` classes to the `<figure>` element.

In addition to that, the sample is configured to use the {@link features/images-resizing image resize feature} with three {@link module:image/image~ImageConfig#resizeOptions resize options} available: `'resizeImage:original'`, `'resizeImage:50'` and `'resizeImage:75'`. They allow you to set the image width in the editor to the original image size, 50% and 75%, respectively.

See the result below:

{@snippet features/image-style-presentational}

### Defining custom styles

Besides using the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS five predefined styles}:

* `'full'`,
* `'side'`,
* `'alignLeft'`,
* `'alignCenter'`,
* `'alignRight'`

you can also define your own styles or modify the existing ones.

<info-box>
	Reusing (or modifying) predefined styles has the following advantage: CKEditor 5 will use its official translations for the defined button titles.
</info-box>

You can find advanced examples in the {@link module:image/image~ImageConfig#styles `config.image.styles`} configuration option documentation.

<!-- TODO (live example)... not today, yet -->

## Installation

This feature is available in all {@link builds/guides/overview ready-to-use editor builds}. If your integrations uses a custom editor build, check out the {@link features/images-installation image features installation} guide to learn how to enable this feature.

## Common API

The {@link module:image/imagestyle~ImageStyle} plugin registers:

* A button for each defined style, for example: `'imageStyle:full'` and `'imageStyle:side'` (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand `'imageStyle'` command} that accepts a value based on the {@link module:image/image~ImageConfig#styles `image.styles`} configuration option (for example, `'full'` and `'side'`):

	```js
	editor.execute( 'imageStyle', { value: 'side' } );
	```

* [TODO] more about declarative style dropdowns

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
