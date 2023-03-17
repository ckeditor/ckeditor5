---
category: features-images
menu-title: Image captions
order: 30
---
{@snippet features/build-image-source}

# Image captions

The {@link module:image/imagecaption~ImageCaption} plugin lets you add captions to images by providing support for the `<figcaption>` element.

## Demo

Click on an image and use the contextual image toolbar {@icon @ckeditor/ckeditor5-core/theme/icons/caption.svg Image caption} to toggle captions on and off. Click on a caption to edit it.

{@snippet features/image-caption}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

<info-box hint>
	You can change the placement of the image caption by setting [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) in your {@link installation/advanced/content-styles content styles} for the `.ck-content .image > figcaption` style. Changing it to `caption-side: top` will display the caption above the image.
</info-box>

## Additional feature information

The {@link module:image/imagecaption~ImageCaption} plugin adds support for the `<figcaption>` element:

```html
<figure class="image">
	<img src="..." alt="...">
	<figcaption>A caption goes here...</figcaption>
</figure>
```

By default, if the image caption is empty, the `<figcaption>` element is not visible to the user. You can click the image to reveal the caption field and write one.

## Installation

This feature is available in all {@link installation/getting-started/predefined-builds ready-to-use editor builds}. If your integration uses a custom editor build, check out the {@link features/images-installation image features installation guide} to learn how to enable this feature.

## Common API

The {@link module:image/imagecaption~ImageCaption} plugin registers:

* The `'toggleImageCaption'` button (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `'toggleImageCaption'` command}

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
