---
menu-title: (Legacy) DLL builds
meta-title: DLL builds | Legacy CKEditor 5 documentation
category: alternative-setups
order: 20
modified_at: 2022-02-22
---

{@snippet installation/advanced/dll-builds}

# (Legacy) CKEditor 5 DLL builds

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you want to learn more about these changes, please refer to the {@link updating/nim-migration/dll-builds Migrating from DLL builds} guide.
</info-box>

The purpose of a DLL build is to allow adding plugins to an editor build without having to rebuild (recompile) the build itself.

Currently, the two most common integration methods include:

* Using pre-compiled builds. This can be either one of the official builds or a custom build. In this case, adding a plugin requires recompiling the entire build.
* Integrating the editor from source. In this case, if you want to add a plugin, your application needs to be recompiled.

In some advanced use cases, the list of available plugins cannot be limited &ndash; it should be possible to add plugins without any access to Node.js. In other words, plugins should be built (compiled) separately from the editor's core.

This is where the DLL builds come to the rescue.

DLL builds are based on the [DLL webpack](https://webpack.js.org/plugins/dll-plugin/) plugin that provides a CKEditor&nbsp;5 **base DLL** and a set of **[DLL consumer plugins](https://webpack.js.org/plugins/dll-plugin/#dllreferenceplugin)**.

CKEditor&nbsp;5 comes with ready-to-use DLL builds. These builds are added to the npm packages and they are available inside the `/build` directory of each package.

<info-box>
	For simplicity reasons, this guide does not include any collaboration features. If you are interested in adding these features, please check the {@link getting-started/advanced/dll-builds-collaboration-features DLL builds for CKEditor&nbsp;5 Collaboration Features} guide after reading this one.
</info-box>

## Anatomy of a DLL build

A DLL build of the editor consists of two parts:

* **Base DLL build**. It is a single JavaScript file that combines the contents of several core CKEditor&nbsp;5 packages: `utils`, `core`, `engine`, `ui`, `clipboard`, `enter`, `paragraph`, `select-all`, `typing`, `undo`, `upload`, `widget`, and `watchdog`. These packages are either the framework core, or are features used by nearly all editor installations. The build is available on npm in `ckeditor5` package.
* **DLL-compatible package builds**. Every package that is not part of the base DLL build is built into a DLL-compatible JavaScript file. These DLLs are available on npm in `@ckeditor/ckeditor5-[FEATURE_NAME]` packages.

To load an editor, you need to use the base DLL build plus several DLL-compatible package builds. You will see how to do that later on.

## Creating a DLL build

To create your base DLL build and DLL-compatible packages builds, all you need to do is:

1. Install `ckeditor5` package from npm.
1. Install `@ckeditor/ckeditor5-*` packages for all plugins that you want to include in the build.

This is it.

## Using a DLL build

The exact way to use a DLL build will depend on your system. Presented in this guide is the simplest method that uses the `<script>` tags.

To run the editor, you need to load the necessary files (base DLL + editor creator + features). These files expose their content in the `CKEditor5` global, using the following format:

```
CKEditor5.packageName.moduleName
```

For example:

```html
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

<script>
	const config = {
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
			CKEditor5.table.TableToolbar
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
				'redo'
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
		}
	};

	CKEditor5.editorClassic.ClassicEditor
		.create( document.querySelector( '#editor' ), config )
		.then( editor => {
			window.editor = editor;
		} );
</script>
```

## Live implementation sample

Presented below is a working sample editor using the DLL mechanism. Observe the source and then click **"Result"** to switch to the live view of the working CKEditor&nbsp;5 instance.

<iframe width="100%" height="850" src="//jsfiddle.net/ckeditor/ex7hcoz1/embedded/html,result/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

## Localization

All DLL builds use the default (English) translation files. However, a localized version of the editor can be easily configured.

The base DLL build produces translation files for several core packages. The DLL-compatible package builds contain their own translation files per package.

<info-box info>
	Some CKEditor&nbsp;5 features do not provide translation files as they do not offer UI elements or toolbar items.
</info-box>

To create an editor with a localized UI, you need to load the necessary translation files (similar to loading DLL builds).

For example:

```html
<!-- Base DLL build. -->
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

<!-- Spanish translation files. -->
<script src="path/to/node_modules/ckeditor5/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-basic-styles/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-block-quote/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-heading/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-image/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-indent/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-link/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-list/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-media-embed/build/translations/es.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-table/build/translations/es.js"></script>

<script>
	const config = {
		// Use the Spanish language.
		language: 'es',
		// ...the rest of configuration object.
	};

	CKEditor5.editorClassic.ClassicEditor
		.create( document.querySelector( '#editor' ), config )
		.then( editor => {
			window.editor = editor;
		} );
</script>
```

<!--

## Known limitations

## Creating DLL-compatible plugins

## Runtime plugins

-->
