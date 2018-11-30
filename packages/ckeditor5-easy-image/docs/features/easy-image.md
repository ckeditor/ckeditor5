---
category: features
menu-title: Easy Image
---

# Easy Image integration

{@link module:easy-image/easyimage~EasyImage Easy Image} is an editor feature that takes care of image uploads with virtually no server configuration required on your side.

<info-box>
	Check out the {@link features/image-upload general image upload guide} to learn about other ways to upload images into CKEditor 5.
</info-box>

### Demo

The demo below uses the {@link builds/guides/overview#classic-editor Classic editor} configured to use the Easy Image service provided by CKEditor Cloud Services:

{@snippet build-classic-source}

{@snippet features/easy-image}

## Configuration

To make enabling image upload in CKEditor 5 a breeze, by default all builds include the {@link module:easy-image/easyimage~EasyImage `EasyImage` plugin}, which integrates with the Easy Image service provided by [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/). Enabling it is straightforward and the results are immediate:

1. Follow {@link @cs guides/easy-image/quick-start Easy Image &mdash; Quick start} guide to setup an account.
2. Configure CKEditor (see {@link module:cloud-services/cloudservices~CloudServicesConfig `CloudServicesConfig`}):

	```js
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			cloudServices: {
				tokenUrl: 'https://example.com/cs-token-endpoint',
				uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
			}
		} )
		.then( ... )
		.catch( ... );
	```

This is all. At this point, image upload will be automatically enabled in your application.

If you are having troubles in setting up Easy Image, please [contact us](https://ckeditor.com/contact/).

## Responsive images

Another great feature introduced with CKEditor 5 is the ability to have responsive images in the content. With a single image upload, several optimized versions of that image are created, each for a different size of the display. All this is totally transparent to the end user who uploaded the image. Rescaled and optimized images are delivered through a blazing-fast CDN.

## What's next?

See the {@link features/image Image feature} guide to learn more about handling images in CKEditor 5.

