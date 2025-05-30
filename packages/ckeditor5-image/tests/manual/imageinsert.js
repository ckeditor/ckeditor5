/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder.js';
import ImageInsert from '../../src/imageinsert.js';
import AutoImage from '../../src/autoimage.js';

async function createEditor( elementId, imageType ) {
	const editor = await ClassicEditor.create( document.querySelector( '#' + elementId ), {
		plugins: [ ArticlePluginSet, ImageInsert, AutoImage, LinkImage, CKFinderUploadAdapter, CKFinder ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'insertImage',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		menuBar: { isVisible: true },
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'toggleImageCaption', 'imageTextAlternative' ],
			insert: {
				integrations: getSelectedIntegrations(),
				type: imageType
			}
		},
		ckfinder: {
			// eslint-disable-next-line @stylistic/max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		},
		updateSourceElementOnDestroy: true
	} );

	window[ elementId ] = editor;

	CKEditorInspector.attach( { [ imageType ]: editor } );
}

setupEditors( {
	editor1: 'auto',
	editor2: 'block',
	editor3: 'inline'
} ).catch( err => {
	console.error( err );
} );

async function setupEditors( opt ) {
	await startEditors();

	for ( const element of document.querySelectorAll( 'input[name=imageInsertIntegration]' ) ) {
		element.addEventListener( 'change', () => {
			restartEditors().catch( err => console.error( err ) );
		} );
	}

	async function restartEditors() {
		await stopEditors();
		await startEditors();
	}

	async function startEditors() {
		for ( const [ elementId, imageType ] of Object.entries( opt ) ) {
			await createEditor( elementId, imageType );
		}
	}

	async function stopEditors( ) {
		for ( const editorId of Object.keys( opt ) ) {
			await window[ editorId ].destroy();
		}
	}
}

function getSelectedIntegrations() {
	return Array.from( document.querySelectorAll( 'input[name=imageInsertIntegration]' ) )
		.filter( element => element.checked )
		.map( element => element.value );
}
