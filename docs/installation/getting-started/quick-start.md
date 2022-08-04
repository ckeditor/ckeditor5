---
# Scope:
# - Guidance on all possible installation options.

category: getting-started
order: 10
modified_at: 2022-06-27
---

# Quick start

## Introduction
In this guide, you will find the quickest and easiest way to run ready-to-use CKEditor 5 with minimal effort &ndash; by running the editor from [CDN](https://cdn.ckeditor.com/).

<info-box>
	Please bear in mind that the CDN solution only offers {@link installation/advanced/predefined-builds ready-to-use predefined editor builds}, hence it is not possible to add new plugins and all the features available in the editor are preset.

	Should you need a more flexible solution, consider using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or try {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.
</info-box>

## Running a simple editor

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

Let us run a classic editor build as an example. In your HTML page add an element that will serve as a placeholder for a CKEditor instance:

```html
<div id="editor"></div>
```

Load the classic editor build (here a [CDN](https://cdn.ckeditor.com/) location is used).

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method to display the editor.

```html
<script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

### Sample implementation

A full webpage with embedded CKEditor 5 from the above example would look like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
</head>
<body>
	<h1>Classic editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		ClassicEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

<info-box>
	This kind of installation will only provide features available in the build used.

	You can learn more about other available predefined editor builds in the {@link installation/advanced/predefined-builds dedicated builds guide}.
</info-box>

## Running a full-featured editor from CDN

The fastest way to run an advanced editor using the {@link features/index rich editing features offered by CKEditor 5} is using a superbuild. The superbuild, available instantly from CDN, is a preconfigured package that offers access to almost all available plugins and all predefined editor types.

<info-box>
	Please consider, that the superbuild contains a really whole lot of code. A good portion of that code may not be needed in your implementation, so using the superbuild should be considered for evaluation purposes and tests rather, than for the production environment.

	We strongly advise using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} approach or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source} to create customized and efficient production-environment solutions. You can also try out the {@link installation/advanced/predefined-builds predefined builds} tailored for specific needs.
</info-box>

### Using the CKEditor 5 superbuild

In the superbuild, all editor classes are stored under the `CKEDITOR` object. Apart from that exception, the editor initialization is no different than the one described in the {@link installation/advanced/predefined-builds#available-builds available builds documentation}.

Because the superbuild contains a lot of plugins, you may need to remove the plugins you do not need with the <code>removePlugins</code> configuration option and adjust the toolbar configuration.

### Sample implementation

In this example, we remove the premium collaboration features as well as several other plugins that require credentials to work. We need to do this, otherwise the editor would throw an error.


```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
	</head>
	<body>
		<style>
			#container {
				width: 1000px;
				margin: 20px auto;
			}
			.ck-editor__editable[role="textbox"] {
				/* editing area */
				min-height: 200px;
			}
			.ck-content .image {
				/* block images */
				max-width: 80%;
				margin: 20px auto;
			}
		</style>
		<div id="container">
			<div id="editor">
			</div>
		</div>
		<!--
			The "super-build" of CKEditor 5 served via CDN contains a large set of plugins and multiple editor types.
			See https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html#running-a-full-featured-editor-from-cdn
		-->
		<script src="https://cdn.ckeditor.com/ckeditor5/34.1.0/super-build/ckeditor.js"></script>
		<!--
			Uncomment to load the Spanish translation
			<script src="https://cdn.ckeditor.com/ckeditor5/34.1.0/super-build/translations/es.js"></script>
		-->
		<script>
			// This sample still does not showcase all CKEditor 5 features (!)
			// Visit https://ckeditor.com/docs/ckeditor5/latest/features/index.html to browse all the features.
			CKEDITOR.ClassicEditor.create(document.getElementById("editor"), {
				// https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/toolbar.html#extended-toolbar-configuration-format
				toolbar: {
					items: [
						'exportPDF','exportWord', '|',
						'findAndReplace', 'selectAll', '|',
						'heading', '|',
						'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'removeFormat', '|',
						'bulletedList', 'numberedList', 'todoList', '|',
						'outdent', 'indent', '|',
						'undo', 'redo',
						'-',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
						'alignment', '|',
						'link', 'insertImage', 'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', 'htmlEmbed', '|',
						'specialCharacters', 'horizontalLine', 'pageBreak', '|',
						'textPartLanguage', '|',
						'sourceEditing'
					],
					shouldNotGroupWhenFull: true
				},
				// Changing the language of the interface requires loading the language file using the <script> tag.
				// language: 'es',
				list: {
					properties: {
						styles: true,
						startIndex: true,
						reversed: true
					}
				},
				// https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#configuration
				heading: {
					options: [
						{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
						{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
						{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
						{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
						{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
						{ model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
						{ model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
					]
				},
				// https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html#using-the-editor-configuration
				placeholder: 'Welcome to CKEditor 5!',
				// https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-family-feature
				fontFamily: {
					options: [
						'default',
						'Arial, Helvetica, sans-serif',
						'Courier New, Courier, monospace',
						'Georgia, serif',
						'Lucida Sans Unicode, Lucida Grande, sans-serif',
						'Tahoma, Geneva, sans-serif',
						'Times New Roman, Times, serif',
						'Trebuchet MS, Helvetica, sans-serif',
						'Verdana, Geneva, sans-serif'
					],
					supportAllValues: true
				},
				// https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-size-feature
				fontSize: {
					options: [ 10, 12, 14, 'default', 18, 20, 22 ],
					supportAllValues: true
				},
				// Be careful with the setting below. It instructs CKEditor to accept ALL HTML markup.
				// https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
				htmlSupport: {
					allow: [
						{
							name: /.*/,
							attributes: true,
							classes: true,
							styles: true
						}
					]
				},
				// Be careful with enabling previews
				// https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html#content-previews
				htmlEmbed: {
					showPreviews: true
				},
				// https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators
				link: {
					decorators: {
						addTargetToExternalLinks: true,
						defaultProtocol: 'https://',
						toggleDownloadable: {
							mode: 'manual',
							label: 'Downloadable',
							attributes: {
								download: 'file'
							}
						}
					}
				},
				// https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#configuration
				mention: {
					feeds: [
						{
							marker: '@',
							feed: [
								'@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
								'@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
								'@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
								'@sugar', '@sweet', '@topping', '@wafer'
							],
							minimumCharacters: 1
						}
					]
				},
				// The "super-build" contains more premium features that require additional configuration, disable them below.
				// Do not turn them on unless you read the documentation and know how to configure them and setup the editor.
				removePlugins: [
					// These two are commercial, but you can try them out without registering to a trial.
					// 'ExportPdf',
					// 'ExportWord',
					'CKBox',
					'CKFinder',
					'EasyImage',
					// This sample uses the Base64UploadAdapter to handle image uploads as it requires no configuration.
					// https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html
					// Storing images as Base64 is usually a very bad idea.
					// Replace it on production website with other solutions:
					// https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html
					// 'Base64UploadAdapter',
					'RealTimeCollaborativeComments',
					'RealTimeCollaborativeTrackChanges',
					'RealTimeCollaborativeRevisionHistory',
					'PresenceList',
					'Comments',
					'TrackChanges',
					'TrackChangesData',
					'RevisionHistory',
					'Pagination',
					'WProofreader',
					// Careful, with the Mathtype plugin CKEditor will not load when loading this sample
					// from a local file system (file://) - load this site via HTTP server if you enable MathType
					'MathType'
				]
			});
		</script>
	</body>
</html>
```

### The CKEditor 5 superbuild limitations

While the superbuild is designed to provide as many of them as possible, some of these plugins may conflict with each other. Due to that fact, several of those needed to be excluded from the superbuild and are not available that way:

* Watchdog
* ContextWatchdog
* Context
* Title
* Restricted editing

## Running a full-featured editor with Premium features

If you would like to quickly evaluate CKEditor 5 with premium features such as real-time collaboration, track changes and revision history then sign up for a [30-day free trial](https://orders.ckeditor.com/trial/premium-features).

After you sign up, you will find in the customer dashboard the full code snippet to run the editor with premium features with all the necessary configurations.

## List of all plugins included in the CKEditor 5 superbuild

The table below presents the list of all plugins included in the superbuild. You may disable any of them using the `removePlugins` configuration option.

<table border="1" cellpadding="1" cellspacing="1" style="width:500px">
	<tbody>
		<tr>
			<td><b>Plugin</b></td>
			<td><b>Documentation</b></td>
		</tr>
		<tr>
			<td>Alignment</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/text-alignment.html">https://ckeditor.com/docs/ckeditor5/latest/features/text-alignment.html</a></td>
		</tr>
		<tr>
			<td>Autoformat</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/autoformat.html">https://ckeditor.com/docs/ckeditor5/latest/features/autoformat.html</a></td>
		</tr>
		<tr>
			<td>AutoImage</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/images-inserting.html#inserting-images-via-pasting-url-into-editor">https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/images-inserting.html#inserting-images-via-pasting-url-into-editor</a></td>
		</tr>
		<tr>
			<td>Base64UploadAdapter</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html</a></td>
		</tr>
		<tr>
			<td>BlockQuote</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html">https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html</a></td>
		</tr>
		<tr>
			<td>Bold</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html</a></td>
		</tr>
		<tr>
			<td>CKBox</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/ckbox.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/ckbox.html</a></td>
		</tr>
		<tr>
			<td>CKFinder</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/ckfinder.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/ckfinder.html</a></td>
		</tr>
		<tr>
			<td>CloudServices</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_cloud-services_cloudservices-CloudServices.html">https://ckeditor.com/docs/ckeditor5/latest/api/module_cloud-services_cloudservices-CloudServices.html</a></td>
		</tr>
		<tr>
			<td>Code</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html</a></td>
		</tr>
		<tr>
			<td>CodeBlock</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html">https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html</a></td>
		</tr>
		<tr>
			<td>Comments</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html">https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html</a></td>
		</tr>
		<tr>
			<td>EasyImage</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html</a></td>
		</tr>
		<tr>
			<td>ExportPdf</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html">https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html</a></td>
		</tr>
		<tr>
			<td>ExportWord</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/export-word.html">https://ckeditor.com/docs/ckeditor5/latest/features/export-word.html</a></td>
		</tr>
		<tr>
			<td>FindAndReplace</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html">https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html</a></td>
		</tr>
		<tr>
			<td>FontBackgroundColor, FontColor, FontFamily, FontSize</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/font.html">https://ckeditor.com/docs/ckeditor5/latest/features/font.html</a></td>
		</tr>
		<tr>
			<td>GeneralHtmlSupport</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html">https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html</a></td>
		</tr>
		<tr>
			<td>Heading</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/headings.html">https://ckeditor.com/docs/ckeditor5/latest/features/headings.html</a></td>
		</tr>
		<tr>
			<td>Highlight</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html">https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html</a></td>
		</tr>
		<tr>
			<td>HorizontalLine</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html">https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html</a></td>
		</tr>
		<tr>
			<td>HtmlComment</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#html-comments">https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#html-comments</a></td>
		</tr>
		<tr>
			<td>HtmlEmbed</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html">https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html</a></td>
		</tr>
		<tr>
			<td>Image</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html</a></td>
		</tr>
		<tr>
			<td>ImageCaption</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-captions.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/images-captions.html</a></td>
		</tr>
		<tr>
			<td>ImageResize</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-resizing.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/images-resizing.html</a></td>
		</tr>
		<tr>
			<td>ImageStyle</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/images-styles.html</a></td>
		</tr>
		<tr>
			<td>ImageToolbar</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html#image-contextual-toolbar">https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html#image-contextual-toolbar</a></td>
		</tr>
		<tr>
			<td>ImageUpload</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html</a></td>
		</tr>
		<tr>
			<td>ImageInsert</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/images-inserting.html">https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/images-inserting.html</a></td>
		</tr>
		<tr>
			<td>Indent, IndentBlock</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/indent.html">https://ckeditor.com/docs/ckeditor5/latest/features/indent.html</a></td>
		</tr>
		<tr>
			<td>Italic</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html</a></td>
		</tr>
		<tr>
			<td>Link, Autolink, LinkImage</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/link.html">https://ckeditor.com/docs/ckeditor5/latest/features/link.html</a></td>
		</tr>
		<tr>
			<td>List, ListProperties, TodoList</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html">https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html</a></td>
		</tr>
		<tr>
			<td>MathType</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/math-equations.html">https://ckeditor.com/docs/ckeditor5/latest/features/math-equations.html</a></td>
		</tr>
		<tr>
			<td>MediaEmbed</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html">https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html</a></td>
		</tr>
		<tr>
			<td>Mention</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html">https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html</a></td>
		</tr>
		<tr>
			<td>PageBreak</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html">https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html</a></td>
		</tr>
		<tr>
			<td>Pagination</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/pagination/pagination.html">https://ckeditor.com/docs/ckeditor5/latest/features/pagination/pagination.html</a></td>
		</tr>
		<tr>
			<td>PasteFromOffice</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-word.html">https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-word.html</a></td>
		</tr>
		<tr>
			<td>PictureEditing</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_image_pictureediting-PictureEditing.html">https://ckeditor.com/docs/ckeditor5/latest/api/module_image_pictureediting-PictureEditing.html</a></td>
		</tr>
		<tr>
			<td>PresenceList</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/users-in-real-time-collaboration.html">https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/users-in-real-time-collaboration.html</a></td>
		</tr>
		<tr>
			<td>RealTimeCollaborativeEditing, RealTimeCollaborativeComments, RealTimeCollaborativeRevisionHistory, RealTimeCollaborativeTrackChanges</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html">https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html</a></td>
		</tr>
		<tr>
			<td>RemoveFormat</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html">https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html</a></td>
		</tr>
		<tr>
			<td>RevisionHistory</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/revision-history/revision-history.html">https://ckeditor.com/docs/ckeditor5/latest/features/revision-history/revision-history.html</a></td>
		</tr>
		<tr>
			<td>StandardEditingMode</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/restricted-editing.html">https://ckeditor.com/docs/ckeditor5/latest/features/restricted-editing.html</a></td>
		</tr>
		<tr>
			<td>SpecialCharacters</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/special-characters.html">https://ckeditor.com/docs/ckeditor5/latest/features/special-characters.html</a></td>
		</tr>
		<tr>
			<td>Strikethrough</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html</a></td>
		</tr>
		<tr>
			<td>Subscript</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html</a></td>
		</tr>
		<tr>
			<td>Superscript</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html</a></td>
		</tr>
		<tr>
			<td>Table, TableToolbar, TableCellProperties, TableProperties, TableCaption, TableColumnResize</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/table.html">https://ckeditor.com/docs/ckeditor5/latest/features/table.html</a></td>
		</tr>
		<tr>
			<td>TextPartLanguage</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/language.html">https://ckeditor.com/docs/ckeditor5/latest/features/language.html</a></td>
		</tr>
		<tr>
			<td>TextTransformation</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/text-transformation.html">https://ckeditor.com/docs/ckeditor5/latest/features/text-transformation.html</a></td>
		</tr>
		<tr>
			<td>TrackChanges</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html">https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html</a></td>
		</tr>
		<tr>
			<td>TrackChangesData</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes-data.html">https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes-data.html</a></td>
		</tr>
		<tr>
			<td>Underline</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html</a></td>
		</tr>
		<tr>
			<td>WordCount</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/word-count.html">https://ckeditor.com/docs/ckeditor5/latest/features/word-count.html</a></td>
		</tr>
		<tr>
			<td>WProofReader</td>
			<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/spelling-and-grammar-checking.html">https://ckeditor.com/docs/ckeditor5/latest/features/spelling-and-grammar-checking.html</a></td>
		</tr>
	</tbody>
</table>

<info-box hint>
**What's next?**

Congratulations, you have just run your first CKEditor 5 instance!

You can also try another simple installation method, like the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.

And if you use Angular, React or Vue.js and want to integrate CKEditor 5 in your application, refer to the {@link installation/frameworks/overview Frameworks section}.
</info-box>