/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import config from '../../_utils/performance-config.js';
import dataSet from '../../_data/data-sets/mixed.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

const initialData = dataSet();
const finalConfig = { initialData, ...config };
const editorElement = document.querySelector( '#editor' );

function startTest() {
	const startTime = window.performance.now();

	ClassicEditor
		.create( editorElement, finalConfig )
		.then( editor => {
			const testTime = window.performance.now() - startTime;

			console.log( testTime );

			window._editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

document.getElementById( 'btnStart' ).addEventListener( 'click', () => {
	document.getElementById( 'btnStart' ).remove();

	startTest();
} );
