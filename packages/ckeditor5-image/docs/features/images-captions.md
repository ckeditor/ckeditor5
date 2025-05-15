---
category: features-images
menu-title: Image captions
meta-title: Image captions | CKEditor 5 Documentation
meta-description: Utilizing image captions to enhance your rich content.
order: 30
---

# Image captions

The {@link module:image/imagecaption~ImageCaption} plugin lets you add captions to images by providing support for the `<figcaption>` element.

## Demo

Click one of the images below and use the contextual image toolbar {@icon @ckeditor/ckeditor5-icons/theme/icons/caption.svg Image caption} to toggle the caption on and off. Click the caption to edit it.

{@snippet features/image-caption}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

<info-box hint>
	You can change the placement of the image caption by setting [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) in your {@link getting-started/advanced/content-styles content styles} for the `.ck-content .image > figcaption` style. Changing it to `caption-side: top` will display the caption above the image.
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

To enable this feature, you need to load the {@link module:link/linkimage~LinkImage} plugin. Read more in the {@link features/images-installation installation guide}.

## Common API

The {@link module:image/imagecaption~ImageCaption} plugin registers:

* The `'toggleImageCaption'` button (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `'toggleImageCaption'` command}

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
