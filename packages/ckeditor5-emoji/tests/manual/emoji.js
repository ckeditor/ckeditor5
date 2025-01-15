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

const elements = {
	template: document.querySelector( '#content' ),
	emojiBoth: document.querySelector( '#editor-emoji-both' ),
	emojiMention: document.querySelector( '#editor-emoji-mention' ),
	emojiPicker: document.querySelector( '#editor-emoji-picker' )
};

Object.keys( elements )
	.filter( name => name.startsWith( 'emoji' ) )
	.forEach( name => {
		const tempDiv = document.createElement( 'div' );
		tempDiv.appendChild( elements.template.content.cloneNode( true ) );

		elements[ name ].innerHTML = tempDiv.innerHTML;
	} );

function getEditorConfig( { extraPlugins, emojiButtonInToolbar = true } ) {
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
			'undo',
			'redo',
			emojiButtonInToolbar ? 'emoji' : ''
		].filter( Boolean ),
		menuBar: {
			isVisible: true
		}
	};
}

ClassicEditor
	.create(
		elements.emojiBoth,
		getEditorConfig( { extraPlugins: [ Emoji, Mention ] } )
	)
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create(
		elements.emojiMention,
		getEditorConfig( { extraPlugins: [ EmojiMention, Mention ], emojiButtonInToolbar: false } )
	)
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create(
		elements.emojiPicker,
		getEditorConfig( { extraPlugins: [ EmojiPicker ] } )
	)
	.catch( err => {
		console.error( err.stack );
	} );
