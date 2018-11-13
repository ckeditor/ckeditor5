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
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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

		const openerMethod = this.editor.config.get( 'ckfinder.openerMethod' ) || 'modal';

		if ( openerMethod != 'popup' && openerMethod != 'modal' ) {
			throw new CKEditorError( 'ckfinder-unknown-openerMethod: The openerMethod config option must by "popup" or "modal".' );
		}

		const options = this.editor.config.get( 'ckfinder.options' ) || {};

		options.chooseFiles = true;

		// The onInit method allows to extend CKFinder's behavior. It is used to attach event listeners to file choosing related events.
		options.onInit = finder => {
			finder.on( 'files:choose', evt => {
				for ( const file of evt.data.files.toArray() ) {
					const url = file.get( 'url' );

					// Use CKFinder file isImage() to insert only image-type files.
					if ( file.isImage() ) {
						insertImage( editor.model, url ? url : finder.request( 'file:getProxyUrl', { file } ) );
					} else {
						editor.execute( 'link', url );
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

				// Show warning - no resizedUrl returned...
				insertImage( editor.model, resizedUrl );
			} );
		};

		window.CKFinder[ openerMethod ]( options );
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
