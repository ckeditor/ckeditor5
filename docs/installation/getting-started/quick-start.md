---
# Scope:
# - Guidance on all possible installation options.

category: getting-started
order: 10
modified_at: 2022-06-21
---

# Quick start

## Introduction

In this guide you will find the fastest and easiest way to run ready-to-use CKEditor 5 with minimal effort &ndash; running the editor from [CDN](https://cdn.ckeditor.com/). This is the fastest method that lets you set up a running copy of CKEditor 5 in literally seconds.

<info-box>
	Please bear in mind that the CDN solution only offers ready-to-use editor builds, hence it is not possible to add new plugins and the features available in the editor are preset.

	Should you need a more flexible solution, consider using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or try {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.
</info-box>

## Running a simple editor

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

Let us run a classic editor build as an example. In your HTML page add an element that CKEditor should replace:

```html
<div id="editor"></div>
```

Load the classic editor build (here [CDN](https://cdn.ckeditor.com/) location is used). This link format of the link will ensure you are using the latest available CKEditor 5 release.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.

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

The fastest way to run an advanced editor using the {@link features/index rich editing features offered by CKEditor 5} is using a superbuild. The superbuild, available instantly from CDN, is a preconfigured editor instance that offers access to all available plugins and all predefined editor types. Starting from that point and using the `removePlugins` configuration option, you can trim and customize the editor to your exact needs with minimal effort.

<info-box>
	Please consider, that the superbuild contains a really whole lot of code. A good portion of that code may not be needed in you implementation, so using the superbuild should rather be considered for evaluation purposes and for tests, than for production environment.

	We strongly advise using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} approach or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source} to create customized and efficient production-environment solutions. You can also try out the {@link installation/advanced/predefined-builds predefined builds} tailored for specific needs.
</info-box>

### Using the CKEditor 5 superbuild

First add the editor placeholder to your document.

```html
<div id="editor"></div>
```

Then include the code from CDN to superbuild to load the editor.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.

```html
<script>
	CKEDITOR.ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

Remove the plugins you do not need with the `removePlugins` configuration option. In this example, we will remove the premium collaboration features that require credentials to work. We need to do this, otherwise the editor will throw an error.

Then, configure the toolbar to display only the desired options. You can read more about toolbar configuration the the {@link features/toolbar toolbar guide}. Several plugins, like the image feature or the list feature need additional configuration for their own toolbars.

A source code listing for the configuration can be seen below.

```js
CKEDITOR.ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Comments, RealTimeCollaborativeComments, TrackChanges, RealTimeCollaborativeTrackChanges, RevisionHistory, RealTimeCollaborativeRevisionHistory, RealTimeCollaborativeEditing, ExportWord, ExportPdf, Pagination, WProofreader, MathType' ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|',
				'exportPdf', 'exportWord',
				'|',
				'wproofreader', 'findAndReplace', 'selectAll',
				'|',
				'heading',
				'|',
				'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript',
				'|',
				'specialCharacters', 'horizontalLine', 'pageBreak',
				'|',
				'-',
				'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
				'|',
				'link', 'blockQuote', 'insertTable', 'uploadImage', 'mediaEmbed', 'codeBlock', 'htmlEmbed',
				'|',
				'bulletedList', 'numberedList', 'todoList',
				'|',
				'outdent', 'indent', 'alignment',
				'|',
				'textPartLanguage',
				'|',
				'sourceEditing'
			],
			shouldNotGroupWhenFull: true
		},
	image: {
			styles: [
				'alignCenter',
				'alignLeft',
				'alignRight'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
				'resizeImage'
			],
			insert: {
				integrations: [
					'insertImageViaUrl'
				]
			}
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
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
		placeholder: 'Type or paste your content here!',
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
	} )
	.catch( error => {
		console.log( error );
	} );
