---
# Scope:
# * Introduction to plugins.
# * Exemplify use cases.
# * Point to resources to learn plugin development.

category: builds-development
order: 70
---

# Plugins

Features in CKEditor are introduced by plugins. In fact, without plugins CKEditor is an empty API with no use. The builds provided with CKEditor 5 are actually predefined collections of plugins, put together to satisfy specific needs.

Plugins provided by the CKEditor core team are available in [npm](https://www.npmjs.com/search?q=ckeditor5) (and [GitHub](https://github.com/ckeditor?utf8=%E2%9C%93&q=ckeditor5&type=&language=), too) in form of npm packages. A package may contain one or more plugins (e.g. the [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains {@link features/image several granular plugins}).

## Common use cases

Plugins can be pretty much anything. They are simply pieces of code initialized by the editor if they are configured to be loaded. They can use the richness of the {@link api/index CKEditor 5 Framework API} to enhance the editor or to better integrate it with your application.

Common use cases for plugins are:

* **Editing features**, like bold, heading, linking or any other feature that the user can use to manipulate the content.
* **Adding semantic value** to the content, like annotations or accessibility features.
* **Third-party services integration**, for injecting external resources into the content, like videos or social network posts.
* **Handling image upload** and image manipulation features.
* **Providing widgets** for easy integration with application structured data.
* **Injecting analysis tools** that help enhance the quality of the content.
* And other infinite possibilities...

## Creating plugins

Creating your own plugins is a straightforward task but it requires good knowledge about a few aspects of the CKEditor 5 development environment. The following resources are recommended as a starting point:


* The {@link framework/guides/creating-simple-plugin Plugin development guide} in the {@link framework/index CKEditor 5 Framework} documentation.
* The {@link framework/guides/quick-start Quick start guide} in the {@link framework/index CKEditor 5 Framework} documentation.
* {@link builds/guides/integration/advanced-setup#scenario-1-creating-a-custom-build Creating custom builds} which is necessary to have your plugin included inside a CKEditor 5 build.

A good understanding of the {@link framework/index CKEditor 5 Framework} is also very welcome when it comes to creating plugins.

## Using third-party plugins

A great way to enhance your builds with additional features is by using plugins created by the community. Such plugins are generally available as npm packages, so a quick [search on the "ckeditor5" keyword in npm](https://www.npmjs.com/search?q=ckeditor5) should work as a starting point.

Once you have plugins to be included, {@link builds/guides/integration/installing-plugins learn how to install them}.
