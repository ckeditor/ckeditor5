---
category: nim-migration
order: 40
menu-title: Migrating from customized builds
meta-title: Migrating from customized builds to new installation methods | CKEditor 5 Documentation
meta-description: Learn how to upgrade from customized builds to the new installation methods.
modified_at: 2024-06-25
---

# Migrating from customized builds

Migrating from a customized build to the new installation methods should mostly be a matter of changing the way you import CKEditor&nbsp;5 and its plugins.

Regardless of whether you used our old Online Builder or created a custom build from source using webpack or Vite, the new installation methods allow you to build and run the editor with any bundler or JavaScript meta-framework you like. This means that by the end of the migration, you can remove the CKEditor-specific webpack or Vite setup from your project if you already use another bundler to build your project.

<info-box warning>
	Currently, the new installation methods do not support {@link framework/how-tos#how-to-customize-the-ckeditor-5-icons the customization of the CKEditor&nbsp;5 icons}. This feature will be added in a future release.
</info-box>

## Prerequisites

Before you start, follow the usual upgrade path to update your project to use the latest version of CKEditor&nbsp;5. This will rule out any problems that may be caused by upgrading from an outdated version of the editor.

## Migration steps

If you are using the customized build, follow the steps below:

1. Start by uninstalling all CKEditor&nbsp;5 packages that you have installed in your project. This includes the main `ckeditor5` package and any additional plugins that you have installed separately.

	```bash
	npm uninstall \
		@ckeditor/ckeditor5-adapter-ckfinder \
		@ckeditor/ckeditor5-alignment \
		@ckeditor/ckeditor5-autoformat \
		@ckeditor/ckeditor5-autosave \
		@ckeditor/ckeditor5-basic-styles \
		@ckeditor/ckeditor5-block-quote \
		@ckeditor/ckeditor5-ckbox \
		@ckeditor/ckeditor5-ckfinder \
		@ckeditor/ckeditor5-clipboard \
		@ckeditor/ckeditor5-cloud-services \
		@ckeditor/ckeditor5-code-block \
		@ckeditor/ckeditor5-core \
		@ckeditor/ckeditor5-easy-image \
		@ckeditor/ckeditor5-editor-balloon \
		@ckeditor/ckeditor5-editor-classic \
		@ckeditor/ckeditor5-editor-decoupled \
		@ckeditor/ckeditor5-editor-inline \
		@ckeditor/ckeditor5-editor-multi-root \
		@ckeditor/ckeditor5-engine \
		@ckeditor/ckeditor5-enter \
		@ckeditor/ckeditor5-essentials \
		@ckeditor/ckeditor5-find-and-replace \
		@ckeditor/ckeditor5-font \
		@ckeditor/ckeditor5-heading \
		@ckeditor/ckeditor5-highlight \
		@ckeditor/ckeditor5-horizontal-line \
		@ckeditor/ckeditor5-html-embed \
		@ckeditor/ckeditor5-html-support \
		@ckeditor/ckeditor5-image \
		@ckeditor/ckeditor5-indent \
		@ckeditor/ckeditor5-language \
		@ckeditor/ckeditor5-link \
		@ckeditor/ckeditor5-list \
		@ckeditor/ckeditor5-markdown-gfm \
		@ckeditor/ckeditor5-media-embed \
		@ckeditor/ckeditor5-mention \
		@ckeditor/ckeditor5-minimap \
		@ckeditor/ckeditor5-page-break \
		@ckeditor/ckeditor5-paragraph \
		@ckeditor/ckeditor5-paste-from-office \
		@ckeditor/ckeditor5-remove-format \
		@ckeditor/ckeditor5-restricted-editing \
		@ckeditor/ckeditor5-select-all \
		@ckeditor/ckeditor5-show-blocks \
		@ckeditor/ckeditor5-source-editing \
		@ckeditor/ckeditor5-special-characters \
		@ckeditor/ckeditor5-style \
		@ckeditor/ckeditor5-table \
		@ckeditor/ckeditor5-theme-lark \
		@ckeditor/ckeditor5-typing \
		@ckeditor/ckeditor5-ui \
		@ckeditor/ckeditor5-undo \
		@ckeditor/ckeditor5-upload \
		@ckeditor/ckeditor5-utils \
		@ckeditor/ckeditor5-watchdog \
		@ckeditor/ckeditor5-widget \
		@ckeditor/ckeditor5-word-count \
		@ckeditor/ckeditor5-ai \
		@ckeditor/ckeditor5-case-change \
		@ckeditor/ckeditor5-collaboration-core \
		@ckeditor/ckeditor5-comments \
		@ckeditor/ckeditor5-document-outline \
		@ckeditor/ckeditor5-export-pdf \
		@ckeditor/ckeditor5-export-word \
		@ckeditor/ckeditor5-format-painter \
		@ckeditor/ckeditor5-import-word \
		@ckeditor/ckeditor5-list-multi-level \
		@ckeditor/ckeditor5-pagination \
		@ckeditor/ckeditor5-paste-from-office-enhanced \
		@ckeditor/ckeditor5-real-time-collaboration \
		@ckeditor/ckeditor5-revision-history \
		@ckeditor/ckeditor5-slash-command \
		@ckeditor/ckeditor5-template \
		@ckeditor/ckeditor5-track-changes \
		ckeditor5 \
		ckeditor5-collaboration
	```

2. Next, install the `ckeditor5` package. This package contains the editor and all of our open-source plugins.

	```bash
	npm install ckeditor5
	```

3. (Optional) If you are using premium features from our commercial offer, you should also install the `ckeditor5-premium-features` package.

	```bash
	npm install ckeditor5-premium-features
	```

4. Open the file where you initialized the editor. Then, replace the import statements to import the editor and all the open-source plugins from the `ckeditor5` package and the commercial plugins from the `ckeditor5-premium-features` package only.

	```js
	import { ClassicEditor, Essentials, Bold, Italic, Paragrap, Mention } from 'ckeditor5';
	import { FormatPainter, SlashCommand } from 'ckeditor5-premium-features';
	```

5. Below these imports, add imports of the CSS styles for the editor and the commercial plugins.

	```js
	import 'ckeditor5/ckeditor5.css';
	import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
	```

## Example

Below is a comparison of the editor configuration before and after the migration.

<details>
<summary>Before</summary>

```js
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { CKFinderUploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

export default class ClassicEditor extends ClassicEditorBase {
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
```
</details>

<details>
<summary>After</summary>

```js
import {
	ClassicEditor as ClassicEditorBase,
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

export default class ClassicEditor extends ClassicEditorBase {
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
```
</details>
