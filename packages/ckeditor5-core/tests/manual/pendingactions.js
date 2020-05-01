/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '../_utils/articlepluginset';
import PendingActions from '../../src/pendingactions';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, PendingActions ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const pendingActions = editor.plugins.get( PendingActions );
		const actionsEl = document.querySelector( '.pending-actions' );

		document.querySelector( '#add-action' ).addEventListener( 'click', () => {
			const action = pendingActions.add( 'Pending action 0%.' );

			wait( 1000 )
				.then( () => ( action.message = 'Pending action 0%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Pending action 20%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Pending action 40%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Pending action 60%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Pending action 80%.' ) )
				.then( () => wait( 500 ) )
				.then( () => ( action.message = 'Pending action 100%.' ) )
				.then( () => wait( 500 ) )
				.then( () => pendingActions.remove( action ) );
		} );

		window.addEventListener( 'beforeunload', evt => {
			if ( pendingActions.hasAny ) {
				evt.returnValue = pendingActions.first.message;
			}
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
