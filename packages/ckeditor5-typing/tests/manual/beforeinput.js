/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals CKEditorInspector, console, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

// initEditor( ClassicEditor, document.querySelector( '#editor-classic' ), 'classic' );
// initEditor( BalloonEditor, document.querySelector( '#editor-balloon' ), 'balloon' );

async function initEditor( editorConstructor, element, name ) {
	const editor = await editorConstructor.create( element, {
		initialData: document.querySelector( '#fixtures' ).innerHTML,
		plugins: [
			Essentials,
			Autoformat,
			BlockQuote,
			Bold,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageResize,
			Indent,
			Italic,
			Link,
			List,
			MediaEmbed,
			Mention,
			Paragraph,
			Table,
			TableToolbar
		],
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
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
				},
				{
					marker: '#',
					feed: [
						'#a01', '#a02', '#a03', '#a04', '#a05', '#a06', '#a07', '#a08', '#a09', '#a10',
						'#a11', '#a12', '#a13', '#a14', '#a15', '#a16', '#a17', '#a18', '#a19', '#a20'
					]
				},
				{
					marker: ':',
					feed: [
						':+1:', ':-1:', ':@(at-sign):', ':$(dollar-sign):', ':#(hash-sign):'
					]
				}
			]
		}
	} );

	CKEditorInspector.attach( { [ name ]: editor } );
}

document.addEventListener( 'beforeinput', logEvent );
document.addEventListener( 'compositionstart', logEvent );
document.addEventListener( 'compositionend', logEvent );

document.addEventListener( 'selectionchange', logEvent );

document.addEventListener( 'keydown', logEvent );
document.addEventListener( 'keyup', logEvent );

function logEvent( evt ) {
	// Don't log for the editor.
	if ( evt.target.closest && evt.target.closest( '.ck-content' ) ) {
		return;
	}

	console.group( `%c${ evt.type }`, 'color:red' );

	if ( 'inputType' in evt ) {
		console.log( `%cinput type:%c "${ evt.inputType }"`, 'font-weight: bold', 'font-weight: default; color: blue' );
	}

	if ( 'isComposing' in evt ) {
		console.log( `%cisComposing:%c ${ evt.isComposing }`, 'font-weight: bold', 'font-weight: default; color: green' );
	}

	if ( 'data' in evt ) {
		console.log( `%cdata:%c "${ evt.data }"`, 'font-weight: bold', 'font-weight: default; color: red' );
	}

	if ( 'keyCode' in evt ) {
		console.log( `%ckeyCode:%c ${ evt.keyCode }`, 'font-weight: bold', 'font-weight: default; color: green' );
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
			console.log( '  start:', range.startContainer, range.startOffset );
			console.log( '  end:', range.endContainer, range.endOffset );
		}
	}
}
