/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CS_CONFIG } from '@snippets/index.js';
import { BalloonEditorExperimental } from './build-drag-drop-source.js';

BalloonEditorExperimental.create(
	document.querySelector( '#snippet-block-balloon-drag-drop' ),
	{
		placeholder: 'Drop the content here to test the feature.',
		cloudServices: CS_CONFIG
	}
)
	.then( editor => {
		window.editorExperimentalBalloon = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
