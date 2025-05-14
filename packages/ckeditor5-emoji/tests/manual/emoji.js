/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Emoji, EmojiMention, EmojiPicker, EmojiRepository } from '../../src/index.js';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { List } from '@ckeditor/ckeditor5-list';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';

const cssValue = [
	':root {',
	'	--ck-font-face: Helvetica, Arial, Tahoma, Verdana, \'Noto Color Emoji\';',
	'}',
	'body {',
	'	font-family: Helvetica, Arial, Tahoma, Verdana, \'Noto Color Emoji\';',
	'}'
].join( '\n' );

const elements = {
	template: document.querySelector( '#content' ),
	emojiBoth: document.querySelector( '#editor-emoji-both' ),
	emojiMention: document.querySelector( '#editor-emoji-mention' ),
	emojiPicker: document.querySelector( '#editor-emoji-picker' ),
	emojiPickerBalloonEditor: document.querySelector( '#editor-emoji-picker-balloon-editor' )
};

// Keeps active editor references.
const editors = [];

// Initial rendering.
await reloadEditor();

// Reload editors whenever the radio button is clicked.
[ ...document.querySelectorAll( 'input[type="radio"]' ) ].forEach( element => {
	element.addEventListener( 'input', async event => {
		// Clear the internal cache when messing up with the filtering mechanism.
		if ( event.target.name === 'custom-font' ) {
			EmojiRepository._results = {};
		}

		await reloadEditor();
	} );
} );

async function reloadEditor() {
	// Destroy existing editors.
	await Promise.all(
		editors.map( editor => editor.destroy() )
	);

	// Remove the custom style definitions.
	document.getElementById( 'custom-emoji-style' )?.remove();

	// Create new styles depending on a radio button.
	if ( document.querySelector( 'input[name="custom-font"]:checked' ).value === 'true' ) {
		const styleElement = document.createElement( 'style' );
		styleElement.id = 'custom-emoji-style';
		styleElement.appendChild( document.createTextNode( cssValue ) );
		document.head.appendChild( styleElement );
	}

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
			} ),

		BalloonEditor
			.create(
				elements.emojiPickerBalloonEditor,
				getEditorConfig( {
					extraPlugins: [ EmojiPicker, BalloonToolbar, Mention ]
				} )
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
	const customFont = document.querySelector( 'input[name="custom-font"]:checked' ).value;

	if ( dbVersion !== 'null' ) {
		emoji.version = parseInt( dbVersion );
	}
	if ( skinTone !== 'null' ) {
		emoji.skinTone = skinTone;
	}
	if ( customFont === 'true' ) {
		emoji.useCustomFont = true;
	}

	return {
		plugins: [
			Mention,
			Essentials,
			Paragraph,
			List,
			Heading,
			Bold,
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

