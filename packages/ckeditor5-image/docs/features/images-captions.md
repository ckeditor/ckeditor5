---
category: features-images
menu-title: Image captions
order: 30
---

# Image captions

The {@link module:image/imagecaption~ImageCaption} plugin adds support for image captions:

```html
<figure class="image">
	<img src="..." alt="...">
	<figcaption>A caption goes here...</figcaption>
</figure>
```

By default, if the image caption is empty, the `<figcaption>` element is not visible to the user. You can click the image to reveal the caption field and write one. See the demo below:

<info-box hint>
	You can change the placement of the image caption by setting [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) in your {@link builds/guides/integration/content-styles content styles} for the `.ck-content .image > figcaption` style. Changing it to `caption-side: top` will display the caption above the image.
</info-box>

# Common API

The {@link module:image/imagecaption~ImageCaption} plugin registers:

* The `'toggleImageCaption'` button (to use in the {@link TODO-overview#image-toolbar image toolbar}).
* The {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `'toggleImageCaption'` command}

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image.
