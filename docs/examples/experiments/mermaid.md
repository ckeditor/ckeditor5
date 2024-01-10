---
category: experiments
order: 20
classes: main__content--no-toc
toc: false
meta-title: Mermaid flowcharts and diagrams example | CKEditor 5 Documentation
menu-title: Flowcharts and diagrams
modified_at: 2023-06-14
---

# Creating flowcharts and diagrams using Mermaid

You can create flowcharts and diagrams in CKEditor&nbsp;5 thanks to the experimental integration with the [Mermaid](https://mermaid.js.org/) library. Mermaid uses a Markdown-inspired syntax to create and dynamically modify flowcharts, Gantt diagrams, pie or quadrant charts, graphs, mindmaps, and more.

The example below lets you test creating diagrams and flowcharts right during the content creation &ndash; no more screenshots that need to be re-created and re-uploaded each time something needs a change! You can also check out a live implementation in [GitHub Writer](https://ckeditor.com/blog/github-writer-now-available-with-mermaid-support/).

{@snippet examples/mermaid}

## Using Mermaid syntax

Mermaid offers an extensive and flexible syntax allowing users to create a variety of diagrams, charts, and graphs. Find the complete syntax reference on [Mermaid.js](https://mermaid.js.org/intro/). You can also check out more examples online in [Mermaid Live Editor](https://mermaid.live/).

<!-- Learn more about Mermaid syntax and usage in a [dedicated article](https://ckeditor.com/blog/basic-overview-of-creating-flowcharts-using-mermaid/) on our company blog. -->

## Editor example configuration

This example uses our own Mermaid plugin, [available on GitHub](https://github.com/ckeditor/ckeditor5-mermaid). You need to import it before CKEditor&nbsp;5 can use the Mermaid syntax. Look at the sample configuration to learn how to add the plugin and the toolbar button.

<details>
<summary>Editor configuration script</summary>

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import Mermaid from '@ckeditor/ckeditor5-mermaid/src/mermaid';

ClassicEditor
	.create( document.querySelector( '#mermaid' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [
			Mermaid
		] ),
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'mermaid',
				'|', 'bulletedList', 'numberedList', 'todolist', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

</details>

<details>
<summary>Editor content listing</summary>

```html
<div id="mermaid">

	<p>Sample editor data</p>
	<pre spellcheck="false"><code class="language-mermaid">
		Sample Mermaid code goes here.
	</code></pre>

</div>
```

</details>
