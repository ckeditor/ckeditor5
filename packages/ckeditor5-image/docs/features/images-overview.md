---
category: features-images
menu-title: Basics
meta-title: Image features overview | CKEditor 5 Documentation
meta-description: Find out all about images in CKEditor 5 - available image features, attributes, or the image toolbar.
order: 10
modified_at: 2021-06-17
---

# Images in CKEditor&nbsp;5 (overview)

CKEditor&nbsp;5 comes with various tools to insert, upload, resize, style, caption, and link images. All these features work out of the box with block, inline, and responsive images alike.

## Demo

To see all the image features in action, check out the demo below. To learn more about individual plugins (sub-features) of the image ecosystem, see the [**Image features**](#image-features) section.

{@snippet features/image-full}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Base image feature

The base image feature does not support any user interface for inserting or managing images. Its sole purpose is to lay ground for other plugins (listed below) to build the target user experience. This pattern (composition of atomic features) is common for CKEditor&nbsp;5 and allows the developers to build their own customized experience by implementing specific subfeatures differently.

## Image features

The [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains multiple plugins that implement various image-related features. The {@link module:image/image~Image `Image`} plugin is at the core of the ecosystem. It provides the basic support for block and inline images. There are many other features that extend the editor's capabilities:

* The [contextual toolbar](#image-contextual-toolbar) available on mouse click gives access to image features.
* {@link features/images-captions Image captions} allow adding descriptive text under the image.
* The {@link features/images-styles image styles} help control the placement, size, and other characteristics with predefined styles.
* The {@link features/images-text-alternative text alternative} tag aids accessibility and SEO, provides additional image description, and supports better navigation.
* {@link features/images-resizing Image resizing} lets the user control the dimensions of images in the content.
* {@link features/images-linking Linking images} makes it possible to use them as URL anchors.
* A selection of {@link features/image-upload image upload methods} allows for the most convenient way of adding images. These include support for {@link features/images-inserting#inserting-images-via-pasting-a-url-into-the-editor inserting an image via a URL} and even {@link features/images-inserting#inserting-images-via-a-source-url via pasting a URL into the editor} along with custom integrations.
* The {@link features/ckbox CKBox} and Uploadcare {@link features/uploadcare} management platforms provide support for {@link features/images-responsive responsive images} in CKEditor&nbsp;5. Responsive images will display correctly on any viewport, enhancing the accessibility, reach, and user experience.
* Both Uploadcare and CKBox provide {@link features/images-image-optimizer editing and optimization capabilities}, like cropping, resizing, rotating, and flipping right from the image contextual toolbar.

## Image contextual toolbar

The {@link module:image/imagetoolbar~ImageToolbar} plugin introduces a contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options such as the {@link features/images-text-alternative text alternative} button, the {@link features/images-captions image caption} button, and {@link features/images-styles image styles} buttons. The toolbar can also host the image editing button introduced by the {@link features/ckbox CKBox asset manager}. Shown below is an example contextual toolbar with an extended set of buttons.

{@img assets/img/toolbar-items.png 402 An extended contextual toolbar.}

The image toolbar is configurable using the {@link module:image/imageconfig~ImageConfig#styles `config.image.toolbar`} property. For instance, to display the caption toggle, text alternative and editing buttons, use the following configuration:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: {
			toolbar: [ 'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Refer to the {@link features/images-installation image installation} guide for more details on configuring the features available in the toolbar and to the {@link updating/update-to-29#image-toolbar toolbar section} of the Migration to v29.x guide, as important changes were introduced in that version. You can also check the {@link getting-started/setup/toolbar editor toolbar} guide.

See the common API of image-related features such as {@link module:image/imagestyle~ImageStyle}, {@link module:image/imageresize~ImageResize}, and {@link module:link/linkimage~LinkImage} to learn more about available image toolbar buttons.

## Image `width` and `height` attributes

Starting with v40.0.0, the image's `width` and `height` attributes are retained by the editor when it is loaded. Adding them is done to ensure that the image dimensions ratio is properly kept when an image is styled or aligned and that it always looks like it should, rather than forcing the image size within the content. This ensures high-quality output.

The attributes are now handled as follows:

* Upon {@link features/image-upload uploading an image file} or {@link features/images-inserting inserting it} into the editor content, the CKEditor 5 image feature fetches these dimensions from the file. The editor then adds these properties to the markup, just like the {@link features/images-text-alternative text alternative tag}.
* If the user uses an upload adapter and the server sends back the uploaded image with the `width` or `height` parameters already set, these existing values are not overwritten.
* The editor will not change already existing content. It means, loading HTML (that is `setData`) with images does not set up these attributes.
* Changes to an image (such as resize, etc.) will trigger the creation of those attributes. These attributes are crucial to proper content handling, and actions on a current image that does not have these improve this image's markup.
* The `aspect-ratio` attribute has been added to the image's properties to handle situations when the file is resized or scaled with a tweaked aspect ratio.

These image properties can be further controlled via CSS styles. If you need to crop, resize, rotate, or mirror flip your images, you can use the {@link features/ckbox CKBox asset manager} to achieve that.

<info-box>
	Due to the introduction of this new behavior in CKEditor&nbsp;5 v40.0.0, the `width` and `height` attributes are now used to preserve the image’s natural width and height. The information about a resized image is stored in the `resizedWidth` and `resizeHeight` attributes.
</info-box>

## Typing around images

To type before or after an image easily, select the image, then press the Arrow key (<kbd>←</kbd> or <kbd>→</kbd>) once, depending on where you want to add content &ndash; before or after respectively. The image becomes no longer selected and whatever text you type will appear in the desired position.

You can also use the **Insert paragraph** handles on the bottom or top edge of the selected image to add a paragraph below or above the image, respectively.

{@img assets/img/image-insert-paragraph.png 640 Paragraph insertion handles.}

## Image editing

While the image feature does not provide native image editing support, the {@link features/ckbox CKBox} and Uploadcare {@link features/uploadcare} premium features provide {@link features/images-image-optimizer editing capabilities} such as cropping to presets, flipping, or rotating.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
