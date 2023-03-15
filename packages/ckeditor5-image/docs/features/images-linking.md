---
category: features-images
menu-title: Linking images
order: 70
---
{@snippet features/build-image-source}

# Linking images

The {@link module:link/linkimage~LinkImage} plugin lets you use images as links.

## Demo

Click on the images to invoke the contextual toolbar. Use the link icon {@icon @ckeditor/ckeditor5-link/theme/icons/link.svg Link} to access the editing options for links on an image. Also notice the icon in the top-right corner of the image, indicating there is a link attached to the image.

{@snippet features/image-link}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

Here are some use cases where linking images can be useful:

* Linking to a high-resolution version of an image.
* Using images as thumbnails linking to an article or product page.
* Creating banners linking to other pages.

The image link can be added or edited via the image toolbar. An icon in top right corner of the image indicates the presence of a link.

An example source code for block image would look similar to this one:

```html
<figure class="image">
	<a href="...">
		<img src="..." alt="...">
	</a>
	<figcaption>Image caption</figcaption>
</figure>
```

An inline image code would look more like this:

```html
<a href="...">
	Some text <img src="..." alt="..." style="width: 20px">
</a>
```

## Installation

The image linking feature is not enabled by default in any of the editor builds. To enable it, you need to load the {@link module:link/linkimage~LinkImage} plugin. Read more in the {@link features/images-installation installation guide}.

<info-box info>
	The {@link module:link/linkimage~LinkImage} plugin is available in the {@link api/link `@ckeditor/ckeditor5-link`} package.
</info-box>

## Common API

The {@link module:link/linkimage~LinkImage} plugin registers:

* The `'linkImage'` button that opens the link UI when an image is selected by the user (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:link/linkcommand~LinkCommand `'linkImage'` command}.

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link).
