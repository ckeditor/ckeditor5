---
category: installation-methods
menu-title: (Legacy) Quick start
meta-title: Quick start | Legacy CKEditor 5 documentation
order: 10
modified_at: 2022-06-27
---

# (Legacy) Quick start

<info-box warning>
	⚠️  We changed installation methods and kept this guide for users’ convenience. If you are looking for current CKEditor 5 installation instructions, please refer to the newest version of the {@link getting-started/integrations-cdn/quick-start CKEditor&nbsp;5 Quick Start} guide.
</info-box>

## Introduction

In this guide, you will find the quickest and easiest way to run ready-to-use CKEditor&nbsp;5 with minimal effort &ndash; by running the editor from [CDN](https://cdn.ckeditor.com/).

## Running a full-featured editor from CDN

The fastest way to run an advanced editor using the {@link features/index rich editing features offered by CKEditor&nbsp;5} is using a superbuild. The superbuild, available instantly from CDN, is a pre-configured package that offers access to almost all available plugins and all predefined editor types.

<info-box>
	The superbuild contains a lot of code. A good portion of that code may not be needed in your implementation. Using the superbuild should be considered for evaluation purposes and tests rather than for the production environment.
</info-box>

### Using the CKEditor&nbsp;5 superbuild

In the superbuild, all editor classes are stored under the `CKEDITOR` object.

Because the superbuild contains a lot of plugins, you may need to remove the plugins you do not need with the `removePlugins` configuration option and adjust the toolbar configuration. There are also some plugins that require a license to run. You can learn more about obtaining and activating license keys in the {@link getting-started/licensing/license-key-and-activation License key and activation} guide. Observe the configuration below to see this implemented.

### Sample implementation

<info-box warning>
	⚠️  Please note that, due to the deprecation of predefined build, the superbuild only provides and outdated version of CKEditor&nbsp;5. By using it, you are missing crucial updates and various new developments of the editor. We strongly suggest {@link updating/nim-migration/migration-to-new-installation-methods migrating CKEditor&nbsp;5 to new installation methods}.
</info-box>

In this example, you remove the premium collaboration features and several other plugins that require credentials to work. You need to do this, otherwise, the editor will throw an error.

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
				/* Editing area */
				min-height: 200px;
			}
			.ck-content .image {
				/* Block images */
				max-width: 80%;
				margin: 20px auto;
			}
		</style>
		<div id="container">
			<div id="editor">
			</div>
		</div>
		<!--
			The "super-build" of CKEditor&nbsp;5 served via CDN contains a large set of plugins and multiple editor types.
			See https://ckeditor.com/docs/ckeditor5/latest/installation/legacy/getting-started/quick-start.html#running-a-full-featured-editor-from-cdn
		-->
		<script src="https://cdn.ckeditor.com/ckeditor5/41.4.2/super-build/ckeditor.js"></script>
		<!--
			Uncomment to load the Spanish translation
			<script src="https://cdn.ckeditor.com/ckeditor5/41.4.2/super-build/translations/es.js"></script>
		-->
		<script>
			// This sample still does not showcase all CKEditor&nbsp;5 features (!)
			// Visit https://ckeditor.com/docs/ckeditor5/latest/features/index.html to browse all the features.
			CKEDITOR.ClassicEditor.create(document.getElementById("editor"), {
				// https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar/toolbar.html#extended-toolbar-configuration-format
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
						'link', 'uploadImage', 'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', 'htmlEmbed', '|',
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
					showPreviews: false
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
				// The "superbuild" contains more premium features that require additional configuration, disable them below.
				// Do not turn them on unless you read the documentation and know how to configure them and setup the editor.
				removePlugins: [
					// These two are commercial, but you can try them out without registering to a trial.
					// 'ExportPdf',
					// 'ExportWord',
					'AIAssistant',
					'CKBox',
					'CKFinder',
					'EasyImage',
					// This sample uses the Base64UploadAdapter to handle image uploads as it requires no configuration.
					// https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html
					// Storing images as Base64 is usually a very bad idea.
					// Replace it on production website with other solutions:
					// https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html
					// 'Base64UploadAdapter',
					'MultiLevelList',
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
					// from a local file system (file://) - load this site via HTTP server if you enable MathType.
					'MathType',
					// The following features require additional license.
					'SlashCommand',
					'Template',
					'DocumentOutline',
					'FormatPainter',
					'TableOfContents',
					'PasteFromOfficeEnhanced',
					'CaseChange'
				]
			});
		</script>
	</body>
</html>
```

### The CKEditor&nbsp;5 superbuild limitations

While the superbuild is designed to provide as many of them as possible, some of these plugins may conflict with each other. Due to that fact, several of those needed to be excluded from the superbuild and are not available that way:

* Watchdog
* ContextWatchdog
* Context
* Title
* Restricted editing

## Running a full-featured editor with Premium features

If you would like to quickly evaluate CKEditor&nbsp;5 with premium features such as real-time collaboration, track changes, and revision history, sign up for a [14-day free trial](https://portal.ckeditor.com/checkout?plan=free).

After you sign up, in the customer dashboard you will find the full code snippet to run the editor with premium features with all the necessary configurations.

## Adjusting plugins included in the CKEditor&nbsp;5 superbuild

You may turn off any features available in the superbuild using the `removePlugins` configuration option. Removing certain features may make the editor unusable.
