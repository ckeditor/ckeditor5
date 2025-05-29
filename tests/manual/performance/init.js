/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import config from '../../_utils/performance-config.js';
import allDataSets from '../../_data/data-sets/index.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

/* TEST CONFIG. */

// Number of tries per data set.
const TRIES_PER_DATA_SET = 10;

// Change to array with data sets names if you want to check only specific data sets.
const DATA_SETS_NAMES = null;

// Change to `0` to keep all values in the results. Change to higher value to remove more outliers.
const REMOVE_OUTLIERS = 1;

/* END OF TEST CONFIG. */

// If `DATA_SETS_NAMES` is defined, keep only that data set.
const dataSetsNames = DATA_SETS_NAMES ? DATA_SETS_NAMES : Object.keys( allDataSets );

run();

function run() {
	const btnEl = document.getElementById( 'btnStart' );

	if ( !isStarted() ) {
		btnEl.addEventListener( 'click', () => {
			btnEl.remove();

			setupTests();
			performTest();
		} );
	} else {
		btnEl.remove();
		performTest();
	}
}

function performTest() {
	const dataSetName = getCurrentDataSetName();
	const initialData = allDataSets[ dataSetName ]();
	const finalConfig = { initialData, ...config };
	const editorElement = document.querySelector( '#editor' );

	setStatus();

	const startTime = window.performance.now();

	ClassicEditor
		.create( editorElement, finalConfig )
		.then( () => {
			const testTime = window.performance.now() - startTime;

			saveResult( testTime );
			runNext();
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function setStatus() {
	const statusEl = document.getElementById( 'status' );
	const dataSetIndex = Number( sessionStorage.getItem( 'performanceTestDataSetIndex' ) );
	const dataSetName = getCurrentDataSetName();
	const tryNumber = sessionStorage.getItem( 'performanceTestTryNumber' );

	statusEl.innerHTML = `Dataset "${ dataSetName }" (${ dataSetIndex + 1 } / ${ dataSetsNames.length }), ` +
		`try ${ tryNumber } / ${ TRIES_PER_DATA_SET }`;
}

function getCurrentDataSetName() {
	const dataSetIndex = Number( sessionStorage.getItem( 'performanceTestDataSetIndex' ) );

	return dataSetsNames[ dataSetIndex ];
}

function setupTests() {
	sessionStorage.setItem( 'performanceTestTryNumber', '1' );
	sessionStorage.setItem( 'performanceTestResults', '{}' );
	sessionStorage.setItem( 'performanceTestDataSetIndex', '0' );
}

function isStarted() {
	return sessionStorage.getItem( 'performanceTestResults' ) !== null;
}

function saveResult( time ) {
	const resultsString = sessionStorage.getItem( 'performanceTestResults' );
	const results = JSON.parse( resultsString );
	const dataSetName = getCurrentDataSetName();

	if ( !( dataSetName in results ) ) {
		results[ dataSetName ] = [];
	}

	results[ dataSetName ].push( Math.round( time ) );

	sessionStorage.setItem( 'performanceTestResults', JSON.stringify( results ) );
}

function runNext() {
	const tryNumber = Number( sessionStorage.getItem( 'performanceTestTryNumber' ) );

	if ( tryNumber === TRIES_PER_DATA_SET ) {
		if ( isNextDataSet() ) {
			nextDataSet();
		} else {
			finishTests();
		}
	} else {
		nextTry( tryNumber + 1 );
	}
}

function isNextDataSet() {
	const dataSetIndex = Number( sessionStorage.getItem( 'performanceTestDataSetIndex' ) );

	return dataSetIndex < dataSetsNames.length - 1;
}

function nextDataSet() {
	const dataSetIndex = Number( sessionStorage.getItem( 'performanceTestDataSetIndex' ) );

	sessionStorage.setItem( 'performanceTestDataSetIndex', String( dataSetIndex + 1 ) );
	sessionStorage.setItem( 'performanceTestTryNumber', '1' );

	reload();
}

function nextTry( tryNumber ) {
	sessionStorage.setItem( 'performanceTestTryNumber', String( tryNumber ) );

	reload();
}

function reload() {
	window.reloadTimeout = window.setTimeout( () => {
		window.location.reload();
	}, 1000 );
}

function finishTests() {
	const resultsString = sessionStorage.getItem( 'performanceTestResults' );
	const results = JSON.parse( resultsString );

	cleanupsessionStorage();

	const resultsProcessed = prepareResults( results );

	console.log( results );
	console.log( resultsProcessed );

	navigator.clipboard.writeText( resultsProcessed ).then( () => {
		// eslint-disable-next-line no-alert
		alert( 'Tests finished!\nResults are copied to your clipboard\nYou can paste them to a spreadsheet' );
	} );
}

function cleanupsessionStorage() {
	sessionStorage.removeItem( 'performanceTestTryNumber' );
	sessionStorage.removeItem( 'performanceTestResults' );
	sessionStorage.removeItem( 'performanceTestDataSetIndex' );
}

function prepareResults( dataObj ) {
	return Object.entries( dataObj ).map( entry => {
		const dataSetName = entry[ 0 ];
		const results = entry[ 1 ];

		for ( let i = 0; i < REMOVE_OUTLIERS; i++ ) {
			let maxV = 0;
			let minV = Number.MAX_VALUE;
			let maxJ = 0;
			let minJ = 0;

			for ( let j = 0; j < results.length - 1; j++ ) {
				if ( results[ j ] === '' ) {
					continue;
				}

				if ( maxV < results[ j ] ) {
					maxV = results[ j ];
					maxJ = j;
				}

				if ( minV > results[ j ] ) {
					minV = results[ j ];
					minJ = j;
				}
			}

			// Keep '' so that the final string is properly formatted and will work well in spreadsheet.
			results[ maxJ ] = '';
			results[ minJ ] = '';
		}

		return dataSetName + '\t\t' + results.join( '\t' ) + '\n';
	} ).join( '' );
}
