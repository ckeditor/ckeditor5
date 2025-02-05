---
category: nim-migration
order: 20
menu-title: Migrating from predefined builds
meta-title: Migrating from predefined builds to new installation methods | CKEditor5 documentation
meta-description: Learn how to upgrade from predefined builds to the new installation methods.
modified_at: 2024-06-25
---

# Migrating from predefined builds

Before version 42.0.0, the predefined builds were the easiest way to get started with CKEditor&nbsp;5. They provided an out-of-the-box editor with a predefined set of plugins and a default configuration. However, they had limitations, such as the inability to customize the editor by adding or removing plugins.

The new installation methods solve this problem. They allow you to fully customize the editor, whether you use npm packages or browser builds.

Migrating from the predefined builds to the new installation methods should mostly be a matter of copying and pasting the code below to replace the old code. The code to copy depends on the build and distribution method you used.

## Prerequisites

Before you start, follow the usual upgrade path to update your project to use the latest version of CKEditor&nbsp;5. This will rule out any problems that may be caused by upgrading from an outdated version of CKEditor&nbsp;5.

## Migration steps

### npm

If you are using predefined builds from npm, follow the steps below:

1. Start by uninstalling the old build package. It can be identified by the `@ckeditor/ckeditor5-build-` prefix. For example, if you were using the `@ckeditor/ckeditor5-build-classic` package, you should uninstall it. Below is the command to uninstall all predefined builds.

	```bash
	npm uninstall \
		@ckeditor/ckeditor5-build-balloon \
		@ckeditor/ckeditor5-build-balloon-block \
		@ckeditor/ckeditor5-build-classic \
		@ckeditor/ckeditor5-build-decoupled-document \
		@ckeditor/ckeditor5-build-inline \
		@ckeditor/ckeditor5-build-multi-root
	```

2. Next, install the `ckeditor5` package. This package contains the editor and all of our open-source plugins.

	```bash
	npm install ckeditor5
	```

3. (Optional) If you are using premium features from our commercial offer, you should also install the `ckeditor5-premium-features` package.

	```bash
	npm install ckeditor5-premium-features
	```

4. Open the file where you initialized the editor. Then replace the import statement and the initialization code depending on the build you are using.

	<details>
	<summary>Classic editor</summary>

	Before:
	```js
	import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

	ClassicEditor
		.create( /* Configuration */ )
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```
	</details>

	<details>
	<summary>Inline editor</summary>

	Before:
	```js
	import InlineEditor from '@ckeditor/ckeditor5-build-inline';

	InlineEditor
		.create( /* Configuration */ )
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```
	</details>

	<details>
	<summary>Balloon editor</summary>

	Before:
	```js
	import BalloonEditor from '@ckeditor/ckeditor5-build-balloon';

	BalloonEditor
		.create( /* Configuration */ )
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
		Table,
		TableToolbar,
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```
	</details>

	<details>
	<summary>Balloon block editor</summary>

	Before:
	```js
	import BalloonEditor from '@ckeditor/ckeditor5-build-balloon-block';

	BalloonEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```

	After:
	```js
	import {
		BalloonEditor,
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		BlockToolbar,
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

	/*
	Create an additional stylesheet file with the given content:

	.ck.ck-block-toolbar-button {
		transform: translateX( calc(-1 * var(--ck-spacing-large)) );
	}
	*/

	class Editor extends BalloonEditor {
		static builtinPlugins = [
			Essentials,
			CKFinderUploadAdapter,
			Autoformat,
			BlockToolbar,
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
			blockToolbar: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			],
			toolbar: {
				items: [
					'bold', 'italic', 'link'
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```
	</details>

	<details>
	<summary>Decoupled document editor</summary>

	Before:
	```js
	import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

	DecoupledEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```

	After:
	```js
	import {
		DecoupledEditor,
		Essentials,
		Alignment,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		Strikethrough,
		Underline,
		BlockQuote,
		CKBox,
		CKFinder,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageResize,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		PictureEditing,
		Indent,
		IndentBlock,
		Link,
		List,
		ListProperties,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table,
		TableToolbar,
		TextTransformation,
		CloudServices
	} from 'ckeditor5';

	import 'ckeditor5/ckeditor5.css';

	class Editor extends DecoupledEditor {
		static builtinPlugins = [
			Essentials,
			Alignment,
			FontSize,
			FontFamily,
			FontColor,
			FontBackgroundColor,
			CKFinderUploadAdapter,
			Autoformat,
			Bold,
			Italic,
			Strikethrough,
			Underline,
			BlockQuote,
			CKBox,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageResize,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			IndentBlock,
			Link,
			List,
			ListProperties,
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
					'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
					'|', 'bold', 'italic', 'underline', 'strikethrough',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'alignment',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
				]
			},
			image: {
				resizeUnit: 'px',
				toolbar: [
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
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
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			},
			language: 'en'
		};
	}

	Editor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```
	</details>

	<details>
	<summary>Multi-root editor</summary>

	Before:
	```js
	import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

	MultiRootEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```

	After:
	```js
	import {
		MultiRootEditor,
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

	class Editor extends MultiRootEditor {
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	```
	</details>

