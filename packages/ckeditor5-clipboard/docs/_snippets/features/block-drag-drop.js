/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals ClassicEditorExperimental, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditorExperimental.create(
	document.querySelector( '#snippet-block-drag-drop' ),
	{
		placeholder: 'Drop the content here to test the feature.',
		cloudServices: CS_CONFIG
	}
)
	.then( editor => {
		window.editorExperimental = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
