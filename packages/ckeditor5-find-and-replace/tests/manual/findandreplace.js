/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { FindAndReplace } from '../../src/findandreplace.js';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { FontColor } from '@ckeditor/ckeditor5-font';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

createEditor( '#editor-dropdown', {
	uiType: 'dropdown'
} );
createEditor( '#editor-dialog' );

function createEditor( selector, featureConfig = {} ) {
	// Note: We need to load paragraph because we don't have inline editors yet.
	ClassicEditor
		.create( document.querySelector( selector ), {
			plugins: [ Essentials, Paragraph, FindAndReplace, Highlight, ArticlePluginSet, FontColor, SourceEditing ],
			toolbar: [ 'findAndReplace', '|', 'sourceEditing', '|', 'heading', 'undo', 'redo', 'highlight', 'bold', 'fontColor' ],
			image: {
				toolbar: [
					'toggleImageCaption', 'imageTextAlternative'
				]
			},
			findAndReplace: featureConfig
		} )
		.then( editor => {
			window.editor = editor;
			let isReadOnly = false;

			document.getElementById( 'readonly-toggle' ).addEventListener( 'click', () => {
				isReadOnly = !isReadOnly;

				if ( isReadOnly ) {
					editor.enableReadOnlyMode( 'manual-test' );
				} else {
					editor.disableReadOnlyMode( 'manual-test' );
				}

				editor.editing.view.focus();
			} );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
