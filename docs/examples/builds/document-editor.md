---
category: examples-builds
order: 50
toc: false
classes: 'main__content-wide main__content--no-toc'
---

# Document editor

The editor in this example is a feature–rich build focused on rich text editing experience similar to the native word processors. It works best for creating documents which are usually later printed or exported to PDF files.

See the {@link framework/document-editor tutorial} to learn how to create this kind of an editor (and similar) with a custom UI layout on top of {@link module:editor-decoupled/decouplededitor~DecoupledEditor}.

{@snippet examples/document-editor}

## Editor example configuration

Check out the {@link installation/getting-started/predefined-builds#installation-example-5 Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/src/ckeditor';

DecoupledEditor
	.create( document.querySelector( '.document-editor__editable' ), {
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
		const toolbarContainer = document.querySelector( '.document-editor__toolbar' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

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
<div class="document-editor">
	<div class="document-editor__toolbar"></div>
	<div class="document-editor__editable-container">
		<div class="document-editor__editable">
			Editor content is inserted here.
		</div>
	</div>
</div>

<style>
	.document-editor {
		border: 1px solid var(--ck-color-base-border);
		border-radius: var(--ck-border-radius);

		/* Set vertical boundaries for the document editor. */
		max-height: 700px;

		/* This element is a flex container for easier rendering. */
		display: flex;
		flex-flow: column nowrap;
	}

	.document-editor__toolbar {
		/* Make sure the toolbar container is always above the editable. */
		z-index: 1;

		/* Create the illusion of the toolbar floating over the editable. */
		box-shadow: 0 0 5px hsla( 0,0%,0%,.2 );

		/* Use the CKEditor CSS variables to keep the UI consistent. */
		border-bottom: 1px solid var(--ck-color-toolbar-border);
	}

	/* Adjust the look of the toolbar inside of the container. */
	.document-editor__toolbar .ck-toolbar {
		border: 0;
		border-radius: 0;
	}

	/* Make the editable container look like the inside of a native word processor app. */
	.document-editor__editable-container {
		padding: calc( 2 * var(--ck-spacing-large) );
		background: var(--ck-color-base-foreground);

		/* Make it possible to scroll the "page" of the edited content. */
		overflow-y: scroll;
	}

	.document-editor__editable-container .document-editor__editable.ck-editor__editable {
		/* Set the dimensions of the "page". */
		width: 15.8cm;
		min-height: 21cm;

		/* Keep the "page" off the boundaries of the container. */
		padding: 1cm 2cm 2cm;

		border: 1px hsl( 0,0%,82.7% ) solid;
		border-radius: var(--ck-border-radius);
		background: white;

		/* The "page" should cast a slight shadow (3D illusion). */
		box-shadow: 0 0 5px hsla( 0,0%,0%,.1 );

		/* Center the "page". */
		margin: 0 auto;
	}

	/* Override the page's width in the "Examples" section which is wider. */
	.main__content-wide .document-editor__editable-container .document-editor__editable.ck-editor__editable {
		width: 18cm;
	}

	/* Set the default font for the "page" of the content. */
	.document-editor .ck-content,
	.document-editor .ck-heading-dropdown .ck-list .ck-button__label {
		font: 16px/1.6 "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	/* Adjust the headings dropdown to host some larger heading styles. */
	.document-editor .ck-heading-dropdown .ck-list .ck-button__label {
		line-height: calc( 1.7 * var(--ck-line-height-base) * var(--ck-font-size-base) );
		min-width: 6em;
	}

	/* Scale down all heading previews because they are way too big to be presented in the UI.
	Preserve the relative scale, though. */
	.document-editor .ck-heading-dropdown .ck-list .ck-heading_heading1 .ck-button__label,
	.document-editor .ck-heading-dropdown .ck-list .ck-heading_heading2 .ck-button__label {
		transform: scale(0.8);
		transform-origin: left;
	}

	/* Set the styles for "Heading 1". */
	.document-editor .ck-content h2,
	.document-editor .ck-heading-dropdown .ck-heading_heading1 .ck-button__label {
		font-size: 2.18em;
		font-weight: normal;
	}

	.document-editor .ck-content h2 {
		line-height: 1.37em;
		padding-top: .342em;
		margin-bottom: .142em;
	}

	/* Set the styles for "Heading 2". */
	.document-editor .ck-content h3,
	.document-editor .ck-heading-dropdown .ck-heading_heading2 .ck-button__label {
		font-size: 1.75em;
		font-weight: normal;
		color: hsl( 203, 100%, 50% );
	}

	.document-editor .ck-heading-dropdown .ck-heading_heading2.ck-on .ck-button__label {
		color: var(--ck-color-list-button-on-text);
	}

	/* Set the styles for "Heading 2". */
	.document-editor .ck-content h3 {
		line-height: 1.86em;
		padding-top: .171em;
		margin-bottom: .357em;
	}

	/* Set the styles for "Heading 3". */
	.document-editor .ck-content h4,
	.document-editor .ck-heading-dropdown .ck-heading_heading3 .ck-button__label {
		font-size: 1.31em;
		font-weight: bold;
	}

	.document-editor .ck-content h4 {
		line-height: 1.24em;
		padding-top: .286em;
		margin-bottom: .952em;
	}

	/* Make the block quoted text serif with some additional spacing. */
	.document-editor .ck-content blockquote {
		font-family: Georgia, serif;
		margin-left: calc( 2 * var(--ck-spacing-large) );
		margin-right: calc( 2 * var(--ck-spacing-large) );
	}

	@media only screen and (max-width: 960px) {
		/* Because on mobile 2cm paddings are to big. */
		.document-editor__editable-container .document-editor__editable.ck-editor__editable {
			padding: 1.5em;
		}
	}

	@media only screen and (max-width: 1200px) {
		.main__content-wide .document-editor__editable-container .document-editor__editable.ck-editor__editable {
			width: 100%;
		}
	}

	/* Style document editor a'ka Google Docs.*/
	@media only screen and (min-width: 1360px) {
		.main .main__content.main__content-wide {
			padding-right: 0;
		}
	}

	@media only screen and (min-width: 1600px) {
		.main .main__content.main__content-wide {
			width: 24cm;
		}

		.main .main__content.main__content-wide .main__content-inner {
			width: auto;
			margin: 0 50px;
		}

		/* Keep "page" look based on viewport width. */
		.main__content-wide .document-editor__editable-container .document-editor__editable.ck-editor__editable {
			width: 60%;
		}
	}
</style>


```

</details>
