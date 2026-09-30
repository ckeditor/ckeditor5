/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { BalloonEditorExperimental } from './build-drag-drop-source.js';

BalloonEditorExperimental.create( {
	root: {
		placeholder: 'Drop the content here to test the feature.',
		element: document.querySelector( '#snippet-block-balloon-drag-drop' )
	}
} )
	.then( editor => {
		window.editorExperimentalBalloon = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
