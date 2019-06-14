---
category: features-image-upload
menu-title: Base64 Upload Adapter
order: 40
---

# Base64 Upload Adapter

The {@link module:upload/base64uploadadapter~Base64UploadAdapter} plugin allows inlining images into the editor as a string which is added directly as the editor's content.

## Example

{@snippet features/base64-upload}

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package:

```bash
npm install --save @ckeditor/ckeditor5-upload
```

And add it to your plugin list:

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

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-upload.
