/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { FontFamily } from '../../src/fontfamily.js';

declare global {
	interface Window { editor: any }
}

const restrictedModeButton = document.getElementById( 'mode-restricted-values' );
const standardModeButton = document.getElementById( 'mode-disable-value-matching' );

restrictedModeButton!.addEventListener( 'change', handleModeChange );
standardModeButton!.addEventListener( 'change', handleModeChange );

// When page loaded.
startMode( ( document.querySelector( 'input[name="mode"]:checked' ) as HTMLInputElement ).value );

// When a user changed a mode.
async function handleModeChange( evt: any ) {
	await startMode( evt.target.value );
}

// Starts the editor.
async function startMode( selectedMode: string ) {
	if ( selectedMode === 'restricted-values' ) {
		await reloadEditor();
	} else {
		await reloadEditor( { supportAllValues: true } );
	}
}

async function reloadEditor( options: any = {} ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	const config = {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, FontFamily ],
		toolbar: [
			'heading', '|', 'fontFamily', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		menuBar: { isVisible: true },
		fontFamily: {} as any
	};

	if ( options.supportAllValues ) {
		config.fontFamily.supportAllValues = true;
	}

	window.editor = await ClassicEditor.create( config );
}