```

### Sample implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Full-featured editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
</head>
<body>
	<h1>Full-featured editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		CKEDITOR.ClassicEditor
			.create( document.querySelector( '#editor' ), {
				removePlugins: [ 'Comments, RealTimeCollaborativeComments, TrackChanges, RealTimeCollaborativeTrackChanges, RevisionHistory, RealTimeCollaborativeRevisionHistory, RealTimeCollaborativeEditing, ExportWord, ExportPdf, Pagination, WProofreader, MathType' ],
				toolbar: {
					items: [
						'undo', 'redo',
						'|',
						'exportPdf', 'exportWord',
						'|',
						'wproofreader', 'findAndReplace', 'selectAll',
						'|',
						'heading',
						'|',
						'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript',
						'|',
						'specialCharacters', 'horizontalLine', 'pageBreak',
						'|',
						'-',
						'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
						'|',
						'link', 'blockQuote', 'insertTable', 'uploadImage', 'mediaEmbed', 'codeBlock', 'htmlEmbed',
						'|',
						'bulletedList', 'numberedList', 'todoList',
						'|',
						'outdent', 'indent', 'alignment',
						'|',
						'textPartLanguage',
						'|',
						'sourceEditing'
					],
					shouldNotGroupWhenFull: true
				},
			image: {
					styles: [
						'alignCenter',
						'alignLeft',
						'alignRight'
					],
					resizeOptions: [
						{
							name: 'resizeImage:original',
							label: 'Original',
							value: null
						},
						{
							name: 'resizeImage:50',
							label: '50%',
							value: '50'
						},
						{
							name: 'resizeImage:75',
							label: '75%',
							value: '75'
						}
					],
					toolbar: [
						'imageTextAlternative', 'toggleImageCaption', '|',
						'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
						'resizeImage'
					],
					insert: {
						integrations: [
							'insertImageViaUrl'
						]
					}
				},
				list: {
					properties: {
						styles: true,
						startIndex: true,
						reversed: true
					}
				},
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
				placeholder: 'Type or paste your content here!',
				table: {
					contentToolbar: [
						'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
					]
				},
			} )
			.catch( error => {
				console.log( error );
			} );
	</script>
</body>
</html>
```

### Using the CKEditor 5 superbuild with Premium features

Again, add the editor placeholder to your document.

```html
<div id="editor"></div>
```

Include the code from CDN to superbuild to load the editor.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.

```html
<script>
	CKEDITOR.ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

This time we do not remove the Premium features. Instead, we configure the toolbar to include all available plugins. We also need to configure all of these options and provide correct credentials where indicated.

CKEditor 5 Premium features can be easily tested without commitment via the [Premium features free trial](https://ckeditor.com/docs/trial/latest/guides/overview.html) package.

The correct source code listing for the configuration can be seen below.

```js
CKEDITOR.ClassicEditor
	.create( document.querySelector( '#editor' ), {
		cloudServices: {
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint',
					uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/',
					webSocketUrl: 'your-organization-id.cke-cs.com/ws/'
		},
		toolbar: {
			items: [
				'undo', 'redo',
				'|',
				'exportPdf', 'exportWord',
				'|',
				'wproofreader', 'findAndReplace', 'selectAll',
				'|',
				'heading',
				'|',
				'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript',
				'|',
				'specialCharacters', 'horizontalLine', 'pageBreak',
				'|',
				'-',
				'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
				'|',
				'link', 'blockQuote', 'insertTable', 'uploadImage', 'mediaEmbed', 'codeBlock', 'htmlEmbed',
				'|',
				'bulletedList', 'numberedList', 'todoList',
				'|',
				'outdent', 'indent', 'alignment',
				'|',
				'textPartLanguage',
				'|',
				'sourceEditing',
				'|',
				'Comments', 'TrackChanges', 'RevisionHistory',
				'|',
				'ExportWord', 'ExportPdf', 'Pagination',
				'|',
				'WProofreader', 'MathType'
			],
			shouldNotGroupWhenFull: true
		},
	exportPdf: {
			stylesheets: [
				'EDITOR_STYLES',
				// Add your custom styles here
			],
			fileName: 'export-pdf-demo.pdf',
			converterOptions: {
				format: 'Tabloid',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '24mm',
				margin_left: '24mm',
				page_orientation: 'portrait'
			},
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint'
		},
		exportWord: {
			stylesheets: [ 'EDITOR_STYLES' ],
			fileName: 'export-word-demo.docx',
			converterOptions: {
				format: 'B4',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '12mm',
				margin_left: '12mm',
				page_orientation: 'portrait'
			},
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint'
		},
		fontFamily: {
			supportAllValues: true
		},
		fontSize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ],
			supportAllValues: true
		},
		htmlEmbed: {
			showPreviews: true
		},
		image: {
			styles: [
				'alignCenter',
				'alignLeft',
				'alignRight'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
				'resizeImage'
			],
			insert: {
				integrations: [
					'insertImageViaUrl'
				]
			}
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
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
		placeholder: 'Type or paste your content here!',
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
		wproofreader: {
		// PROVIDE CORRECT VALUE HERE:
			serviceId: 'service ID',
			lang: 'auto',
			srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
		}
	} )
	.catch( error => {
		console.log( error );
	} );
