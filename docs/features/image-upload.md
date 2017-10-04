---
category: features
---

# Image upload

Inserting images in content created with CKEditor is a very common task. In CKEditor 5, a totally new way of handling images has been introduced, with strong focus on the end user experience. The goal is making this an effortless and intuitive task.

In a properly configured editor, there are several ways for the end user to insert images:

* Pasting it from the clipboard.
* Dragging a file from the file system.
* Selecting it through a file system dialog.
* Selecting it from a media management tool in your application.

Excluding the last option, all other ways require the image to be uploaded to a server, which will be the one responsible for giving the image URL used by CKEditor to display the image in the contents.

The image insertion, therefore, is made of a few steps, which are transparent to the end user:

1. User inserts an image.
2. Temporary image is inserted.
3. Image is being uploaded.
4. Server returns the image URL.
5. Temporary image is replaced with the definitive one.

<!-- TODO [ Drawing: workflow ( User Inserts Image ) -> ( Temporary Image Inserted ) -> ( Image Uploaded ) -> ( URL Returned ) -> ( Temporary Image Replaced with Definitive ) ] -->

The enable the above process, an image upload plugin must be available. Such plugin will handle both the upload and URL returning steps in the above workflow.

## Responsive images

Another great feature introduced with CKEditor 5 is the ability of having responsive images in the content. With a single image upload, several optimized versions of that image are created after upload, for different size of displays. All this is totally transparent to the end user who uploaded the image.

Be sure to use image upload plugins with support for responsive images to enjoin this important additional benefit. [Easy Image](#Easy-Image) has out of the box support for responsive images as well.

## Easy Image

To make enabling image upload in CKEditor 5 a breeze, all builds include by default the {@link module:easy-image/easyimage~EasyImage `EasyImage` plugin}, which integrates with the Easy Image service provided by the [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/). Enabling it is very easy and the results are immediate:

<info-box warning>
	The CKEditor Cloud Services is in private beta. [Contact us](https://ckeditor.com/contact/) to learn more.
</info-box>

1. Create an account in the CKEditor Cloud Services (CS).
2. Create an API key in your CS account.
3. Create a security token entry point in your application.
4. Configure CKEditor to use the above security token entry point:

	```js
	ClassicCreator
		.create( document.querySelector( '#editor' ), {
			cloudServices: {
				token: 'token-retrieved-from-the-cs-token-server'
			}
		} )
		.then( ... )
		.catch( ... );
	```

That is all. At this point, image upload will be automatically enabled in your application.

## What's next?

See the {@link features/image Image feature} guide to learn more about the image feature and its options.
