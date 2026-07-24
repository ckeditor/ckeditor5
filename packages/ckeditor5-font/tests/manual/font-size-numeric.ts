/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { FontSize } from '../../src/fontsize.js';

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
		plugins: [ ArticlePluginSet, FontSize ],
		toolbar: [
			'heading', '|', 'fontSize', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		fontSize: { options: [ 10, 12, 14, 'default', 18, 20, 22 ] } as any
	};

	if ( options.supportAllValues ) {
		config.fontSize.supportAllValues = true;
	}

	window.editor = await ClassicEditor.create( config );
}
