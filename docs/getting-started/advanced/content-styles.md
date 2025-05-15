---
category: advanced
menu-title: (Legacy) Content styles
meta-title: Content styles | Legacy CKEditor 5 documentation
order: 30
---

# (Legacy) Content styles

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you are looking for current CKEditor 5 installation instructions, please refer to the newest version of the {@link getting-started/setup/css Editor and content styles} guide.
</info-box>

Some {@link features/index core editor features} bring additional CSS to control the look of the content they produce. Take, for example, the {@link features/images-overview image feature} that needs special content styles to render images and their captions in the content. Or the {@link module:block-quote/blockquote~BlockQuote block quote} feature that displays quotes in italics with a subtle border on the side.

{@img assets/img/builds-content-styles.png 823 Editor content styles.}

Content styles are bundled along with editor UI styles and, together with the JavaScript code of CKEditor&nbsp;5, they create a monolithic structure called an editor build. By default, content styles are inseparable from the rest of the editor. This means there is no CSS file containing them you could take straight from the editor and use in your application (as opposed to the CKEditor 4 `contents.css` file). To get the editor content styles, for instance, for the frontend of your application, you will have to take additional steps described in this guide.

## Sharing content styles between frontend and backend

By default, content styles are loaded by the editor JavaScript. This makes them present only when users edit their content and this, in turn, usually takes place in the backend of an application. If you want to use the same styles in the frontend, you may find yourself in a situation that requires you to load CKEditor just for that purpose, which is (performance–wise) not the best idea.

To avoid unnecessary dependencies in your frontend, use a style sheet with a complete list of CKEditor&nbsp;5 content styles used by all editor features. You can generate it by using a dedicated script. Learn more in the {@link framework/contributing/development-environment#generating-content-styles Development environment} guide. Then, load the `content-styles.css` file in your application by adding the following code to the template:

```html
<link rel="stylesheet" href="path/to/assets/content-styles.css" type="text/css">
```

The content in the frontend of your application should now look the same as when edited by the users.

<info-box warning>
	**Important!**

	If you take a closer look at the content styles, you may notice they are prefixed with the `.ck-content` class selector. This narrows their scope when used in CKEditor&nbsp;5 so they do not affect the rest of the application. To use them in the front–end, **you will have to** add the `ck-content` CSS class to the container of your content. Otherwise, the styles will not be applied.
</info-box>

<info-box>
	If you are not afraid to get your hands dirty, you can always create a custom CKEditor&nbsp;5 preset from the source code with **all** the CSS (both UI and the content) extracted to a separate file. See how to do that in a {@link getting-started/advanced/integrating-from-source-webpack#option-extracting-css dedicated guide}.
</info-box>

## Styling the published content

Your application is typically divided into two areas. *Content creation*, which hosts the editor and is a writing tool, and *content publishing*, which presents the written content.

It is important to use the content styles on the publishing side of your application. Otherwise, the content will look different in the editor and for your end users.

There are two ways to obtain the content styles:

* From the `npm` packages, in the `dist/ckeditor5-content.css` and `ckeditor5-premium-features-content.css` location.
* From our CDN, `https://cdn.ckeditor.com/ckeditor5/`

Below is an example with placeholder paths showing how to load the `ckeditor5-content.css` (and `ckeditor5-premium-features-content.css`, if needed) file on the publishing side.

```html
<link rel="stylesheet" href="path/to/assets/ckeditor5-content.css">

<!-- If you are using premium features: -->
<link rel="stylesheet" href="path/to/assets/ckeditor5-premium-features-content.css">

<!-- If you have other style sheet that changes the look of the content: -->
<link rel="stylesheet" href="path/to/assets/styles.css">
```

The final setup depends on how your application is structured. As mentioned earlier, you can use our CDN, or your JS bundler already creates and serves combined style sheets. Choose the solution that works best for your case.
