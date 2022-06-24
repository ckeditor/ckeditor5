---
# Scope:
# - Guidance on all possible installation options.

category: getting-started
order: 10
modified_at: 2022-06-21
---

# Quick start

## Introduction

In this guide you will find the quickest and easiest way to run ready-to-use CKEditor 5 with minimal effort &ndash; by running the editor from [CDN](https://cdn.ckeditor.com/). This is the fastest method that lets you set up a running copy of CKEditor 5 in literally minutes.

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

Load the classic editor build (here a [CDN](https://cdn.ckeditor.com/) location is used). The link format with a variable will ensure you are using the latest available CKEditor 5 release.

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

The fastest way to run an advanced editor using the {@link features/index rich editing features offered by CKEditor 5} is using a superbuild. The superbuild, available instantly from CDN, is a preconfigured editor instance that offers access to all available plugins and all predefined editor types. Starting from that point and using the `removePlugins` configuration option as well as toolbar configuration, you can trim down and customize the editor to your exact needs with minimal effort.

<info-box>
	Please consider, that the superbuild contains a really whole lot of code. A good portion of that code may not be needed in you implementation, so using the superbuild should be considered for evaluation purposes and for tests rather, than for production environment.

	We strongly advise using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} approach or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source} to create customized and efficient production-environment solutions. You can also try out the {@link installation/advanced/predefined-builds predefined builds} tailored for specific needs.
</info-box>

### The CKEditor 5 superbuild limitations

CKEditor 5 provides a multitude of plugins offering {@link features/index various features} addressing versatile needs. While the superbuild is designed to provide as many of them as possible, some of these plugins may conflict with each other. Due to that fact, several of those needed to be excluded from the superbuild and are not available that way.

The plugins not available currently in the superbuild include:
* Watchdog
* ContextWatchdog
* Context
* Title

### Using the CKEditor 5 superbuild

To start using the CKEditor 5 superbuild from CDN, first add the editor placeholder to your document.

```html
<div id="editor"></div>
```

Then, include the code from CDN to superbuild to load the editor.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
```

In the superbuild, all editor classes are stored under the `CKEDITOR` object. To create the classic editor, you need to access the `CKEDITOR` object first, then call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.

```html
<script>
	CKEDITOR.ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

Remove the plugins you do not need with the `removePlugins` configuration option. In this example, we remove the premium collaboration features as well as several other plugins that require credentials to work. We need to do this, otherwise the editor will throw an error.

Then, configure the toolbar to display only the desired options. You can read more about toolbar configuration the {@link features/toolbar toolbar guide}. Several plugins, like the image feature or the list feature, need additional configuration for their own toolbars.

A source code listing for the configuration can be seen below. Due to the complex nature of editor configuration, the final solution may differ depending on the active plugins. Please refer to the sample implementation listed in the next section for a working code example.

```js
CKEDITOR.ClassicEditor
	.create( document.querySelector( '#editor' ), {
		removePlugins: [ 'Comments', 'TrackChanges', 'TrackChangesData', 'RevisionHistory', 'RealTimeCollaborativeComments', 'RealTimeCollaborativeTrackChanges', 'RealTimeCollaborativeRevisionHistory', 'RealTimeCollaborativeEditing', 'PresenceList', 'ExportWord', 'ExportPdf', 'Pagination', 'WProofreader', 'MathType' ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|',
				'findAndReplace', 'selectAll',
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

#### Sample implementation

You can see a full webpage with embedded CKEditor 5 from the above example after expanding the code listing below.

<details>
<summary>View editor configuration script</summary>

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
				removePlugins: [ 'Comments', 'TrackChanges', 'TrackChangesData', 'RevisionHistory', 'RealTimeCollaborativeComments', 'RealTimeCollaborativeTrackChanges', 'RealTimeCollaborativeRevisionHistory', 'RealTimeCollaborativeEditing', 'PresenceList', 'ExportWord', 'ExportPdf', 'Pagination', 'WProofreader', 'MathType' ],
				toolbar: {
					items: [
						'undo', 'redo',
						'|',
						'findAndReplace', 'selectAll',
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
</details>

## Using the CKEditor 5 superbuild with Premium features
### An editor with real-time collaboration

To unleash the full potential of CKEditor 5 with Premium features, we will use the decoupled editor and create a more complex markup, including the structure required by the Revision History feature.

```html
<div id="presence-list"></div>
<div class="editors-holder">
	<div class="editor-toolbar"></div>

	<div class="editor-container" id="editor-container">
		<div class="editor-element">
			<div id="editor"></div>
		</div>
		<div class="sidebar-container" id="sidebar-container"></div>
	</div>

	<div class="editor-container" id="revision-viewer-container">
		<div class="editor-element">
			<div id="revision-viewer-editor"></div>
		</div>
		<div class="sidebar-container" id="revision-viewer-sidebar"></div>
	</div>
</div>
```

Include the code from CDN to superbuild to load the editor.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
```

Call the {@link module:editor-decoupled/decouplededitor~DecoupledEditor#create `DecoupledEditor.create()`} method. The decoupled editor requires you to inject the toolbar into the DOM and the best place to do that is somewhere in the promise chain (e.g. one of the `then( () => { ... } )` blocks).

```html
<script>
	CKEDITOR.DecoupledEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			const toolbarContainer = document.querySelector( '.editor-toolbar' );

			toolbarContainer.appendChild( editor.ui.view.toolbar.element );
		} )
		.catch( error => {
			console.error( error );
		} );
</script>
```

This time we do not remove the Premium features. Instead, we configure the toolbar to include all available plugins. We also need to configure all of these options and provide correct credentials where indicated.

<info-box hint>
CKEditor 5 Premium features can be easily tested without commitment via the [Premium features free trial](https://ckeditor.com/docs/trial/latest/guides/overview.html) package.
</info-box>

The correct source code listing for this configuration can be seen below.

```js
CKEDITOR.DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		CKEDITOR.DecoupledEditor
			.create( document.querySelector( '#editor' ), {
				cloudServices: {
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint',
					uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/',
					webSocketUrl: 'your-organization-id.cke-cs.com/ws/'
				},
				toolbar: {
					items: [
						'revisionHistory',
						'|',
						'pageNavigation',
						'previousPage',
						'nextPage',
						'|',
						'comment', 'trackChanges',
						'|',
						'exportPdf', 'exportWord',
						'|',
						'wproofreader', 'MathType', 'findAndReplace', 'selectAll',
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
						'undo', 'redo'
					],
					shouldNotGroupWhenFull: true
				},
				exportPdf: {
					stylesheets: [
						// Add your custom styles before 'EDITOR_STYLES'
						'EDITOR_STYLES'
					],
					fileName: 'export-pdf-demo.pdf',
					converterOptions: {
						format: 'A4',
						margin_top: '20mm',
						margin_bottom: '20mm',
						margin_right: '12mm',
						margin_left: '12mm',
						page_orientation: 'portrait'
					},
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint',
					dataCallback: ( editor ) => editor.getData( {
						showSuggestionHighlights: true
					} ),
				},
				exportWord: {
					stylesheets: [
						// Add your custom styles before 'EDITOR_STYLES'
						'EDITOR_STYLES'
					],
					fileName: 'export-word-demo.docx',
					converterOptions: {
						format: 'A4',
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
				},
				pagination: {
					// A4
					pageWidth: '21cm',
					pageHeight: '29.7cm',

					pageMargins: {
						top: '20mm',
						bottom: '20mm',
						right: '12mm',
						left: '12mm'
					}
				},
				licenseKey: '', // PROVIDE CORRECT VALUE.
				collaboration: {
					channelId: 'super-build'
				},
				presenceList: {
					container: document.querySelector( '.presence' )
				},
				sidebar: {
					container: document.querySelector( '.sidebar-container' )
				},
				revisionHistory: {
					showRevisionViewerCallback: config => {
						const editorContainer = document.querySelector( '#editor-container' );
						const viewerContainer = document.querySelector( '#revision-viewer-container' );
						const viewerElement = document.querySelector( '#revision-viewer-editor' );

						config.revisionHistory.viewerSidebarContainer = document.querySelector( '#revision-viewer-sidebar' );

						return CKEDITOR.DecoupledEditor.create( viewerElement, config ).then( viewerEditor => {
							viewerContainer.style.display = 'flex';
							editorContainer.style.display = 'none';

							const toolbarContainer = document.querySelector( '.editor-toolbar' );
							toolbarContainer.innerHTML = '';
							toolbarContainer.appendChild( viewerEditor.ui.view.toolbar.element );

							return viewerEditor;
						} );
					},
					closeRevisionViewerCallback: viewerEditor => {
						const editorContainer = document.querySelector( '#editor-container' );
						const viewerContainer = document.querySelector( '#revision-viewer-container' );

						viewerContainer.style.display = 'none';
						editorContainer.style.display = '';

						return viewerEditor.destroy().then( () => {
							const toolbarContainer = document.querySelector( '.editor-toolbar' );
							toolbarContainer.innerHTML = '';
							toolbarContainer.appendChild( window.editor.ui.view.toolbar.element );
						} );
					}
			},
	} )
	.then( editor => {
		const toolbarContainer = document.querySelector( '.editor-toolbar' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( error => {
		console.log( error );
	} );
```

#### Sample implementation

You can see a full webpage with embedded CKEditor 5 from the above example after expanding the code listing below.

<details>
<summary>View editor configuration script</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Full-featured editor with Premium features and real-time collaboration</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/34.1.0/super-build/ckeditor.js"></script>
	<style>
		.editors-holder {
			position: relative;
		}

		.editor-container {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			position: relative;
			width: 1260px;
		}

		.presence {
			position: relative;
			margin: 15px 25px;
			height: 46px;
		}

		#revision-viewer-container {
			display: none;
		}

		.editor-toolbar {
			width: 1260px;
			margin-bottom: -1px;
		}

		.editor-element {
            width: 950px;
            border: 1px solid var(--ck-color-toolbar-border);
            height: calc( 297mm + 2px );
            overflow: scroll;
        }

		.editor-container > .ck-editor {
			position: relative;
			width: 950px;
		}

		.editor-container .ck-editor__top .ck-toolbar {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		.editor-container .ck-editor__editable_inline {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		.ck.ck-content:not(.ck-comment__input *) {
			/* A4 size */
			width: calc( 210mm + 2px ); /* Those 2px are from border (box-sizing: border-box) */
			min-height: calc( 297mm + 2px );
			height: auto;
			padding: 20mm 12mm;
			box-sizing: border-box;
			background: hsl( 0, 0%, 100% );
			border: 1px solid hsl( 0, 0%, 88% );
			box-shadow: 0 2px 8px hsla( 0, 0%, 0%, .08 );
			margin: 40px auto;
			overflow: hidden;
		}

		.sidebar-container {
			position: relative;
			width: 310px;
			overflow: hidden;
			background: var(--ck-color-toolbar-background);
			border: 1px solid var(--ck-color-toolbar-border);
			margin-left: -1px;
		}

		/* Move the square with page number from the Pagination plugin to the left side,
		so that it does not cover the sidebar. */
		.ck.ck-pagination-view-line::after {
			transform: translateX(-100%);
			left: -1px;
			right: unset;
		}
	</style>
</head>
<body>
	<h1>Full-featured editor with Premium features and real-time collaboration</h1>
	<div class="presence"></div>
	<div class="editors-holder">
		<div class="editor-toolbar"></div>

		<div class="editor-container" id="editor-container">
			<div class="editor-element">
				<div id="editor"></div>
			</div>
			<div class="sidebar-container" id="sidebar-container"></div>
		</div>

		<div class="editor-container" id="revision-viewer-container">
			<div class="editor-element">
				<div id="revision-viewer-editor"></div>
			</div>
			<div class="sidebar-container" id="revision-viewer-sidebar"></div>
		</div>
	</div>
	<script>
		CKEDITOR.DecoupledEditor
			.create( document.querySelector( '#editor' ), {
				cloudServices: {
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint',
					uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/',
					webSocketUrl: 'your-organization-id.cke-cs.com/ws/'
				},
				toolbar: {
					items: [
						'revisionHistory',
						'|',
						'pageNavigation',
						'previousPage',
						'nextPage',
						'|',
						'comment', 'trackChanges',
						'|',
						'exportPdf', 'exportWord',
						'|',
						'wproofreader', 'MathType', 'findAndReplace', 'selectAll',
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
						'undo', 'redo',
					],
					shouldNotGroupWhenFull: true
				},
				exportPdf: {
					stylesheets: [
						// Add your custom styles before 'EDITOR_STYLES'
						'EDITOR_STYLES'
					],
					fileName: 'export-pdf-demo.pdf',
					converterOptions: {
						format: 'A4',
						margin_top: '20mm',
						margin_bottom: '20mm',
						margin_right: '12mm',
						margin_left: '12mm',
						page_orientation: 'portrait'
					},
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint',
					dataCallback: ( editor ) => editor.getData( {
						showSuggestionHighlights: true
					} ),
				},
				exportWord: {
					stylesheets: [
						// Add your custom styles before 'EDITOR_STYLES'
						'EDITOR_STYLES'
					],
					fileName: 'export-word-demo.docx',
					converterOptions: {
						format: 'A4',
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
				},
				pagination: {
					// A4
					pageWidth: '21cm',
					pageHeight: '29.7cm',

					pageMargins: {
						top: '20mm',
						bottom: '20mm',
						right: '12mm',
						left: '12mm'
					}
				},
				licenseKey: '', // PROVIDE CORRECT VALUE.
				collaboration: {
					channelId: 'super-build'
				},
				presenceList: {
					container: document.querySelector( '.presence' )
				},
				sidebar: {
					container: document.querySelector( '.sidebar-container' )
				},
				revisionHistory: {
					showRevisionViewerCallback: config => {
						const editorContainer = document.querySelector( '#editor-container' );
						const viewerContainer = document.querySelector( '#revision-viewer-container' );
						const viewerElement = document.querySelector( '#revision-viewer-editor' );

						config.revisionHistory.viewerSidebarContainer = document.querySelector( '#revision-viewer-sidebar' );

						return CKEDITOR.DecoupledEditor.create( viewerElement, config ).then( viewerEditor => {
							viewerContainer.style.display = 'flex';
							editorContainer.style.display = 'none';

							const toolbarContainer = document.querySelector( '.editor-toolbar' );
							toolbarContainer.innerHTML = '';
							toolbarContainer.appendChild( viewerEditor.ui.view.toolbar.element );

							return viewerEditor;
						} );
					},
					closeRevisionViewerCallback: viewerEditor => {
						const editorContainer = document.querySelector( '#editor-container' );
						const viewerContainer = document.querySelector( '#revision-viewer-container' );

						viewerContainer.style.display = 'none';
						editorContainer.style.display = '';

						return viewerEditor.destroy().then( () => {
							const toolbarContainer = document.querySelector( '.editor-toolbar' );
							toolbarContainer.innerHTML = '';
							toolbarContainer.appendChild( window.editor.ui.view.toolbar.element );
						} );
					}
				},
			} )
			.then( editor => {
				window.editor = editor;

				const toolbarContainer = document.querySelector( '.editor-toolbar' );

				toolbarContainer.appendChild( editor.ui.view.toolbar.element );
			} )
			.catch( error => {
				console.log( error );
			} );
	</script>
</body>
</html>
```
</details>

### An editor with non-real-time collaboration

To unleash the full potential of CKEditor 5 with Premium features, we will use the decoupled editor and create a more complex markup, including the structure required by the Revision History feature.

```html
<div class="editors-holder">
	<div class="editor-toolbar"></div>

	<div class="editor-container" id="editor-container">
		<div class="editor-element">
			<div id="editor"></div>
		</div>
		<div class="sidebar-container" id="sidebar-container"></div>
	</div>

	<div class="editor-container" id="revision-viewer-container">
		<div class="editor-element">
			<div id="revision-viewer-editor"></div>
		</div>
		<div class="sidebar-container" id="revision-viewer-sidebar"></div>
	</div>
</div>
```

Include the code from CDN to superbuild to load the editor.

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/super-build/ckeditor.js"></script>
```

Call the {@link module:editor-decoupled/decouplededitor~DecoupledEditor#create `DecoupledEditor.create()`} method. The decoupled editor requires you to inject the toolbar into the DOM and the best place to do that is somewhere in the promise chain (e.g. one of the `then( () => { ... } )` blocks).

```html
<script>
	CKEDITOR.DecoupledEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			const toolbarContainer = document.querySelector( '.editor-toolbar' );

			toolbarContainer.appendChild( editor.ui.view.toolbar.element );
		} )
		.catch( error => {
			console.error( error );
		} );
</script>
```

This time we need to remove all the real-time collaborative plugins. As previously, we configure the toolbar to include all available plugins. We also need to configure all of these options and provide correct credentials where indicated.

<info-box hint>
CKEditor 5 Premium features can be easily tested without commitment via the [Premium features free trial](https://ckeditor.com/docs/trial/latest/guides/overview.html) package.
</info-box>

The correct source code listing for the configuration can be seen below. Note that this snippet contains a custom plugin that handles Users integration required by non-real-time Track Changes, Comments and Revision History.

```js
class UsersIntegration  {
	constructor( editor ) {
		this.editor = editor;
	}

	static get requires() {
		return [ 'Users', 'Comments', 'RevisionHistory' ];
	}

	init() {
		const user = {
			id: 'user-1',
			name: 'John Doe'
		}

		const usersPlugin = this.editor.plugins.get( 'Users' );

		usersPlugin.addUser( user );
		usersPlugin.defineMe( 'user-1' );
	}
}

CKEDITOR.DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		extraPlugins: [ UsersIntegration ],
		removePlugins: [
			'RealTimeCollaborativeComments',
			'RealTimeCollaborativeTrackChanges',
			'RealTimeCollaborativeRevisionHistory',
			'PresenceList'
		],
		cloudServices: {
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint',
			uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
		},
		toolbar: {
			items: [
				'revisionHistory',
				'|',
				'pageNavigation',
				'previousPage',
				'nextPage',
				'|',
				'comment', 'trackChanges',
				'|',
				'exportPdf', 'exportWord',
				'|',
				'wproofreader', 'MathType', 'findAndReplace', 'selectAll',
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
				'undo', 'redo',
			],
			shouldNotGroupWhenFull: true
		},
		exportPdf: {
			stylesheets: [
				// Add your custom styles before 'EDITOR_STYLES'
				'EDITOR_STYLES'
			],
			fileName: 'export-pdf-demo.pdf',
			converterOptions: {
				format: 'A4',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '12mm',
				margin_left: '12mm',
				page_orientation: 'portrait'
			},
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint',
			dataCallback: ( editor ) => editor.getData( {
				showSuggestionHighlights: true
			} ),
		},
		exportWord: {
			stylesheets: [
				// Add your custom styles before 'EDITOR_STYLES'
				'EDITOR_STYLES'
			],
			fileName: 'export-word-demo.docx',
			converterOptions: {
				format: 'A4',
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
		},
		pagination: {
			// A4
			pageWidth: '21cm',
			pageHeight: '29.7cm',

			pageMargins: {
				top: '20mm',
				bottom: '20mm',
				right: '12mm',
				left: '12mm'
			}
		},
		licenseKey: '', // PROVIDE THE CORRECT VALUE.
		sidebar: {
			container: document.querySelector( '.sidebar-container' )
		},
		revisionHistory: {
			showRevisionViewerCallback: config => {
				const editorContainer = document.querySelector( '#editor-container' );
				const viewerContainer = document.querySelector( '#revision-viewer-container' );
				const viewerElement = document.querySelector( '#revision-viewer-editor' );

				config.revisionHistory.viewerSidebarContainer = document.querySelector( '#revision-viewer-sidebar' );

				return CKEDITOR.DecoupledEditor.create( viewerElement, config ).then( viewerEditor => {
					viewerContainer.style.display = 'flex';
					editorContainer.style.display = 'none';

					const toolbarContainer = document.querySelector( '.editor-toolbar' );
					toolbarContainer.innerHTML = '';
					toolbarContainer.appendChild( viewerEditor.ui.view.toolbar.element );

					return viewerEditor;
				} );
			},
			closeRevisionViewerCallback: viewerEditor => {
				const editorContainer = document.querySelector( '#editor-container' );
				const viewerContainer = document.querySelector( '#revision-viewer-container' );

				viewerContainer.style.display = 'none';
				editorContainer.style.display = '';

				return viewerEditor.destroy().then( () => {
					const toolbarContainer = document.querySelector( '.editor-toolbar' );
					toolbarContainer.innerHTML = '';
					toolbarContainer.appendChild( window.editor.ui.view.toolbar.element );
				} );
			}
		},
	} )
	.then( editor => {
		const toolbarContainer = document.querySelector( '.editor-toolbar' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( error => {
		console.log( error );
	} );
```

#### Sample implementation

You can see a full webpage with embedded CKEditor 5 from the above example after expanding the code listing below.

<details>
<summary>View editor configuration script</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Full-featured editor with Premium features and non-real-time collaboration</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/34.1.0/super-build/ckeditor.js"></script>
	<style>
		.editors-holder {
			position: relative;
		}

		.editor-container {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			position: relative;
			width: 1260px;
		}

		#revision-viewer-container {
			display: none;
		}

		.editor-toolbar {
			width: 1260px;
			margin-bottom: -1px;
		}

		.editor-element {
            width: 950px;
            border: 1px solid var(--ck-color-toolbar-border);
            height: calc( 297mm + 2px );
            overflow: scroll;
        }

		.editor-container > .ck-editor {
			position: relative;
			width: 950px;
		}

		.editor-container .ck-editor__top .ck-toolbar {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		.editor-container .ck-editor__editable_inline {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		.ck.ck-content:not(.ck-comment__input *) {
			/* A4 size */
			width: calc( 210mm + 2px ); /* Those 2px are from border (box-sizing: border-box) */
			min-height: calc( 297mm + 2px );
			height: auto;
			padding: 20mm 12mm;
			box-sizing: border-box;
			background: hsl( 0, 0%, 100% );
			border: 1px solid hsl( 0, 0%, 88% );
			box-shadow: 0 2px 8px hsla( 0, 0%, 0%, .08 );
			margin: 40px auto;
			overflow: hidden;
		}

		.sidebar-container {
			position: relative;
			width: 310px;
			overflow: hidden;
			background: var(--ck-color-toolbar-background);
			border: 1px solid var(--ck-color-toolbar-border);
			margin-left: -1px;
		}

		/* Move the square with page number from the Pagination plugin to the left side,
		so that it does not cover the sidebar. */
		.ck.ck-pagination-view-line::after {
			transform: translateX(-100%);
			left: -1px;
			right: unset;
		}
	</style>
</head>
<body>
	<h1>Full-featured editor with Premium features and non-real-time collaboration</h1>

	<div class="editors-holder">
		<div class="editor-toolbar"></div>

		<div class="editor-container" id="editor-container">
			<div class="editor-element">
				<div id="editor"></div>
			</div>
			<div class="sidebar-container" id="sidebar-container"></div>
		</div>

		<div class="editor-container" id="revision-viewer-container">
			<div class="editor-element">
				<div id="revision-viewer-editor"></div>
			</div>
			<div class="sidebar-container" id="revision-viewer-sidebar"></div>
		</div>
	</div>
	<script>
		class UsersIntegration  {
            constructor( editor ) {
                this.editor = editor;
            }

            static get requires() {
                return [ 'Users', 'Comments', 'RevisionHistory' ];
            }

            init() {
                const user = {
                    id: 'user-1',
                    name: 'John Doe'
                }

                const usersPlugin = this.editor.plugins.get( 'Users' );

                usersPlugin.addUser( user );
                usersPlugin.defineMe( 'user-1' );
            }
        }

		CKEDITOR.DecoupledEditor
			.create( document.querySelector( '#editor' ), {
				extraPlugins: [ UsersIntegration ],
				removePlugins: [
					'RealTimeCollaborativeComments',
					'RealTimeCollaborativeTrackChanges',
					'RealTimeCollaborativeRevisionHistory',
					'PresenceList'
				],
				cloudServices: {
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint',
					uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
				},
				toolbar: {
					items: [
						'revisionHistory',
						'|',
						'pageNavigation',
						'previousPage',
						'nextPage',
						'|',
						'comment', 'trackChanges',
						'|',
						'exportPdf', 'exportWord',
						'|',
						'wproofreader', 'MathType', 'findAndReplace', 'selectAll',
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
						'undo', 'redo',
					],
					shouldNotGroupWhenFull: true
				},
				exportPdf: {
					stylesheets: [
						// Add your custom styles before 'EDITOR_STYLES'
						'EDITOR_STYLES'
					],
					fileName: 'export-pdf-demo.pdf',
					converterOptions: {
						format: 'A4',
						margin_top: '20mm',
						margin_bottom: '20mm',
						margin_right: '12mm',
						margin_left: '12mm',
						page_orientation: 'portrait'
					},
					// PROVIDE CORRECT VALUES HERE:
					tokenUrl: 'https://example.com/cs-token-endpoint',
					dataCallback: ( editor ) => editor.getData( {
						showSuggestionHighlights: true
					} ),
				},
				exportWord: {
					stylesheets: [
						// Add your custom styles before 'EDITOR_STYLES'
						'EDITOR_STYLES'
					],
					fileName: 'export-word-demo.docx',
					converterOptions: {
						format: 'A4',
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
				},
				pagination: {
					// A4
					pageWidth: '21cm',
					pageHeight: '29.7cm',

					pageMargins: {
						top: '20mm',
						bottom: '20mm',
						right: '12mm',
						left: '12mm'
					}
				},
				licenseKey: '', // PROVIDE THE CORRECT VALUE.
				sidebar: {
					container: document.querySelector( '.sidebar-container' )
				},
				revisionHistory: {
					showRevisionViewerCallback: config => {
						const editorContainer = document.querySelector( '#editor-container' );
						const viewerContainer = document.querySelector( '#revision-viewer-container' );
						const viewerElement = document.querySelector( '#revision-viewer-editor' );

						config.revisionHistory.viewerSidebarContainer = document.querySelector( '#revision-viewer-sidebar' );

						return CKEDITOR.DecoupledEditor.create( viewerElement, config ).then( viewerEditor => {
							viewerContainer.style.display = 'flex';
							editorContainer.style.display = 'none';

							const toolbarContainer = document.querySelector( '.editor-toolbar' );
							toolbarContainer.innerHTML = '';
							toolbarContainer.appendChild( viewerEditor.ui.view.toolbar.element );

							return viewerEditor;
						} );
					},
					closeRevisionViewerCallback: viewerEditor => {
						const editorContainer = document.querySelector( '#editor-container' );
						const viewerContainer = document.querySelector( '#revision-viewer-container' );

						viewerContainer.style.display = 'none';
						editorContainer.style.display = '';

						return viewerEditor.destroy().then( () => {
							const toolbarContainer = document.querySelector( '.editor-toolbar' );
							toolbarContainer.innerHTML = '';
							toolbarContainer.appendChild( window.editor.ui.view.toolbar.element );
						} );
					}
				},
			} )
			.then( editor => {
				window.editor = editor;

				const toolbarContainer = document.querySelector( '.editor-toolbar' );

				toolbarContainer.appendChild( editor.ui.view.toolbar.element );
			} )
			.catch( error => {
				console.log( error );
			} );
	</script>
</body>
</html>
```
</details>

<info-box hint>
**What's next?**

Congratulations, you have just run your first CKEditor 5 instance!

You can also try another simple installation method, like the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.

And if you use Angular, React or Vue.js and want to integrate CKEditor 5 in your application, refer to the {@link installation/frameworks/overview Frameworks section}.
</info-box>
