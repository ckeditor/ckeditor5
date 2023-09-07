---
category: features-images
menu-title: Inserting images via URL
meta-title: Inserting images into content via URL | CKEditor 5 Documentation
meta-description: Learn how to insert your images into the content.
order: 75
---
{@snippet features/build-image-source}

# Inserting images

You can insert images by uploading them directly from your disk, but you can also configure CKEditor&nbsp;5 to let you insert images using URLs. This way you can save time by adding images that are already online.

## Inserting images via a source URL
### Demo

To upload an image, use the image toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/image.svg Image}. If you want to add an image through a URL, click the arrow next to the image button and paste the URL in the dropdown panel. To update an existing image, select it and paste a new URL in the dropdown panel.

{@snippet features/image-insert-via-url}

<info-box info>
	The demos in this guide only present a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

### Installation

<info-box>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

Using the URL of an image, the user may easily paste it into the editor. In order to enable this option, install the `ImageInsert` plugin and add the `insertImage` toolbar item to the toolbar (it replaces the standard `uploadImage` button).

```js
import { ImageInsert } from '@ckeditor/ckeditor5-image';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ /* ... */ , ImageInsert ],
		toolbar: [ /* ... */ , 'insertImage' ]
	} )
```

This will add a new **Insert image** dropdown {@icon @ckeditor/ckeditor5-core/theme/icons/image.svg Insert image} in the toolbar. 

## Inserting images via pasting a URL into the editor

### Demo

You can paste an image URL directly into the editor content, and it will be automatically embedded.

<input class="example-input" type="text" value="https://ckeditor.com/docs/ckeditor5/latest/assets/img/malta.jpg">

{@snippet features/image-insert-via-pasting-url-into-editor}

### Installation

The {@link module:image/autoimage~AutoImage} plugin recognizes image links in the pasted content and embeds them shortly after they are injected into the document to speed up the editing. Accepted image extensions are: `jpg`, `jpeg`, `png`, `gif`, and `ico`. Use the following code to enable the plugin in your editor. There is no toolbar configuration for this feature.

```js
import { AutoImage } from '@ckeditor/ckeditor5-image';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ /* ... */ , AutoImage ]
	} )
```

<info-box>
	The image URL must be the only content pasted to be properly embedded. Multiple links (`"http://image.url http://another.image.url"`) as well as bigger chunks of content (`"This link http://image.url will not be auto–embedded when pasted."`) are ignored.
</info-box>

If the automatic embedding was unexpected, for instance when the link was meant to remain in the content as text, simply undo the action (by clicking the "Undo" button in the toolbar or using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Z</kbd> keystrokes).

## Common API

The {@link module:image/image~Image} plugin registers:

* The {@link module:image/image/insertimagecommand~InsertImageCommand `'insertImage'` command} that accepts a source (e.g. a URL) of an image to insert.

The {@link module:image/imageupload~ImageUpload} plugin registers:

* The `'uploadImage'` button that opens the native file browser to let you upload a file directly from your disk (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imageupload/uploadimagecommand~UploadImageCommand `'uploadImage'` command} that accepts the file to upload.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
