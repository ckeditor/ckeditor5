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
	Please bear in mind that the CDN solution only offers {@link installation/getting-started/predefined-builds ready-to-use predefined editor builds}, hence it is not possible to add new plugins and all the features available in the editor are preset.

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

	You can learn more about other available predefined editor builds in the {@link installation/getting-started/predefined-builds dedicated builds guide}.
</info-box>

## Running a full-featured editor from CDN

The fastest way to run an advanced editor using the {@link features/index rich editing features offered by CKEditor 5} is using a superbuild. The superbuild, available instantly from CDN, is a preconfigured package that offers access to almost all available plugins and all predefined editor types.

<info-box>
	Please consider, that the superbuild contains a really whole lot of code. A good portion of that code may not be needed in your implementation, so using the superbuild should be considered for evaluation purposes and tests rather, than for the production environment.

	We strongly advise using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} approach or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source} to create customized and efficient production-environment solutions. You can also try out the {@link installation/getting-started/predefined-builds predefined builds} tailored for specific needs.
</info-box>

### Using the CKEditor 5 superbuild

In the superbuild, all editor classes are stored under the `CKEDITOR` object. Apart from that exception, the editor initialization is no different than the one described in the {@link installation/getting-started/predefined-builds#available-builds available builds documentation}.

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
		<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
		<!--
			Uncomment to load the Spanish translation
			<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/translations/es.js"></script>
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

## Adjusting plugins included in the CKEditor 5 superbuild

You may disable any features available in the superbuild using the {@link installation/getting-started/configuration#removing-features `removePlugins` configuration option}. For a full list of features currently available in the superbuild, please consult the {@link installation/getting-started/predefined-builds#list-of-plugins-included-in-the-ckeditor-5-predefined-builds predefined editor builds} guide. Please note, that removing certain features may make the editor unusable.

<info-box hint>
**What's next?**

Congratulations, you have just run your first CKEditor 5 instance!

You can also try another simple installation method, like the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.

And if you use Angular, React or Vue.js and want to integrate CKEditor 5 in your application, refer to the {@link installation/frameworks/overview Frameworks section}.
</info-box>
