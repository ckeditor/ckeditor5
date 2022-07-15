---
category: features-images
menu-title: Image styles
order: 60
modified_at: 2021-06-17
---
{@snippet features/build-image-source}

# Image styles

## Overview
This package allows for adjusting the image appearance by:
* **Applying CSS classes** - adding a particular [predefined](#ready-to-use-styles) or [custom](#configuring-the-styles) CSS class or removing any style-related CSS class,
* **Managing the HTML representation** by changing the image type from inline to block and vice versa. Applying a style may change the type of the image, depending on the configuration of the style.

<info-box>
	The actual styling of the images is the integrator's job. CKEditor 5 WYSIWYG editor comes with some default styles, but they will only be applied to the images inside the editor. The integrator needs to style them appropriately on the target pages.

	You can find the source of the default styles applied by the editor here: [`ckeditor5-image/theme/imagestyle.css`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/theme/imagestyle.css).

	Read more about {@link installation/advanced/content-styles styling the content of the editor}.
</info-box>

### Image classes
The styles applied to the image can either add or remove the style-related class from it. This behavior depends on the particular configuration of the {@link module:image/imagestyle~ImageStyleOptionDefinition}. Only the definition with the {@link module:image/imagestyle~ImageStyleOptionDefinition#isDefault} flag set to true will remove any applied image style-related class.

<info-box warning>
	The `ImageStyle` plugin does not provide any mechanism to apply a default CSS class to newly inserted images. The initial image appearance should be handled by the integrator by defining the proper custom {@link installation/advanced/content-styles content styles}. If desired, the default image appearance customization can be done by overriding the following CSS rules:
	  * `.ck-content .image-inline` for the inline images,
	  * `.ck-content .image` for the block images.
</info-box>

### Inline and block images
Images in the editor can be displayed as either inline or block.

The inline type images are represented as inline HTML elements and can be inserted in the middle of a paragraph or in a link just like a regular text. The HTML representation of the inline image looks like this:
* `<span class=”image-style-class”><img></img></span>` in the editable,
* `<img class=”image-style-class”></img>` in the HTML content retrieved by the {@link module:core/editor/utils/dataapimixin~DataApi#getData} method.

Block type images, on the other hand, can be inserted only between other blocks like paragraphs, tables or media. The HTML representation of the block image looks like this:
* `<figure class=”image image-style-class”><img></img></figure>`.

**Switching between these two types of images can be executed by applying/removing a style from the image**: Each of the defined style options provides a list of the image types which it can be applied to. Applying a style may change the type of the image, depending on the configuration of the style.

When a new image is inserted, the editor will, by default, choose the optimal image type based on the context of the insertion (e.g. the current selection/position and {@link features/images-installation#inline-and-block-images availability of plugins}). The default type of the newly inserted image can be controlled using the {@link module:image/imageinsert~ImageInsertConfig#type `image.insert.type` configuration}.

<info-box hint>
	All of the default editor builds support both block and inline images, but it is also possible to {@link features/images-installation#inline-and-block-images disable one of these types}.
	<!-- TODO: describe this case in the inline and block images installation guide. -->
</info-box>

## UI
Application of a style can be executed by using one of the toolbar buttons created by the `ImageStyle` plugin. Each of the defined styles (both [default](#ready-to-use-styles) and [custom](#configuring-the-styles)) will be registered under the name `imageStyle:image-style-name` in the {@link module:ui/componentfactory~ComponentFactory} and can be added to the image or main toolbar by referencing to this name.

The default image toolbar has its standard configuration already set in the predefined builds.
* The default UI of the classic, inline, balloon and balloon block builds consists of a set of buttons to apply only the [semantical styles](#semantical-styles) to support creating a structured content. [**See a live example**](#semantical-example).
* The document editor build UI uses several buttons for applying [presentational styles](#presentational-styles) and also uses the [semantical styles](#semantical-styles) to reset the image appearance to default. [**See a live example**](#presentational-example).

It is also possible to create a completely custom image styles UI, setting your own icons and tooltips, and grouping the image style buttons into the {@link module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition custom drop-downs}. Read more about it in the [**customizing the image styles UI**](#configuring-the-styles) section of this guide.

## Approaches to styling images
CKEditor5 offers two basic approaches to styling the images:
* A particular style can define the image “type”, so it can be styled for example as an avatar, a banner or an emoticon. It will be called a [“semantical style”](#semantical-styles), since it refers to the purpose of the particular image.
* On the other hand, sometimes the user should be able to granularly control how an image is presented thanks to the ability to set the size and alignment separately and completely arbitrarily. The style that defines the image alignment will be called a [“presentational”](#presentational-styles) one, since it refers only to the appearance of the image.

<info-box hint>
The distinction made above is purely theoretical. Setting up both semantical and presentational styles is done in exactly the same way, using the {@link module:image/image~ImageConfig#styles `ImageConfig#styles`} configuration.
</info-box>

### Semantical styles
A semantical style lets the user choose from predefined appearances of the images. The user is not able to set the image border, alignment, margins, width, etc. separately. Instead, they can pick one of the styles defined by the developer who prepared the WYSIWYG editor integration. Check the list of the available semantical styles in the [table](#ready-to-use-styles) below. Semantical styles give the integrator an ability to put a wide range of predefined image appearances at the user's disposal. This gives the developer control over how the users style their images and makes the user's life easier by setting multiple properties at once.

<info-box hint>
	Try to understand what use cases you system needs to support and define semantic options accordingly. Defining useful and clear styles is one of the steps towards a good user experience and clear, portable output. The "side image" in the example below is displayed as a floated image on wide screens and as a normal image on low resolution screens (e.g. mobile browsers).
</info-box>

<info-box warning>
	While semantical styles can be combined with manual {@link features/images-resizing image resizing}, these features were not designed to be used together, as semantical styles usually also affect the image size.

	If you want to enable image resizing, use [presentational image styles](#presentational-styles) instead or define custom semantical styles to make sure that there are no conflicts with the image resizing feature.
</info-box>

As the most of the predefined editor builds support editing a structured content which requires passing the control over the possible image appearances to the developer, they introduce a UI containing a set of buttons applying the semantical styles (taken from the [default styles](#styles-table) listed below).

The example below presents an editor with such a basic configuration. There are three types of the images:
* **a block image** {@icon @ckeditor/ckeditor5-core/theme/icons/object-center.svg Block image} - a representation of a block image with no style-related CSS class,
* **an inline image** {@icon @ckeditor/ckeditor5-core/theme/icons/object-inline.svg Inline image} - a representation of an inline image with no style-related CSS class,
* **a side image** {@icon @ckeditor/ckeditor5-core/theme/icons/object-inline-right.svg Side image} - a semantical style applying the `image-style-side` CSS class to it.

You can change the style of an individual image using the contextual toolbar invoked after an image is clicked.

<div id="semantical-example">

{@snippet features/image-semantical-style}

</div>

The editor above does not require any configuration, using one of the following builds: classic, inline, balloon or balloon-block, for example:

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( ... )
	.catch( ... );
```

### Presentational styles
Presentational styles do not relate to any special meaning of the content. They directly control the visual aspect of an image. The default available presentational styles determine the image alignment behavior. Check the list of the available semantical styles in the [table](#ready-to-use-styles) below.

<info-box hint>
	Presentational image styles should be combined with the optional {@link features/images-resizing image resizing feature} as these features were designed to be used together. The image width is then controlled by the image resize feature, while the alignment is controlled by the image style feature.

	If you do not enable the image resize feature in your setup while using the default presentational styles, your images will always retain their original sizes (up to 100% of the editor width) so the alignment may not be visible.

	If you do not want to enable image resizing, you can use [semantical styles](#semantical-styles) to set the image dimensions.
</info-box>

The sample editor below uses predefined presentational image styles represented by buttons grouped in the drop-downs by the way the image is displayed in the document:
* **Inline images** {@icon @ckeditor/ckeditor5-core/theme/icons/object-inline.svg Inline images} - displayed inside a line of text. It is a default style for the inline images and it does not apply any CSS class to the image.
* **Images wrapped with text** {@icon @ckeditor/ckeditor5-core/theme/icons/object-inline-left.svg Inline image aligned to the left} - these are the images with the CSS `float` property. They can be either in the inline or block mode, but to keep the valid HTML output, the block images (wrapped with the `<figure>` tags) can only be placed before or after paragraphs, not in the middle of one. It contains the following image styles:
  * `'align-left'` {@icon @ckeditor/ckeditor5-core/theme/icons/object-inline-left.svg Image aligned to the left},
  * `'align-right'` {@icon @ckeditor/ckeditor5-core/theme/icons/object-inline-right.svg Image aligned to the right}.
* **Images placed between the paragraphs** {@icon @ckeditor/ckeditor5-core/theme/icons/object-center.svg Centered image} - block images without the CSS `float` property. It contains following image styles:
  * `'align-block-left'` {@icon @ckeditor/ckeditor5-core/theme/icons/object-left.svg Block image aligned to the left},
  * `'align-block-right'` {@icon @ckeditor/ckeditor5-core/theme/icons/object-right.svg Block image aligned to the right},
  * `'block'` {@icon @ckeditor/ckeditor5-core/theme/icons/object-center.svg Centered block image} - this style is the default one for block images and it does not apply any CSS class to the image.

You can change the style of an individual image using the contextual toolbar invoked after an image is clicked.

In addition to the above, the sample is configured to use the {@link features/images-resizing image resize feature} with three {@link module:image/image~ImageConfig#resizeOptions resize options} available: `'resizeImage:original'`, `'resizeImage:50'` and `'resizeImage:75'`. They allow you to set the image width in the editor to the original image size (up to 100% of the editor window width), 50% and 75% respectively. You can also use the resize handles to set a custom size of the image.

See the result below:

<div id="presentational-example">

{@snippet features/image-style-presentational}

</div>

This set of buttons and styles is available by default in the predefined {@link installation/advanced/predefined-builds#document-editor document editor build} and does not require any additional customization:

```js
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';

DecoupledEditor.
	.create( document.querySelector( '#editor' ) )
	.then( ... )
	.catch( ... );
```

<info-box warning>
At the moment it is not possible to apply multiple styles (classes) to the image at the same time. To apply multiple CSS rules to the image (e.g. a red border AND a left alignment), you should probably consider using the [semantical styles](#semantical-styles).
</info-box>

## Configuring the styles

There are three ways of defining the image styles in the editor configuration:
* using one of the predefined [default styles](#ready-to-use-styles),
* modifying one of the styles mentioned above (you can change the class it applies to the image, the icon, the tooltip and the supported image type),
* defining a completely custom image style.

<info-box>
	Reusing (or modifying) predefined styles has the following advantage: CKEditor 5 will use its official translations provided for the defined button titles.
</info-box>

### Demo

The editor example below shows the possibilities of customizing the image visual representation and customizing image styles UI (icons, tooltips and drop-downs).

{@snippet features/image-style-custom}

The editor presented above uses custom image styles, custom image toolbar configuration with {@link module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition declarative drop-downs}, and some modified [default styles](#ready-to-use-styles). You can find some more examples of using and modifying these styles in the {@link module:image/image~ImageConfig#styles `config.image.styles`} API documentation.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		...
		image: {
			styles: {
				// Defining custom styling options for the images.
				options: [ {
					name: 'side',
					icon: sideIcon,
					title: 'Side image',
					className: 'image-side',
					modelElements: [ 'imageBlock' ]
				}, {
					name: 'margin-left',
					icon: leftIcon,
					title: 'Image on left margin',
					className: 'image-margin-left',
					modelElements: [ 'imageInline' ]
				}, {
					name: 'margin-right',
					icon: rightIcon,
					title: 'Image on right margin',
					className: 'image-margin-right',
					modelElements: [ 'imageInline' ]
				},
				// Modifying icons and titles of the default inline and
				// block image styles to reflect its real appearance.
				{
					name: 'inline',
					icon: inlineIcon
				}, {
					name: 'block',
					title: 'Centered image',
					icon: centerIcon
				} ]
			},
			toolbar: [ {
				// Grouping the buttons for the icon-like image styling
				// into one drop-down.
				name: 'imageStyle:icons',
				items: [
					'imageStyle:margin-left',
					'imageStyle:margin-right',
					'imageStyle:inline'
				],
				defaultItem: 'imageStyle:margin-left'
			}, {
				// Grouping the buttons for the regular
				// picture-like image styling into one drop-down.
				name: 'imageStyle:pictures',
				items: [ 'imageStyle:block', 'imageStyle:side' ],
				defaultItem: 'imageStyle:block'
			}, '|', 'toggleImageCaption', 'linkImage'
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

It also applies multiple CSS rules to not only display custom image styles (the `'image-margin-right'`, `'image-margin-left'` and `'image-side'` classes) properly, but also to provide the default {@link installation/advanced/content-styles content styles}, so the appearance of headers, paragraphs, links, captions and newly inserted images is consistent.

The most important rules regarding the image styling are presented below. You can see the complete content stylesheet [here](https://github.com/ckeditor/ckeditor5/blob/a95554244e9fc71af5aa9e53c6841f114c6d2483/packages/ckeditor5-image/docs/_snippets/features/image-semantical-style-custom.html).

```css
/* Defining the default content styles for the block images.
This is what the newly inserted image without any
style-specific class will look like. */
.ck-content .image {
	margin-top: 50px;
	margin-bottom: 50px;
}
.ck-content .image img {
	border-radius: 50%;
	width: 180px;
	height: 180px;
	object-fit: cover;
	filter: grayscale(100%) brightness(70%);
	box-shadow: 10px 10px 30px #00000078;
}
.ck-content .image::before {
	content: '';
	width: 100%;
	height: 100%;
	background-color: #1138b0;
	top: 5%;
	left: 5%;
	position: absolute;
	border-radius: 50%;
}
.ck-content .image::after {
	content: '';
	width: 200%;
	height: 200%;
	background-image: url(../../assets/img/image-context.svg);
	background-size: contain;
	background-repeat: no-repeat;
	position: absolute;
	top: -60%;
	pointer-events: none;
	left: -60%;
}

/* Defining the default content styles for the inline images.
This is what the newly inserted image without any
style-specific class will look like. */
.ck-content .image-inline {
	margin: 0 4px;
	vertical-align: middle;
	border-radius: 12px;
}
.ck-content .image-inline img {
	width: 24px;
	max-height: 24px;
	min-height: 24px;
	filter: grayscale(100%);
}

/* Defining the custom content styles for the images
placed on the side of the editing area. */
.ck-content .image.image-side {
	float: right;
	margin-right: -200px;
	margin-left: 50px;
	margin-top: -50px;
}
.ck-content .image.image-side img {
	width: 360px;
	height: 360px;
}

/* Defining the custom content styles for the images
placed on the editor margins. */
.ck-content .image-inline.image-margin-left,
.ck-content .image-inline.image-margin-right {
	position: absolute;
	margin: 0;
	top: auto;
}
.ck-content .image-inline.image-margin-left {
	left: calc( -12.5% - var(--icon-size) / 2 );
}
.ck-content .image-inline.image-margin-right {
	right: calc( -12.5% - var(--icon-size) / 2 );
}
.ck-content .image-inline.image-margin-left img,
.ck-content .image-inline.image-margin-right img {
	filter: none;
}

/* Defining the custom content styles for the image captions. */
.ck-content .image > figcaption {
	z-index: 1;
	position: absolute;
	bottom: 20px;
	left: -20px;
	font-style: italic;
	border-radius: 41px;
	background-color: #ffffffe8;
	color: #1138b0;
	padding: 5px 12px;
	font-size: 13px;
	box-shadow: 0 0 18px #1a1a1a26
}
```
### Ready-to-use styles

The `ImageStyle` plugin provides a set of default styles depending on the loaded plugins. The table below presents the availability of these styles and the image behavior caused by an application of a particular style.

<figure class="table" id="styles-table">
	<table style="text-align: left">
		<thead>
			<tr>
				<th>Style name</th>
				<th>Required plugins</th>
				<th>Converts to</th>
				<th>Applies class</th>
				<th>Type</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th>"block"</th>
				<td><code>ImageBlock</code></td>
				<td>block</td>
				<td>removes all classes (default style)</td>
				<td>semantical</td>
			</tr>
			<tr>
				<th>"inline"</th>
				<td><code>ImageInline</code></td>
				<td>inline</td>
				<td>removes all classes (default style)</td>
				<td>semantical</td>
			</tr>
			<tr>
				<th>"side"</th>
				<td><code>ImageBlock</code></td>
				<td>block</td>
				<td><code>image-style-side</code></td>
				<td>semantical</td>
			</tr>
			<tr>
				<th>"alignLeft"</th>
				<td>any</td>
				<td>-</td>
				<td><code>image-style-align-left</code></td>
				<td>presentational</td>
			</tr>
			<tr>
				<th>"alignRight"</th>
				<td>any</td>
				<td>-</td>
				<td><code>image-style-align-right</code></td>
				<td>presentational</td>
			</tr>
			<tr>
				<th>"alignBlockLeft"</th>
				<td><code>ImageBlock</code></td>
				<td>block</td>
				<td><code>image-style-align-block-left</code></td>
				<td>presentational</td>
			</tr>
			<tr>
				<th>"alignBlockRight"</th>
				<td><code>ImageBlock</code></td>
				<td>block</td>
				<td><code>image-style-align-block-right</code></td>
				<td>presentational</td>
			</tr>
			<tr>
				<th>"alignCenter"</th>
				<td><code>ImageBlock</code></td>
				<td>block</td>
				<td><code>image-style-align-center</code></td>
				<td>presentational</td>
			</tr>
		</tbody>
	</table>
</figure>

## Installation

This feature is available in all {@link installation/advanced/predefined-builds ready-to-use editor builds}. If your integrations uses a custom editor build, check out the {@link features/images-installation image feature installation guide} to learn how to enable this feature.

## Common API

The {@link module:image/imagestyle~ImageStyle} plugin registers:

* A button for each defined style, for example: `'imageStyle:block'` and `'imageStyle:side'` (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand `'imageStyle'` command} that accepts a value based on the {@link module:image/image~ImageConfig#styles `image.styles`} configuration option (for example, `'block'` and `'side'`):

	```js
	editor.execute( 'imageStyle', { value: 'side' } );
	```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
