---
category: setup
menu-title: Content styles
meta-title: Content styles | CKEditor 5 Documentation
meta-description: Learn how to style the content produced by CKEditor 5 with CSS.
order: 90
modified_at: 2026-10-20
---

# Content styles

We distribute CKEditor&nbsp;5 with two types of styles:

* Editor styles for the editor's user interface &ndash; see the {@link getting-started/setup/editor-styles Editor styles} guide.
* Content styles for the content inside the editor &ndash; covered in this guide.

If you went through our {@link getting-started/integrations-cdn/quick-start Quick start}, you probably noticed that attaching the styles in JavaScript is pretty standard, and we provide CSS style sheets that have both the editor and content styles combined. There are separate styles for open-source and premium features:

```js
import 'ckeditor5/ckeditor5.css';

import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
```

It is as easy in HTML if you decide to use our CDN:

```html
<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />

<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
```

## Why do I need content styles?

Some {@link features/index core editor features} bring additional CSS to control the look of the content they produce. One such example is the {@link features/images-overview image feature}, which requires special content styles to render images and their captions within the content. Another would be the {@link features/block-quote block quote} feature that displays quotes in italics with a subtle border on the side. You can see both of these pictured below.

{@img assets/img/builds-content-styles.png 823 Editor content styles.}

## Customizing content styles

Content inside the editor is styled with [native CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties), so you can adjust its look without touching the source styles.

