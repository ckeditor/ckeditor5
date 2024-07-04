---
category: features
meta-title: Mermaid flowcharts and diagrams example | CKEditor 5 Documentation
menu-title: Mermaid flowcharts and diagrams
modified_at: 2023-06-14
---

# Creating flowcharts and diagrams using Mermaid

You can create flowcharts and diagrams in CKEditor&nbsp;5 thanks to the experimental integration with the [Mermaid](https://mermaid.js.org/) library. Mermaid uses a Markdown-inspired syntax to create and dynamically modify flowcharts, Gantt diagrams, pie or quadrant charts, graphs, mindmaps, and more.

<info-box warning>
	This is an **experimental feature**, and as such it is not recommended for production use. For more information, comments, and feature requests, please refer to the [package repository on GitHub](https://github.com/ckeditor/ckeditor5-mermaid).
</info-box>

## Demo

The example below lets you test creating diagrams and flowcharts right during the content creation &ndash; no more screenshots that need to be re-created and re-uploaded each time something needs a change! You can also check out a live implementation in [GitHub Writer](https://ckeditor.com/blog/github-writer-now-available-with-mermaid-support/).

{@snippet features/mermaid}

## Using Mermaid syntax

Mermaid offers an extensive and flexible syntax allowing users to create a variety of diagrams, charts, and graphs. Find the complete syntax reference on [Mermaid.js](https://mermaid.js.org/intro/). You can also check out more examples online in [Mermaid Live Editor](https://mermaid.live/).

Learn more about Mermaid syntax and usage in a [dedicated article](https://ckeditor.com/blog/basic-overview-of-creating-flowcharts-using-mermaid/) on our company blog.

## Installation

<infobox>
	Please note that this plugin is not imported from the main CKEditor&nbsp;5 file, but from its own package.
</infobox>

After {@link getting-started/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration. Please note, that unlike native CKEditor&nbsp;5 plugins, this one is imported from its own package. Also, that this import is different than the standard CKEditor&nbsp;5 plugins import:

```js
import { ClassicEditor } from 'ckeditor5';
import { Mermaid } from '@ckeditor/ckeditor5-mermaid/dist/index.js';

import '@ckeditor/ckeditor5-mermaid/dist/index.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Mermaid, /* ... */ ],
		toolbar: [ 'mermaid', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
