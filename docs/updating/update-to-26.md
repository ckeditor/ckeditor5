---
category: update-guides
menu-title: Update to v26.x
order: 98
---

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

# Update to CKEditor 5 v26.0.0

For the entire list of changes introduced in version 26.0.0, see the [release notes for CKEditor 5 v26.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v26.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v26.0.0.

## Soft requirements

While [allowing to extend builds](https://github.com/ckeditor/ckeditor5/issues/8395) with additional plugins without rebuilding the bundle (a concept also called {@link installation/advanced/dll-builds "DLLs"}), certain sets of plugins had to be decoupled. This has lead to the introduction of the "soft requirements".

Before, each plugin had its direct requirements that would be automatically loaded by the editor before the plugin is loaded. These plugins were specified in the `static get() {}` callback of a plugin class in the form of plugin constructors (dependencies).

Starting from v26.0.0 not all plugins can be directly imported by other plugins. However, a plugin can define that it requires another plugin (called for example `'Foo'`) by returning a string from `static get() {}`. This tells the editor that such a plugin must be provided by the integrator (you) either prior to building (via {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}) or when creating a new instance of the editor (e.g. via {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`}).

Therefore, when upgrading to version 26.0.0, you may stumble upon the {@link support/error-codes#error-plugincollection-soft-required `plugincollection-soft-required`} error. This tells you that some dependencies are now missing and you need to provide them.

### List of known soft requirements

* Make sure to add {@link module:cloud-services/cloudservices~CloudServices `CloudServices`} to the editor plugins when using the `CloudServicesUploadAdapter` or `EasyImage` features.
* Make sure to add {@link module:image/image~Image `Image`} and {@link module:image/imageupload~ImageUpload `ImageUpload`} to the editor plugins when using the `EasyImage` feature.
* Make sure to add {@link module:adapter-ckfinder/uploadadapter~UploadAdapter `CKFinderUploadAdapter`}, {@link module:image/image~Image `Image`}, and {@link module:link/link~Link `Link`} features to the editor plugins when using the `CKFinder` feature.
* Make sure to add {@link module:paragraph/paragraph~Paragraph `Paragraph`} to the editor plugins when using the `Title` feature.
* Make sure to add {@link module:paragraph/paragraph~Paragraph `Paragraph`} to the editor plugins when using the `List` feature.
* Make sure to add {@link module:image/image~Image `Image`} to the editor plugins when using the `LinkImage` feature.
* Make sure to add {@link module:cloud-services/cloudservices~CloudServices `CloudServices`} to the editor plugins when using the `ExportPdf` or `ExportWord` features.

### Upgrade method

Before, when you were passing plugins directly to `Editor.create()` via `config.plugins`, this would be your setup:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImageCaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

ClassicEditor
	.create( document.querySelector( '#editor'), {
		plugins: [
			EssentialsPlugin,
			AutoformatPlugin,
			BoldPlugin,
			ItalicPlugin,
			BlockQuotePlugin,
			HeadingPlugin,
			ImagePlugin,
			ImageCaptionPlugin,
			ImageStylePlugin,
			ImageToolbarPlugin,
			EasyImagePlugin,
			ImageUploadPlugin,
			LinkPlugin,
			ListPlugin,
			ParagraphPlugin
		],
		toolbar: [
			'heading',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'uploadImage',
			'blockQuote',
			'undo',
			'redo'
		],
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

Based on the list above (or the error being thrown when you upgraded your packages), you can check that you need to add:

* `ImageUpload` because you use `EasyImage`,
* `CloudServices` because you use `EasyImage`.

After the upgrade, the setup should therefore look like this:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImageCaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

// ADDED
import ImageUploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
import CloudServicesPlugin from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

ClassicEditor
	.create( document.querySelector( '#editor'), {
		plugins: [
			EssentialsPlugin,
			AutoformatPlugin,
			BoldPlugin,
			ItalicPlugin,
			BlockQuotePlugin,
			HeadingPlugin,
			ImagePlugin,
			ImageCaptionPlugin,
			ImageStylePlugin,
			ImageToolbarPlugin,
			EasyImagePlugin,
			ImageUploadPlugin,
			LinkPlugin,
			ListPlugin,
			ParagraphPlugin,

			// ADDED
			ImageUploadPlugin,
			CloudServicesPlugin
		],
		toolbar: [
			'heading',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'uploadImage',
			'blockQuote',
			'undo',
			'redo'
		],
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

## Keystrokes for macOS

Starting from v26.0.0, the {@link module:utils/keystrokehandler~KeystrokeHandler `KeystrokeHandler`} is not automatically binding to both <kbd>Ctrl</kbd> and <kbd>Cmd</kbd> keys on macOS as before. Instead, it is translating the <kbd>Ctrl</kbd> key to the <kbd>Cmd</kbd> key and handling this keystroke only.

For example, a registered keystroke `Ctrl+A` will now be translated to `Cmd+A` on macOS. To disable the translation of some keystroke, use the forced modifier: `Ctrl!+A` (note the exclamation mark).

## Unified button and command naming convention

The naming conventions for both buttons and commands have been reviewed and unified to maintain maximum consistency and provide sane rules that match real-life cases.

All buttons follow the **verb + noun** (i.e. `insertTable`, `selectAll`) or the **noun** (i.e. `bold`, `mediaEmbed`) convention.

It was trickier for commands, because there are more possible name combinations than there are for buttons. For commands, the proper name should in most cases start with the **action** followed by the **feature** name (i.e. `checkTodoList`, `insertTable`).

Toolbar button name changes (before → after):

* `imageUpload` → `uploadImage`
* `imageResize` → `resizeImage`
* `imageInsert` → `insertImage`
* `imageResize:*` → `resizeImage:*`

Command name changes (before → after):

* `imageInsert` → `insertImage`
* `imageUpload` → `uploadImage`
* `imageResize` → `resizeImage`
* `forwardDelete` → `deleteForward`
* `todoListCheck` → `checkTodoList`

The `TodoListCheckCommand` module was moved to {@link module:list/todolist/checktodolistcommand~CheckTodoListCommand `CheckTodoListCommand`}.

The `ImageInsertCommand` module was moved to {@link module:image/image/insertimagecommand~InsertImageCommand `InsertImageCommand`}.

The `ImageResizeCommand` module was moved to {@link module:image/imageresize/resizeimagecommand~ResizeImageCommand `ResizeImageCommand`}.

The `ImageUploadCommand` module was moved to {@link module:image/imageupload/uploadimagecommand~UploadImageCommand `UploadImageCommand`}.

The old names are still available as aliases.
