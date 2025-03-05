---
category: installation-methods
menu-title: (Legacy) Quick start
meta-title: Quick start | Legacy CKEditor 5 documentation
order: 10
modified_at: 2022-06-27
---

# (Legacy) Quick start

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you are looking for current CKEditor 5 installation instructions, please refer to the newest version of the {@link getting-started/integrations-cdn/quick-start CKEditor&nbsp;5 Quick Start} guide.
</info-box>

## Introduction

In this guide, you will find the quickest and easiest way to run ready-to-use CKEditor&nbsp;5 with minimal effort &ndash; by running the editor from [CDN](https://cdn.ckeditor.com/).

## Running a simple editor

Creating an editor using a CKEditor&nbsp;5 build is simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

Let us run a classic editor build as an example. In your HTML page add an element that will serve as a placeholder for a CKEditor instance:

```html
<div id="editor"></div>
```

Load the classic editor build (here a [CDN](https://cdn.ckeditor.com/) location is used).

```html
<script src="https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method to display the editor.

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

A full web page with embedded CKEditor&nbsp;5 from this example would look like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js"></script>
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
</info-box>

## Running a full-featured editor from CDN

The fastest way to run an advanced editor using the {@link features/index rich editing features offered by CKEditor&nbsp;5} is using a superbuild. The superbuild, available instantly from CDN, is a pre-configured package that offers access to almost all available plugins and all predefined editor types.

<info-box>
	The superbuild contains a lot of code. A good portion of that code may not be needed in your implementation. Using the superbuild should be considered for evaluation purposes and tests rather than for the production environment.

	We strongly advise using the {@link getting-started/legacy-getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} approach or {@link getting-started/legacy-getting-started/quick-start-other#building-the-editor-from-source building the editor from source} to create customized and efficient production-environment solutions.
</info-box>

## Running a full-featured editor with Premium features

If you would like to quickly evaluate CKEditor&nbsp;5 with premium features such as real-time collaboration, track changes, and revision history, sign up for a [14-day free trial](https://portal.ckeditor.com/checkout?plan=free).

After you sign up, in the customer dashboard you will find the full code snippet to run the editor with premium features with all the necessary configurations.
