---
# Scope:
# * Explain what content styles are and how to use them.
# * Offer developers a way to obtain editor content styles.

category: builds-integration
order: 80
---

# Content styles

Some of the {@link features/index core editor features} bring additional CSS to control the look of the content they produce. Take, for example, the {@link features/image Image feature} that needs special content styles to render images and their captions in the content. Or the {@link module:block-quote/blockquote~BlockQuote Block quote} plugin displays quotes in italic with a subtle border on the side.

{@img assets/img/builds-content-styles.png 823 Editor content styles.}

Content styles are bundled along with editor UI styles and, together with the JavaScript code of CKEditor 5, they create a monolithic structure called an {@link builds/guides/overview#available-builds editor build}. By default, content styles are inseparable from the rest of the editor which means there is no CSS file containing them you could take straight from the editor and use in your application (as opposed to the CKEditor 4 `contents.css` file). To get editor content styles, for instance, for the front–end of your application, you will have to take additional steps described in this guide.

## Sharing content styles between front–end and back–end

By default, content styles are loaded by the editor JavaScript which makes them only present when users edit their content and this, in turn, usually takes place in the back–end of an application. You want to use the same styles in the front–end, you may find yourself in a situation that requires you to load CKEditor just for that purpose, which is (performance–wise) not the best idea.

To avoid unnecessary dependencies in your front–end use a stylesheet with a complete list of CKEditor 5 content styles used by all editor features. There are two ways to obtain it:

* By taking it directly from [this guide](#the-full-list-of-content-styles) and saving it as a static resource in your application (e.g. `content-styles.css`) (**recommended**).
* By generating it using the `yarn docs:content-styles` script in the [root package](https://github.com/ckeditor/ckeditor5) of the editor:
	```shell
	> git clone git@github.com:ckeditor/ckeditor5.git
	Cloning into 'ckeditor5'...
	...
	> yarn
	yarn install v1.16.0
	[1/5] 🔍  Validating package.json...
	[2/5] 🔍  Resolving packages...
	[3/5] 🚚  Fetching packages...
	...
	> yarn docs:content-styles
	yarn run v1.16.0
	$ node ./scripts/docs/build-content-styles.js
	Content styles have been extracted to /path/to/ckeditor5/build/content-styles/content-styles.css
	```

Load the `content-styles.css` file in your application by adding the following code to the template:

```html
<link rel="stylesheet" href="path/to/assets/content-styles.css" type="text/css">
```

The content in the front–end of your application should now look the same as when edited by the users.

<info-box warning>
	**Important!**

	If you take a closer look at the content styles you may notice they all are prefixed by the `.ck-content` class selector. This narrows their scope when used in CKEditor so they do not affect the rest of the application. To use them in the front–end, **you will have to** add the `ck-content` CSS class to the container of your content. Otherwise styles will not apply.
</info-box>

<info-box>
	If you are not afraid to get your hands dirty, you can always create a custom CKEditor 5 build from the source code with **all** the CSS (both UI and the content) extracted to a separate file. See how to do that in a {@link builds/guides/integration/advanced-setup#option-extracting-css dedicated guide}.
</info-box>

## The full list of content styles

Below there is a full list of content styles used by editor features. You can copy it and use straight in your project. **Make sure to add the `ck-content` class to your content container for the styles to work** ([see above](#sharing-content-styles-between-frontend-and-backend)).

```css
/*
 * CKEditor 5 (v12.3.1) content styles.
 * Generated on Tue, 06 Aug 2019 09:44:26 GMT.
 * For more information, check out https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/content-styles.html
 */

:root {
	--ck-image-style-spacing: 1.5em;
}

/* ckeditor5-image/theme/imagecaption.css */
.ck-content .image > figcaption {
	display: table-caption;
	caption-side: bottom;
	word-break: break-word;
	color: hsl(0, 0%, 20%);
	background-color: hsl(0, 0%, 97%);
	padding: .6em;
	font-size: .75em;
	outline-offset: -1px;
}
/* ckeditor5-basic-styles/theme/code.css */
.ck-content code {
	background-color: hsla(0, 0%, 78%, 0.3);
	padding: .15em;
	border-radius: 2px;
}
/* ckeditor5-table/theme/table.css */
.ck-content .table {
	margin: 1em auto;
	display: table
}
/* ckeditor5-table/theme/table.css */
.ck-content .table table {
	border-collapse: collapse;
	border-spacing: 0;
	border: 1px double hsl(0, 0%, 70%)
}
/* ckeditor5-table/theme/table.css */
.ck-content .table table td,
.ck-content .table table th {
	min-width: 2em;
	padding: .4em;
	border-color: hsl(0, 0%, 85%);
}
/* ckeditor5-table/theme/table.css */
.ck-content .table table td,
.ck-content .table table th {
	min-width: 2em;
	padding: .4em;
	border-color: hsl(0, 0%, 85%);
}
/* ckeditor5-table/theme/table.css */
.ck-content .table table th {
	font-weight: bold;
	background: hsl(0, 0%, 98%);
}
/* ckeditor5-image/theme/image.css */
.ck-content .image {
	display: table;
	clear: both;
	text-align: center;
	margin: 1em auto
}
/* ckeditor5-image/theme/image.css */
.ck-content .image > img {
	display: block;
	margin: 0 auto;
	max-width: 100%;
	min-width: 50px;
}
/* ckeditor5-image/theme/imageuploadprogress.css */
.ck-content .image {
	position: relative;
	overflow: hidden;
}
/* ckeditor5-image/theme/imageuploadprogress.css */
.ck-content .image.ck-appear {
	animation: fadeIn 700ms;
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-side,
.ck-content .image-style-align-left,
.ck-content .image-style-align-center,
.ck-content .image-style-align-right {
	max-width: 50%;
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-side,
.ck-content .image-style-align-left,
.ck-content .image-style-align-center,
.ck-content .image-style-align-right {
	max-width: 50%;
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-side,
.ck-content .image-style-align-left,
.ck-content .image-style-align-center,
.ck-content .image-style-align-right {
	max-width: 50%;
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-side,
.ck-content .image-style-align-left,
.ck-content .image-style-align-center,
.ck-content .image-style-align-right {
	max-width: 50%;
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-side {
	float: right;
	margin-left: var(--ck-image-style-spacing);
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-align-left {
	float: left;
	margin-right: var(--ck-image-style-spacing);
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-align-center {
	margin-left: auto;
	margin-right: auto;
}
/* ckeditor5-image/theme/imagestyle.css */
.ck-content .image-style-align-right {
	float: right;
	margin-left: var(--ck-image-style-spacing);
}
/* ckeditor5-block-quote/theme/blockquote.css */
.ck-content blockquote {
	overflow: hidden;
	padding-right: 1.5em;
	padding-left: 1.5em;
	margin-left: 0;
	font-style: italic;
	border-left: solid 5px hsl(0, 0%, 80%);
}
/* ckeditor5-media-embed/theme/mediaembed.css */
.ck-content .media {
	clear: both;
	margin: 1em 0;
	display: block;
	min-width: 15em;
}
```
