
---
category: builds-migration
menu-title: Migration to v28.x
order: 11
---

# Migration to CKEditor 5 v28.0.0

This migration guide enumerates the most important changes that require your attention when upgrading to CKEditor 5 v28.0.0 due to changes introduced in the `Image` plugin and some other image-related features.

For the entire list of the changes introduced in version 28.0.0 of the CKEditor 5 see the *changelog (link)*.

To see the new editor UI for the images visit the image feature description, especially:
* Images in the structured content,
* Images in the document-like content

## Inline images
From the 28.0.0 version, the existing `Image` plugin loads two independent plugins - `ImageInline` and `ImageBlock`, therefore both of them are included in all of the *predefined editor builds (link)* by default.
* The `ImageInline` is a newly introduced plugin supporting an inline `<img>` tag nested in any *`$block` element (link)* in the editor. In the model, it is represented by an `inlineImage` element.
* The `ImageBlock` maintains the functionality of the previous `Image` plugin. In the model, the previous `image` element is now called `blockImage`.

Note: It is possible to load only one of these plugins, but only when *building the editor from source (link)*.

## Image caption
An image caption is no longer automatically showed up when selecting the image widget. Its visibility can now be toggled by a `toggleImageCaption` button registered by the `ImageCaption` plugin. The button is added to the default image toolbar in all of the *predefined editor builds (link)*.

To provide a valid HTML data output, an image caption is supported for the block images only. Adding a caption to an inline image results in conversion the block image.

## Image styles
Since the appearance of the image in the document depends on the image type (block/inline), the `ImageStyle` plugin is now in charge of switching between these types. Thus, the following changes have been introduced:

* *A new set of buttons (link)* is available to manage the image type and appearance.

* There is a possibility to group the buttons provided by the `ImageStyle` plugin into the dropdowns.
	* A few *default dropdowns (link)* are provided.
	* In the editor configuration *a custom dropdown (link)* can be declared.

* The format of the `config.image.styles` has changed. The list of the supported styles must be wrapped with the `options` array. Read more about the *`image.styles` configuration (link)*.

```js
// Old code
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		styles: [ 'inline', 'full', 'side' ]
	}
} );

// New code
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		styles: {
			options: [ 'inline', 'full', 'side' ]
		}
	}
} );
```

* The format of the `imageStyle` has changed. It must now provide an information about the image types supporting a particular style. Read more about the *`imageStyle` format (link)*.

```js
// Old code
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		styles: [ {
			name: 'alignLeft',
			title: 'Left aligned image',
			icon: objectLeft,
			className: 'image-style-align-left'
		} ]
	}
} );

// New code
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		styles: {
			options: [ {
				name: 'alignLeft',
				title: 'Left aligned image',
				icon: objectLeft,
				// Image types (names of the model elements) supporting this style.
				modelElements: [ 'imageBlock', 'imageInline' ],
				className: 'image-style-align-left'
			} ]
		}
	}
} );
```
* Also, several changes has been made to the `ImageStyle` plugin API:
	* The `ImageStyleCommand#defaultStyle` and `ImageStyleCommand#styles` are private properties now.
	* In the `ImageStyle~utils` module
		* the `defaultIcons` are renamed to `DEFAULT_ICONS`,
		* the `defaultStyles` are renamed to `DEFAULT_OPTIONS`,
		* the `normalizeImageStyles` function is now protected and is renamed to `normalizeStyles`

## Image toolbar

Due to the changes mentioned above, the image toolbar became crucial in terms of providing the user with proper interaction with images in terms of managing the image type and caption. Thus, it is recommended to use one of the following configurations as the minimum set-up for the image toolbar:

* For the purposes of the structured content editing (implemented by default in the classic, balloon, balloon-block, and inline editor builds):

	```js
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} );
	```

* For the purposes of the document-like editing (implemented by default in the decoupled document build).

	```js
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			toolbar: [
				'imageCaption',
				'imageStyle:inline',
				// A drop-down containing `alignLeft` and `alignRight` options
				'imageStyle:wrapText',
				// A drop-down containing `alignBlockLeft`, `full` (default) and  `alignBlockRight` options
				'imageStyle:breakText'
			]
		}
	} );
	```

To view the above configurations, see the *feature description page (link)*.

## Inserting images

When loaded, the `ImageInline` plugin changes the default behavior of inserting/pasting/dropping images into a non-empty `$block` elements - it is now upcasted to the `inlineImage` model element. The image inserted into an empty paragraph is still upcasted to a `blockImage` model element. This behavior can be overridden in the *`ImageInsert` plugin configuration (link)* to force an insertion block or inline images only.

Read more about the *logic controlling the image type while inserting/pasting/dropping (link)*.

## Image utils

The image utils are now wrapped with a plugin exported by the *@ckeditor/ckeditor5-image/src/imageutils module (link)*.

```js
// Old code
import { isImageWidget } from './utils';

function isImageWidget( viewElement ) {
	return isImageWidget( viewElement );
}

// New code
// ...
const imageUtils = this.editor.plugins.get( 'ImageUtils' );

function isImageWidget( viewElement ) {
	return imageUtils.isImageWidget( viewElement );
}
```
* The `insertImage` function
	* doesn't require a `model` parameter any longer,
	* as a second parameter also *`Selectable` (link)* can be passed not only *`Position` (link)*,
	* a new parameter `imageType` is now supported to force a type of the image to be inserted.
```js
// Old code
import { insertImage } from './utils';

const src = 'path/to/image.jpg';
const model = ths.editor.model;
const selection = model.document.selection;
const position = model.createPositionAt( selection.getSelectedElement() );

insertImage( model, { src }, position );

// New code
const src = 'path/to/image.jpg';
const selection = this.editor.model.document.selection;
const imageUtils = this.editor.plugins.get( 'ImageUtils' );
const imageType = 'blockImage';

imageUtils.insertImage( { src }, selection, imageType );
```
* The `isImage` function returns now a `Element` for both, inline and block images.
* There are two new helpers: `isBlockImageView` and `isInlineImageView` functions.
* The `getSelectedImageWidget` function is now protected and is renamed to `getClosestSelectedImageElement`.
* The `getViewImgFromWidget` function is now protected and is renamed to `getViewImageFromWidget`.
* The `isImageAllowed` function is now protected.
* The `isImageWidget` function is now protected.
* The `toImageWidget` function is now protected.

## `EasyImage` plugin

Please note that the {@link module:easy-image/easyimage~EasyImage} plugin is no longer automatically importing the {@link module:image/image~Image} plugin as a dependency. This allows using it alone with either {link module:image/image~ImageBlock} or {link module:image/image~ImageInline} without loading the other.

This decoupling does not have an impact on integrations based on on {@link builds/guides/overview#available-builds official editor builds} or using [the CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).

However, for integrations that {@link builds/guides/integration/advanced-setup build the editor from source}, this means that in order to get Easy Image working properly, the `Image` plugin (or one of {link module:image/image~ImageBlock} or {link module:image/image~ImageInline}) must be imported separately:

```js
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Image from '@ckeditor/ckeditor5-image/src/image';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EasyImage, Image, ... ],
		toolbar: [ 'uploadImage', ... ],

		// ...
	} )
	.then( ... )
	.catch( ... );
```
Check out the comprehensive {@link features/image#installation guide to images} in CKEditor 5 to learn more.
