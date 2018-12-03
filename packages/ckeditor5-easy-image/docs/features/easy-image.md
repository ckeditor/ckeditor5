---
category: features
menu-title: Easy Image
---

# Easy Image integration

CKEditor 5 introduces a totally new way of handling images, with strong focus on the end–user experience. It is called {@link features/easy-image Easy Image} and its goal is to make the image upload as effortless and intuitive as possible.

Easy Image is part of the [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/) offer. It is a <abbr title="Software as a service">SaaS</abbr> product which:

* securely uploads images,
* takes care of rescaling and {@link @cs guides/easy-image/service-details#image-processing optimizing them} as well as providing [various image sizes](#responsive-images) (responsive images),
* delivers uploaded images through a blazing-fast CDN.

All that, with virtually zero server setup so you do not have to worry about anything.

<info-box>
	Check out the {@link features/image-upload comprehensive "Image upload" guide} to learn about other ways to upload images into CKEditor 5.
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

Another great feature introduced with CKEditor 5 is the ability to have responsive images in the content. With a single image upload, several optimized versions of that image are created, each for a different size of the display. All this is totally transparent to the end user who uploaded the image.

{@img assets/img/responsive-images.svg 550 The visualization of the responsive images approach.}

### Why responsive images?

Responsive images have two main advantages over the "traditional" image delivery:

* **They save the data transfer**: There are countless device and screen size combinations that can be used to display images in your application (smartphones, tablets, laptops, etc.) but you do not need to serve the same full–scale images to all of them.

	Using Easy Image guarantees only the particular size variant corresponding to the user's screen size is served, minimizing the amount of data transferred to the client. For large images, this can save up to 90% of the transferred data — [see it yourself!](https://ckeditor.com/ckeditor-cloud-services/easy-image/)
* **They load a way faster**: because only the image matching the size of the screen is transferred, in most of the cases, it can be loaded and displayed a way faster than a "regular" full–scale image. And the faster it loads, the sooner the users can see it, which greatly improves the user experience of your application. You no longer need to wait ages for a high–resolution photos to load on a tiny smartphone screen.

### Responsive images in the markup

Responsive images delivered by the Easy Image service are transparent to your application. Once uploaded, the image appears in the editor content as a "regular" image but with some additional attributes like the `srcset`.

The `srcset` attribute specifies the image variants dedicated for the various screen sizes for the web browser to choose from (360px, 720px, 1080px, 1440px, etc.), for instance the `image.jpg` file  uploaded by the user will have the following markup:

```html
<figure ...>
	<img
		src="https://cdn.cke-cs.com/images/image.jpg"
		srcset="https://cdn.cke-cs.com/images/image.jpg/w_360 360w,
			https://cdn.cke-cs.com/images/image.jpg/w_720 720w,
			https://cdn.cke-cs.com/images/image.jpg/w_1080 1080w,
			...
			https://cdn.cke-cs.com/images/image.jpg/w_2880 2880w,
			https://cdn.cke-cs.com/images/image.jpg/w_3240 3240w,
			https://cdn.cke-cs.com/images/image.jpg/w_3543 3543w"
		sizes="100vw"
		width="...">
	<figcaption ...>...</figcaption>
</figure>
```

The variety of the image sizes in the `srcset` attribute allows the web browser to choose the best one for the particular screen size so it loads faster and with less data transferred. See the detailed {@link @cs guides/easy-image/service-details documentation} of the Easy Image to learn more about responsive images and other features offered by the service.

## What's next?

Check out the {@link features/image-upload comprehensive "Image upload" guide} to learn more about different ways of uploading images in CKEditor 5. See the {@link features/image Image feature} guide to find out more about handling images in CKEditor 5.

