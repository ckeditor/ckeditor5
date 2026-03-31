/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CS_CONFIG, MultiRootEditor } from '@snippets/index.js';

MultiRootEditor
	.create(
		{
			removePlugins: [
				'CKBox'
			],
			cloudServices: CS_CONFIG,
			roots: {
				header: {
					element: document.querySelector( '#header' )
				},
				content: {
					element: document.querySelector( '#content' )
				},
				leftSide: {
					element: document.querySelector( '#left-side' )
				},
				rightSide: {
					element: document.querySelector( '#right-side' )
				}
			}
		}
	)
	.then( editor => {
		window.editor = editor;

		// Append toolbar to a proper container.
		const toolbarContainer = document.querySelector( '#toolbar' );
		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		// Make toolbar sticky when the editor is focused.
		editor.ui.focusTracker.on( 'change:isFocused', () => {
			if ( editor.ui.focusTracker.isFocused ) {
				toolbarContainer.classList.add( 'sticky' );
			} else {
				toolbarContainer.classList.remove( 'sticky' );
			}
		} );
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );
