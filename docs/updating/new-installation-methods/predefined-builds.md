---
category: nim-migration
order: 20
menu-title: Migrating from predefined builds
meta-title: Migration guide from the predefined builds
meta-description: Learn how to upgrade from predefined builds to the new installation methods.
---

# Migration guide from the predefined builds

Migrating from the predefined builds should mostly be a matter of copying and pasting the code from below to replace the old code. The code to copy depends on the build and distribution method you used.

## Prerequisites

Before you start, follow the usual upgrade path to update your project to use the latest version of CKEditor 5. This will rule out any issues that might be caused by upgrading from outdated version of CKEditor 5.

## npm

If you are using the predefined builds from npm, follow the steps below:

1. Start by uninstalling the old build package. It can be identified by the `@ckeditor/ckeditor5-build-` prefix. For example, if you were using the `@ckeditor/ckeditor5-build-classic` package, you should uninstall it.

	```bash
	# Package name may vary depending on the build you used.
	npm uninstall @ckeditor/ckeditor5-build-classic
	```

2. Next, install the `ckeditor5` package. This package contains the editor and all of our open-source plugins.

	```bash
	npm install ckeditor5
	```

3. (Optional) If you use features from our commercial offering, you should also install the `ckeditor5-premium-feature` package.

	```bash
	npm install ckeditor5-premium-feature
	```

4. Open the file, in which you initialize the editor. Then, replace the import statement and the initialization code depending on the build you used.

	<details>
	<summary>Classic editor</summary>

	Before:
	```js
	import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

	ClassicEditor
        .create( document.querySelector( '#editor' ) )
        .catch( error => console.error( error ) );
	```

	After:
	```js
	import {
		ClassicEditor,
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CKBox,
		CKFinder,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		PictureEditing,
		Indent,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table,
		TableToolbar,
		TextTransformation,
		CloudServices
	} from 'ckeditor5';

	import 'ckeditor5/ckeditor5.css';

	class Editor extends ClassicEditor {
		static builtinPlugins = [
			Essentials,
			CKFinderUploadAdapter,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			CKBox,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			PasteFromOffice,
			PictureEditing,
			Table,
			TableToolbar,
			TextTransformation
		];

		static defaultConfig = {
			toolbar: {
				items: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
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
			language: 'en'
		};
	}

	Editor
		.create( document.querySelector( '#editor' ) )
		.catch( error => console.error( error ) );
	```
	</details>

	<details>
	<summary>Inline editor</summary>

	Before:
	```js
	import InlineEditor from '@ckeditor/ckeditor5-build-inline';

	InlineEditor
        .create( document.querySelector( '#editor' ) )
        .catch( error => console.error( error ) );
	```

	After:
	```js
	import {
		InlineEditor,
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CKBox,
		CKFinder,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		PictureEditing,
		Indent,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table,
		TableToolbar,
		TextTransformation,
		CloudServices
	} from 'ckeditor5';

	import 'ckeditor5/ckeditor5.css';

	class Editor extends InlineEditor {
		static builtinPlugins = [
			Essentials,
			CKFinderUploadAdapter,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			CKBox,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			PasteFromOffice,
			PictureEditing,
			Table,
			TableToolbar,
			TextTransformation
		];

		static defaultConfig = {
			toolbar: {
				items: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
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
			language: 'en'
		};
	}

	Editor
		.create( document.querySelector( '#editor' ) )
		.catch( error => console.error( error ) );
	```
	</details>

	<details>
	<summary>Balloon editor</summary>

	Before:
	```js
	import BalloonEditor from '@ckeditor/ckeditor5-build-balloon';

	BalloonEditor
        .create( document.querySelector( '#editor' ) )
        .catch( error => console.error( error ) );
	```

	After:
	```js
	import {
		BalloonEditor,
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CKBox,
		CKFinder,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		PictureEditing,
		Indent,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table, TableToolbar,
		TextTransformation,
		CloudServices
	} from 'ckeditor5';

	import 'ckeditor5/ckeditor5.css';

	class Editor extends BalloonEditor {
		static builtinPlugins = [
			Essentials,
			CKFinderUploadAdapter,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			CKBox,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			PasteFromOffice,
			PictureEditing,
			Table,
			TableToolbar,
			TextTransformation
		];

		static defaultConfig = {
			toolbar: {
				items: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
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
			language: 'en'
		};
	}

	Editor
		.create( document.querySelector( '#editor' ) )
		.catch( error => console.error( error ) );
	```
	</details>

5. Unlike when using predefined builds, now you are free to customize the editor by adding or removing plugins. However, before you do that, make sure to test the editor to ensure that it works as expected.
