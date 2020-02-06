/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, DataTransfer */

import { getPerformanceData, createPerformanceEditor, renderPerformanceDataButtons } from '../../_utils/utils';

renderPerformanceDataButtons( document.querySelector( '#fixture-buttons' ) );

createPerformanceEditor( document.querySelector( '#editor' ) )
	.then( editor => {
		const fixtures = getPerformanceData();
		const buttons = document.querySelectorAll( '#test-controls button' );

		for ( const button of buttons ) {
			button.addEventListener( 'click', function() {
				const fixtureHtml = fixtures[ this.getAttribute( 'data-file-name' ) ];

				const data = new DataTransfer();
				data.setData( 'text/html', fixtureHtml );

				editor.editing.view.document.fire( 'clipboardInput', {
					dataTransfer: data
				} );
			} );
			button.disabled = false;
		}
	} );