```

### Sample implementation

You can compare this sample configuration with a {@link examples/builds-custom/full-featured full-featured editor} configuration in the {@link examples/index examples section}.

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Full-featured editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
</head>
<body>
	<h1>Full-featured editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		CKEDITOR.ClassicEditor
			.create( document.querySelector( '#editor' ), {
				cloudServices: {
							// PROVIDE CORRECT VALUES HERE:
							tokenUrl: 'https://example.com/cs-token-endpoint',
							uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/',
							webSocketUrl: 'your-organization-id.cke-cs.com/ws/'
				},
				toolbar: {
					items: [
						'undo', 'redo',
						'|',
						'exportPdf', 'exportWord',
						'|',
						'wproofreader', 'findAndReplace', 'selectAll',
						'|',
						'heading',
						'|',
						'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript',
						'|',
						'specialCharacters', 'horizontalLine', 'pageBreak',
						'|',
						'-',
						'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
						'|',
						'link', 'blockQuote', 'insertTable', 'uploadImage', 'mediaEmbed', 'codeBlock', 'htmlEmbed',
						'|',
						'bulletedList', 'numberedList', 'todoList',
						'|',
						'outdent', 'indent', 'alignment',
						'|',
						'textPartLanguage',
						'|',
						'sourceEditing',
						'|',
						'Comments', 'TrackChanges', 'RevisionHistory',
						'|',
						'ExportWord', 'ExportPdf', 'Pagination',
						'|',
						'WProofreader', 'MathType'
					],
					shouldNotGroupWhenFull: true
				},
			exportPdf: {
					stylesheets: [
						'EDITOR_STYLES',
						// Add your custom styles here
					],
					fileName: 'export-pdf-demo.pdf',
					converterOptions: {
						format: 'Tabloid',
						margin_top: '20mm',
						margin_bottom: '20mm',
						margin_right: '24mm',
						margin_left: '24mm',
						page_orientation: 'portrait'
					},
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint'
				},
				exportWord: {
					stylesheets: [ 'EDITOR_STYLES' ],
					fileName: 'export-word-demo.docx',
					converterOptions: {
						format: 'B4',
						margin_top: '20mm',
						margin_bottom: '20mm',
						margin_right: '12mm',
						margin_left: '12mm',
						page_orientation: 'portrait'
					},
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint'
				},
				fontFamily: {
					supportAllValues: true
				},
				fontSize: {
					options: [ 10, 12, 14, 'default', 18, 20, 22 ],
					supportAllValues: true
				},
				htmlEmbed: {
					showPreviews: true
				},
				image: {
					styles: [
						'alignCenter',
						'alignLeft',
						'alignRight'
					],
					resizeOptions: [
						{
							name: 'resizeImage:original',
							label: 'Original',
							value: null
						},
						{
							name: 'resizeImage:50',
							label: '50%',
							value: '50'
						},
						{
							name: 'resizeImage:75',
							label: '75%',
							value: '75'
						}
					],
					toolbar: [
						'imageTextAlternative', 'toggleImageCaption', '|',
						'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
						'resizeImage'
					],
					insert: {
						integrations: [
							'insertImageViaUrl'
						]
					}
				},
				list: {
					properties: {
						styles: true,
						startIndex: true,
						reversed: true
					}
				},
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
				placeholder: 'Type or paste your content here!',
				table: {
					contentToolbar: [
						'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
					]
				},
				wproofreader: {
				// PROVIDE CORRECT VALUE HERE:
					serviceId: 'service ID',
					lang: 'auto',
					srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
				}
			} )
			.catch( error => {
				console.log( error );
			} );
	</script>
</body>
</html>
```

<info-box hint>
**What's next?**

Congratulations, you have just run your first CKEditor 5 instance!

You can also try another simple installation method, like the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.

And if you use Angular, React or Vue.js and want to integrate CKEditor 5 in your application, refer to the {@link installation/frameworks/overview Frameworks section}.
</info-box>
