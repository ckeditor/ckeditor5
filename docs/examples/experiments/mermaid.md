---
category: experiments
order: 20
classes: main__content--no-toc
toc: false
meta-title: Flowcharts and diagrams in a Mermaid-enabled editor
menu-title: Creating flowcharts and diagrams
modified_at: 2023-05-26
---

# Creating flowcharts and diagrams using Mermaid

Mermaid is a JavaScript-based tool for creating flowcharts and diagram visualizations. It uses a Markdown-inspired syntax to create and dynamically modify flowcharts, Gantt diagrams, pie charts, graphs, mindmaps, and others. 

The example below lets you test creating diagrams and flowcharts on the go, right during the content creation &mdash; no more screenshots that need to be re-created and re-uploaded each time something needs a change! You can also check out a live implementation in [GitHub Writer](https://ckeditor.com/blog/github-writer-now-available-with-mermaid-support/).

{@snippet examples/mermaid}

## Using Mermaid syntax

Mermaid offers an extensive and flexible syntax allowing users to create a variety of diagrams, charts, and graphs. Find the full syntax reference on [Mermaid.js](https://mermaid.js.org/intro/). You can also check out more examples online on [Mermaid Live Editor](https://mermaid.live/).

<!-- Learn more about Mermaid syntax and usage in a [dedicated article](https://ckeditor.com/blog/basic-overview-of-creating-flowcharts-using-mermaid/) on our company blog. -->

## Editor example configuration

This example demo uses our won Mermaid package, [available on GitHub](https://github.com/ckeditor/ckeditor5-mermaid). It needs to be imported before CKEditor 5 can make use of the Mermaid syntax. Have a look at the sample configuration to learn how to add the package and the toolbar button.

<details>
<summary>Editor configuration script</summary>
<!-- Let's consider removing parts of this -->

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
				'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'mermaid',
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
		CKEditorInspector.attach( editor );
		window.console.log( 'CKEditor 5 is ready.', editor );
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
		Sample mermaid code goes here.
	</code></pre>

</div>
```

</details>
