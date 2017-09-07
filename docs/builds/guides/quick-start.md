---
# Scope:
# * TL;DR I want to run CKEditor 5.

title: Quick start
category: builds-guides
order: 30
---

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

## Classic editor

In your HTML page add an element that CKEditor should replace:

```html
<textarea name="content" id="editor"></textarea>
```

Load CKEditor 5, the classic editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5-build-classic/{@var ckeditor5-version}/build/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.

```js
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
<html>
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5-build-classic/{@var ckeditor5-version}/build/ckeditor.js"></script>
</head>
<body>
	<h1>Classic editor</h1>
	<textarea name="content" id="editor">
		&lt;p&gt;This is some sample content.&lt;/p&gt;
	</textarea>
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

Load CKEditor 5, the inline editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5-build-inline/{@var ckeditor5-version}/build/ckeditor.js"></script>
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
<html>
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Inline editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5-build-inline/{@var ckeditor5-version}/build/ckeditor.js"></script>
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

## Balloon toolbar editor

In your HTML page add an element that CKEditor should make editable:

```html
<div id="editor"></div>
```

Load CKEditor 5, the balloon toolbar editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5-build-balloon-toolbar/{@var ckeditor5-version}/build/ckeditor.js"></script>
```

Call the {@link module:editor-balloon-toolbar/balloontoolbareditor~BalloonToolbarEditor#create `BalloonToolbarEditor.create()`} method.

```html
<script>
	BalloonToolbarEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

### Example

```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Balloon toolbar editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5-build-balloon-toolbar/{@var ckeditor5-version}/build/ckeditor.js"></script>
</head>
<body>
	<h1>Balloon toolbar editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		BalloonToolbarEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

## Next steps

Check the {@link builds/guides/integration/configuration Configuration guide} to learn how to configure the editor – e.g. change the default toolbar.
