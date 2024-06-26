---
menu-title: DLL builds for Collaboration Features
meta-title: DLL builds for Collaboration Features | Legacy CKEditor 5 documentation
category: alternative-setups
order: 30
modified_at: 2022-02-21
---

# CKEditor 5 DLL builds for CKEditor 5 Collaboration Features &ndash; Legacy guide

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you want to learn more about these changes, please refer to the {@link updating/nim-migration/dll-builds Migrating from DLL builds} guide.
</info-box>

This guide discusses using a DLL build together with CKEditor&nbsp;5 Collaboration Features and is supplemental to the {@link getting-started/advanced/dll-builds CKEditor&nbsp;5 DLL builds guide}. Make sure to read the {@link getting-started/advanced/dll-builds base guide} first before proceeding.

## Anatomy of a DLL build with CKEditor&nbsp;5 collaboration features

A DLL build of the editor consists of the following parts:

* **Base DLL build**. It is a single JavaScript file that combines the contents of several core CKEditor&nbsp;5 packages: `utils`, `core`, `engine`, `ui`, `clipboard`, `enter`, `paragraph`, `select-all`, `typing`, `undo`, `upload`, `widget`, and `watchdog`. These packages are either the framework core or are features used by nearly all editor installations. The build is available on npm in `ckeditor5` package.
* **Base DLL build for CKEditor&nbsp;5 Collaboration Features**. It is a single JavaScript file that includes all necessary files for the collaboration features packages and extends the base DLL for CKEditor&nbsp;5. The build is available on npm in `ckeditor5-collaboration` package.
* **DLL-compatible package builds**. Every package that is not a part of the base DLL builds, is built into a DLL-compatible JavaScript file. The CKEditor&nbsp;5 Collaboration Features DLL builds are available in this format as well. These DLLs are available on npm in `@ckeditor/ckeditor5-[FEATURE_NAME]` packages.

To create an editor with collaboration features, you need to use the two base DLL builds plus a DLL-compatible package build for each plugin you would like to include.

## Integrating CKEditor&nbsp;5 Collaboration Features as DLL builds

The exact way to use a DLL build will depend on your system. Presented in this guide is the simplest method that uses the `<script>` tags.

To run the editor, you need to load the necessary files (base DLL + CF base DLL + editor creator + features). These files expose their content in the `CKEditor5` global, using the following format:

```
CKEditor5.packageName.moduleName
```

<info-box>
	This guide uses the {@link features/watchdog watchdog feature} feature. You can also integrate the collaboration features without it, but it is strongly recommended to use the watchdog when real-time collaboration is enabled.
</info-box>

Below is an example of an integration:

```html
<div id="presence-list-container"></div>

<div class="container">
	<div id="editor"><p>Let's edit this together!</p></div>
	<div class="sidebar" id="sidebar"></div>
</div>

<!-- Base DLL build. -->
<!-- Note: It includes ckeditor5-paragraph too. -->
<script src="path/to/node_modules/ckeditor5/build/ckeditor5-dll.js"></script>

<!-- DLL-compatible build of ckeditor5-editor-classic. -->
<script src="path/to/node_modules/@ckeditor/ckeditor5-editor-classic/build/editor-classic.js"></script>

<!-- DLL-compatible builds of editor features. -->
<script src="path/to/node_modules/@ckeditor/ckeditor5-autoformat/build/autoformat.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-basic-styles/build/basic-styles.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-block-quote/build/block-quote.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-essentials/build/essentials.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-heading/build/heading.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-image/build/image.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-indent/build/indent.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-link/build/link.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-list/build/list.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-media-embed/build/media-embed.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-paste-from-office/build/paste-from-office.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-table/build/table.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-cloud-services/build/cloud-services.js"></script>

<!-- Base DLL build for Collaboration features -->
<script src="path/to/node_modules/ckeditor5-collaboration/build/ckeditor5-collaboration-dll.js"></script>

<!-- DLL-compatible builds of collaboration features. -->
<script src="path/to/node_modules/@ckeditor/ckeditor5-comments/build/comments.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-track-changes/build/track-changes.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-real-time-collaboration/build/real-time-collaboration.js"></script>

<script>
	const watchdog = new CKEditor5.watchdog.EditorWatchdog( Editor );

	watchdog.create( document.querySelector( '#editor', {
		plugins: [
			CKEditor5.autoformat.Autoformat,
			CKEditor5.basicStyles.Bold,
			CKEditor5.basicStyles.Italic,
			CKEditor5.blockQuote.BlockQuote,
			CKEditor5.essentials.Essentials,
			CKEditor5.heading.Heading,
			CKEditor5.image.Image,
			CKEditor5.image.ImageCaption,
			CKEditor5.image.ImageStyle,
			CKEditor5.image.ImageToolbar,
			CKEditor5.image.ImageUpload,
			CKEditor5.indent.Indent,
			CKEditor5.link.Link,
			CKEditor5.list.List,
			CKEditor5.mediaEmbed.MediaEmbed,
			CKEditor5.paragraph.Paragraph,
			CKEditor5.pasteFromOffice.PasteFromOffice,
			CKEditor5.table.Table,
			CKEditor5.table.TableToolbar,
			CKEditor5.cloudServices.CloudServices,
			CKEditor5.comments.Comments,
			CKEditor5.trackChanges.TrackChanges,
			CKEditor5.realTimeCollaboration.RealTimeCollaborativeEditing,
			CKEditor5.realTimeCollaboration.RealTimeCollaborativeComments,
			CKEditor5.realTimeCollaboration.RealTimeCollaborativeTrackChanges,
		],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'uploadImage',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo',
				'-',
				'comment',
				'-',
				'trackChanges'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		comments: {
			editorConfig: {
				extraPlugins: [ CKEditor5.basicStyles.Bold, CKEditor5.basicStyles.Italic, CKEditor5.list.List, CKEditor5.autoformat.Autoformat ]
			}
		},
		presenceList: {
			container: document.querySelector( '#presence-list-container' )
		},
		sidebar: {
			container: document.querySelector( '#sidebar' )
		},
		cloudServices: {
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint',
			uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/',
			webSocketUrl: 'your-organization-id.cke-cs.com/ws/'
		},
		collaboration: {
			channelId: 'document-id'
		}
	} ) );
</script>
```
