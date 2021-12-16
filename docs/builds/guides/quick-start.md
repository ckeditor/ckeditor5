---
# Scope:
# * TL;DR I want to run CKEditor 5.

category: builds-predefined
order: 30
---

# Quick start

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

<info-box>
	There are other installation and integration methods available. For more information check {@link builds/guides/integration/installation Installation} and {@link builds/guides/integration/basic-api Basic API} guides.
</info-box>

## Classic editor

In your HTML page add an element that CKEditor should replace:

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

### Example

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

## Inline editor

In your HTML page add an element that CKEditor should make editable:

```html
<div id="editor"></div>
```

Load the inline editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/inline/ckeditor.js"></script>
```

Call the {@link module:editor-inline/inlineeditor~InlineEditor#create `InlineEditor.create()`} method.

```html
<script>
	InlineEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Inline editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/inline/ckeditor.js"></script>
</head>
<body>
	<h1>Inline editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		InlineEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

## Balloon editor

In your HTML page add an element that CKEditor should make editable:

```html
<div id="editor"></div>
```

Load the balloon editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon/ckeditor.js"></script>
```

Call the {@link module:editor-balloon/ballooneditor~BalloonEditor#create `BalloonEditor.create()`} method.

```html
<script>
	BalloonEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Balloon editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon/ckeditor.js"></script>
</head>
<body>
	<h1>Balloon editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		BalloonEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

## Balloon block editor

In your HTML page add an element that CKEditor should make editable:

```html
<div id="editor"></div>
```

Load the balloon block editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon-block/ckeditor.js"></script>
```

Call the {@link module:editor-balloon/ballooneditor~BalloonEditor#create `BalloonEditor.create()`} method.

```html
<script>
	BalloonEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

**Note:** You can configure the block toolbar items using the {@link module:core/editor/editorconfig~EditorConfig#blockToolbar `config.blockToolbar`} option.

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Balloon block editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon-block/ckeditor.js"></script>
</head>
<body>
	<h1>Balloon editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		BalloonEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

## Document editor

Load the document editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/decoupled-document/ckeditor.js"></script>
```

Call the {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method. The decoupled editor requires you to inject the toolbar into the DOM and the best place to do that is somewhere in the promise chain (e.g. one of the `then( () => { ... } )` blocks).

<info-box>
	The following snippet will run the document editor but to make the most of it check out the {@link framework/guides/document-editor comprehensive tutorial} which explains step—by—step how to configure and style the application for the best editing experience.
</info-box>

```html
<script>
	DecoupledEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			const toolbarContainer = document.querySelector( '#toolbar-container' );

			toolbarContainer.appendChild( editor.ui.view.toolbar.element );
		} )
		.catch( error => {
			console.error( error );
		} );
</script>
```

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Document editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/decoupled-document/ckeditor.js"></script>
</head>
<body>
	<h1>Document editor</h1>

	<!-- The toolbar will be rendered in this container. -->
	<div id="toolbar-container"></div>

	<!-- This container will become the editable. -->
	<div id="editor">
		<p>This is the initial editor content.</p>
	</div>

	<script>
		DecoupledEditor
			.create( document.querySelector( '#editor' ) )
			.then( editor => {
				const toolbarContainer = document.querySelector( '#toolbar-container' );

				toolbarContainer.appendChild( editor.ui.view.toolbar.element );
			} )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

## Next steps

Check the {@link builds/guides/integration/configuration Configuration guide} to learn how to configure the editor &mdash; for example, change the default toolbar.
