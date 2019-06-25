---
category: features-image-upload
menu-title: Base64 Upload Adapter
order: 40
---

# Base64 Upload Adapter

The {@link module:upload/base64uploadadapter~Base64UploadAdapter Base64 Upload Adapter} plugin converts images inserted into the editor into [Base64 strings](https://en.wikipedia.org/wiki/Base64) stored directly in the {@link builds/guides/integration/saving-data editor output}.

This kind of image upload does not require server processing – images are stored with the rest of the text and displayed by the web browser without additional requests. On the downside, this approach can bloat your database with very long data strings which, in theory, could have a negative impact on the performance.

<info-box>
	Check out the comprehensive {@link features/image-upload Image upload overview} to learn about other ways to upload images into CKEditor 5.
</info-box>

## Example

Use the editor below to see the adapter in action. Open the web browser console and click the button below to see the base64–encoded image in the editor output data.

{@snippet features/base64-upload}

## Installation

<info-box info>
	The [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package is available by default in all builds. The installation instructions are for developers interested in building their own, custom WYSIWYG editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package:

```bash
npm install --save @ckeditor/ckeditor5-upload
```

Then add the {@link module:upload/base64uploadadapter~Base64UploadAdapter `Base64UploadAdapter`} to your plugin list:

```js
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/base64uploadadapter';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Base64UploadAdapter, ... ],
		toolbar: [ ... ]
	} )
	.then( ... )
	.catch( ... );
```

Once enabled in the plugin list, the upload adapter works out–of–the–box without additional configuration.

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/image Image feature} guide to find out more about handling images in CKEditor 5.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-upload.
