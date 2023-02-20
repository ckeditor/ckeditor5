---
category: features-image-upload
menu-title: Easy Image
order: 30
badges: [ premium ]
---

# Easy Image integration

The [Easy Image](https://ckeditor.com/ckeditor-cloud-services/easy-image/) feature takes care of handling images with a strong focus on the end–user experience. Its goal is to make the image upload as effortless and intuitive as possible. Unlike the {@link features/ckbox CKBox} feature, which is a full-fledged file manager, Easy Image concentrates on upload only.

<info-box info>
	This is a premium feature and you need a license for it on top of your CKEditor 5 commercial license. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs.

	You can also sign up for the [CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features) to test the feature.

	This feature is enabled by default in all [predefined builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html) for convenience, but the editor will still work properly without activating it.
</info-box>

Easy Image is part of the CKEditor Cloud Services. It is a <abbr title="Software as a service">SaaS</abbr> product which:

* securely uploads images,
* takes care of rescaling and [optimizing them](https://ckeditor.com/docs/cs/latest/guides/easy-image/service-details.html#image-processing) as well as providing [various image sizes](#responsive-images) (responsive images), <!-- absolute link -->
* delivers uploaded images through a blazing-fast CDN.

All that with virtually zero server setup.

## Demo

The demo below uses the {@link installation/getting-started/predefined-builds#classic-editor Classic editor} configured to use the Easy Image service provided by CKEditor Cloud Services:

{@snippet build-classic-source}

{@snippet features/easy-image}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Configuration

To make enabling image upload in CKEditor 5 a breeze, by default all builds include the {@link module:easy-image/easyimage~EasyImage `EasyImage` plugin}. It integrates with the Easy Image service provided by [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/). Enabling it is straightforward and the results are immediate:

1. Follow the [Easy Image &mdash; Quick start guide](https://ckeditor.com/docs/cs/latest/guides/easy-image/quick-start.html) to set up an account.
2. Configure CKEditor 5 (see {@link module:cloud-services/cloudservices~CloudServicesConfig `CloudServicesConfig`}):

	```js
	ClassicEditor
		.create( document.querySelector( '#editor' ), {
			cloudServices: {
				tokenUrl: 'https://example.com/cs-token-endpoint',
				uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
			}
		} )
		.then( /* ... */ )
		.catch( /* ... */ );
	```

This is all. At this point, image upload will be automatically enabled in your application.

If you are having troubles with setting up Easy Image, please [contact us](https://ckeditor.com/contact/).

### Configuring allowed file types

The allowed file types that can be uploaded should actually be configured in two places:

* On the client side, in CKEditor 5, restricting image upload through the CKEditor 5 UI and commands.
* On the server side, in Easy Image, restricting the file formats that are accepted in Easy Image.

#### Client-side configuration

Use the {@link module:image/imageupload~ImageUploadConfig#types `image.upload.types`} configuration option to define the allowed image MIME types that can be uploaded to CKEditor 5.

By default, users are allowed to upload `jpeg`, `png`, `gif`, `bmp`, `webp` and `tiff` files. This corresponds with file formats supported by Easy Image, but you can modify the list to limit the number of allowed image types.

#### Server-side configuration

Check the [list of file formats supported by Easy Image](https://ckeditor.com/docs/cs/latest/guides/easy-image/service-details.html#supported-file-formats). At the moment it is not possible to limit or extend this list so any restrictions need to be introduced on the client side.

## Responsive images

Another great feature introduced with CKEditor 5 is the ability to have responsive images in the rich-text editor content. With a single image upload, several optimized versions of that image are created, each for a different size of the display. All this is transparent to the end user who uploaded the image.

{@img assets/img/responsive-images.svg 550 The visualization of the responsive images approach for CKEditor 5 WYSIWYG editor.}

### Why responsive images?

Responsive images have two main advantages over the "traditional" image delivery:

* **They save the data transfer**. There are countless device and screen size combinations that can be used to display images in your application (smartphones, tablets, laptops, etc.). You do not need to serve the same full–scale images to all of them, though.

	Using Easy Image guarantees only the particular size variant corresponding to the user's screen size is served, minimizing the amount of data transferred to the client. For large images, this can save up to 90% of the transferred data &mdash; [see it yourself!](https://ckeditor.com/ckeditor-cloud-services/easy-image/)
* **They load faster**. Because only the image matching the size of the screen is transferred, in most cases it can be loaded and displayed much faster than a "regular" full–scale image. The faster it loads, the sooner the users can see it, which greatly improves the user experience of your application. You no longer need to wait ages for high–resolution photos to load on a tiny smartphone screen.

### Responsive images in the markup

Responsive images delivered by the Easy Image service are transparent to your application. Once uploaded, the image appears in the editor content as a "regular" image but with some additional attributes like the `srcset`.

The `srcset` attribute specifies the image variants dedicated for the various screen sizes for the web browser to choose from (360px, 720px, 1080px, 1440px, etc.). For instance the `image.jpg` file  uploaded by the user will have the following markup:

```html
<figure class="image">
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
	<figcaption>...</figcaption>
</figure>
```

The variety of the image sizes in the `srcset` attribute allows the web browser to choose the best one for the particular screen size. As a result, it loads faster and with less data transferred. See the detailed [Easy Image service documentation](https://ckeditor.com/docs/cs/latest/guides/easy-image/service-details.html) to learn more about responsive images and other features offered by the service.

## Installation

<info-box info>
	This feature is enabled by default in all predefined builds. The installation instructions are for developers interested in building their own, custom WYSIWYG editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-easy-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image) package:

```bash
npm install --save @ckeditor/ckeditor5-easy-image
```

Then add {@link module:easy-image/easyimage~EasyImage} to your plugin list and [configure](#configuration) the feature. For instance:

```js
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Image from '@ckeditor/ckeditor5-image/src/image';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EasyImage, Image, /* ... */ ],
		toolbar: [ 'uploadImage', /* ... */ ],

		// Configure the endpoint. See the "Configuration" section above.
		cloudServices: {
			tokenUrl: 'https://example.com/cs-token-endpoint',
			uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Please note that most integrations will also require the {@link module:image/image~Image} plugin to be loaded in the editor to make this feature work properly (or one of {@link module:image/imageblock~ImageBlock} or {@link module:image/imageinline~ImageInline}). Check out the comprehensive {@link features/images-installation guide to images} in CKEditor 5 to learn more.
</info-box>

## What's next?

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor 5.

See the {@link features/images-overview Image feature} guide to find out more about handling images in CKEditor 5.

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-easy-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-easy-image).
