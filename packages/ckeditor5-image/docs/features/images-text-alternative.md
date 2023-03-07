---
category: features-images
menu-title: Text alternative
order: 20
---
{@snippet features/build-image-source}

# Image text alternative

Image text alternative (the `alt` attribute) helps screen reader users navigate and understand the document. It also provides meaningful image descriptions to search engine crawlers.

## Demo

You can see the demo of a WYSIWYG editor with the base image feature enabled below. Click on the images to activate the image toolbar and use the contextual toolbar button {@icon @ckeditor/ckeditor5-core/theme/icons/low-vision.svg Alternative text} to edit the text alternative.

{@snippet features/image-text-alternative}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

The `alt` attribute is essential for both accessibility and [<abbr title="Search Engine Optimization">SEO</abbr>](https://en.wikipedia.org/wiki/Search_engine_optimization).

CKEditor 5 provides support for alternate image text using the {@link module:image/imagetextalternative~ImageTextAlternative} plugin. The `alt` attribute is supported by both block and inline images in the editor output data:

```html
<!-- Block image markup -->
<figure class="image">
	<img src="..." alt="Description of an image">
	<figcaption>...</figcaption>
</figure>

<!-- Inline image in a paragraph -->
<p>Some text followed by an image <img src="..." alt="Description of an image">.</p>
```

<info-box hint>
	This feature follows the markup proposed by the [Editor Recommendations](https://ckeditor.github.io/editor-recommendations/features/image.html) project.
</info-box>

## Installation

This feature is available in all {@link installation/getting-started/predefined-builds ready-to-use editor builds}. If your integration uses a custom editor build, check out the {@link features/images-installation image features installation guide} to learn how to enable this feature.

## Common API

The {@link module:image/imagetextalternative~ImageTextAlternative} plugin registers:

* The `'imageTextAlternative'` button (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imagetextalternative/imagetextalternativecommand~ImageTextAlternativeCommand `'imageTextAlternative'` command}.

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
