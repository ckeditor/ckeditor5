/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontFamily from '../../src/fontfamily';

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
		plugins: [ ArticlePluginSet, FontFamily ],
		toolbar: [
			'heading', '|', 'fontFamily', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		fontFamily: {}
	};

	if ( options.supportAllValues ) {
		config.fontFamily.supportAllValues = true;
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
}
