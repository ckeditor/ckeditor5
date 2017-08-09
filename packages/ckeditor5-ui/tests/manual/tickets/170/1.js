/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';
import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview';

// Set initial scroll for the outer container element.
document.querySelector( '.container-outer' ).scrollTop = 450;

// Init editor with balloon attached to the target element.
ClassicEditor
	.create( document.querySelector( '#editor-attach' ), {
		plugins: [ ArticlePresets ],
		toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		const panel = new BalloonPanelView();

		panel.element.innerHTML = 'Balloon content.';
		editor.ui.view.body.add( panel );

		editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

		panel.init();
		panel.attachTo( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.view.editableElement
		} );

		window.attachEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Init editor with balloon sticked to the target element.
ClassicEditor
	.create( document.querySelector( '#editor-stick' ), {
		plugins: [ ArticlePresets ],
		toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		const panel = new BalloonPanelView();

		panel.element.innerHTML = 'Balloon content.';
		editor.ui.view.body.add( panel );

		editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

		panel.init();
		panel.pin( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.view.editableElement
		} );

		window.stickEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
