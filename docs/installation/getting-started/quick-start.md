---
# Scope:
# - Guidance on all possible installation options.

category: getting-started
order: 10
modified_at: 2022-06-21
---

# Quick start

## Introduction

In this guide you will find the fastest and easiest way to run ready-to-use CKEditor 5 with minimal effort &ndash; running the editor from [CDN](https://cdn.ckeditor.com/). This is the fastest method that lets you set up a running copy of CKEditor 5 in literally seconds. CKEditor is hosted on servers spread across the globe &ndash; the scripts are loaded faster because they are served from the nearest locations to the end user. If the same version of CKEditor has already been downloaded (even on a different website), it is loaded from cache. Using CDN reduces the number of HTTP requests handled by your server so it speeds it up as well.

<info-box>
	Please bear in mind that the CDN solution only offers ready-to-use editor builds, hence it is not possible to add new plugins and the features available in the editor are preset.

	Should you need a more flexible solution, consider using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or try {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.
</info-box>

## Running a simple editor

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

Let us run a classic editor build as an example. In your HTML page add an element that CKEditor should replace:

```html
<div id="editor"></div>
```

Load the classic editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.

```html
<script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

### Sample implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
</head>
<body>
	<h1>Classic editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		ClassicEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

<info-box>
	This kind of installation will only provide features available in the build used.

	You can learn more about other available predefined editor builds in the {@link installation/advanced/predefined-builds dedicated builds guide}.
</info-box>

## Running a more advanced editor

The fastest way to run an advanced editor using the {@link features/index rich editing features offered by CKEditor 5} is using a superbuild. The superbuild, available instantly from CDN, is a preconfigured editor instance that offers access to all available plugins. Starting from that point and using the `removePlugins` configuration option, you can trim and customize the editor to your exact needs with minimal effort.

<info-box>
	Please consider, that the superbuild contains a really whole lot of code. A good portion of that code may not be needed in you implementation, so using the superbuild should rather be considered for evaluation purposes and for tests, than for production environment.

	We strongly advise using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source} to create efficient end-user solutions.
</info-box>

### Multiple editors

Text placeholder
### Superbuild

Text placeholder

<info-box hint>
**What's next?**

Congratulations, you have just run your first CKEditor 5 instance!

You can also try another simple installation method, like the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.

And if you use Angular, React or Vue.js and want to integrate CKEditor 5 in your application, refer to the {@link installation/frameworks/overview Frameworks section}.
</info-box>
