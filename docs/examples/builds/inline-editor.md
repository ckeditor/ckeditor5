---
category: examples-builds
order: 20
toc: false
classes: main__content--no-toc
---

# Inline editor

{@link installation/getting-started/predefined-builds#inline-editor Inline editor} lets you create your content directly in its target location with the help of a floating toolbar that apprears when the editable text is focused.

In this example the {@link features/images-styles image styles} configuration was changed to enable left- and right-aligned images.

{@snippet examples/inline-editor}

## Editor example configuration

Check out the {@link installation/getting-started/predefined-builds#installation-example-2 Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js

import InlineEditor from '@ckeditor/ckeditor5-build-inline/src/ckeditor';

const inlineInjectElements = document.querySelectorAll( '#snippet-inline-editor [data-inline-inject]' );

Array.from( inlineInjectElements ).forEach( inlineElement => {
	const config = {
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
		},
	};

	if ( inlineElement.tagName.toLowerCase() == 'header' ) {
		config.removePlugins = [
			'Blockquote',
			'Image',
			'ImageCaption',
			'ImageStyle',
			'ImageToolbar',
			'ImageUpload',
			'List',
			'EasyImage',
			'CKFinder',
			'CKFinderUploadAdapter'
		];
		config.toolbar.items = [ 'heading', '|', 'bold', 'italic', 'link' ];
	} else {
		config.image = {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		};
	}

	InlineEditor
		.create( inlineElement, config )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err );
		} );
} );

```

</details>

<details>
<summary>View editor content listing</summary>

```html
<div id="snippet-inline-editor">
	<header data-inline-inject="true">
		Editor content is inserted here.
	</header>

	<div data-inline-inject="true">
		Editor content is inserted here.
	</div>

	<div class="demo-row">
		<div class="demo-row__half">
			<div data-inline-inject="true">
				Editor content is inserted here.
			</div>
		</div>

		<div class="demo-row__half">
			<div data-inline-inject="true">
				Editor content is inserted here.
			</div>
		</div>
	</div>
</div>

```

</details>
