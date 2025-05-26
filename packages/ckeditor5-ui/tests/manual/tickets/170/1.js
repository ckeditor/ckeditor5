/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview.js';

// Set initial scroll for the outer container element.
document.querySelector( '.container-outer' ).scrollTop = 450;

// Init editor with balloon attached to the target element.
ClassicEditor
	.create( document.querySelector( '#editor-attach' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		const panel = new BalloonPanelView();

		editor.ui.view.body.add( panel );
		panel.element.innerHTML = 'Balloon content.';

		editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

		panel.attachTo( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.getEditableElement()
		} );

		window.attachEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Init editor with balloon sticked to the target element.
ClassicEditor
	.create( document.querySelector( '#editor-stick' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		const panel = new BalloonPanelView();

		editor.ui.view.body.add( panel );
		panel.element.innerHTML = 'Balloon content.';

		editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

		panel.pin( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.getEditableElement()
		} );

		window.stickEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
