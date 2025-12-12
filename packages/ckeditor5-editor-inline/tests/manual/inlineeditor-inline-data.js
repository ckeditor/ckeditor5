/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { InlineEditor } from '../../src/inlineeditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

const container = document.querySelector( '.container' );

InlineEditor
	.create( '<h2>Editor</h2><p>This is an editor instance.</p>', {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		modelRootElementName: '$inlineRoot',
		viewRootElementName: 'h3'
	} )
	.then( editor => {
		window.editor = editor;
		container.appendChild( editor.ui.element );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
