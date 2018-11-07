/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

/**
 * @module ckfinder/ckfinder
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * The CKFinder command.
 *
 * @extends module:core/command~Command
 */
export default class CKFinderCommand extends Command {
	refresh() {
		this.isEnabled = true;
	}

	execute() {
		const editor = this.editor;
		// Execute command.
		// TODO: options
		// TODO: modal vs popup - config option
		window.CKFinder.modal( {
			width: 800,
			height: 500,
			// required:
			chooseFiles: true,
			connectorPath: 'https://cksource.com/weuy2g4ryt278ywiue/core/connector/php/connector.php',
			onInit: finder => {
				finder.on( 'files:choose', evt => {
					for ( const file of evt.data.files.toArray() ) {
						// Use CKFinder file isImage() to insert only image-type files.
						if ( file.isImage() ) {
							const url = file.get( 'url' );

							if ( !url ) {
								finder.request( 'file:getUrl', { file } ).then( url => insertImage( editor.model, url ) );
							} else {
								insertImage( editor.model, url );
							}
						}
					}
				} );

				finder.on( 'file:choose:resizedImage', evt => {
					insertImage( editor.model, evt.data.resizedUrl );
				} );
			}
		} );
	}
}

function insertImage( model, url ) {
	model.change( writer => {
		const imageElement = writer.createElement( 'image', { src: url } );

		const insertAtSelection = findOptimalInsertionPosition( model.document.selection, model );

		model.insertContent( imageElement, insertAtSelection );

		// Inserting an image might've failed due to schema regulations.
		if ( imageElement.parent ) {
			writer.setSelection( imageElement, 'on' );
		}
	} );
}
