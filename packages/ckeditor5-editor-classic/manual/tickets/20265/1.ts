/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '../../../src/classiceditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

declare global {
	interface Window { editors: any }
}

const content = Array.from( { length: 40 }, ( item, index ) => `<p>Line ${ index + 1 }</p>` ).join( '' );

window.editors = {};

for ( const id of [ 'editor-container', 'editor-nested', 'editor-scrollable-editable', 'editor-small' ] ) {
	ClassicEditor
		.create( {
			attachTo: document.getElementById( id )!,
			initialData: content,
			plugins: [ ArticlePluginSet ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
		} )
		.then( editor => {
			window.editors[ id ] = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
