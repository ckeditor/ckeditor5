---
category: examples-builds
order: 30
classes: main__content--no-toc
---

# Balloon block editor

{@link builds/guides/overview#balloon-block-editor Balloon block editor} lets you create your content directly in its target location with the help of two toolbars:

* a balloon toolbar that appears next to the selected editable document element (offering inline content formatting tools),
* a {@link features/blocktoolbar block toolbar} accessible using a button attached to the editable content area and following the selection in the document (bringing additional block formatting tools).

{@snippet examples/balloon-block-editor}

## Source code

Check out the {@link builds/guides/quick-start#balloon-block-editor Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there.

You can also view the HTML code of the above example here.

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon-block/ckeditor.js"></script>
</head>
<body>
<div id="snippet-balloon-block-editor">
	<h2>Taj Mahal: A breathtaking ode to love</h2>

	<figure class="image image-style-side" height="400">
		<img src="%BASE_PATH%/assets/img/tajmahal.jpg" srcset="%BASE_PATH%/assets/img/tajmahal.jpg, %BASE_PATH%/assets/img/tajmahal_2x.jpg 2x" alt="Taj Mahal illustration.">
		<figcaption>Taj Mahal with its poetic white marble tomb</figcaption>
	</figure>

	<p>No trip to India is complete without visiting this spectacular monument, <a href="https://en.wikipedia.org/wiki/New7Wonders_of_the_World"><strong>counted among the Seven Wonders of the World</strong></a>.
	</p>

	<p>Tourists frequently admit that Taj Mahal "simply cannot be described with words". And that’s probably true. The more you try the more speechless you become. Words give only a semblance of truth. The real truth about its beauty is revealed when you adore <strong>different shades of “Taj” depending on the time of the day</strong> or when you admire the exquisite inlay work in different corners of the façade.</p>

	<h3>Masterpiece of the world’s heritage</h3>

	<p>Taj Mahal is a mausoleum built in Agra between 1631 and 1648 by Emperor Shah Jahan <strong>in the memory of his beloved wife</strong>, Mumtaz Mahal, whose body lies there. It took 20 000 workers to complete and the excellence of this building is visible in every brick.</p>

	<p>In 1983, Taj Mahal was appointed <a href="https://en.wikipedia.org/wiki/World_Heritage_Site">UNESCO World Heritage Site</a> for being "the jewel of Muslim art in India and one of the universally admired masterpieces of the world's heritage".</p>

	<p>If you like having a methodology for visiting historical places, here are the four elements on which we recommend to focus your attention:</p>

	<ul>
		<li>The tomb</li>
		<li>The Decorations</li>
		<li>The Garden</li>
		<li>The Outlying buildings</li>
	</ul>

	<p>The tomb is what immediately catches your eyesight. The <strong>white and soft marble</strong> embroidered with stones leaves you totally enchanted.</p>
</div>

<style>
	/* Restrict the width of the editor to isolate it from the content of the guide. */
	#snippet-balloon-block-editor {
		margin-left: 5%;
		margin-right: 5%;
	}
</style>

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
