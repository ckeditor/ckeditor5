/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingCommand from './headingcommand';

const defaultModelElement = 'paragraph';

/**
 * The headings engine feature. It handles switching between block formats &ndash; headings and paragraph.
 * This class represents the engine part of the heading feature. See also {@link module:heading/heading~Heading}.
 *
 * @extends modules:core/plugin~Plugin
 */
export default class HeadingEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// TODO: This needs proper documentation, i.e. why paragraph entry does not need
		// more properties (https://github.com/ckeditor/ckeditor5/issues/403).
		editor.config.define( 'heading', {
			options: [
				{ modelElement: 'paragraph' },
				{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1' },
				{ modelElement: 'heading2', viewElement: 'h3', title: 'Heading 2' },
				{ modelElement: 'heading3', viewElement: 'h4', title: 'Heading 3' }
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;
		const options = editor.config.get( 'heading.options' );
		let command;

		for ( let option of options ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( option.modelElement !== defaultModelElement ) {
				// Schema.
				editor.document.schema.registerItem( option.modelElement, '$block' );

				// Build converter from model to view for data and editing pipelines.
				buildModelConverter().for( data.modelToView, editing.modelToView )
					.fromElement( option.modelElement )
					.toElement( option.viewElement );

				// Build converter from view to model for data pipeline.
				buildViewConverter().for( data.viewToModel )
					.fromElement( option.viewElement )
					.toElement( option.modelElement );

				// Register the heading command for this option.
				command = new HeadingCommand( editor, option );
				editor.commands.set( command.modelElement, command );
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		// If the enter command is added to the editor, alter its behavior.
		// Enter at the end of a heading element should create a paragraph.
		const editor = this.editor;
		const enterCommand = editor.commands.get( 'enter' );
		const options = editor.config.get( 'heading.options' );

		if ( enterCommand ) {
			this.listenTo( enterCommand, 'afterExecute', ( evt, data ) => {
				const positionParent = editor.document.selection.getFirstPosition().parent;
				const batch = data.batch;
				const isHeading = options.some( option => option.modelElement == positionParent.name );

				if ( isHeading && positionParent.name != defaultModelElement && positionParent.childCount === 0 ) {
					batch.rename( positionParent, defaultModelElement );
				}
			} );
		}
	}
}
