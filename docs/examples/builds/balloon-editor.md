---
category: examples-builds
order: 30
toc: false
classes: main__content--no-toc
---

# Balloon editor

{@link installation/getting-started/predefined-builds#balloon-editor Balloon editor} lets you create your content directly in its target location with the help of a balloon toolbar that appears next to the selected editable document element.

{@snippet examples/balloon-editor}

## Editor example configuration

Check out the {@link installation/getting-started/predefined-builds#installation-example-3 Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js

import BalloonEditor from '@ckeditor/ckeditor5-build-balloon/src/ckeditor';

BalloonEditor
	.create( document.querySelector( '#snippet-balloon-editor' ), {
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
<div id="snippet-balloon-editor">
	Editor content is inserted here.
</div>

<style>
	/* Restrict the width of the editor to isolate it from the content of the guide. */
	#snippet-balloon-editor {
		margin-left: 5%;
		margin-right: 5%;
	}
</style>

```

</details>
