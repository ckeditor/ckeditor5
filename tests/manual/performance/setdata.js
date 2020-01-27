/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import { loadPerformanceData, createPerformanceEditor } from '../../_utils/utils';

createPerformanceEditor( document.querySelector( '#editor' ) )
	.then( loadPerformanceData )
	.then( fixtures => {
		const buttons = document.querySelectorAll( '#test-controls button' );

		for ( const button of buttons ) {
			button.addEventListener( 'click', function() {
				const content = fixtures[ this.getAttribute( 'data-file-name' ) ];

				window.editor.setData( content );
			} );
			button.disabled = false;
		}
	} );
