---
category: features-images
menu-title: Responsive images
order: 55
---
{@snippet features/build-image-source}

# Responsive images

The ability to have responsive images in the rich-text editor content is a great modern feature provided by the {@link features/ckbox CKBox file manager}. With a single image upload, several optimized versions of that image are created, each for a different size of the display. All this is transparent to the end user who uploaded the image.

## Demo

Add an image to the content with the CKBox toolbar button {@icon @ckeditor/ckeditor5-ckbox/theme/icons/browse-files.svg}. Change the demo viewport and observe how the editor automatically serves the right-sized image.

<!-- {@snippet features/image-link} -->

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>


## Why responsive images?

Responsive images have two main advantages over "traditional" image delivery:

* **They save the data transfer**. There are countless device and screen size combinations that can be used to display images in your application (smartphones, tablets, laptops, etc.). You do not need to serve the same full–scale images to all of them, though. Using CKBox guarantees only the particular size variant corresponding to the user's screen size is served, minimizing the amount of data transferred to the client. For large images, this can save up to 90% of the transferred data.
* **They load faster**. Because only the image matching the size of the screen is transferred, in most cases it can be loaded and displayed much faster than a "regular" full–scale image. The faster it loads, the sooner the users can see it, which greatly improves the user experience of your application. You no longer need to wait for ages for high–resolution photos to load on a tiny smartphone screen.
* **Accessibility**. By catering to different user devices, you may better address the users' different needs. Paired with the {@link features/images-text-alternative text alternative} it makes your content more accessible.

{@img assets/img/responsive-images.svg 550 The visualization of the responsive images approach for CKEditor 5 WYSIWYG editor.}

## Responsive images in the markup

Responsive images delivered by the CKBox service are transparent to your application. Once uploaded, the image appears in the editor content as a "regular" image but with some additional attributes like the `srcset`.

The `srcset` attribute specifies the image variants dedicated to the various screen sizes for the web browser to choose from (360px, 720px, 1080px, 1440px, etc.).

For instance, the `image.png` file uploaded by the user will have the following markup:

```html
<picture>
	<source srcset="https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/147.webp  147w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/291.webp  291w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/435.webp  435w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/579.webp  579w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/723.webp  723w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/867.webp  867w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/1011.webp  1011w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/1155.webp  1155w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/1299.webp  1299w,
	https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/1443.webp 1443w"
	sizes="(max-width: 1443px) 100vw, 1443px"
	type="image/webp"><img data-ckbox-resource-id="VB2OIjfIpHMR"
	src="https://ckbox.cloud/rc1DFuFpHqcR3Mah6y0e/assets/VB2OIjfIpHMR/images/1443.png">
 </picture>
```

The variety of the image sizes in the `srcset` attribute allows the web browser to choose the best one for the particular screen size. As a result, it loads faster and with less data transferred. Read the {@link @ckbox features/images/responsive-images CKBox responsive images} guide to learn how are the intermediate file sizes calculated.

Regardless of the original file format, the responsive versions will be served as `.webp`. While this format is standard, you can always call any file format supported by CKBox and display it. Refer to the {@link @ckbox features/images/conversion CKBox responsive images} guide to find out how to do it.

## Installation

<info-box>
	The CKBox file manager is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

For detailed information on how to configure and use CKBox, please refer to the {@link features/ckbox CKBox file manager} guide.


## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link).
