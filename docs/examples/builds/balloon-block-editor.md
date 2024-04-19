---
category: examples-builds
meta-title: Balloon block editor build example | CKEditor 5 Documentation
order: 40
toc: false
classes: main__content--no-toc
---

# Balloon block editor

{@link installation/getting-started/predefined-builds#balloon-block-editor Balloon block editor} lets you create your content directly in its target location with the help of two toolbars:

* A balloon toolbar that appears next to the selected editable document element (offering inline content formatting tools).
* A {@link features/blocktoolbar block toolbar} accessible using the toolbar handle button {@icon @ckeditor/ckeditor5-core/theme/icons/drag-indicator.svg Drag indicator}  attached to the editable content area and following the selection in the document (bringing additional block formatting tools). The {@icon @ckeditor/ckeditor5-core/theme/icons/drag-indicator.svg Drag indicator} button is also a handle that can be used to drag and drop blocks around the content.

{@snippet examples/balloon-block-editor}

## Editor example configuration

Check out the {@link installation/getting-started/predefined-builds#installation-example-4 Quick start} guide to learn more about implementing this kind of editor. You will find the implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js

import BalloonEditor from '@ckeditor/ckeditor5-build-balloon-block';

BalloonEditor
	.create( document.querySelector( '#snippet-balloon-block-editor' ), {
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
<div id="snippet-balloon-block-editor">
	Editor content is inserted here.
</div>

<style>
	/* Restrict the width of the editor to isolate it from the content of the guide. */
	#snippet-balloon-block-editor {
		margin-left: 5%;
		margin-right: 5%;
	}
</style>

```

</details>
