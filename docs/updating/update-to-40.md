---
category: update-guides
meta-title: Update to version 40.x | CKEditor 5 Documentation
menu-title: Update to v40.x
order: 84
modified_at: 2023-12-06
---

# Update to CKEditor&nbsp;5 v40.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v40.2.0

For the entire list of changes introduced in version 40.2.0, see the [release notes for CKEditor&nbsp;5 v40.2.0](https://github.com/ckeditor/ckeditor5/releases/tag/v40.2.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v40.2.0.

### AI Assistant integration

The below information affects all editor integrations that use the AI Assistant feature.

We added support for the AWS Bedrock service and for providing custom adapters that may extend our solutions or allow to connect to a custom model. To enable this, it was necessary to perform refactoring in the feature's plugins architecture and configuration structure. However, we hope it makes us ready for providing new AI-related features in the future without introducing more breaking changes.

Before, the OpenAI adapter was automatically required by the `AIAssistant` plugin. Now, the integrator must explicitly add the chosen adapter to the list of plugins:

```js
// Before:
import { AIAssistant } from '@ckeditor/ckeditor5-ai';

ClassicEditor.create( element, {
	plugins: [ AIAssistant, /* ... */ ]
} );

// After:
import { AIAssistant, OpenAITextAdapter } from '@ckeditor/ckeditor5-ai';

ClassicEditor.create( element, {
	plugins: [ AIAssistant, OpenAITextAdapter, /* ... */ ]
} );
```

Another change is connected to {@link module:ai/aiassistant~AIAssistantConfig configuration structure}. The new `config.ai` namespace was introduced. The `config.aiAssistant` option was moved into `config.ai.aiAssistant`. Adapter-related properties were extracted to `config.ai.openAI`. Also, some of the properties were renamed.

```js
// Before:
ClassicEditor.create( element, {
	aiAssitant: {
		authKey: 'OPENAI_API_KEY',
		removeCommands: [ 'improveWriting', 'casual' ],
		useTheme: false
	}
} );

// After:
ClassicEditor.create( element, {
	ai: {
		openAI: {
			requestHeaders: {
				Authorization: 'Bearer OPENAI_API_KEY'
			}
		},
		aiAssistant: {
			removeCommands: [ 'improveWriting', 'casual' ]
		},
		useTheme: false
	}
} );
```

### CKBox image editing

The new release includes the {@link features/ckbox CKBox} image editing feature, now quickly accessible either through a main toolbar button or the image contextual toolbar button {@icon @ckeditor/ckeditor5-ckbox/theme/icons/ckbox-image-edit.svg Image upload}. It lets users perform image quick image edits such as cropping, resizing, flipping and rotating the image. As it is called from withing the editor and the process takes place right in the asset manager, it greatly speeds up and simplifies the content editing process.

{@img assets/img/ckbox-editing-area.png 1062 CKBox image editing panel.}

#### Adding CKBox image editing to CKEditor 5

To use the CKBox image editing feature, you need to import it first into you editor. Please note, that it requires the `PictureEditing` plugin to work correctly.

Then, add it to the plugin list and the toolbar as shown below.

```js
import { ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CKBox, CKBoxImageEdit } from "@ckeditor/ckeditor5-ckbox";

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [  PictureEditing, ImageUpload, CloudServices, CKBox, CKBoxImageEdit, /* ... */ ],
		toolbar: [ 'ckbox', 'ckboxImageEdit', /* ... */ ], // Depending on your preference.
		ckbox: {
			// Feature configuration.
			// ...
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

You can add the image editing button both to the main editor toolbar (as shown in the snippet above) and the image contextual toolbar for convenience.

```js
image: {
	toolbar: [
		'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
		'toggleImageCaption', 'imageTextAlternative', '|', 'ckboxImageEdit'
	]
},
```

You can read more about image editing in {@link @ckbox features/images/editing CKBox documentation}.

### Expanded image insert dropdown

We have updated the toolbar `insertImage` component. By default, the image toolbar dropdown {@icon @ckeditor/ckeditor5-core/theme/icons/image.svg Image} provides access to all installed methods of inserting images into content, such as {@link features/image-upload uploading images from your computer}, adding images from {@link features/using-file-managers file managers} or {@link features/images-inserting inserting images via URL}.

{@img assets/img/image_insert_dropdown.png 772 Image insert dropdown in the main editor toolbar.}

You may want to update your toolbar configuration to make use of the updated feature if you did not use it before.

```js
import { Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, LinkImage ],
		// the insert image dropdown toolbar item
		toolbar: [ 'insertImage', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

By default, the function automatically detects all available upload methods. For example, it will detect and add the `ImageInsertViaUrl` if it is enabled. While no configuration is required for this feature, you may limit the methods included in the dropdown (apart from not installing a specific feature) or change their order. For this, you can use the `image.insert.integration` configuration option:

```js
import { Image } from '@ckeditor/ckeditor5-image';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Image, /* ... */ ],
		toolbar: [ 'insertImage', /* ... */ ],
		image: {
			insert: {
				// You do not need to provide this configuration key
				// if the default list content and order reflects your needs.
				integrations: [ 'assetManager', 'upload', 'url' ]
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Learn more about the toolbar dropdown configuration in the {@link features/images-installation#configuring-the-toolbar-dropdown image installation guide}.

#### Image upload plugins

These are all available plugins that provide integrations to the insert image dropdown:

* `ImageUpload` &ndash; provides the default upload from computer toolbar button
* `ImageInsertViaUrl` &ndash; provides the insert image via URL integration and toolbar item
* `ImageInsert` &ndash; delivers both of the integrations mentioned above:
	* `ImageUpload`
	* `ImageInsertViaUrl`

Additional image inserting plugins:
* `CKBox` &ndash; asset manager that provides image upload and editing capabilities
* `CKFinder` &ndash; image manager

#### New image upload icons

Due to the changes to the image insert mechanisms, new toolbar icons have been introduced and replaced the old {@icon @ckeditor/ckeditor5-core/theme/icons/image.svg Image} image icon.

Now there are:
* {@icon @ckeditor/ckeditor5-core/theme/icons/image-upload.svg Image upload} image upload icon that is the default for the dropdown or for the upload from computer command
* {@icon @ckeditor/ckeditor5-core/theme/icons/image-asset-manager.svg Image manager} image manager icon
* {@icon @ckeditor/ckeditor5-core/theme/icons/image-url.svg Insert via URL} insert via URL icon.

The toolbar dropdown will use the {@icon @ckeditor/ckeditor5-core/theme/icons/image-upload.svg Image upload} image upload icon bu default. If no upload adapter is present, the toolbar will use the next available icon instead.

### Removal of the `insertImageViaUrl` option

The `insertImageViaUrl` configuration option was not used and has been removed. If you have it somewhere in your editor configuration, please remove it to avoid getting an error. 

## Update to CKEditor&nbsp;5 v40.1.0

For the entire list of changes introduced in version 40.1.0, see the [release notes for CKEditor&nbsp;5 v40.1.0](https://github.com/ckeditor/ckeditor5/releases/tag/v40.1.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v40.1.0.

### Changes to the default insert image action

We changed how the images are inserted by default. For long time, the image insert action detected where the selection is placed, and depending on that inserted an inline image or a block one. This caused confusion in some cases, and led to suboptimal experience. From now on, the images will be inserted as block ones by default.

Changes introduced in the latest version affect the `image.insert.type` configuration setting that lets the integrators set up the way newly uploaded ar pasted images are handled in the editor content. We renamed the `undefined` option to `auto` (see further details below). Now, if the `image.insert.type` configuration is not specified, all images inserted into the content will be treated as block images. This means that inserting an image inside a paragraph (or other content blocks) will create a new block for the image immediately below or above the current paragraph or block. After insertion, you can transform the block image into an inline image using the {@link features/images-overview#image-contextual-toolbar contextual toolbar}.

If you wish to modify this behavior, the `type` setting in the editor configuration can be easily adjusted to meet your needs:

```js
ClassicEditor.create( element, {
	image: {
		insert: {
			type: 'auto'
		}
	}
} );
```

The `type` setting accepts the following values:

* `'auto'`: The editor determines the image type based on the cursor's position, just as it was before. For example, if you insert an image in the middle of a paragraph, it will be inserted as inline. If you insert it at the end or beginning of a paragraph, it will become a block image.
* `'block'`: Always inserts images as block elements, placing them below or above the current paragraph or block.
* `'inline'`: Always inserts images as inline elements within the current paragraph or block.

If the `type` setting is omitted from the configuration, the behavior defaults to inserting images as a block.

**Important**: If only one type of {@link features/images-installation#inline-and-block-images image plugin} is enabled (for example, `ImageInline` is enabled but `ImageBlock` is not), the `image.insert.type` configuration will be effectively ignored and the only supported image type will be used.

### Updated image text alternative icon

The {@link features/images-text-alternative image text alternative} (the alt attribute) helps screen reader users navigate and understand the document. We have updated the toolbar icon {@icon @ckeditor/ckeditor5-core/theme/icons/text-alternative.svg Alternative text} to be more intuitive and easier to recognize, following global standards.

## Update to CKEditor&nbsp;5 v40.0.0

For the entire list of changes introduced in version 40.0.0, see the [release notes for CKEditor&nbsp;5 v40.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v40.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v40.0.0.

### Changes to the image feature

#### Width and height attributes

This release introduces changes to the {@link features/images-overview image feature} connected with the image `width` and `height` attributes. The changes include:

* Upon {@link features/image-upload uploading an image file} or {@link features/images-inserting inserting it} into the editor content, the CKEditor 5 image feature fetches these dimensions from the file. The editor then adds these properties to the markup, just like the {@link features/images-text-alternative text alternative tag}.
	* The editor **will not change already existing content**. It means, loading HTML (that is, `setData`) with images does not set up these attributes.
	* If the user uses an upload adapter and the server sends back the uploaded image with the `width` or `height` parameters already set, these existing values are not overwritten.
* Changes to an image (such as resize, etc.) will trigger the creation of those attributes. These attributes are crucial to proper content handling, and actions on a current image that does not have these improve this image's markup.
* The `aspect-ratio` attribute has been added to the image's properties to handle situations when the file is resized or scaled with a tweaked aspect ratio.

Image output HTML before:

```html
<p>
	<img src="image.jpg" alt="">
</p>
```

Image output HTML after (added the `width` and `height` attributes):

```html
<p>
	<img src="image.jpg" alt="" width="400" height="300">
</p>
```

Resized image output HTML before:

```html
<p>
	<img class="image_resized" style="width:50%;" src="image.jpg" alt="">
</p>
```

Resized image output HTML after (added the `aspect-ratio` style and the `width` and `height` attributes):

```html
<p>
	<img class="image_resized" style="aspect-ratio:400/300;width:50%;" src="image.jpg" alt="" width="400" height="300">
</p>
```

#### Changes to the model

Due to the introduction of this new behavior, the following changes to model attributes have been introduced:

* The `width` and `height` attributes are now used to preserve the **image’s natural width and height**.
* The information about a **resized image** is stored in the `resizedWidth` attribute (renamed from `width`) and a newly added `resizeHeight` attribute.

Therefore, the relation between styles and attributes toward model attributes looks as follows:

* Style `width` → model `resizedWidth` (changed from `width`).
* Style `height` → model `resizedHeight` (new).
* Attribute `width` → model `width` (new).
* Attribute `height` → model `height` (new).

Given the following input HTML:

```html
<p>
	<img src="image.jpg" style="width:50%;" width="400" height="300" alt="">
</p>
```

Previously, the model would set the resized value in the `width` model attribute and ignore the input `width` and `height` attributes:

```html
<paragraph>
	<imageInline src="image.jpg" width="50%"></imageInline>
</paragraph>
```

And now the resized value is stored in the `resizedWidth` attribute (the `width` attribute is now reserved for the natural width value):

```html
<paragraph>
	<imageInline src="image.jpg" resizedWidth="50%" width="400" height="300"></imageInline>
</paragraph>
```

#### Changes to the `srcset` attribute

The `srcset` model attribute which provides parameters for responsive images, has been simplified. It is no longer an object `{ data: "...", width: "..." }`, but the value that was previously stored in the `data` part.

#### Changes to content styles

Last but not least, content styles have been updated with this release, which means you need to update them in your editor implementation to avoid any discrepancies. Please refer to the {@link installation/advanced/content-styles Content styles} guide to learn how to generate the style sheet.

### Changes to the comments feature

#### Unlinked comment threads and UX/UI changes

The comment thread's **resolved** state has been separated from the **unlinked** state. Thread is **resolved** when manually resolved by the user. A thread is **unlinked** when the related content in the editor has been removed. Earlier, these actions were treated as the same. Both actions still put the comment thread inside the comments archive. This new approach is reflected in the comments archive UI and UX. Notably, an unlinked comment thread can be further resolved and reopened, while inside the comments archive. Additionally, an unlinked comment thread has a gray header color to differentiate it from a resolved comment thread.

The new approach has an impact on how revision history (or loading legacy document data) works. Now, **resolved** comment threads will stay in the comments archive after restoring a revision. However, **unlinked** comment threads will be restored together with the document data.

#### New `CommentThread#unlinkedAt` property

A new property -- {@link module:comments/comments/commentsrepository~CommentThread#unlinkedAt `CommentThread#unlinkedAt`} -- has been introduced. If your integration saves comment threads data in your system, make sure to update your code, so it saves the new property and returns it together with other `CommentThread` data.

#### Changes impacting custom features

The `Comment#archivedAt` property is now the property to check when deciding whether the comment thread is inside the comments archive or not. Earlier, it was based on `#resolvedAt`. If you have custom code that uses `#resolvedAt` property to filter threads in the comments archive, change it to use `#archivedAt` instead.

The `CommentsArchive#resolvedThreads` property has been renamed to `#archivedThreads`. If your custom code uses that property, make sure to apply this change.

The `deletedAt` property is no longer passed in `AddCommentThreadEvent` as it is not needed anymore. Additionally, now, `CommentsRepository` should never store deleted comment threads.

Your custom code may need to be updated accordingly (for example if your application uses the comments outside the editor feature). Examples:

```js
// Before:
for ( const thread of commentsRepository.getCommentThreads( { channelId } ) ) {
	// Ignore threads that have been already resolved or removed.
	if ( !thread.isResolved && !thread.deletedAt ) {
        handleNewCommentThread( thread.id );
    }
}

// After:
for ( const thread of commentsRepository.getCommentThreads( { channelId } ) ) {
	// Ignore threads that have been already resolved.
	if ( !thread.isResolved ) {
		handleNewCommentThread( thread.id );
	}
}
```

```js
// Before:
commentsRepository.on( 'addCommentThread', ( evt, data ) => {
	if ( data.deletedAt ) {
		// Return to avoid processing deleted comment threads.
		return;
    }

    // ... Custom code processing the comment thread.
} );

// After:
commentsRepository.on( 'addCommentThread', ( evt, data ) => {
	// ... Custom code processing the comment thread.
} );
```

This change was reflected in the {@link features/comments-outside-editor comments outside the editor} guide. You might want to revise the new version of the guide.

Previously, in a real-time collaboration environment, deleted comment threads were fetched and added to `CommentsRepository` when the editor re-connected to Cloud Services. This was an incorrect behavior and was fixed.

If your custom integration manually adds deleted comment threads to `CommentsRepository`, it should not and should be fixed. If your custom integration somehow depends on this incorrect behavior, you may need to change it.

### New Balloon Block editor icon

We have changed the default {@link features/blocktoolbar Balloon Block editor toolbar} indicator icon from the pilcrow icon (`¶`) to the braille pattern dots icon (`⠿`). The new icon better corresponds to the dual function of the indicator, which may be used to both invoke the balloon toolbar and to drag to content block around.

While `⠿` is now a default, the icon can still be configured by the integrator, for example:

```js
	blockToolbar: {
		items: [
			'bold',
			'italic',
			'link'
		],
		icon: 'pilcrow' // or SVG.
	},
```

### A new default lists plugin coming

We currently maintain two list features: {@link features/lists List} and {@link features/document-lists DocumentList}. The list v1 feature was implemented in the early days of CKEditor 5. It supports “plain lists” &ndash; lists where `<li>` cannot contain block content (paragraphs, headings, tables, block images). It supports to-do lists, but it does not support extending list markup via the {@link features/general-html-support General HTML Support (GHS)} feature.

The list v2 (document list) feature was implemented in 2022 to add support for block content in list items. It supported extending list markup via GHS. It did not, however, support to-do lists. Since then we concentrated on bringing full list v1 functionality to this plugin. We are nearing the end of a long job of pairing these two plugins in their functions. The newest release brings in the to-do list functionality and the {@link features/document-lists#simple-lists simple list configuration setting}.

You can follow the current state of works in the [Document list feature parity](https://github.com/ckeditor/ckeditor5/issues/14632) issue. Considering this progress, the old lists feature will be replaced with the new document lists in one of the upcoming releases and it will be sunset at the beginning of 2024. The change will be seamless for the users, but there are significant changes between these plugins. We will update the information about this process as it unfolds.

See the [#14767](https://github.com/ckeditor/ckeditor5/issues/14767) issue for more details.
