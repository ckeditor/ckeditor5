---
category: features-image-upload
menu-title: Base64 upload adapter
order: 40
---

# Base64 image upload adapter

The {@link module:upload/adapters/base64uploadadapter~Base64UploadAdapter Base64 image upload adapter} plugin converts images inserted into the rich-text editor into [Base64-encoded strings](https://en.wikipedia.org/wiki/Base64) in the {@link builds/guides/integration/saving-data editor output}.

This kind of image upload does not require any server-side processing &mdash; images are stored with the rest of the text and displayed by the web browser without additional requests. On the downside, this approach can bloat your database with very long data strings which, in theory, could have a negative impact on the performance.

<info-box>
	Check out the comprehensive {@link features/image-upload Image upload overview} to learn about other ways to upload images into CKEditor 5.
</info-box>

## Demo

Use the editor below to see the adapter in action. Open the web browser console and click the button below to see the base64–encoded image in the editor output data.

{@snippet features/base64-upload}

## Installation

First, install the [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package:

```plaintext
npm install --save @ckeditor/ckeditor5-upload
```

Add the {@link module:upload/adapters/base64uploadadapter~Base64UploadAdapter `Base64UploadAdapter`} to your plugin list:

```js
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Base64UploadAdapter, ... ],
		toolbar: [ ... ]
	} )
	.then( ... )
	.catch( ... );
```

Once enabled in the plugin list, the Base64 image upload adapter works out–of–the–box without any additional configuration.

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuration

### Configuring allowed file types

The allowed file types that can be uploaded should actually be configured in two places:

* On the client side, in CKEditor 5, restricting image upload through the CKEditor 5 UI and commands.
* On the server side, in your server configuration.

#### Client-side configuration

Use the {@link module:image/imageupload~ImageUploadConfig#types `image.upload.types`} configuration option to define the allowed image MIME types that can be uploaded to CKEditor 5.

By default, users are allowed to upload `jpeg`, `png`, `gif`, `bmp`, `webp` and `tiff` files, but you can customize this behavior to accept, for example, SVG files.

#### Server-side configuration

It is up to you to implement any filtering mechanisms on your server in order to restrict the types of images that are allowed to be uploaded.

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/image Image feature} guide to find out more about handling images in CKEditor 5 WYSIWYG editor.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-upload.
