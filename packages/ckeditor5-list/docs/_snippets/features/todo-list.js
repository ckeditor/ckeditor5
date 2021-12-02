/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import TodoList from '@ckeditor/ckeditor5-list/src/todolist';

ClassicEditor.builtinPlugins.push( TodoList );

ClassicEditor
	.create( document.querySelector( '#snippet-todo-list' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'heading',
				'|',
				'bulletedList',
				'numberedList',
				'todoList',
				'|',
				'outdent',
				'indent',
				'|',
				'link',
				'insertTable',
				'|',
				'undo',
				'redo'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'To-do List' ),
			text: 'Click to create a to-do list.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
