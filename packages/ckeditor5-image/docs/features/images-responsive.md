---
category: features-images
menu-title: Responsive images
meta-title: Responsive images | CKEditor 5 Documentation
meta-description: Learn how responsive images can make your content better.
order: 55
modified_at: 2023-06-30
---

# Responsive images

The ability to have responsive images in the rich-text editor content is a great modern feature provided by the {@link features/ckbox CKBox asset manager}. With a single image upload, several optimized versions of that image are created, each for a different size of the display. The CKBox feature produces a `<picture>` element with a set of optimized images. The browser will automatically load the image with the dimensions most suitable for the presented page resolution, which makes the image load much faster and saves bandwidth.

## Demo

Observe the responsive image in the demo. You can also add another one with the CKBox toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/browse-files.svg}. Resize your browser window to change the editor viewport and observe how the editor automatically serves the size-adjusted, optimized image.

{@snippet features/image-responsive}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Why responsive images?

Responsive images have two main advantages over "traditional" image delivery:

* **They save the data transfer**. There are countless device and screen size combinations that can be used to display images in your application (smartphones, tablets, laptops, etc.). You do not need to serve the same full–scale images to all of them, though. Using CKBox guarantees only the particular size variant corresponding to the user's screen size is served, minimizing the amount of data transferred to the client. For large images, this can save up to 90% of the transferred data.
* **They load faster**. Because only the image matching the size of the screen is transferred, in most cases it can be loaded and displayed much faster than a "regular" full–scale image. The faster it loads, the sooner the users can see it, which greatly improves the user experience of your application. You no longer need to wait for ages for high–resolution photos to load on a tiny smartphone screen.
* **Accessibility**. By catering to different user devices, you may better address the users' different needs. Paired with the {@link features/images-text-alternative text alternative} it makes your content more accessible.

{@img assets/img/responsive-images.svg 550 The visualization of the responsive images approach for CKEditor&nbsp;5 WYSIWYG editor.}

## Responsive images in the markup

The image appears in the editor content as a `<picture>` element. The `<picture>` element contains the original `<img>` and the `<source>` element, which defines alternative versions of images using the `srcset` attribute.

The `srcset` attribute specifies the image variants dedicated to the various screen sizes for the web browser to choose from (360px, 720px, 1080px, 1440px, etc.).

For instance, the `image.jgeg` file uploaded by the user will have the following markup:

```html
	<picture>
		<source srcset="https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/160.webp 160w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/320.webp 320w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/480.webp 480w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/640.webp 640w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/800.webp 800w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/960.webp 960w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/1120.webp 1120w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/1280.webp 1280w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/1440.webp 1440w,
		https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/1600.webp 1600w"
		sizes="(max-width: 1600px) 100vw, 1600px"
		type="image/webp">
		<img src="https://ckbox.cloud/huTfIec9s6SodytaMc9x/assets/1aUrKtJqioMR/images/1600.jpeg" alt="Snowdrop" data-ckbox-resource-id="M0tgMczsDphw">
	</picture>
```

The variety of the image sizes in the `srcset` attribute allows the web browser to choose the best one for the particular screen size. As a result, it loads faster and with less data transferred. Read the [CKBox responsive images](https://ckeditor.com/docs/ckbox/latest/features/images/responsive-images.html) guide to learn how are the intermediate file sizes calculated.

Regardless of the original file format, the responsive versions will be served as `.webp`.

<info-box>
	CKBox converts image formats and resizes images on the fly. Refer to the [CKBox image conversion](https://ckeditor.com/docs/ckbox/latest/features/images/conversion.html) guide to find out how to do it.
</info-box>

## Installation

For detailed information on how to configure and use CKBox, please refer to the {@link features/ckbox#installation CKBox file manager} installation guide.
