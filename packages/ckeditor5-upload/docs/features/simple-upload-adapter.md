---
category: features-image-upload
menu-title: Simple Upload Adapter
order: 50
---

# Simple Upload Adapter

The {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter} plugin that enables file uploads in CKEditor 5 using the external side-server connection.

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-upload`](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload) package:

 ```bash
npm install --save @ckeditor/ckeditor5-upload
```

And add it to your plugin list:

 ```js
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/simpleuploadadapter';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ SimpleUploadAdapter, ... ],
		toolbar: [ ... ],
		simpleUpload: {
			...
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Configuration

All available options are defined in the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadConfig} interface. 

 ## Contribute

 The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-upload.
