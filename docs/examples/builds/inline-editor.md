---
category: examples-builds
order: 20
classes: main__content--no-toc
---

# Inline editor

{@link builds/guides/overview#inline-editor Inline editor} lets you create your content directly in its target location with the help of a floating toolbar that apprears when the editable text is focused.

In this example the {@link features/images-styles image styles} configuration was changed to enable left- and right-aligned images.

{@snippet examples/inline-editor}

## Source code

Check out the {@link builds/guides/quick-start#inline-editor Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there.

You can also view the HTML code of the above example here.

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/inline/ckeditor.js"></script>
</head>
<body>
<div id="snippet-inline-editor">
	<header data-inline-inject="true">
		<h2>Gone traveling</h2>
		<h3>Monthly travel news and inspiration</h3>
	</header>

	<div data-inline-inject="true">
		<h3>Destination of the Month</h3>

		<h4>Valletta</h4>

		<figure class="image image-style-align-right" style="width: 50%;">
			<img alt="Picture of a sunlit facade of a Maltan building." src="%BASE_PATH%/assets/img/malta.jpg" srcset="%BASE_PATH%/assets/img/malta.jpg, %BASE_PATH%/assets/img/malta_2x.jpg 2x">
			<figcaption>It's siesta time in Valletta.</figcaption>
		</figure>

		<p>The capital city of <a href="https://en.wikipedia.org/wiki/Malta" target="_blank" rel="external">Malta</a> is the top destination this summer. It’s home to a cutting-edge contemporary architecture, baroque masterpieces, delicious local cuisine and at least 8 months of sun. It’s also a top destination for filmmakers, so you can take a tour through locations familiar to you from Game of Thrones, Gladiator, Troy and many more.</p>
	</div>

	<div class="demo-row">
		<div class="demo-row__half">
			<div data-inline-inject="true">
				<h3>The three greatest things you learn from traveling</h3>
				<p><a href="#">Find out more</a></p>
			</div>
		</div>

		<div class="demo-row__half">
			<div data-inline-inject="true">
				<h3>Walking the capitals of Europe: Warsaw</h3>
				<p><a href="#">Find out more</a></p>
			</div>
		</div>
	</div>
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
