---
category: features-images
menu-title: Text alternative
meta-title: Image text alternative | CKEditor 5 Documentation
meta-description: Setting and managing the alt tag on images in CKEditor 5
order: 20
---
{@snippet features/build-image-source}

# Image text alternative

Image text alternative (the `alt` attribute) helps screen reader users navigate and understand the document. It also provides meaningful image descriptions to search engine crawlers.

## Demo

The editor below has the base image feature enabled. Click any of the images and use the contextual image toolbar {@icon @ckeditor/ckeditor5-core/theme/icons/text-alternative.svg Alternative text} to edit the text alternative.

{@snippet features/image-text-alternative}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

The `alt` attribute is essential for both accessibility and [<abbr title="Search Engine Optimization">SEO</abbr>](https://en.wikipedia.org/wiki/Search_engine_optimization).

CKEditor&nbsp;5 provides support for alternate image text using the {@link module:image/imagetextalternative~ImageTextAlternative} plugin. The `alt` attribute is supported by both block and inline images in the editor output data:

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

### Utilizing CKBox to manage text alternatives

When using the {@link features/ckbox CKBox file manager}, you can utilize its {@link @ckbox features/file-management/metadata#description metadata management tools} to set or change the text alternative. CKBox automatically adds the metadata `description` to the `alt` tag.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

Check out the {@link features/images-installation image features installation guide} to learn how to enable this feature.

## Common API

The {@link module:image/imagetextalternative~ImageTextAlternative} plugin registers:

* The `'imageTextAlternative'` button (to use in the {@link features/images-overview#image-contextual-toolbar image toolbar}).
* The {@link module:image/imagetextalternative/imagetextalternativecommand~ImageTextAlternativeCommand `'imageTextAlternative'` command}.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-image).
