---
category: features-images
menu-title: Image styles
order: 60
modified_at: 2021-05-30
---
{@snippet features/build-image-source}

# Image styles

## Overview
This package allows adjusting the image appearance by:
* **[Applying CSS classes](#image-classes)** - adding a particular predefined (link?) or custom (link?) CSS class or removing any style-related CSS class,
* **[Managing the HTML representation](#inline-and-block-images)** by changing the image type form inline to block and vice versa. The type conversion occurs if the newly applied style doesn't support the current image type.

<info-box>
	The actual styling of the images is the integrator's job. CKEditor 5 WYSIWYG editor comes with some default styles, but they will only be applied to the images inside the editor. The integrator needs to style them appropriately on the target pages.

	You can find the source of the default styles applied by the editor here: [`ckeditor5-image/theme/imagestyle.css`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/theme/imagestyle.css).

	Read more about {@link builds/guides/integration/content-styles styling the content of the editor}.
</info-box>

## Image classes
The style applied to the image can either add or remove the style-related class from it. This behavior depends on the particular configuration of the {@link module:image/imagestyle~ImageStyleOptionDefinition}. Only the definition with the {@link module:image/imagestyle~ImageStyleOptionDefinition#isDefault} flag set to true will remove any applied image style-related class.

<info-box warning>
	The `ImageStyle` plugin doesn't provide a mechanism to apply a default CSS class to newly inserted images. The initial image appearance should be handled by the integrator by defining the proper custom {@link builds/guides/integration/content-styles content styles}. If desired, the default image appearance customization can be done by overriding the following CSS rules:
	  * `.ck-content .image-inline` for the inline images,
	  * `.ck-content .image` for the block images.
</info-box>

## Inline and block images
Images in the editor can be displayed as one of two types: inline or block.

The inline images are represented as inline HTML elements and can be inserted in the middle of a paragraph or a link just like a regular text. The HTML representation of the inline image looks like this:
* `<span class=”image-style-class”><img></img></span>` in the editable,
* `<img class=”image-style-class”></img>` in the HTML content retrieved by the {@link module:core/editor/utils/dataapimixin~DataApi#getData} method.

Block images, on the other hand, can be inserted only between other blocks like paragraphs, tables or media. The HTML representation of the block image looks like this:
* `<figure class=”image image-style-class”><img></img></figure>`.

Switching between these two types can be executed by applying/removing a style from the image: Each of the defined style options provides a list of the image types which can coexist with it. The inline <-> block conversion occurs if the newly applied style doesn’t support the current image type.

In case of inserting a new image, by default, the editor will choose the optimal image type based on the context of the insertion (e.g. the current selection/position and {@link features/images-installation#inline-and-block-images availability of plugins}). The default type of the newly inserted image can be controlled using the {@link module:image/imageinsert~ImageInsertConfig#type `image.insert.type` configuration}.

## Default styles

The `ImageStyle` plugin provides a set of the default styles depending on the loaded plugins. The table below presents the availability of these styles and the image behavior caused by an application of a particular style. Apart from the predefined styles, the developer can define the [custom styles](#defining-custom-styles).

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
				<th>"full"</th>
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

## Approaches to styling images
CKEditor5 offers two basic approaches to styling the images:
* The particular style can define the image “type”, so it can be styled for example as an avatar, a banner or an emoticon. It will be called a [“semantical style”](#semantical-styles), since it refers to the purpose of the particular image.
* On the other hand, sometimes the user should be able to granularly control how an image is presented thanks to the ability to set the size and alignment separately and completely arbitrary. The style which defines the image alignment will be called a [“presentational”](#presentational-styles), since it refers to the appearance of the image only.

### Semantical styles
A semantical style lets the user choose from predefined appearances of the images. The user is not able to set the image border, alignment, margins, width, etc. separately. Instead, he can pick one of the styles defined by the developer who prepared the WYSIWYG editor integration. Check the list of the available semantical styles in the [table](#styles-table) above.

<info-box warning>
	While semantical styles can be combined with manual {@link features/images-resizing image resizing}, these features were not designed to be used together, as semantical styles usually affects the image size.

	If you want to enable image resizing, use [presentational image styles](#presentational-styles) or define custom semantical styles to make sure that there are no conflicts with the image resizing feature.
</info-box>

#### Default styles
As the most of the default editor builds support editing a structured content, which requires passing the control over the possible image appearances to the developer, they introduces a UI containing a set of buttons applying a semantical styles (taken from the [default styles](#styles-table) listed above).

The example below presents an editor with this basic configuration. The top image is full-width, while the bottom image is a side image. You can change the style of an individual image using the contextual toolbar invoked after an image is clicked.

{@snippet features/image-semantical-style-default}

The editor above doesn't require any configuration using one of the following builds: classic, inline, balloon or balloon-block, for example:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( ... )
	.catch( ... );
```

#### Custom styles

Semantical styles gives the integrator an ability to put at the user's disposal a wide range of predefined image appearances. This gives the developer control over how the users style their images and makes the user's life easier by setting multiple properties at once.

<info-box hint>
	Try to understand what use cases the system needs to support and define semantic options accordingly. Defining useful and clear styles is one of the steps towards a good user experience and clear, portable output. The "side image" in the example below is displayed as a floated image on wide screens and as a normal image on low resolution screens (e.g. mobile browsers).
</info-box>

{@snippet features/image-semantical-style-custom}

```
TODO: editor configuration (CSS???)
```

TODO: editor configuration description
Read more about defining the [custom styles](#defining-custom-styles).

### Presentational styles
Presentational styles do not relate to any special meaning of the content. They directly control the visual aspect of an image. The default available presentational styles determines the image alignment behavior. Check the list of the available semantical styles in the [table](#styles-table) above.

<info-box hint>
	Presentational image styles should be combined with the optional {@link features/images-resizing image resizing feature} as these features were designed to be used together. The image width is then controlled by the image resize feature, while the alignment is controller by the image style feature.

	If you do not enable the image resize feature in your setup using the default presentational styles, your images will always have their original sizes (up to 100% of the editor width) so the alignment may not be visible.

	If you do not want to enable image resizing, you can use [semantical image styles](#semantical-styles) to set the image dimensions.
</info-box>

<!--

The code sample above uses predefined presentational image styles: `'alignLeft'`, `'alignCenter'` and `'alignRight'`. They apply, respectively, the `.image-style-align-left`, `.image-style-align-center` and  `.image-style-align-right` classes to the `<figure>` element.

In addition to that, the sample is configured to use the {@link features/images-resizing image resize feature} with three {@link module:image/image~ImageConfig#resizeOptions resize options} available: `'resizeImage:original'`, `'resizeImage:50'` and `'resizeImage:75'`. They allow you to set the image width in the editor to the original image size, 50% and 75%, respectively.

See the result below:

{@snippet features/image-style-presentational}

-->

## UI
Application of a style can be executed by using one of the buttons created by the `ImageStyle` plugin for each of the default and custom defined styles. Each of the styles will be registered under the name `imageStyle: image-style-name` in the componentsFactory (link) and can be added to the image or main toolbar while creating a editor instance.

It is also possible to group the image styles into the custom drop-downs (TODO: more!).

The default image toolbar has its default configuration already set in the default builds. The default UI of the classic, inline, balloon and balloon block builds consists a set of the buttons applying only the [semantical styles](#semantical-styles) to support creating a structured content. The document editor build UI uses a few buttons applying a [presentational styles](#presentational-styles) and also uses the [semantical styles](#semantical-styles) to reset the image appearance to the default one. All of the builds supports both, block and inline images.
## Defining custom styles

Besides using the {@link module:image/imagestyle/utils~DEFAULT_OPTIONS predefined styles}, you can also define your own styles or modify the existing ones.

<info-box>
	Reusing (or modifying) predefined styles has the following advantage: CKEditor 5 will use its official translations for the defined button titles.
</info-box>

You can find advanced examples in the {@link module:image/image~ImageConfig#styles `config.image.styles`} configuration option documentation.

<!-- TODO (live example)... not today, yet -->

## Installation

This feature is available in all {@link builds/guides/overview ready-to-use editor builds}. If your integrations uses a custom editor build, check out the {@link features/images-installation image features installation} guide to learn how to enable this feature.

TODO: links to API.

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
You can also report an issues or share your thoughts in the GitHub issue TODO: link.
