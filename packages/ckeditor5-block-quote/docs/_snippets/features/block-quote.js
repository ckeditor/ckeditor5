/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';
import { BlockQuoteEditor } from './block-quote-source.js';

BlockQuoteEditor
	.create( document.querySelector( '#snippet-block-quote' ) )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Block quote' ),
			text: 'Click to insert a block quote.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
