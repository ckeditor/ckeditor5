/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontSize from '../../src/fontsize';

const restrictedModeButton = document.getElementById( 'mode-restricted-values' );
const standardModeButton = document.getElementById( 'mode-disable-value-matching' );

restrictedModeButton.addEventListener( 'change', handleModeChange );
standardModeButton.addEventListener( 'change', handleModeChange );

// When page loaded.
startMode( document.querySelector( 'input[name="mode"]:checked' ).value );

// When a user changed a mode.
async function handleModeChange( evt ) {
	await startMode( evt.target.value );
}

// Starts the editor.
async function startMode( selectedMode ) {
	if ( selectedMode === 'restricted-values' ) {
		await reloadEditor();
	} else {
		await reloadEditor( { supportAllValues: true } );
	}
}

async function reloadEditor( options = {} ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	const config = {
		plugins: [ ArticlePluginSet, FontSize ],
		toolbar: [
			'heading', '|', 'fontSize', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		fontSize: { options: [ 10, 12, 14, 'default', 18, 20, 22 ] }
	};

	if ( options.supportAllValues ) {
		config.fontSize.supportAllValues = true;
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
}
