---
category: examples-builds
order: 10
toc: false
classes: main__content--no-toc
---

# Classic editor

{@snippet build-classic-source}

{@link installation/getting-started/predefined-builds#classic-editor Classic editor} shows a boxed editing area with a toolbar, placed in a specific position on the page.

{@snippet examples/classic-editor}

## Editor example configuration

Check out the {@link installation/getting-started/predefined-builds#installation-example Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

ClassicEditor
	.create( document.querySelector( '#snippet-classic-editor' ), {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		cloudServices: {
			// All predefined builds include the Easy Image feature.
			// Provide correct configuration values to use it.
			tokenUrl: 'https://example.com/cs-token-endpoint',
			uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
			// Read more about Easy Image - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html.
			// For other image upload methods see the guide - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html.
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

```

</details>

<details>
<summary>View editor content listing</summary>

```html
<div id="snippet-classic-editor">
	Editor content is inserted here.
</div>

```

</details>
