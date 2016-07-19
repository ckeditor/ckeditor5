/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../feature.js';
import BuildModelConverterFor from '../engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '../engine/conversion/view-converter-builder.js';
import Paragraph from '../paragraph/paragraph.js';
import HeadingsCommand from './headingscommand.js';

const formats = [
	{ id: 'paragraph', viewElement: 'p', label: 'Paragraph' },
	{ id: 'heading1', viewElement: 'h2', label: 'Heading 1' },
	{ id: 'heading2', viewElement: 'h3', label: 'Heading 2' },
	{ id: 'heading3', viewElement: 'h4', label: 'Heading 3' }
];

/**
 * The headings feature. Handles switching between block formats - different headings and paragraph.
 * This class represents the engine part of the Headings feature.
 *
 * @memberOf headings
 * @extends ckeditor5.Feature
 */
export default class HeadingsEngine extends Feature {
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

		for ( let format of formats ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( format.id !== 'paragraph' ) {
				// Schema.
				editor.document.schema.registerItem( format.id, '$block' );

				// Build converter from model to view for data and editing pipelines.
				BuildModelConverterFor( data.modelToView, editing.modelToView )
					.fromElement( format.id )
					.toElement( format.viewElement );

				// Build converter from view to model for data pipeline.
				BuildViewConverterFor( data.viewToModel )
					.fromElement( format.viewElement )
					.toElement( format.id );
			}
		}

		// Register command.
		const command = new HeadingsCommand( editor, formats );
		editor.commands.set( 'headings', command );
	}
}
