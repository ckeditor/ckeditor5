---
menu-title: FAQ
category: support
order: 60
---

# Frequently asked questions

## How to use CKEditor 5 with frameworks (Angular, React, Vue, etc.)?

For the list of official integrations, see the {@link installation/integrations/overview#official-wysiwyg-editor-integrations "Official integrations"} section.

If an official integration for the framework of your choice does not exist yet, read the {@link installation/integrations/overview "Integrating CKEditor 5 with JavaScript frameworks"} guide. CKEditor 5 offers a rich JavaScript API and predefined builds that make it possible to use CKEditor 5 with whichever framework you need.

We plan to provide more official integrations with time. [Your feedback on what we should work on next](https://github.com/ckeditor/ckeditor5/issues/1002) will be most welcome!

## How to get a full-featured editor build?

We have prepared a build containing almost all available plugins, and it is called the superbuild. Read how to integrate it in the {@link installation/getting-started/quick-start#running-a-full-featured-editor-from-cdn quick start guide}.

In the {@link installation/getting-started/predefined-builds predefined builds} guide, there are details available about the {@link installation/getting-started/predefined-builds#superbuild superbuild}, together with the {@link installation/getting-started/predefined-builds#list-of-plugins-included-in-the-ckeditor-5-predefined-builds list of features included in the superbuild}, compared to other types of builds.

### How to turn the source mode on?

The {@link features/source-editing source editing} feature provides basic support for viewing and editing the source of the document.

### Why does the editor filter out my content (styles, classes, elements)?

CKEditor 5 implements a custom {@link framework/architecture/editing-engine data model}. This means that every piece of content that is loaded into the editor needs to be converted to that model and then rendered back to the view.

Each kind of content must be handled by some feature. For example, the [`ckeditor5-basic-styles`](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles) package handles HTML elements such as `<b>`, `<i>`, `<u>`, etc. along with their representation in the model. The feature defines the two–way conversion between the HTML (view) and the editor model.

If you load some content unknown to any editor feature, it will be dropped. If you want all the HTML5 elements to be supported, you need to write plugins to support them. Once you do that, CKEditor 5 will not filter anything out.

### How to add more features to the build I downloaded?

See the {@link installation/plugins/installing-plugins Installing plugins} guide to learn how to extend the editor with some additional features.

You can learn which editor features are available in which build in the {@link installation/getting-started/predefined-builds#list-of-plugins-included-in-the-ckeditor-5-predefined-builds Predefined builds} guide.

### How to enable image drag&drop and upload? Where should I start?

The {@link features/images-overview image} and {@link features/image-upload image upload} features are enabled by default in all editor builds. However, to fully enable image upload when installing CKEditor 5, you need to configure one of the available upload adapters. Check out the {@link features/image-upload comprehensive "Image upload" guide} to find out the best image upload strategy for your project.
