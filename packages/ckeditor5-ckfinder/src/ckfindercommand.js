/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

/**
 * @module ckfinder/ckfindercommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
	constructor( editor ) {
		super( editor );

		// Remove default document listener to lower its priority.
		this.stopListening( this.editor.model.document, 'change' );

		// Lower this command listener priority to be sure that refresh() will be called after link & image refresh.
		this.listenTo( this.editor.model.document, 'change', () => this.refresh(), { priority: 'low' } );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const imageCommand = this.editor.commands.get( 'imageUpload' );
		const linkCommand = this.editor.commands.get( 'link' );

		// The CKFinder command is enabled when one of image or link command is enabled.
		this.isEnabled = imageCommand && linkCommand && ( imageCommand.isEnabled || linkCommand.isEnabled );
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

		// Cache the user-defined onInit method
		const originalOnInit = options.onInit;

		// Pass the lang code to the CKFinder if not defined by user.
		if ( !options.language ) {
			options.language = editor.locale.language;
		}

		// The onInit method allows to extend CKFinder's behavior. It is used to attach event listeners to file choosing related events.
		options.onInit = finder => {
			// Call original options.onInit if it was defined by user.
			if ( originalOnInit ) {
				originalOnInit();
			}

			finder.on( 'files:choose', evt => {
				const files = evt.data.files.toArray();

				// Insert links
				const links = files.filter( file => !file.isImage() );
				const images = files.filter( file => file.isImage() );

				for ( const linkFile of links ) {
					editor.execute( 'link', linkFile.getUrl() );
				}

				const imagesUrls = [];

				for ( const image of images ) {
					const url = image.getUrl();

					imagesUrls.push( url ? url : finder.request( 'file:getProxyUrl', { file: image } ) );
				}

				if ( imagesUrls.length ) {
					insertImages( editor, imagesUrls );
				}
			} );

			finder.on( 'file:choose:resizedImage', evt => {
				const resizedUrl = evt.data.resizedUrl;

				if ( !resizedUrl ) {
					const notification = editor.plugins.get( 'Notification' );
					const t = editor.locale.t;

					notification.showWarning( t( 'Could not obtain resized image URL.' ), {
						title: t( 'Selecting resized image failed' ),
						namespace: 'ckfinder'
					} );

					return;
				}

				insertImages( editor, [ resizedUrl ] );
			} );
		};

		window.CKFinder[ openerMethod ]( options );
	}
}

function insertImages( editor, urls ) {
	const imageCommand = editor.commands.get( 'imageUpload' );

	// Check if inserting an image is actually possible - it might be possible to only insert a link.
	if ( !imageCommand.isEnabled ) {
		const notification = editor.plugins.get( 'Notification' );
		const t = editor.locale.t;

		notification.showWarning( t( 'Could not insert image at the current position.' ), {
			title: t( 'Inserting image failed' ),
			namespace: 'ckfinder'
		} );

		return;
	}

	editor.execute( 'imageInsert', { source: urls } );
}
