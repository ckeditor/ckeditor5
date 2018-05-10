/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '../_utils/articlepluginset';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, PendingActions ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
		}
	} )
	.then( editor => {
		window.editor = editor;

		const pendingActions = editor.plugins.get( PendingActions );
		const actionsEl = document.querySelector( '.pending-actions' );

		document.querySelector( '#add-action' ).addEventListener( 'click', () => {
			const action = pendingActions.add( 'Static pending action.' );

			wait( 5000 ).then( () => pendingActions.remove( action ) );
		} );

		document.querySelector( '#add-action-progress' ).addEventListener( 'click', () => {
			const action = pendingActions.add( 'Dynamic pending action 0%.' );

			wait( 1000 )
				.then( () => ( action.message = 'Dynamic pending action 0%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Dynamic pending action 20%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Dynamic pending action 40%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Dynamic pending action 60%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Dynamic pending action 80%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Dynamic pending action 1000%.' ) )
				.then( () => wait( 500 ) )
				.then( () => pendingActions.remove( action ) );
		} );

		pendingActions.on( 'add', () => displayActions() );
		pendingActions.on( 'remove', () => displayActions() );

		function displayActions() {
			const frag = document.createDocumentFragment();

			for ( const action of pendingActions ) {
				const item = document.createElement( 'li' );

				item.textContent = action.message;

				action.on( 'change:message', () => {
					item.textContent = action.message;
				} );

				frag.appendChild( item );
			}

			actionsEl.innerHTML = '';
			actionsEl.appendChild( frag );
		}

		function wait( ms ) {
			return new Promise( resolve => setTimeout( resolve, ms ) );
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );
