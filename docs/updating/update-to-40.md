---
category: update-guides
meta-title: Update to version 40.x | CKEditor 5 Documentation
menu-title: Update to v40.x
order: 84
modified_at: 2023-09-26
---

# Update to CKEditor&nbsp;5 v40.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v40.0.0

For the entire list of changes introduced in version 40.0.0, see the [release notes for CKEditor&nbsp;5 v40.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v40.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v40.0.0.

### Changes to the image feature

#### Width and height attributes

This release introduces changes to the {@link features/images-overview image feature} connected with the image `width` and `height` attributes. The changes include:

* Upon {@link features/image-upload uploading an image file} or {@link features/images-inserting inserting it} into the editor content, the CKEditor 5 image feature fetches these dimensions from the file. The editor then adds these properties to the markup, just like the {@link features/images-text-alternative text alternative tag}.
	* The editor **will not change already existing content**. It means, loading HTML (i.e., `setData`) with images does not set up these attributes.
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

Your custom code may need to be updated accordingly (e.g. if your application uses the comments outside the editor feature). Examples:

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
