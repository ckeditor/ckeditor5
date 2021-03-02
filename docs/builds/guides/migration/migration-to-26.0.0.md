---
category: builds-migration
order: 20
---

# Migration to 26.0.0

For the entire list of changes introduced in version 26.0.0 see the [changelog for CKEditor 5 v26.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#2600-2021-03-01).

Listed below are the most important changes that require your attention when upgrading to 26.0.0.

## Soft requirements

While [allowing to extend builds](https://github.com/ckeditor/ckeditor5/issues/8395) with additional plugins without rebuilding the bundle (concept also called "DLLs"), certain sets of plugins had to be decoupled. This has lead to the introduction of the "soft requirements".

Normally, each plugin had its direct requirements that would be automatically loaded by the editor before that plugin is loaded. Those plugins were specified in `static get() {}` callback of a plugin class in the form of plugin constructors (dependencies).

Starting from 26.0.0 not all plugins can be directly imported by other plugins. However, a plugin can define that it requires another plugin (called for example `'Foo'`) by returning a string from `static get() {}`. This tells the editor that such a plugin must be provided by the integrator (you) either prior to building (via {@link module:core/editor/editor~Editor.builtinPlugins `Editor.builtinPlugins`}) or when creating a new instance of the editor (e.g. via {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`}).

Therefore, when upgrading to version 26.0.0 you may stumble upon `plugincollection-soft-required` error. This tells you that some dependencies are now missing and you need to provide them.

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
