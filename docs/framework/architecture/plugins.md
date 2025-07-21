---
category: framework-architecture
menu-title: Plugins in CKEditor 5
meta-title: Plugins in CKEditor 5 | CKEditor 5 Documentation
toc-limit: 1
order: 10
---

# Plugins in CKEditor 5

Features in CKEditor are introduced by plugins. In fact, without plugins, CKEditor&nbsp;5 is an empty API with no use. Plugins provided by the CKEditor core team are available in [npm](https://www.npmjs.com/search?q=ckeditor5) (and [GitHub](https://github.com/ckeditor?utf8=%E2%9C%93&q=ckeditor5&type=&language=), too) in the form of npm packages. A package may contain one or more plugins (for example, the [`@ckeditor/ckeditor5-image`](https://www.npmjs.com/package/@ckeditor/ckeditor5-image) package contains {@link features/images-overview several granular plugins}).

Starting with CKEditor&nbsp;5 v42.0.0, we collect all plugins in two aggregate packages: `ckeditor5` and `ckeditor5-premium-features`. Using those two is the recommended way of setup. This way you get easy access to all the plugins, without the need to look which plugin is in which package.

## Common use cases

Plugins can be pretty much anything. They are pieces of code initialized by the editor if they are configured to be loaded. They can use the richness of the {@link api/index CKEditor&nbsp;5 Framework API} to enhance the editor or to better integrate it with your application.

Common use cases for plugins are:

* **Editing features**, like bold, heading, linking, or any other feature that the user can use to manipulate the content.
* **Adding semantic value** to the content, like annotations or accessibility features.
* **Third-party services integration**, for injecting external resources into the content, like videos or social network posts.
* **Handling image upload** and image manipulation features.
* **Providing widgets** for easy integration with application structured data.
* **Injecting analysis tools** that help enhance the quality of the content.
* And other infinite possibilities.

## Creating plugins

Creating your own plugins is a straightforward task, but it requires good knowledge about some aspects of the CKEditor&nbsp;5 development environment. The following resources are recommended as a starting point:

* The {@link tutorials/crash-course/editor Plugin development guide}.
* The {@link framework/development-tools/package-generator/using-package-generator Using package generator}, that provides a plugin development environment.

A good understanding of the {@link framework/index CKEditor&nbsp;5 Framework} is also welcome when it comes to creating plugins.

## Using third-party plugins

A great way to enhance your editor with additional features is by using plugins created by the community. Such plugins are available as npm packages, so a quick [search on the "ckeditor5" keyword in npm](https://www.npmjs.com/search?q=ckeditor5) should work as a starting point.

Once you have plugins you want to include, {@link getting-started/setup/typescript-support#adding-an-unofficial-javascript-plugin learn how to install them}.

## Plugins and HTML output

Listed below are all official CKEditor&nbsp;5 packages as well as some partner packages together with their possible HTML output. If a plugin generates a different HTML output depending on its configuration, it is described in the "HTML output" column.

The classes, styles or attributes applied to an HTML element are all **possible** results. It does not mean they all will always be used.

`$block` is a generic structural element that may contain textual content. Features like headings or paragraph implement it to inherit common behaviors. You can read more about it in the {@link framework/deep-dive/schema#generic-items Schema} guide.

If a given plugin does not generate any output, the "HTML output" is described as "None."  Wildcard character `*` means any value is possible.

The data used to generate the following tables comes from the package metadata. You can read more about it in the {@link framework/contributing/package-metadata package metadata} guide.

<style>
	.doc.b-table__cell:first-child {
		width: 33.333%;
	}
	.doc.b-table__cell:last-child {
		width: 66.667%;
	}
	.doc.b-table__cell--default {
		position: relative;
		padding-right: var(--spacing-18);
	}
	.doc.b-table__cell--default::after {
		content: "Default";
		border: 1px solid var(--color-primary-400);
		color: var(--color-primary-400);
		border-radius: var(--radius-1);
		display: inline-block;
		padding: var(--spacing-0) var(--spacing-1);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		font-size: var(--font-size-xs);
		line-height: var(--line-height-sm);
		position: absolute;
		right: var(--spacing-1-5);
		top: var(--spacing-1-5);
	}
</style>

{@exec ../scripts/docs/features-html-output/build-features-html-output.cjs}

