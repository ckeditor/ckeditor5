/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '../../../src/classiceditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

declare global {
	interface Window { editors: any }
}

const content = '<h2>Sticky toolbar</h2>' + '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'.repeat( 30 );

window.editors = [];

for ( const id of [ 'editor-scrollable', 'editor-page' ] ) {
	ClassicEditor
		.create( {
			attachTo: document.getElementById( id )!,
			initialData: content,
			plugins: [ ArticlePluginSet ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
		} )
		.then( editor => {
			window.editors.push( editor );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

const select = document.getElementById( 'wrapper-style' ) as HTMLSelectElement;

function applyWrapperStyle() {
	for ( const wrapper of document.querySelectorAll<HTMLElement>( '.wrapper' ) ) {
		wrapper.style.cssText = select.value;
	}
}

select.addEventListener( 'change', applyWrapperStyle );
applyWrapperStyle();
