---
# Scope:
# * TL;DR I want to run CKEditor 5.

title: Quick start
category: builds-guides
order: 30
---

Creating an editor using CKEditor 5 build is very simple and in short can be described in two steps:
 
1. Load the desired editor via `<script>` tag.
2. Call the static `create` method to create the editor.

## Classic editor

In your HTML page add an element that CKEditor should replace:
```
<textarea name="editor1" id="text-editor"></textarea>
```

Load CKEditor 5, the classic editor build (here [CDN](https://cdn.ckeditor.com/) location is used):
```
<script src="https://cdn.ckeditor.com/ckeditor5-build-classic/{@var ckeditor5-version}/build/ckeditor.js"></script>
```

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.
```
<script>
	ClassicEditor.create( document.querySelector( '#text-editor' ) );
</script>
```

### Example

```
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5-build-classic/{@var ckeditor5-version}/build/ckeditor.js"></script>
</head>
<body>
<h1>Classic editor</h1>
<textarea name="editor1" id="text-editor"></textarea>
<script>
	ClassicEditor.create( document.querySelector( '#text-editor' ) );
</script>
</body>
</html>
```

## Inline editor

In your HTML page add an element that CKEditor should make editable:
```
<div id="text-editor"></div>
```

Load CKEditor 5, the inline editor build (here [CDN](https://cdn.ckeditor.com/) location is used):
```
<script src="https://cdn.ckeditor.com/ckeditor5-build-inline/{@var ckeditor5-version}/build/ckeditor.js"></script>
```

Call the {@link module:editor-inline/inlineeditor~InlineEditor#create `InlineEditor.create()`} method.
```
<script>
	InlineEditor.create( document.querySelector( '#text-editor' ) );
</script>
```

### Example

```
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Inline editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5-build-inline/{@var ckeditor5-version}/build/ckeditor.js"></script>
</head>
<body>
<h1>Inline editor</h1>
<div id="text-editor">This is some sample content.</div>
<script>
	InlineEditor.create( document.querySelector( '#text-editor' ) );
</script>
</body>
</html>
```
## Balloon toolbar editor

In your HTML page add an element that CKEditor should make editable:
```
<div id="text-editor"></div>
```

Load CKEditor 5, the balloon toolbar editor build (here [CDN](https://cdn.ckeditor.com/) location is used):
```
<script src="https://cdn.ckeditor.com/ckeditor5-build-balloon-toolbar/{@var ckeditor5-version}/build/ckeditor.js"></script>
```

Call the {@link module:editor-balloon-toolbar/balloontoolbareditor~BalloonToolbarEditor#create `BalloonToolbarEditor.create()`} method.
```
<script>
	BalloonToolbarEditor.create( document.querySelector( '#text-editor' ) );
</script>
```

### Example

```
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Balloon toolbar editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5-build-balloon-toolbar/{@var ckeditor5-version}/build/ckeditor.js"></script>
</head>
<body>
<h1>Balloon toolbar editor</h1>
<div id="text-editor">This is some sample content.</div>
<script>
	BalloonToolbarEditor.create( document.querySelector( '#text-editor' ) );
</script>
</body>
</html>
```

## Next steps

Check the {@link builds/guides/integration/configuration Configuration guide} to learn how to configure the editor, e.g. change the default toolbar.