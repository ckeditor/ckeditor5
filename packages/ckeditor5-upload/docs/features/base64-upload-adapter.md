---
category: features-image-upload
menu-title: Base64 upload adapter
meta-title: Base64 upload adapter | CKEditor 5 Documentation
order: 50
---

# Base64 image upload adapter

The Base64 image upload adapter converts inserted images into [Base64-encoded strings](https://en.wikipedia.org/wiki/Base64) in the {@link getting-started/setup/getting-and-setting-data editor output}. The images are stored with other content in the database without any server-side processing.

<info-box warning>
    Remember that while `Base64` upload is an easy solution, it is also highly inefficient. The image file is kept as data in the database, generating a much heavier data load and higher transfer. `Base64` images are never cached by the browser so loading and saving such data will always be slower.

This can be troublesome for some features: {@link features/revision-history revision history} may hence take longer to load revisions. The same applies to {@link features/comments comments}. Content with `Base64` images may also exceed the allowed file size when your document is {@link features/export-pdf exported to PDF} or {@link features/export-word to Word}.

Therefore using the `Base64` feature is a less efficient option to use than some other available ones. Check out the comprehensive {@link features/image-upload image upload overview} guide to learn about other ways to upload images into CKEditor&nbsp;5.
</info-box>

## Demo

Use the editor below to see the adapter in action. Open the web browser console and click the button below the editor to see the base64–encoded image in the editor output data.

{@snippet features/base64-upload}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

```js
import { ClassicEditor, Base64UploadAdapter } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Base64UploadAdapter, /* ... */ ],
		toolbar: [ /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Once enabled in the plugin list, the Base64 image upload adapter works out–of–the–box without any additional configuration.

## Configuration

### Configuring allowed file types

The allowed file types that can be uploaded should actually be configured in two places:

* On the client side, in CKEditor&nbsp;5, restricting image upload through the CKEditor&nbsp;5 UI and commands.
* On the server side, in your server configuration.

#### Client-side configuration

Use the {@link module:image/imageconfig~ImageUploadConfig#types `image.upload.types`} configuration option to define the allowed image MIME types that can be uploaded to CKEditor&nbsp;5.

By default, users can upload `jpeg`, `png`, `gif`, `bmp`, `webp`, and `tiff` files. You can customize this behavior to accept, for example, SVG files (in this case use the `svg+xml` type).

#### Server-side configuration

It is up to you to implement any filtering mechanisms on your server to restrict the types of images allowed to be uploaded.

## What's next

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor&nbsp;5.

See the {@link features/images-overview Image feature guide} to find out more about handling images in CKEditor&nbsp;5 WYSIWYG editor.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-upload](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-upload).
