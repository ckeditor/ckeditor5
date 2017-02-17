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

const defaultFormats = [
	{ id: 'paragraph', element: 'p', label: 'Paragraph' },
	{ id: 'heading1', element: 'h2', label: 'Heading 1' },
	{ id: 'heading2', element: 'h3', label: 'Heading 2' },
	{ id: 'heading3', element: 'h4', label: 'Heading 3' }
];

const defaultFormatId = 'paragraph';

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

		editor.config.define( 'heading', {
			formats: defaultFormats,
			defaultFormatId: defaultFormatId
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
		const formats = editor.config.get( 'heading.formats' );
		const defaultFormatId = editor.config.get( 'heading.defaultFormatId' );

		for ( let format of formats ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( format.id !== defaultFormatId ) {
				// Schema.
				editor.document.schema.registerItem( format.id, '$block' );

				// Build converter from model to view for data and editing pipelines.
				buildModelConverter().for( data.modelToView, editing.modelToView )
					.fromElement( format.id )
					.toElement( format.element );

				// Build converter from view to model for data pipeline.
				buildViewConverter().for( data.viewToModel )
					.fromElement( format.element )
					.toElement( format.id );
			}
		}

		// Register the heading command.
		const command = new HeadingCommand( editor, formats );
		editor.commands.set( 'heading', command );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		// If the enter command is added to the editor, alter its behavior.
		// Enter at the end of a heading element should create a paragraph.

		const editor = this.editor;
		const command = editor.commands.get( 'heading' );
		const enterCommand = editor.commands.get( 'enter' );
		const formats = editor.config.get( 'heading.formats' );

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
	}
}
