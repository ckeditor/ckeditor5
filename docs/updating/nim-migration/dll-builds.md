---
category: nim-migration
order: 50
menu-title: Migrating from DLL builds
meta-title: Migrating from DLL builds to new installation methods | CKEditor5 documentation
meta-description: Learn how to upgrade from DLL builds to the new installation methods.
modified_at: 2024-06-25
---

# Migrating from DLL builds

DLLs are webpack-specific builds that register CKEditor&nbsp;5 and its plugins in a globally scoped variable `CKEditor5`. This variable could then be used to create the editor instance.

Since the new installation methods do not rely on global variables, migrating from the DLL builds to the new installation methods should mostly be a matter of changing the way you import CKEditor&nbsp;5 and its plugins.

Other notable difference is that DLLs use the `<script>` tags while the new CDN build uses the `<script type="module">` tag, which behave differently in some cases. For more information, see this [MDN page explaining the differences between modules and standard scripts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#other_differences_between_modules_and_standard_scripts).

## Prerequisites

Before you start, follow the usual upgrade path to update your project to use the latest version of CKEditor&nbsp;5. This will rule out any problems that may be caused by upgrading from an outdated version of the editor.

## Migration steps

If you are using the DLL build, follow the steps below:

1. Remove the `<script>` tags that load the CKEditor&nbsp;5 DLL builds from your project.

2. Add the `<link>` tags to include the editor's CSS files and the `<script type="importmap">` tag to map the package names to the build URLs.

	2.1 If you only use the open-source editor:

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

3. Replace the old `<script>` tag that contains the initialization code with the `<script type="module">` tag. In it, you can import the editor and plugins from the `ckeditor5` and `ckeditor5-premium-features` packages instead of relying on the global `CKEditor5` variable.

	3.1 If you only use the open-source editor:

	```html
	<script type="module">
	import { ClassicEditor, Essentials, Bold, Italic, Paragraph } from 'ckeditor5';

	ClassicEditor.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Paragraph ],
		toolbar: [ /* ... */ ]
	} );
	</script>
	```

	3.2 If you also use premium features from our commercial offer:

	```html
	<script type="module">
	import { ClassicEditor, Essentials, Bold, Italic, Paragraph, Mention } from 'ckeditor5';
	import { SlashCommand } from 'ckeditor5-premium-features';

	ClassicEditor.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Bold, Italic, Paragraph, Mention, SlashCommand ],
		toolbar: [ /* ... */ ],
		licenseKey: '<YOUR_LICENSE_KEY>',
	} );
	</script>
	```

## Example

Below is the comparison of the editor configuration before and after the migration.

<details>
<summary>Before</summary>

```html
<script src="path/to/node_modules/ckeditor5/build/ckeditor5-dll.js"></script>
<script src="path/to/node_modules/@ckeditor/ckeditor5-editor-classic/build/editor-classic.js"></script>
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

</details>

<details>
<summary>After</summary>

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
<script type="module">
import {
	ClassicEditor,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	Essentials,
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
	Table,
	TableToolbar
} from 'ckeditor5';

const config = {
	plugins: [
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		Essentials,
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
		Table,
		TableToolbar
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

ClassicEditor
	.create( document.querySelector( '#editor' ), config )
	.then( editor => {
			window.editor = editor;
	} );
</script>
```

</details>
