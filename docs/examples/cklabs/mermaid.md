---
category: cklabs
order: 20
classes: main__content--no-toc
toc: false
meta-title: Mermaid-enabled editor
modified_at: 2023-05-26
---

# Mermaid-enabled editor

Mermaid is a JavaScript-based tool for creating flowcharts and diagram visualizations. It uses a syntax Markdown-inspired to create and dynamically modify flowcharts. You can also check out a live implementation in [GitHub Writer](https://ckeditor.com/blog/github-writer-now-available-with-mermaid-support/).

The example below lets you test creating diagrams and flowcharts on the go, right during the content creation &mdash; no more screenshots that need to be re-created and re-uploaded each time something needs a change!

{@snippet examples/mermaid}

## Quick command cheatsheet<!-- consider whether we need this, or just the article link -->

* `flowchart` &ndash; create a flowchart with straight lines
* `graph` &ndash; create a graph
* `TB` &ndash; top to bottom
* `BT` &ndash; bottom to top
* `LR` &ndash; left-right
* `RL` &ndash; right-left
* `-->` &ndash; arrow
* `-- text --` &ndash; straight line with text

Learn more about Mermaid syntax and usage in a [dedicated article](https://ckeditor.com/blog/basic-overview-of-creating-flowcharts-using-mermaid/) on our company blog.


## Editor example configuration

<details>
<summary>Editor configuration script</summary>
<!-- Let's consider removing parts of this -->

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Code } from '@ckeditor/ckeditor5-basic-styles';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { CKEditorInspector } from '@ckeditor/ckeditor5-inspector';

import Mermaid from '@ckeditor/ckeditor5-mermaid/src/mermaid';

ClassicEditor
	.create( document.querySelector( '#mermaid' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [
			CodeBlock,
			Code,
			PictureEditing,
			ImageResize,
			AutoImage,
			LinkImage,
			CKBox,
			Mermaid
		] ),
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic', 'code',
				'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'codeBlock', 'mermaid',
				'|', 'bulletedList', 'numberedList', 'todolist', 'outdent', 'indent'
			]
		},
		codeBlock: {
			languages: [
				{ language: 'plaintext', label: 'Plain text', class: '' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'python', label: 'Python' },
				{ language: 'mermaid', label: 'Mermaid' }
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
			ckbox: {
			// Provide correct configuration values to CKBox.
				tokenUrl: 'https://your.token.url',
			// Read more about CKBox - https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckbox.html.
			// For other image upload methods see the guide - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html.
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
