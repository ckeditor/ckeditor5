---
category: features-images
menu-title: Linking images
meta-title: Linking images | CKEditor 5 Documentation
meta-description: Learn how to use your images as link anchors.
order: 70
---

# Linking images

The {@link module:link/linkimage~LinkImage} plugin lets you use images as links.

## Demo

Click one of the images to open the contextual toolbar. Use the link icon {@icon @ckeditor/ckeditor5-icons/theme/icons/link.svg Link} to add a link to the image. After you do this, an icon will appear in the top-right corner of the image, indicating there is a link attached to it.

{@snippet features/image-link}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
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

To enable this feature, you need to load the {@link module:link/linkimage~LinkImage} plugin. Read more in the {@link features/images-installation installation guide}.

<info-box info>
	The {@link module:link/linkimage~LinkImage} plugin is available in the {@link api/link `@ckeditor/ckeditor5-link`} package.
</info-box>

## Common API

The {@link module:link/linkimage~LinkImage} plugin registers:

* The `'linkImage'` button that opens the link UI when an image is selected by the user (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:link/linkcommand~LinkCommand `'linkImage'` command}.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link).
