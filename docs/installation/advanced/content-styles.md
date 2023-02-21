---
# Scope:
# * Explain what content styles are and how to use them.
# * Offer developers a way to obtain the editor content styles.

category: advanced
order: 30
---

# Content styles

Some of the {@link features/index core editor features} bring additional CSS to control the look of the content they produce. Take, for example, the {@link features/images-overview image feature} that needs special content styles to render images and their captions in the content. Or the {@link module:block-quote/blockquote~BlockQuote block quote} feature that displays quotes in italic with a subtle border on the side.

{@img assets/img/builds-content-styles.png 823 Editor content styles.}

Content styles are bundled along with editor UI styles and, together with the JavaScript code of CKEditor 5, they create a monolithic structure called an {@link installation/getting-started/predefined-builds#available-builds editor build}. By default, content styles are inseparable from the rest of the editor which means there is no CSS file containing them you could take straight from the editor and use in your application (as opposed to the CKEditor 4 `contents.css` file). To get the editor content styles, for instance, for the front–end of your application, you will have to take additional steps described in this guide.

## Sharing content styles between front–end and back–end

By default, content styles are loaded by the editor JavaScript which makes them only present when users edit their content and this, in turn, usually takes place in the back–end of an application. If you want to use the same styles in the front–end, you may find yourself in a situation that requires you to load CKEditor just for that purpose, which is (performance–wise) not the best idea.

To avoid unnecessary dependencies in your front–end, use a stylesheet with a complete list of CKEditor 5 content styles used by all editor features. There are two ways to obtain it:

* By taking it directly from [this guide](#the-full-list-of-content-styles) and saving it as a static resource in your application (e.g. `content-styles.css`) (**recommended**).
* By generating it using a dedicated script. Learn more in the {@link framework/contributing/development-environment#generating-content-styles Development environment} guide.

Load the `content-styles.css` file in your application by adding the following code to the template:

```html
<link rel="stylesheet" href="path/to/assets/content-styles.css" type="text/css">
```

The content in the front–end of your application should now look the same as when edited by the users.

<info-box warning>
	**Important!**

	If you take a closer look at the content styles, you may notice they are prefixed with the `.ck-content` class selector. This narrows their scope when used in CKEditor 5 so they do not affect the rest of the application. To use them in the front–end, **you will have to** add the `ck-content` CSS class to the container of your content. Otherwise the styles will not be applied.
</info-box>

<info-box>
	If you are not afraid to get your hands dirty, you can always create a custom CKEditor 5 build from the source code with **all** the CSS (both UI and the content) extracted to a separate file. See how to do that in a {@link installation/advanced/integrating-from-source-webpack#option-extracting-css dedicated guide}.
</info-box>

## The full list of content styles

Below there is a full list of content styles used by the editor features. You can copy it and use straight in your project. **Make sure to add the `ck-content` class to your content container for the styles to work** ([see above](#sharing-content-styles-between-frontend-and-backend)).

```css
{@exec ../scripts/docs/read-content-styles-file.js}
```
