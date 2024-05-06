---
category: setup
menu-title: Editor and content styles
meta-title: Editor and content styles | CKEditor 5 documentation
order: 60
modified_at: 2024-05-06
---

# Editor and content styles

CKEditor&nbsp;5 is distributed with two types of styles:

* Editor styles, used to style the editor's user interface.
* Content styles, used to style the content in the editor.

If you went through our {@link getting-started/quick-start Quick start}, you probably noticed that attaching the styles in JavaScript is pretty standard, and we provide a CSS style sheet that has both the editor and content style sheets combined:

```js
import 'ckeditor5/dist/index.css';

// If you are using premium features:
import 'ckeditor5-premium-features/dist/index.css'; 
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

## Optimizing the size of style sheets

Our main packages, `ckeditor5` and `ckeditor5-premium-features`, distribute three style sheets:

* `index.css`: combined editor and content styles.
* `index-content.css`: only content styles.
* `index-editor.css`: only editor styles.

// TODO: Link
Content styles include styles for **all** plugins of the editor. If you want to optimize the size of the style sheet, as you may be using minimal set of plugins, read our optimization guide.
