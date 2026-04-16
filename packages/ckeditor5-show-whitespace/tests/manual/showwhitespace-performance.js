/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { Table } from '@ckeditor/ckeditor5-table';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import { ShowWhitespace } from '../../src/index.js';

// Generate large content: ~500 paragraphs with varied whitespace.
function generateContent( paragraphCount ) {
	const sentences = [
		'The quick brown fox jumps over the lazy dog.',
		'CKEditor 5 is a modern rich text editor with a modular architecture.',
		'Whitespace characters are invisible by default in most text editors.',
		'This feature allows users to see spaces, tabs, and line breaks.',
		'Performance matters when dealing with large documents in production.',
		'Each paragraph contains multiple spaces between words that need markers.',
		'Non-breaking\u00A0spaces should be visually\u00A0distinct from regular ones.',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.',
		'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.',
		'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.'
	];

	const headings = [
		'<h2>Section heading</h2>',
		'<h3>Subsection heading</h3>'
	];

	const parts = [];

	for ( let i = 0; i < paragraphCount; i++ ) {
		// Add a heading every ~20 paragraphs.
		if ( i > 0 && i % 20 === 0 ) {
			parts.push( headings[ i % 2 === 0 ? 0 : 1 ] );
		}

		// Pick 2-4 sentences per paragraph.
		const sentenceCount = 2 + ( i % 3 );
		const paragraphSentences = [];

		for ( let j = 0; j < sentenceCount; j++ ) {
			paragraphSentences.push( sentences[ ( i + j ) % sentences.length ] );
		}

		// Some paragraphs get extra consecutive spaces.
		let text = paragraphSentences.join( ' ' );

		if ( i % 5 === 0 ) {
			text = text.replace( /\. /g, '.  ' );
		}

		// Some paragraphs get bold/italic spans.
		if ( i % 7 === 0 ) {
			text = text.replace( /(\w+)\s(\w+)\./, '<strong>$1 $2</strong>.' );
		}

		if ( i % 11 === 0 ) {
			text = text.replace( /(\w+)\s(\w+),/, '<i>$1 $2</i>,' );
		}

		parts.push( `<p>${ text }</p>` );

		// Add a list every ~30 paragraphs.
		if ( i > 0 && i % 30 === 0 ) {
			const listTag = i % 60 === 0 ? 'ol' : 'ul';

			parts.push(
				`<${ listTag }>` +
				'<li>List item with spaces and content.   </li>' +
				'<li>Another list item with\u00A0nbsp.</li>' +
				'<li>Third item in list.</li>' +
				`</${ listTag }>`
			);
		}

		// Add a blockquote every ~40 paragraphs.
		if ( i > 0 && i % 40 === 0 ) {
			parts.push(
				'<blockquote>' +
				'<p>Blockquote paragraph with spaces and  double  spaces.</p>' +
				'<p>Second paragraph in blockquote.</p>' +
				'</blockquote>'
			);
		}

		// Add a table every ~50 paragraphs.
		if ( i > 0 && i % 50 === 0 ) {
			parts.push(
				'<figure class="table"><table><tbody>' +
				'<tr><td>Cell A with spaces.</td><td>Cell B with\u00A0nbsp.</td></tr>' +
				'<tr><td>Cell C content.   </td><td>Cell D content.</td></tr>' +
				'</tbody></table></figure>'
			);
		}
	}

	return parts.join( '\n' );
}

const content = generateContent( 500 );

const editorElement = document.querySelector( '#editor' );

editorElement.innerHTML = content;

ClassicEditor
	.create( editorElement, {
		plugins: [
			Essentials,
			Heading,
			Paragraph,
			Bold,
			Italic,
			List,
			Table,
			BlockQuote,
			ShowWhitespace
		],
		toolbar: [
			'heading', '|',
			'bold', 'italic', '|',
			'bulletedList', 'numberedList', 'blockQuote', '|',
			'insertTable', '|',
			'showWhitespace', '|',
			'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;

		// Measure toggle performance.
		// The synchronous part covers viewport-visible elements only.
		// Background batches process the rest asynchronously.
		const originalExecute = editor.commands.get( 'showWhitespace' ).execute;
		const toggleTimeEl = document.querySelector( '#toggle-time' );

		editor.commands.get( 'showWhitespace' ).execute = function() {
			const start = performance.now();

			originalExecute.call( this );

			const syncDuration = performance.now() - start;
			const state = this.value ? 'ON' : 'OFF';

			toggleTimeEl.textContent = `Toggle ${ state }: ${ syncDuration.toFixed( 1 ) }ms (visible elements)`;
			console.log( `[ShowWhitespace] Toggle ${ state }: ${ syncDuration.toFixed( 1 ) }ms (sync — visible elements only)` );
		};

		document.querySelector( '#get-data' ).addEventListener( 'click', () => {
			console.log( editor.getData() );
		} );

		console.log( '[ShowWhitespace] Editor loaded with ~500 paragraphs.' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