5. Unlike when using predefined builds, you are now free to customize the editor by adding or removing plugins. However, before you do this, you should test the editor to make sure it works as expected.

### CDN

If you are using the predefined builds from CDN, follow the steps below depending on whether you want to use JavaScript modules (ESM) with imports or standard (UMD) scripts with global variables.

#### CDN with imports

One notable difference between the old build and the new ESM build is that the former uses the `<script>` tags while the latter uses the `<script type="module">` tags, which behave differently in some cases. For more information, see this [MDN page explaining the differences between modules and standard scripts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#other_differences_between_modules_and_standard_scripts).

1. Start by removing the `<script>` tags that contain the old build.

	```html
	<script src="https://cdn.ckeditor.com/ckeditor5/<VERSION>/classic/ckeditor.js"></script>
	```

2. Add the `<link>` tags to include the editor's CSS files and the `<script type="importmap">` tag to map the package names to the build URLs.

	2.1 If you only use the open-source features:

	```html
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />

	<script type="importmap">
	{
		"imports": {
			"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
			"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/"
		}
	}
	</script>
	```

	2.2 If you also use premium features from our commercial offer:

	```html
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />

	<script type="importmap">
	{
		"imports": {
			"ckeditor5": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js",
			"ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/",
			"ckeditor5-premium-features": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.js",
			"ckeditor5-premium-features/": "https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/"
		}
	}
	</script>
	```

3. Replace the old `<script>` tag, which contains the initialization code, depending on the build you are using.

	<details>
	<summary>Classic editor</summary>

	Before:
	```html
	<script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
				console.error( error );
		} );
	</script>
	```

	After:
	```html
	<script type="module">
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Inline editor</summary>

	Before:
	```html
	<script>
	InlineEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script type="module">
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Balloon editor</summary>

	Before:
	```html
	<script>
	BalloonEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script type="module">
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
		Table,
		TableToolbar,
		TextTransformation,
		CloudServices
	} from 'ckeditor5';

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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Balloon block editor</summary>

	Before:
	```html
	<script>
	BalloonEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script type="module">
	import {
		BalloonEditor,
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		BlockToolbar,
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

	/*
	Create an additional stylesheet file with the given content:

	.ck.ck-block-toolbar-button {
		transform: translateX( calc(-1 * var(--ck-spacing-large)) );
	}
	*/

	class Editor extends BalloonEditor {
		static builtinPlugins = [
			Essentials,
			CKFinderUploadAdapter,
			Autoformat,
			BlockToolbar,
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
			blockToolbar: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			],
			toolbar: {
				items: [
					'bold', 'italic', 'link'
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Decoupled document editor</summary>

	Before:
	```html
	<script>
	DecoupledEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script type="module">
	import {
		DecoupledEditor,
		Essentials,
		Alignment,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		Strikethrough,
		Underline,
		BlockQuote,
		CKBox,
		CKFinder,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageResize,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		PictureEditing,
		Indent,
		IndentBlock,
		Link,
		List,
		ListProperties,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table,
		TableToolbar,
		TextTransformation,
		CloudServices
	} from 'ckeditor5';

	class Editor extends DecoupledEditor {
		static builtinPlugins = [
			Essentials,
			Alignment,
			FontSize,
			FontFamily,
			FontColor,
			FontBackgroundColor,
			CKFinderUploadAdapter,
			Autoformat,
			Bold,
			Italic,
			Strikethrough,
			Underline,
			BlockQuote,
			CKBox,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageResize,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			IndentBlock,
			Link,
			List,
			ListProperties,
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
					'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
					'|', 'bold', 'italic', 'underline', 'strikethrough',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'alignment',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
				]
			},
			image: {
				resizeUnit: 'px',
				toolbar: [
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
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
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			},
			language: 'en'
		};
	}

	Editor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Multi-root editor</summary>

	Before:
	```html
	<script>
	MultiRootEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script type="module">
	import {
		MultiRootEditor,
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

	class Editor extends MultiRootEditor {
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Superbuild</summary>

	<info-box warning>
		Please note that the snippet below does not include plugins for the {@link features/math-equations math equations and chemical formulas} and {@link features/spelling-and-grammar-checking spelling, grammar, and punctuation checking} features which were part of the old superbuild.

		Please [contact us](https://ckeditor.com/contact/) if you require these features in the CDN distribution.
	</info-box>

	Before:
	```html
	<script>
	ClassicEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script type="module">
	import {
		ClassicEditor as ClassicEditorBase,
		InlineEditor as InlineEditorBase,
		BalloonEditor as BalloonEditorBase,
		DecoupledEditor as DecoupledEditorBase,
		CKFinderUploadAdapter,
		Alignment,
		Autoformat,
		Bold,
		Italic,
		Underline,
		Strikethrough,
		Superscript,
		Subscript,
		Code,
		BlockQuote,
		CKBox,
		CKBoxImageEdit,
		CKFinder,
		CloudServices,
		CodeBlock,
		EasyImage,
		Essentials,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		AutoImage,
		ImageResize,
		ImageUpload,
		ImageInsert,
		PictureEditing,
		Indent,
		IndentBlock,
		TextPartLanguage,
		Link,
		AutoLink,
		LinkImage,
		List,
		ListProperties,
		TodoList,
		MediaEmbed,
		Paragraph,
		FindAndReplace,
		FontBackgroundColor,
		FontColor,
		FontFamily,
		FontSize,
		Highlight,
		HorizontalLine,
		HtmlEmbed,
		GeneralHtmlSupport,
		HtmlComment,
		Mention,
		PageBreak,
		PasteFromOffice,
		RemoveFormat,
		StandardEditingMode,
		ShowBlocks,
		Style,
		SourceEditing,
		SpecialCharacters,
		SpecialCharactersEssentials,
		Table,
		TableToolbar,
		TableCellProperties,
		TableProperties,
		TableCaption,
		TableColumnResize,
		TextTransformation,
		WordCount,
		Base64UploadAdapter
	} from 'ckeditor5';

	import {
		AIAssistant,
		OpenAITextAdapter,
		CaseChange,
		Comments,
		ExportPdf,
		ExportWord,
		MultiLevelList,
		Pagination,
		RealTimeCollaborativeComments,
		RealTimeCollaborativeRevisionHistory,
		RealTimeCollaborativeTrackChanges,
		RevisionHistory,
		TrackChanges,
		TrackChangesData
	} from 'ckeditor5-premium-features';

	class ClassicEditor extends ClassicEditorBase {}

	class InlineEditor extends InlineEditorBase {}

	class BalloonEditor extends BalloonEditorBase {}

	class DecoupledEditor extends DecoupledEditorBase {}

	for ( const Editor of [ ClassicEditor, InlineEditor, BalloonEditor, DecoupledEditor ] ) {
		// Plugins to include in the build.
		Editor.builtinPlugins = [
			AIAssistant, OpenAITextAdapter,
			Base64UploadAdapter,
			Alignment,
			Autoformat,
			Bold, Italic, Underline, Strikethrough, Superscript, Subscript, Code,
			BlockQuote,
			CKBox, CKBoxImageEdit,
			CKFinder, CKFinderUploadAdapter,
			CloudServices,
			CodeBlock,
			Comments,
			EasyImage,
			Essentials,
			ExportPdf,
			ExportWord,
			Heading,
			Image, ImageCaption, ImageStyle, ImageToolbar, AutoImage, ImageResize, ImageUpload, ImageInsert, PictureEditing,
			Indent, IndentBlock,
			TextPartLanguage,
			Link, AutoLink, LinkImage,
			List, ListProperties, TodoList,
			MultiLevelList,
			MediaEmbed,
			Paragraph,
			FindAndReplace,
			FontBackgroundColor, FontColor, FontFamily, FontSize,
			Highlight,
			HorizontalLine,
			HtmlEmbed,
			GeneralHtmlSupport, HtmlComment,
			Mention,
			PageBreak,
			PasteFromOffice,
			Pagination,
			RealTimeCollaborativeComments, RealTimeCollaborativeRevisionHistory, RealTimeCollaborativeTrackChanges, PresenceList,
			RemoveFormat,
			RevisionHistory,
			StandardEditingMode,
			ShowBlocks,
			Style,
			SpecialCharacters, SpecialCharactersEssentials,
			Table, TableToolbar, TableCellProperties, TableProperties, TableCaption, TableColumnResize,
			TrackChanges, TrackChangesData,
			TextTransformation,
			WordCount,
			DocumentOutline, TableOfContents, FormatPainter, Template, SlashCommand, PasteFromOfficeEnhanced, CaseChange
		];

		Editor.defaultConfig = {
			toolbar: [
				'aiCommands', 'aiAssistant',
				'|',
				'tableOfContents', 'formatPainter', 'insertTemplate', 'caseChange',
				'|',
				'pagination',
				'|',
				'trackChanges', 'revisionHistory', 'comment',
				'|',
				'heading', 'style',
				'|',
				'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
				'|',
				'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
				'|',
				'bulletedList', 'numberedList', 'multiLevelList', 'todoList',
				'|',
				'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
				'|',
				'htmlEmbed',
				'|',
				'alignment', 'outdent', 'indent',
				'|',
				'pageBreak', 'horizontalLine', 'specialCharacters',
				'|',
				'textPartLanguage',
				'|',
				'showBlocks',
				'|',
				'undo', 'redo', 'findAndReplace'
			],
			table: {
				contentToolbar: [
					'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
				]
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
						label: 'Original size',
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
					'resizeImage', '|',
					'ckboxImageEdit'
				],
				insert: {
					integrations: [
						'insertImageViaUrl'
					]
				}
			},
			comments: {
				editorConfig: {
					extraPlugins: [ Bold, Italic, Underline, List ]
				}
			},
			placeholder: 'Type the content here!',
			language: 'en'
		};

		// Enable the `SourceEditing` plugin for ClassicEditor only.
		if ( Editor === ClassicEditor ) {
			Editor.builtinPlugins.push( SourceEditing );

			Editor.defaultConfig.toolbar.push( '|', 'sourceEditing' );
		}

		// Enable the `Pagination` plugin for DecoupledEditor only.
		if ( Editor === DecoupledEditor ) {
			Editor.builtinPlugins.push( Pagination );

			Editor.defaultConfig.toolbar.unshift( 'sourceEditing', '|' );

			Editor.defaultConfig.pagination = {
				// A4
				pageWidth: '21cm',
				pageHeight: '29.7cm',

				pageMargins: {
					top: '20mm',
					bottom: '20mm',
					right: '12mm',
					left: '12mm'
				}
			};
		}
	}

	ClassicEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

5. Unlike when using predefined builds, you are now free to customize the editor by adding or removing plugins. However, before you do this, you should test the editor to make sure it works as expected.

#### CDN with global variables

1. Start by removing the `<script>` tags that contain the old build.

	```html
	<script src="https://cdn.ckeditor.com/ckeditor5/<VERSION>/classic/ckeditor.js"></script>
	```

2. Add the `<link>` and `<script>` tags to include the editor's styles and code.

	2.1 If you only use the open-source features:

	```html
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
	```

	2.2 If you also use premium features from our commercial offer:

	```html
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
	<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
	```

3. Replace the old `<script>` tag, which contains the initialization code, depending on the build you are using.

	<details>
	<summary>Classic editor</summary>

	Before:
	```html
	<script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
				console.error( error );
		} );
	</script>
	```

	After:
	```html
	<script>
	const {
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
	} = CKEDITOR;

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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Inline editor</summary>

	Before:
	```html
	<script>
	InlineEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script>
	const {
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
	} = CKEDITOR;

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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Balloon editor</summary>

	Before:
	```html
	<script>
	BalloonEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script>
	const {
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
		Table,
		TableToolbar,
		TextTransformation,
		CloudServices
	} = CKEDITOR;

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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Balloon block editor</summary>

	Before:
	```html
	<script>
	BalloonEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script>
	const {
		BalloonEditor,
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		BlockToolbar,
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
	} = CKEDITOR;

	/*
	Create an additional stylesheet file with the given content:

	.ck.ck-block-toolbar-button {
		transform: translateX( calc(-1 * var(--ck-spacing-large)) );
	}
	*/

	class Editor extends BalloonEditor {
		static builtinPlugins = [
			Essentials,
			CKFinderUploadAdapter,
			Autoformat,
			BlockToolbar,
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
			blockToolbar: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			],
			toolbar: {
				items: [
					'bold', 'italic', 'link'
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Decoupled document editor</summary>

	Before:
	```html
	<script>
	DecoupledEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script>
	const {
		DecoupledEditor,
		Essentials,
		Alignment,
		FontSize,
		FontFamily,
		FontColor,
		FontBackgroundColor,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		Strikethrough,
		Underline,
		BlockQuote,
		CKBox,
		CKFinder,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageResize,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		PictureEditing,
		Indent,
		IndentBlock,
		Link,
		List,
		ListProperties,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table,
		TableToolbar,
		TextTransformation,
		CloudServices
	} = CKEDITOR;

	class Editor extends DecoupledEditor {
		static builtinPlugins = [
			Essentials,
			Alignment,
			FontSize,
			FontFamily,
			FontColor,
			FontBackgroundColor,
			CKFinderUploadAdapter,
			Autoformat,
			Bold,
			Italic,
			Strikethrough,
			Underline,
			BlockQuote,
			CKBox,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageResize,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			IndentBlock,
			Link,
			List,
			ListProperties,
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
					'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
					'|', 'bold', 'italic', 'underline', 'strikethrough',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'alignment',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
				]
			},
			image: {
				resizeUnit: 'px',
				toolbar: [
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
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
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			},
			language: 'en'
		};
	}

	Editor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Multi-root editor</summary>

	Before:
	```html
	<script>
	MultiRootEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script>
	const {
		MultiRootEditor,
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
	} = CKEDITOR;

	class Editor extends MultiRootEditor {
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
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

	<details>
	<summary>Superbuild</summary>

	<info-box warning>
		Please note that the snippet below does not include plugins for the {@link features/math-equations math equations and chemical formulas} and {@link features/spelling-and-grammar-checking spelling, grammar, and punctuation checking} features which were part of the old superbuild.

		Please [contact us](https://ckeditor.com/contact/) if you require these features in the CDN distribution.
	</info-box>

	Before:
	```html
	<script>
	ClassicEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```

	After:
	```html
	<script>
	const {
		ClassicEditor: ClassicEditorBase,
		InlineEditor: InlineEditorBase,
		BalloonEditor: BalloonEditorBase,
		DecoupledEditor: DecoupledEditorBase,
		CKFinderUploadAdapter,
		Alignment,
		Autoformat,
		Bold,
		Italic,
		Underline,
		Strikethrough,
		Superscript,
		Subscript,
		Code,
		BlockQuote,
		CKBox,
		CKBoxImageEdit,
		CKFinder,
		CloudServices,
		CodeBlock,
		EasyImage,
		Essentials,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		AutoImage,
		ImageResize,
		ImageUpload,
		ImageInsert,
		PictureEditing,
		Indent,
		IndentBlock,
		TextPartLanguage,
		Link,
		AutoLink,
		LinkImage,
		List,
		ListProperties,
		TodoList,
		MediaEmbed,
		Paragraph,
		FindAndReplace,
		FontBackgroundColor,
		FontColor,
		FontFamily,
		FontSize,
		Highlight,
		HorizontalLine,
		HtmlEmbed,
		GeneralHtmlSupport,
		HtmlComment,
		Mention,
		PageBreak,
		PasteFromOffice,
		RemoveFormat,
		StandardEditingMode,
		ShowBlocks,
		Style,
		SourceEditing,
		SpecialCharacters,
		SpecialCharactersEssentials,
		Table,
		TableToolbar,
		TableCellProperties,
		TableProperties,
		TableCaption,
		TableColumnResize,
		TextTransformation,
		WordCount,
		Base64UploadAdapter
	} = CKEDITOR;

	const {
		AIAssistant,
		OpenAITextAdapter,
		CaseChange,
		Comments,
		ExportPdf,
		ExportWord,
		MultiLevelList,
		Pagination,
		RealTimeCollaborativeComments,
		RealTimeCollaborativeRevisionHistory,
		RealTimeCollaborativeTrackChanges,
		RevisionHistory,
		TrackChanges,
		TrackChangesData
	} = CKEDITOR_PREMIUM_FEATURES;

	class ClassicEditor extends ClassicEditorBase {}

	class InlineEditor extends InlineEditorBase {}

	class BalloonEditor extends BalloonEditorBase {}

	class DecoupledEditor extends DecoupledEditorBase {}

	for ( const Editor of [ ClassicEditor, InlineEditor, BalloonEditor, DecoupledEditor ] ) {
		// Plugins to include in the build.
		Editor.builtinPlugins = [
			AIAssistant, OpenAITextAdapter,
			Base64UploadAdapter,
			Alignment,
			Autoformat,
			Bold, Italic, Underline, Strikethrough, Superscript, Subscript, Code,
			BlockQuote,
			CKBox, CKBoxImageEdit,
			CKFinder, CKFinderUploadAdapter,
			CloudServices,
			CodeBlock,
			Comments,
			EasyImage,
			Essentials,
			ExportPdf,
			ExportWord,
			Heading,
			Image, ImageCaption, ImageStyle, ImageToolbar, AutoImage, ImageResize, ImageUpload, ImageInsert, PictureEditing,
			Indent, IndentBlock,
			TextPartLanguage,
			Link, AutoLink, LinkImage,
			List, ListProperties, TodoList,
			MultiLevelList,
			MediaEmbed,
			Paragraph,
			FindAndReplace,
			FontBackgroundColor, FontColor, FontFamily, FontSize,
			Highlight,
			HorizontalLine,
			HtmlEmbed,
			GeneralHtmlSupport, HtmlComment,
			Mention,
			PageBreak,
			PasteFromOffice,
			Pagination,
			RealTimeCollaborativeComments, RealTimeCollaborativeRevisionHistory, RealTimeCollaborativeTrackChanges, PresenceList,
			RemoveFormat,
			RevisionHistory,
			StandardEditingMode,
			ShowBlocks,
			Style,
			SpecialCharacters, SpecialCharactersEssentials,
			Table, TableToolbar, TableCellProperties, TableProperties, TableCaption, TableColumnResize,
			TrackChanges, TrackChangesData,
			TextTransformation,
			WordCount,
			DocumentOutline, TableOfContents, FormatPainter, Template, SlashCommand, PasteFromOfficeEnhanced, CaseChange
		];

		Editor.defaultConfig = {
			toolbar: [
				'aiCommands', 'aiAssistant',
				'|',
				// Productivity pack.
				'tableOfContents', 'formatPainter', 'insertTemplate', 'caseChange',
				'|',
				'pagination',
				'|',
				'trackChanges', 'revisionHistory', 'comment',
				'|',
				'heading', 'style',
				'|',
				'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
				'|',
				'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
				'|',
				'bulletedList', 'numberedList', 'multiLevelList', 'todoList',
				'|',
				'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
				'|',
				'htmlEmbed',
				'|',
				'alignment', 'outdent', 'indent',
				'|',
				'pageBreak', 'horizontalLine', 'specialCharacters',
				'|',
				'textPartLanguage',
				'|',
				'showBlocks',
				'|',
				'undo', 'redo', 'findAndReplace'
			],
			table: {
				contentToolbar: [
					'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
				]
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
						label: 'Original size',
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
					'resizeImage', '|',
					'ckboxImageEdit'
				],
				insert: {
					integrations: [
						'insertImageViaUrl'
					]
				}
			},
			comments: {
				editorConfig: {
					extraPlugins: [ Bold, Italic, Underline, List ]
				}
			},
			placeholder: 'Type the content here!',
			language: 'en'
		};

		// Enable the `SourceEditing` plugin for ClassicEditor only.
		if ( Editor === ClassicEditor ) {
			Editor.builtinPlugins.push( SourceEditing );

			Editor.defaultConfig.toolbar.push( '|', 'sourceEditing' );
		}

		// Enable the `Pagination` plugin for DecoupledEditor only.
		if ( Editor === DecoupledEditor ) {
			Editor.builtinPlugins.push( Pagination );

			Editor.defaultConfig.toolbar.unshift( 'sourceEditing', '|' );

			Editor.defaultConfig.pagination = {
				// A4
				pageWidth: '21cm',
				pageHeight: '29.7cm',

				pageMargins: {
					top: '20mm',
					bottom: '20mm',
					right: '12mm',
					left: '12mm'
				}
			};
		}
	}

	ClassicEditor
		.create( /* Configuration */ )
		.catch( error => console.error( error ) );
	</script>
	```
	</details>

4. Unlike when using predefined builds, you are now free to customize the editor by adding or removing plugins. However, before you do this, you should test the editor to make sure it works as expected.
