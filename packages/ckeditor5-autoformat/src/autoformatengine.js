/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';

export default class AutoformatEngine extends Feature {
	init () {
		// const editor = this.editor;
		// const data = editor.data;
		// const editing = editor.editing;

		/**
		for ( let format of formats ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( format.id !== 'paragraph' ) {
				// Schema.
				editor.document.schema.registerItem( format.id, '$block' );

				// Build converter from model to view for data and editing pipelines.
				buildModelConverter().for( data.modelToView, editing.modelToView )
					.fromElement( format.id )
					.toElement( format.viewElement );

				// Build converter from view to model for data pipeline.
				buildViewConverter().for( data.viewToModel )
					.fromElement( format.viewElement )
					.toElement( format.id );
			}
		}

		// Register the heading command.
		const command = new HeadingCommand( editor, formats );
		editor.commands.set( 'heading', command );

		// If the enter command is added to the editor, alter its behavior.
		// Enter at the end of a heading element should create a paragraph.
		const enterCommand = editor.commands.get( 'enter' );

		if ( enterCommand ) {
			this.listenTo( enterCommand, 'afterExecute', ( evt, data ) => {
				const positionParent = editor.document.selection.getFirstPosition().parent;
				const batch = data.batch;
				const isHeading = formats.some( ( format ) => format.id == positionParent.name );

				if ( isHeading && positionParent.name != command.defaultFormat.id && positionParent.childCount === 0 ) {
					batch.rename( positionParent, command.defaultFormat.id );
				}
			} );
		}

		**/
	}
}
