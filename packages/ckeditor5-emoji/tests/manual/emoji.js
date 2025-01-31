/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, document */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Emoji, EmojiMention, EmojiPicker } from '../../src/index.js';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { List } from '@ckeditor/ckeditor5-list';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import Emojifrequently from '../../src/emojifrequently.ts';

const elements = {
	template: document.querySelector( '#content' ),
	emojiBoth: document.querySelector( '#editor-emoji-both' ),
	emojiMention: document.querySelector( '#editor-emoji-mention' ),
	emojiPicker: document.querySelector( '#editor-emoji-picker' )
};

// Keeps active editor references.
const editors = [];

// Initial rendering.
await reloadEditor();

// Reload editors whenever the radio button is clicked.
[ ...document.querySelectorAll( 'input[type="radio"]' ) ].forEach( element => {
	element.addEventListener( 'input', async () => {
		await reloadEditor();
	} );
} );

async function reloadEditor() {
	// Destroy existing editors.
	await Promise.all(
		editors.map( editor => editor.destroy() )
	);

	// Clear references.
	editors.length = 0;

	// Create new editors.
	const promises = [
		ClassicEditor.create( elements.emojiBoth, getEditorConfig( { extraPlugins: [ Emoji, Mention ] } ) )
			.catch( err => {
				console.error( err.stack );
			} ),

		ClassicEditor
			.create(
				elements.emojiMention,
				getEditorConfig( { extraPlugins: [ EmojiMention, Mention ], emojiButtonInToolbar: false } )
			)
			.catch( err => {
				console.error( err.stack );
			} ),

		ClassicEditor
			.create(
				elements.emojiPicker,
				getEditorConfig( { extraPlugins: [ EmojiPicker ] } )
			)
			.catch( err => {
				console.error( err.stack );
			} )

	];

	// Store references.
	editors.push(
		...await Promise.all( promises )
	);
}

function getEditorConfig( { extraPlugins, emojiButtonInToolbar = true } ) {
	const tempDiv = document.createElement( 'div' );
	tempDiv.appendChild( elements.template.content.cloneNode( true ) );
	const initialData = tempDiv.innerHTML;

	const emoji = {};

	const dbVersion = document.querySelector( 'input[name="unicode"]:checked' ).value;
	const skinTone = document.querySelector( 'input[name="skin"]:checked' ).value;

	if ( dbVersion !== 'null' ) {
		emoji.version = parseInt( dbVersion );
	}
	if ( skinTone !== 'null' ) {
		emoji.skinTone = skinTone;
	}

	return {
		plugins: [
			Mention,
			Essentials,
			Paragraph,
			List,
			Heading,
			Bold,
			Emojifrequently,
			...extraPlugins
		],
		toolbar: [
			'heading',
			'undo',
			'redo',
			emojiButtonInToolbar ? 'emoji' : ''
		].filter( Boolean ),
		emoji,
		menuBar: {
			isVisible: true
		},
		initialData
	};
}

