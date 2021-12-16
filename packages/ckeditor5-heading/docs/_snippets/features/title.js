/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import BaloonBlockEditor from '@ckeditor/ckeditor5-build-balloon-block/src/ckeditor';
import Title from '@ckeditor/ckeditor5-heading/src/title';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

BaloonBlockEditor.builtinPlugins.push( Title );

BaloonBlockEditor
	.create( document.querySelector( '#snippet-title' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		blockToolbar: [
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed'
		]
	} )
	.then( editor => {
		window.editor = editor;

		const titlePlugin = editor.plugins.get( 'Title' );
		const titleConsole = new Console( document.querySelector( '.title-console__title' ), 'plaintext' );
		const bodyConsole = new Console( document.querySelector( '.title-console__body' ), 'html' );
		const dataConsole = new Console( document.querySelector( '.title-console__data' ), 'html' );

		editor.model.document.on( 'change:data', () => {
			titleConsole.update( titlePlugin.getTitle() );
			bodyConsole.update( titlePlugin.getBody() );
			dataConsole.update( editor.getData() );
		} );

		// Load data.
		titleConsole.update( '' );
		bodyConsole.update( '<p>&nbsp;</p>' );
		dataConsole.update( '<p>&nbsp;</p>' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

class Console {
	constructor( element, language ) {
		this.element = element;
		this.language = language;
		this.consoleUpdates = 0;
		this.previousData = '';
	}

	update( data ) {
		if ( this.previousData == data ) {
			return;
		}

		this.previousData = data;
		const element = this.element;

		this.consoleUpdates++;

		element.classList.add( 'updated' );

		const content = window.Prism.highlight( data, window.Prism.languages[ this.language ], this.language );

		element.innerHTML = `'${ content }'`;

		setTimeout( () => {
			if ( --this.consoleUpdates == 0 ) {
				element.classList.remove( 'updated' );
			}
		}, 500 );
	}
}
