---
category: setup
menu-title: Editor and content styles
meta-title: Editor and content styles | CKEditor 5 documentation
order: 70
modified_at: 2024-05-06
---

# Editor and content styles

CKEditor&nbsp;5 is distributed with two types of styles:

* Editor styles, used to style the editor's user interface.
* Content styles, used to style the content in the editor.

If you went through our {@link getting-started/quick-start Quick start}, you probably noticed that attaching the styles in JavaScript is pretty standard, and we provide a CSS style sheet that has both the editor and content style sheets combined:

```js
import 'ckeditor5/index.css';

// If you are using premium features:
import 'ckeditor5-premium-features/index.css';
```

It is as easy in HTML:

```html
<link rel="stylesheet" href="<CDN_LINK>/ckeditor5/dist/index.css" />

<!-- If you are using premium features: -->
<link rel="stylesheet" href="<CDN_LINK>/ckeditor5-premium-features/dist/index.css" />
```

## Why do I need content styles?

Some {@link features/index core editor features} bring additional CSS to control the look of the content they produce. One of such examples is the {@link features/images-overview image feature} that needs special content styles to render images and their captions in the content. Another would be the {@link features/block-quote block quote} feature that displays quotes in italics with a subtle border on the side. You can see both of these pictured below.

{@img assets/img/builds-content-styles.png 823 Editor content styles.}

## Styling the published content

Your application is typically divided into two areas. Content creation, which hosts the editor and is a writing tool, and content publishing, which presents the written content.

It is important to use the content styles on the publishing side of your application. Otherwise, the content will look different in the editor and for your end users.

There are two ways to obtain the content styles:

// TODO: Links

* From the `npm` packages, in the `dist/index-content.css` location.
* From CDN, `<CDN_LINK>`

Load the `index-content.css` file on the publishing side by adding the following code to the template:

```html
<link rel="stylesheet" href="path/to/assets/index-content.css">
```

<info-box warning>
	**Important!**

	If you take a closer look at the content styles, you may notice they are prefixed with the `.ck-content` class selector. This narrows their scope when used in CKEditor&nbsp;5 so they do not affect the rest of the application. To use them in the front–end, **you will have to** add the `ck-content` CSS class to the container of your content. Otherwise, the styles will not be applied.
</info-box>

## Customizing the editor's look

The [`@ckeditor/ckeditor5-theme-lark`](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark) package contains the default theme of CKEditor&nbsp;5. Lark is modular, [BEM–friendly](https://en.bem.info/methodology/css/) and built using [PostCSS](http://postcss.org/).

Although it was designed with versatility and the most common editor use cases in mind, some integrations may require adjustments to make it match the style guidelines of their ecosystems. This kind of customization can be done by importing an extra `.css` file and overriding the [native CSS variables](https://www.w3.org/TR/css-variables/).

For example, the override below will tweak the border radius of several elements in the editor, such as toolbar or contextual balloons.

```css
:root {
	/* Overrides the border radius setting in the theme. */
	--ck-border-radius: 4px;
}
```

<info-box hint>
	Check out the [color sheet](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-theme-lark/theme/ckeditor5-ui/globals/_colors.css) for a full list of customizable colors. You can also browse [other files](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-theme-lark/theme/ckeditor5-ui/globals) to learn about other useful tools.
</info-box>

## Customizing the look of the features

Similarly to the customizable editor look, some features also provide an interface to change their styles via [native CSS variables](https://www.w3.org/TR/css-variables/).

For example, if you want to change the color of the mentions' background and text, you can do the following override:


```css
:root {
	--ck-color-mention-background: black;
	--ck-color-mention-text: white;
}
```

<info-box hint>
	Find the available CSS variables in our [ckeditor5](https://www.npmjs.com/package/ckeditor5?activeTab=code) and [ckeditor5-premium-features](https://www.npmjs.com/package/ckeditor5-premium-features?activeTab=code) packages.
</info-box>

## Optimizing the size of style sheets

Our main packages, `ckeditor5` and `ckeditor5-premium-features`, distribute three style sheets:

* `index.css`: combined editor and content styles.
* `index-content.css`: only content styles.
* `index-editor.css`: only editor styles.

// TODO: Link
Content styles include styles for **all** plugins of the editor. If you want to optimize the size of the style sheet, as you may be using minimal set of plugins, read our optimization guide.
