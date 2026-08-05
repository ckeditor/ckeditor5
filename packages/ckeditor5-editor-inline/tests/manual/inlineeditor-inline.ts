/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { InlineEditor } from '../../src/inlineeditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

declare global {
	interface Window { editor: any }
}

InlineEditor
	.create( {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		roots: {
			main: {
				element: document.querySelector( '#editor' ) as HTMLElement,
				modelElement: '$inlineRoot'
			}
		}
	} )
	.then( editor => {
		console.log( 'Editor has been initialized', editor );
		console.log( 'It has been added to global `editors` and `editables`.' );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
