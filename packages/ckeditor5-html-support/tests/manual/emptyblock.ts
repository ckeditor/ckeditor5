/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Table } from '@ckeditor/ckeditor5-table';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Bold, Code, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { EmptyBlock } from '../../src/emptyblock.js';

declare global {
	interface Window {
		editor1: any;
		editor2: any;
	}
}
declare const CKEditorInspector: any;

const config = {
	plugins: [ Table, Essentials, List, ListProperties, Bold, Italic, Code, Paragraph, Heading, SourceEditing, EmptyBlock ],
	toolbar: [ 'sourceEditing', '|', 'insertTable', 'bulletedList', 'numberedList', 'bold', 'italic', 'heading' ]
};

const preserveEmptyBlocksCheckbox = document.getElementById( 'preserve-empty-blocks' );

function createEditor1( preserveEmptyBlocksInEditingView: boolean ) {
	return ClassicEditor
		.create( {
			...config,
			attachTo: document.getElementById( 'editor1' )!,
			htmlSupport: {
				preserveEmptyBlocksInEditingView
			}
		} )
		.then( instance => {
			window.editor1 = instance;
			CKEditorInspector.attach( { 'With EmptyBlock plugin': instance } );
		} );
}

// Initial editor creation
createEditor1( ( preserveEmptyBlocksCheckbox as HTMLInputElement ).checked );

ClassicEditor
	.create( {
		...config,
		attachTo: document.getElementById( 'editor2' )!,
		plugins: config.plugins.filter( plugin => plugin !== EmptyBlock )
	} )
	.then( instance => {
		window.editor2 = instance;
		CKEditorInspector.attach( { 'Without EmptyBlock plugin': instance } );
	} );

const clipboardPreview = document.getElementById( 'clipboard-preview' );

function handleClipboardEvent( evt: any ) {
	clipboardPreview!.textContent = evt.clipboardData.getData( 'text/html' );
}

document.addEventListener( 'copy', handleClipboardEvent );
document.addEventListener( 'cut', handleClipboardEvent );

preserveEmptyBlocksCheckbox!.addEventListener( 'change', async () => {
	const editorElement = document.getElementById( 'editor1' );
	const editorData = window.editor1.getData();

	await window.editor1.destroy();

	// Restore any content that was in the editor
	editorElement!.innerHTML = editorData;

	// Create new editor instance with updated configuration
	await createEditor1( ( preserveEmptyBlocksCheckbox as HTMLInputElement ).checked );
} );
