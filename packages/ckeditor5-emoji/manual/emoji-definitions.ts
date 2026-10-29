/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Emoji, type EmojiDefinition } from '../src/index.js';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

const { default: definitions } = await import( '../tests/fixtures/database.json' ) as { default: Array<EmojiDefinition> };

const editorConfig = {
	plugins: [ Essentials, Paragraph, Mention, Emoji ],
	toolbar: [ 'emoji', '|', 'undo', 'redo' ],
	menuBar: {
		isVisible: true
	}
};

ClassicEditor
	.create( {
		...editorConfig,
		attachTo: document.querySelector( '#editor-all' ) as HTMLElement,
		emoji: {
			definitions
		}
	} )
	.then( editor => {
		( window as any ).editorAll = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( {
		...editorConfig,
		attachTo: document.querySelector( '#editor-smileys' ) as HTMLElement,
		emoji: {
			definitions: definitions.filter( item => item.group === 0 )
		}
	} )
	.then( editor => {
		( window as any ).editorSmileys = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
