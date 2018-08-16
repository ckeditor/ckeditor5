/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/insertmediacommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import { getSelectedMediaElement } from './utils';

/**
 * The insert media command.
 *
 * The command is registered by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} as `'insertMedia'`.
 *
 * To insert a media at the current selection, execute the command and specify the URL:
 *
 *		editor.execute( 'insertMedia', 'http://url.to.the/media' );
 *
 * @extends module:core/command~Command
 */
export default class InsertMediaCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const position = selection.getFirstPosition();
		const selectedMedia = getSelectedMediaElement( selection );

		let parent = position.parent;

		if ( parent != parent.root ) {
			parent = parent.parent;
		}

		this.value = selectedMedia ? selectedMedia.getAttribute( 'url' ) : null;
		this.isEnabled = schema.checkChild( parent, 'media' );
	}

	/**
	 * Executes the command, which either:
	 *
	 * * updates the URL of a selected media,
	 * * inserts the new media into the editor and puts the selection around it.
	 *
	 * @fires execute
	 * @param {String} url The URL of the media.
	 */
	execute( url ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedMedia = getSelectedMediaElement( selection );

		if ( selectedMedia ) {
			model.change( writer => {
				writer.setAttribute( 'url', url, selectedMedia );
			} );
		} else {
			const firstPosition = selection.getFirstPosition();
			const isRoot = firstPosition.parent === firstPosition.root;
			const insertPosition = isRoot ? ModelPosition.createAt( firstPosition ) : ModelPosition.createAfter( firstPosition.parent );

			model.change( writer => {
				const mediaElement = writer.createElement( 'media', { url } );

				writer.insert( mediaElement, insertPosition );
				writer.setSelection( mediaElement, 'on' );
			} );
		}
	}
}

