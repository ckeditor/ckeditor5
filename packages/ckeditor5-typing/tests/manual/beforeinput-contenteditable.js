/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { debounce } from 'es-toolkit/compat';

if ( window.logNative === undefined ) {
	window.logNative = true;
}

document.addEventListener( 'beforeinput', logEvent );
document.addEventListener( 'compositionstart', logEvent );
document.addEventListener( 'compositionend', logEvent );

document.addEventListener( 'selectionchange', logEvent );

document.addEventListener( 'keydown', logEvent );
document.addEventListener( 'keyup', logEvent );

const debouncedLine = debounce( () => {
	console.log( '%c────────────────────────────────────────────────────────────────────────────────────────────────────────────────────',
		'font-weight: bold; color: red' );
}, 300 );

function logEvent( evt ) {
	if ( !window.logNative ) {
		return;
	}

	if ( !document.activeElement || !document.activeElement.getAttribute( 'contenteditable' ) ) {
		return;
	}

	debouncedLine();

	console.group( `%c${ evt.type }`, 'color:red' );

	if ( 'inputType' in evt ) {
		console.log( `%cinput type:%c "${ evt.inputType }"`, 'font-weight: bold', 'font-weight: default; color: blue' );
	}

	if ( 'isComposing' in evt ) {
		console.log( `%cisComposing:%c ${ evt.isComposing }`, 'font-weight: bold', 'font-weight: default; color: green' );
	}

	if ( 'data' in evt ) {
		console.log( `%cdata:%c "${ evt.data }"`, 'font-weight: bold', 'font-weight: default; color: blue' );
	}

	if ( 'dataTransfer' in evt && evt.dataTransfer ) {
		const data = evt.dataTransfer.getData( 'text/plain' );

		console.log( `%cdataTransfer:%c "${ data }"`, 'font-weight: bold', 'font-weight: default; color: blue' );
	}

	if ( 'keyCode' in evt ) {
		console.log( `%ckeyCode:%c ${ evt.keyCode }`, 'font-weight: bold', 'font-weight: default; color: green' );
	}

	if ( 'key' in evt ) {
		console.log( `%ckey:%c "${ evt.key }"`, 'font-weight: bold', 'font-weight: default; color: blue' );
	}

	logTargetRanges( evt );
	logSelection();

	console.groupEnd();
}

function logTargetRanges( evt ) {
	if ( evt.getTargetRanges ) {
		console.group( '%cevent target ranges:', 'font-weight: bold' );
		logRanges( evt.getTargetRanges() );
		console.groupEnd();
	}
}

function logSelection() {
	const selection = document.getSelection();
	const ranges = [];

	for ( let i = 0; i < selection.rangeCount; i++ ) {
		ranges.push( selection.getRangeAt( i ) );
	}

	console.group( '%cselection:', 'font-weight: bold' );
	logRanges( ranges );
	console.groupEnd();
}

function logRanges( ranges ) {
	if ( !ranges || !ranges.length ) {
		console.log( '  %cno ranges', 'font-style: italic' );
	} else {
		for ( const range of ranges ) {
			console.log( '  start:', range.startContainer,
				`${ range.startOffset } / ${
					range.startContainer.nodeType == 3 ?
						range.startContainer.data.length :
						range.startContainer.childNodes.length
				}`
			);
			console.log( '  end:', range.endContainer,
				`${ range.endOffset } / ${
					range.endContainer.nodeType == 3 ?
						range.endContainer.data.length :
						range.endContainer.childNodes.length
				}`
			);
		}
	}
}