<info-box>
	If the editor runs inside a shadow root, load the style sheets into that root and override the variables on the shadow host instead of `:root`. See the {@link getting-started/setup/shadow-dom#overriding-css-variables Shadow DOM} guide for details.
</info-box>

### General content styling

CKEditor&nbsp;5 provides CSS variables to standardize font and line height styling across the content. These variables control the default appearance of text in the content. You can override them in the following way:

```css
:root {
	/* Override the default font family */
	--ck-content-font-family: "Roboto";

	/* Override the default font size */
	--ck-content-font-size: 16px;

	/* Override the default font color */
	--ck-content-font-color: hsl(225, 5%, 45.00%);

	/* Override the default line height */
	--ck-content-line-height: 2;
}
```

The general content CSS variables are listed in the table below. Each defaults to the value shown.

<table>
	<thead>
		<tr>
			<th scope="col">Variable</th>
			<th scope="col">Controls</th>
			<th scope="col">Default</th>
		</tr>
	</thead>
	<tbody>
		<tr><td><code>--ck-content-font-family</code></td><td>Content font family</td><td><code>Helvetica, Arial, Tahoma, Verdana, Sans-Serif</code></td></tr>
		<tr><td><code>--ck-content-font-size</code></td><td>Content font size</td><td><code>medium</code></td></tr>
		<tr><td><code>--ck-content-font-color</code></td><td>Content text color</td><td><code>#000</code></td></tr>
		<tr><td><code>--ck-content-line-height</code></td><td>Content line height</td><td><code>1.5</code></td></tr>
		<tr><td><code>--ck-content-word-break</code></td><td>Word breaking</td><td><code>normal</code></td></tr>
		<tr><td><code>--ck-content-overflow-wrap</code></td><td>Wrapping of long words</td><td><code>break-word</code></td></tr>
	</tbody>
</table>

### Feature-specific styling

Individual features also provide CSS variables for their specific styling needs. For example, to recolor the mentions' background and text:

```css
:root {
	--ck-content-mention-background: black;
	--ck-content-mention-text-color: white;
}
```

The content CSS variables are grouped by feature in the table below. Each defaults to the value shown; override it on `:root` (or on the shadow host when using the Shadow DOM) to restyle the published content.

<table>
	<thead>
		<tr>
			<th scope="col">Variable</th>
			<th scope="col">Controls</th>
			<th scope="col">Default</th>
		</tr>
	</thead>
	<tbody>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Block quote</th></tr>
		<tr><td><code>--ck-content-block-quote-border-color</code></td><td>Side border color</td><td><code>hsl(213, 40%, 90%)</code></td></tr>
		<tr><td><code>--ck-content-block-quote-border-width</code></td><td>Side border thickness</td><td><code>5px</code></td></tr>
		<tr><td><code>--ck-content-block-quote-border-style</code></td><td>Side border style</td><td><code>solid</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Code block</th></tr>
		<tr><td><code>--ck-content-code-block-text-color</code></td><td>Text color</td><td><code>hsl(0, 0%, 20.8%)</code></td></tr>
		<tr><td><code>--ck-content-code-block-background</code></td><td>Background</td><td><code>hsl(0, 0%, 96%)</code></td></tr>
		<tr><td><code>--ck-content-code-block-border-color</code></td><td>Border color</td><td><code>hsl(213, 40%, 90.2%)</code></td></tr>
		<tr><td><code>--ck-content-code-block-border-width</code></td><td>Border thickness</td><td><code>1px</code></td></tr>
		<tr><td><code>--ck-content-code-block-border-style</code></td><td>Border style</td><td><code>solid</code></td></tr>
		<tr><td><code>--ck-content-code-block-border-radius</code></td><td>Corner radius</td><td><code>2px</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Inline code</th></tr>
		<tr><td><code>--ck-content-inline-code-background-color</code></td><td>Background</td><td><code>hsla(0, 0%, 78%, 0.3)</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Font size</th></tr>
		<tr><td><code>--ck-content-font-size-tiny</code></td><td>"Tiny" font size</td><td><code>0.7em</code></td></tr>
		<tr><td><code>--ck-content-font-size-small</code></td><td>"Small" font size</td><td><code>0.85em</code></td></tr>
		<tr><td><code>--ck-content-font-size-big</code></td><td>"Big" font size</td><td><code>1.4em</code></td></tr>
		<tr><td><code>--ck-content-font-size-huge</code></td><td>"Huge" font size</td><td><code>1.8em</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Horizontal line</th></tr>
		<tr><td><code>--ck-content-horizontal-line-background</code></td><td>Line color</td><td><code>hsl(213, 40%, 90.2%)</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Image</th></tr>
		<tr><td><code>--ck-content-image-caption-background-color</code></td><td>Caption background</td><td><code>hsl(0, 0%, 97%)</code></td></tr>
		<tr><td><code>--ck-content-image-caption-text-color</code></td><td>Caption text color</td><td><code>hsl(0, 0%, 20%)</code></td></tr>
		<tr><td><code>--ck-content-image-style-spacing</code></td><td>Spacing around styled block images</td><td><code>1.5em</code></td></tr>
		<tr><td><code>--ck-content-inline-image-style-spacing</code></td><td>Spacing around styled inline images</td><td><code>calc(var(--ck-content-image-style-spacing) / 2)</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Media embed</th></tr>
		<tr><td><code>--ck-content-media-style-spacing</code></td><td>Spacing around styled media</td><td><code>1.5em</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Table</th></tr>
		<tr><td><code>--ck-content-table-border-color</code></td><td>Outer border color</td><td><code>hsl(0, 0%, 70%)</code></td></tr>
		<tr><td><code>--ck-content-table-border-width</code></td><td>Outer border thickness</td><td><code>1px</code></td></tr>
		<tr><td><code>--ck-content-table-border-style</code></td><td>Outer border style</td><td><code>double</code></td></tr>
		<tr><td><code>--ck-content-table-cell-border-color</code></td><td>Cell border color</td><td><code>hsl(0, 0%, 75%)</code></td></tr>
		<tr><td><code>--ck-content-table-cell-border-width</code></td><td>Cell border thickness</td><td><code>1px</code></td></tr>
		<tr><td><code>--ck-content-table-cell-border-style</code></td><td>Cell border style</td><td><code>solid</code></td></tr>
		<tr><td><code>--ck-content-table-header-background</code></td><td>Header cell background</td><td><code>hsla(0, 0%, 0%, 5%)</code></td></tr>
		<tr><td><code>--ck-content-table-caption-background-color</code></td><td>Caption background</td><td><code>hsl(0, 0%, 97%)</code></td></tr>
		<tr><td><code>--ck-content-table-caption-text-color</code></td><td>Caption text color</td><td><code>hsl(0, 0%, 20%)</code></td></tr>
		<tr><td><code>--ck-content-table-style-spacing</code></td><td>Spacing around styled tables</td><td><code>1.5em</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Mention</th></tr>
		<tr><td><code>--ck-content-mention-background</code></td><td>Mention background</td><td><code>hsla(341, 100%, 30%, 0.1)</code></td></tr>
		<tr><td><code>--ck-content-mention-text-color</code></td><td>Mention text color</td><td><code>hsl(341, 100%, 30%)</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Highlight</th></tr>
		<tr><td><code>--ck-content-highlight-marker-yellow</code></td><td>Yellow marker</td><td><code>hsl(60, 97%, 73%)</code></td></tr>
		<tr><td><code>--ck-content-highlight-marker-green</code></td><td>Green marker</td><td><code>hsl(120, 93%, 68%)</code></td></tr>
		<tr><td><code>--ck-content-highlight-marker-pink</code></td><td>Pink marker</td><td><code>hsl(345, 96%, 73%)</code></td></tr>
		<tr><td><code>--ck-content-highlight-marker-blue</code></td><td>Blue marker</td><td><code>hsl(201, 97%, 72%)</code></td></tr>
		<tr><td><code>--ck-content-highlight-pen-red</code></td><td>Red pen</td><td><code>hsl(0, 85%, 49%)</code></td></tr>
		<tr><td><code>--ck-content-highlight-pen-green</code></td><td>Green pen</td><td><code>hsl(112, 100%, 27%)</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">Page break</th></tr>
		<tr><td><code>--ck-content-page-break-line-color</code></td><td>Line color</td><td><code>hsl(0, 0%, 77%)</code></td></tr>
		<tr><td><code>--ck-content-page-break-line-width</code></td><td>Line thickness</td><td><code>2px</code></td></tr>
		<tr><td><code>--ck-content-page-break-line-style</code></td><td>Line style</td><td><code>dashed</code></td></tr>
		<tr><td><code>--ck-content-page-break-label-text-color</code></td><td>Label text color</td><td><code>hsl(0, 0%, 20%)</code></td></tr>
		<tr><td><code>--ck-content-page-break-label-background</code></td><td>Label background</td><td><code>hsl(0, 0%, 100%)</code></td></tr>
		<tr><td><code>--ck-content-page-break-label-border-color</code></td><td>Label border color</td><td><code>hsl(0, 0%, 77%)</code></td></tr>
		<tr><td><code>--ck-content-page-break-label-border-width</code></td><td>Label border thickness</td><td><code>1px</code></td></tr>
		<tr><td><code>--ck-content-page-break-label-border-style</code></td><td>Label border style</td><td><code>solid</code></td></tr>
		<tr><td><code>--ck-content-page-break-label-shadow-color</code></td><td>Label shadow color</td><td><code>hsla(0, 0%, 0%, 0.15)</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">To-do list</th></tr>
		<tr><td><code>--ck-content-todo-list-checkmark-size</code></td><td>Checkbox size</td><td><code>16px</code></td></tr>
		<tr><td><code>--ck-content-todo-list-checkmark-border-color</code></td><td>Checkbox border color</td><td><code>hsl(0, 0%, 20%)</code></td></tr>
		<tr><td><code>--ck-content-todo-list-checkmark-checked-background</code></td><td>Checked background</td><td><code>hsl(126, 64%, 41%)</code></td></tr>
		<tr><td><code>--ck-content-todo-list-checkmark-checked-border-color</code></td><td>Checked border color</td><td><code>hsl(126, 64%, 41%)</code></td></tr>
		<tr><td><code>--ck-content-todo-list-checkmark-tick-border-color</code></td><td>Tick mark color</td><td><code>hsl(0, 0%, 100%)</code></td></tr>
		<tr><th colspan="3" scope="colgroup" style="text-align: left;">List marker</th></tr>
		<tr><td><code>--ck-content-list-marker-color</code></td><td>Marker color</td><td><code>var(--ck-content-font-color)</code></td></tr>
		<tr><td><code>--ck-content-list-marker-font-family</code></td><td>Marker font family</td><td><code>var(--ck-content-font-family)</code></td></tr>
		<tr><td><code>--ck-content-list-marker-font-size</code></td><td>Marker font size</td><td><code>var(--ck-content-font-size)</code></td></tr>
	</tbody>
</table>

<info-box>
	The table caption, image caption, and mention variables were renamed in v49.x to follow a single naming convention. The former `--ck-content-color-table-caption-*`, `--ck-content-color-image-caption-*`, and `--ck-content-color-mention-*` names still work as fallbacks but are deprecated. See the {@link updating/update-to-49 Update to v49.x} guide.

	The defaults of these renamed variables are still declared under the former names, so the new names work as override points only. If your own CSS reads one of them with `var()` and you have not set it, the value is empty. Set the variable first, or read the former name to get the default.
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

<link rel="stylesheet" href="path/to/assets/ckeditor5-premium-features-content.css">

<link rel="stylesheet" href="path/to/assets/styles.css">
```

The final setup depends on how your application is structured. As mentioned earlier, you can use our CDN, or your JS bundler already creates and serves combined style sheets. Choose the solution that works best for your case.

<info-box important>
	If you take a closer look at the content styles, you may notice they are prefixed with the `.ck-content` class selector. This narrows their scope when used in CKEditor&nbsp;5 so they do not affect the rest of the application. To use them in the front–end, **you will have to** add the `ck-content` CSS class to the container of your content. Otherwise, the styles will not be applied.
</info-box>

## Optimizing the size of style sheets

The `ckeditor5` package distributes three style sheets:

* `ckeditor5.css` &ndash; combined editor and content styles,
* `ckeditor5-content.css` &ndash; only content styles,
* `ckeditor5-editor.css` &ndash; only editor styles.

The same is true for the `ckeditor5-premium-features` package, but the filenames are different:

* `ckeditor5-premium-features.css` &ndash; combined editor and content styles,
* `ckeditor5-premium-features-content.css` &ndash; only content styles,
* `ckeditor5-premium-features-editor.css` &ndash; only editor styles.

However, these style sheets include styles for **all** editor plugins. If you want to optimize the size of the style sheet, to only include styles for the plugins you use, you can follow the {@link getting-started/setup/optimizing-build-size#styles Optimizing build size} guide.
