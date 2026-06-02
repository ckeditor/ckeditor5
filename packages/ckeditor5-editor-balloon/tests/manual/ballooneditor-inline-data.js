/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { BalloonEditor } from '../../src/ballooneditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

const container = document.querySelector( '.container' );

BalloonEditor
	.create( {
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		roots: {
			main: {
				initialData: '<h2>Editor</h2><p>This is an editor instance.</p>',
				modelElement: '$inlineRoot',
				element: { name: 'p' }
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
		container.appendChild( editor.ui.element );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
