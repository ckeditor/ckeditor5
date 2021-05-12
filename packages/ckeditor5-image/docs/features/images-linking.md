---
category: features-images
menu-title: Linking images
order: 70
---
{@snippet features/build-image-source}

# Linking images

The {@link module:link/linkimage~LinkImage} plugin adds support for linking images. Some use cases where this could be useful are:

* Linking to a high-resolution version of an image.
* Using images as thumbnails linking to an article or product page.
* Creating banners linking to other pages.

The image link can be added or edited via the image toolbar. An icon in top right corner of the image indicates the presence of a link.

```html
<figure class="image">
	<a href="...">
		<img src="..." alt="...">
	</a>
	<figcaption>Image caption</figcaption>
</figure>
```
Use the link icon in the image toolbar to access the edit options for links on image. Notice the top-right icon indicating a linked image.

{@snippet features/image-link}

### Enabling image linking

The image linking feature is not enabled by default in any of the editor builds. In order to enable it, you need to load the {@link module:link/linkimage~LinkImage} plugin. Read more in the {@link features/images-installation installation} guide.

<info-box info>
	The {@link module:link/linkimage~LinkImage} plugin is available in the {@link api/link `@ckeditor/ckeditor5-link`} package.
</info-box>

# Common API

The {@link module:link/linkimage~LinkImage} plugin registers:

* The `'linkImage'` button that opens the link UI when an image is selected by the user (to use in the {@link TODO-overview#image-toolbar image toolbar}).
* The {@link module:link/linkimage/linkimagecommand~LinkImageCommand `'linkImage'` command}.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link.
