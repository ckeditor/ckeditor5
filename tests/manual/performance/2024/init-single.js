/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import config from './config';
import allDataSets from './data/generated/index.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

const initialData = allDataSets.paragraphs();
const finalConfig = { initialData, ...config };
const editorElement = document.querySelector( '#editor' );

const startTime = window.performance.now();

ClassicEditor
	.create( editorElement, finalConfig )
	.then( () => {
		const testTime = window.performance.now() - startTime;

		console.log( testTime );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
