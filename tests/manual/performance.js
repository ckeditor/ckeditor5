/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, performance, setTimeout, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

window.xxx = 0;
window.yyy = 0;

document.querySelector( '#start' ).addEventListener( 'click', async () => {
	const results = [];
	const dataSizes = document.querySelector( '#data-sizes' ).value
		.split( ',' )
		.map( v => parseInt( v ) );
	const repeatTimes = parseInt( document.querySelector( '#repeat-times' ).value );

	console.log( `Testing for: ${ dataSizes.join( ', ' ) }` );

	const tasks = [];

	dataSizes.forEach( dataSize => {
		for ( let i = 0; i < repeatTimes; i++ ) {
			tasks.push( {
				dataSize,
				callback: async () => {
					return await testLoadingData( dataSize );
				}
			} );
		}
	} );

	for ( const task of tasks ) {
		results.push( { dataSize: task.dataSize, result: await task.callback() } );
		document.querySelector( '#result' ).value = resultsToCsv( results );
	}

	console.log( results );
} );

async function testLoadingData( dataSize ) {
	const awaitTime = parseInt( document.querySelector( '#await-time' ).value );
	const dataToLoad = generateTestData( dataSize );

	const editor = await initEditor();
	console.log( 'Initialized editor' );
	await wait( awaitTime );

	const startAt = performance.now();

	editor.setData( dataToLoad );

	const finishedAt = performance.now();
	const result = finishedAt - startAt;

	console.log( `Loaded data (data size: ${ dataSize })`, result );

	await wait( awaitTime );
	await editor.destroy();
	console.log( 'Destroyed editor' );

	await wait( awaitTime );

	return result;
}

function generateTestData( dataSize ) {
	const paragraph = '<p>test <strong>test</strong> test</p>';

	return paragraph.repeat( dataSize );
}

async function initEditor() {
	return await ClassicEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ ArticlePluginSet ],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo'
			],
			image: {
				toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
			},
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			}
		} );
}

async function wait( ms ) {
	return new Promise( resolve => {
		setTimeout( () => {
			resolve();
		}, ms );
	} );
}

function resultsToCsv( results ) {
	let csvResult = '"Data size","Time"\n';

	csvResult += results.map( result => {
		return `"${ result.dataSize }","${ parseInt( result.result ) }"`;
	} ).join( '\n' );

	return csvResult;
}
