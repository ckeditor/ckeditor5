/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

/**
 * @module ckfinder/ckfindercommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';

import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * The CKFinder command. It is used by the {@link module:ckfinder/ckfinderediting~CKFinderEditing ckfinder editng feature}
 * to open a CKFinder file browser to insert an image or a link to a file into content.
 *
 *		editor.execute( 'ckfinder' );
 *
 * @extends module:core/command~Command
 */
export default class CKFinderCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = true;
	}

	/**
	 * @inheritDoc
	 */
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
			// connectorPath: 'https://cksource.com/weuy2g4ryt278ywiue/core/connector/php/connector.php',
			connectorPath: '/build/core/connector/php/connector.php',
			onInit: finder => {
				finder.on( 'files:choose', evt => {
					for ( const file of evt.data.files.toArray() ) {

						// Use CKFinder file isImage() to insert only image-type files.
						if ( file.isImage() ) {
							const url = file.get( 'url' );

							insertImage( editor.model, url ? url : finder.request( 'file:getProxyUrl', { file } ) );
						}
					}
				} );

				finder.on( 'file:choose:resizedImage', evt => {
					const resizedUrl = evt.data.resizedUrl;

					if ( !resizedUrl ) {
						const notification = editor.plugins.get( Notification );
						const t = editor.locale.t;

						notification.showWarning( t( 'Could not obtain resized image URL. Try different image or folder.' ), {
							title: t( 'Selecting resized image failed' ),
							namespace: 'ckfinder'
						} );
					}

					// show warning - no resizedUrl returned...
					insertImage( editor.model, resizedUrl );
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
