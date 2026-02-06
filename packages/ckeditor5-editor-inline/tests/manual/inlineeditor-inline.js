/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { InlineEditor } from '../../src/inlineeditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

InlineEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		modelRootElementName: '$inlineRoot',
		viewRootElementName: 'h2' // TODO this is ignored as original element is reused
	} )
	.then( editor => {
		console.log( 'Editor has been initialized', editor );
		console.log( 'It has been added to global `editors` and `editables`.' );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
