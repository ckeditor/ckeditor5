---
category: examples-builds
order: 40
toc: false
classes: main__content--no-toc
---

# Balloon block editor

{@link installation/advanced/predefined-builds#balloon-block-editor Balloon block editor} lets you create your content directly in its target location with the help of two toolbars:

* a balloon toolbar that appears next to the selected editable document element (offering inline content formatting tools),
* a {@link features/blocktoolbar block toolbar} accessible using a button attached to the editable content area and following the selection in the document (bringing additional block formatting tools).

{@snippet examples/balloon-block-editor}

## Editor example configuration

Check out the {@link installation/advanced/predefined-builds#installation-example-4 Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js

import BalloonEditor from '@ckeditor/ckeditor5-build-balloon-block/src/ckeditor';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

BalloonEditor
	.create( document.querySelector( '#snippet-balloon-block-editor' ), {
        cloudServices: {
                    // PROVIDE CORRECT VALUES HERE:
                    tokenUrl: 'https://example.com/cs-token-endpoint',
                    uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/',
                    webSocketUrl: 'your-organization-id.cke-cs.com/ws/'
                },
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

```

</details>

<details>
<summary>View editor content listing</summary>

```html
<div id="snippet-balloon-block-editor">
	<h2>Taj Mahal: A breathtaking ode to love</h2>

	<figure class="image image-style-side" height="400">
		<img src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/tajmahal.jpg" alt="Taj Mahal illustration.">
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

```

</details>
