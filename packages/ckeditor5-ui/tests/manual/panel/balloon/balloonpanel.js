/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

// Content of the balloon panel.
class BalloonContentView extends View {
	constructor() {
		super();

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: 'balloon-content'
			},
			children: [
				{
					text: 'Balloon'
				}
			]
		} );
	}
}

// Set initial scroll of one of the container element.
document.querySelector( '.container-a' ).scrollTop = 450;

// Init editor with balloon attached to the target element.
ClassicEditor.create( document.querySelector( '#editor-attach' ), {
	plugins: [ ArticlePresets ],
	toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
} )
.then( editor => {
	const panel = new BalloonPanelView();

	panel.content.add( new BalloonContentView() );
	editor.ui.view.body.add( panel );

	editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

	panel.init().then( () => {
		panel.attachTo( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.view.editableElement
		} );
	} );

	window.attachEditor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );

// Init editor with balloon sticked to the target element.
ClassicEditor.create( document.querySelector( '#editor-stick' ), {
	plugins: [ ArticlePresets ],
	toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
} )
.then( editor => {
	const panel = new BalloonPanelView();

	panel.content.add( new BalloonContentView() );
	editor.ui.view.body.add( panel );

	editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

	panel.init().then( () => {
		panel.keepAttachedTo( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.view.editableElement
		} );
	} );

	window.stickEditor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
