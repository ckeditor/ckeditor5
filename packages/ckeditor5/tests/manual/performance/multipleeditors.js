/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getPerformanceData, createPerformanceEditor, renderPerformanceDataButtons } from '../../_utils/utils.js';

const editorCount = 5;

renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ) );

const fixtures = getPerformanceData();
const editorsWrapper = document.getElementById( 'editors-wrapper' );
const buttons = document.querySelectorAll( '#test-controls button' );

for ( let i = 0; i < editorCount; i++ ) {
	const editorElement = document.createElement( 'div' );
	editorElement.setAttribute( 'id', `editor_${ i }` );
	editorsWrapper.appendChild( editorElement );
}

for ( const button of buttons ) {
	const fixtureName = button.getAttribute( 'data-file-name' );
	const content = fixtures[ fixtureName ];

	button.addEventListener( 'click', function() {
		for ( let i = 0; i < editorCount; i++ ) {
			const editorElement = document.querySelector( `#editor_${ i }` );
			editorElement.innerHTML = content;

			createPerformanceEditor( editorElement )
				.catch( err => {
					console.error( err.stack );
				} );
		}
	} );

	button.disabled = false;
}
