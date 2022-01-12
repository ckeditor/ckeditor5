/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document */

import { getPerformanceData, createPerformanceEditor, renderPerformanceDataButtons } from '../../_utils/utils';

renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ) );

const fixtures = getPerformanceData();
const buttons = document.querySelectorAll( '#test-controls button' );

for ( const button of buttons ) {
	const fixtureName = button.getAttribute( 'data-file-name' );
	const content = fixtures[ fixtureName ];
	const editorElement = document.querySelector( `#editor_${ fixtureName }` );

	// Put the source content in editor-related elements ahead of time, so that potentially
	// big `innerHTML` change does not affect the benchmark when pressing the button.
	editorElement.innerHTML = content;

	button.addEventListener( 'click', function() {
		createPerformanceEditor( editorElement )
			.catch( err => {
				console.error( err.stack );
			} );
	} );

	button.disabled = false;
}

