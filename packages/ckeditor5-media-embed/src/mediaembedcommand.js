/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
import { getSelectedMediaModelWidget, insertMedia } from './utils';

/**
 * The insert media command.
 *
 * The command is registered by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} as `'mediaEmbed'`.
 *
 * To insert media at the current selection, execute the command and specify the URL:
 *
 *		editor.execute( 'mediaEmbed', 'http://url.to.the/media' );
 *
 * @extends module:core/command~Command
 */
export default class MediaEmbedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const insertPosition = findOptimalInsertionPosition( selection, model );
		const selectedMedia = getSelectedMediaModelWidget( selection );

		let parent = insertPosition.parent;

		// The model.insertContent() will remove empty parent (unless it is a $root or a limit).
		if ( parent.isEmpty && !model.schema.isLimit( parent ) ) {
			parent = parent.parent;
		}

		this.value = selectedMedia ? selectedMedia.getAttribute( 'url' ) : null;
		this.isEnabled = schema.checkChild( parent, 'media' );
	}

	/**
	 * Executes the command, which either:
	 *
	 * * updates the URL of the selected media,
	 * * inserts the new media into the editor and puts the selection around it.
	 *
	 * @fires execute
	 * @param {String} url The URL of the media.
	 */
	execute( url ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedMedia = getSelectedMediaModelWidget( selection );

		if ( selectedMedia ) {
			model.change( writer => {
				writer.setAttribute( 'url', url, selectedMedia );
			} );
		} else {
			const insertPosition = findOptimalInsertionPosition( selection, model );

			insertMedia( model, url, insertPosition );
		}
	}
}
