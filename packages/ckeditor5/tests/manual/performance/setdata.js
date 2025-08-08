/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getPerformanceData, createPerformanceEditor, renderPerformanceDataButtons } from '../../_utils/utils.js';

renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ) );

createPerformanceEditor( document.querySelector( '#editor' ) )
	.then( editor => {
		const fixtures = getPerformanceData();
		const buttons = document.querySelectorAll( '#test-controls button' );

		for ( const button of buttons ) {
			button.addEventListener( 'click', function() {
				const content = fixtures[ this.getAttribute( 'data-file-name' ) ];

				editor.setData( content );
			} );
			button.disabled = false;
		}
	} );
