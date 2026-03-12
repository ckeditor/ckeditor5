/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CKBox, PictureEditing, ImageResize, AutoImage, LinkImage } from 'ckeditor5';
import {
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { Mermaid } from '@ckeditor/ckeditor5-mermaid/dist/index.js';

import '@ckeditor/ckeditor5-mermaid/dist/index.css';

ClassicEditor
	.create( document.querySelector( '#mermaid' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [
			PictureEditing,
			ImageResize,
			AutoImage,
			LinkImage,
			CKBox,
			Mermaid
		] ),
		removePlugins: [ 'UploadImage' ],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'mermaid',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		cloudServices: CS_CONFIG,
		// A proper indentation is required for the Mermaid syntax to work.
		initialData: `<h2>CKEditor timeline diagram</h2>
<pre spellcheck="false"><code class="language-mermaid">timeline
title History of CKEditor
2003 : FCKeditor
2009 : CKEditor 3
2012 : CKEditor 4
2018 : CKEditor 5</code></pre>

<h2>Collaboration features mindmap</h2>
<pre spellcheck="false"><code class="language-mermaid">mindmap
  root((CKEditor 5<br>Collaboration))
    Change control
      Track changes
      Revision history
    Comments
      Comments archive
    Other tools
      Mentions
      User list</code></pre>`
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
