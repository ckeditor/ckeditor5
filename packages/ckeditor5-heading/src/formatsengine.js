/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import BuildModelConverterFor from '../engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '../engine/conversion/view-converter-builder.js';
import Paragraph from '../paragraph/paragraph.js';
import FormatsCommand from './formatscommand.js';

const formats = [
	{ id: 'paragraph', viewElement: 'p', label: 'Paragraph' },
	{ id: 'heading1', viewElement: 'h2', label: 'Heading 1' },
	{ id: 'heading2', viewElement: 'h3', label: 'Heading 2' },
	{ id: 'heading3', viewElement: 'h4', label: 'Heading 3' }
];

export default class FormatsEngine extends Feature {
	static get requires() {
		return [ Paragraph ];
	}

	init() {
		const editor = this.editor;
		const document = editor.document;
		const schema = document.schema;
		const data = editor.data;
		const editing = editor.editing;

		for ( let format of formats ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( format.id !== 'paragraph' ) {
				// Schema.
				schema.registerItem( format.id, '$block' );

				// Build converter from model to view for data pipeline.
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
		const command = new FormatsCommand( editor, formats );
		editor.commands.set( 'format', command );
	}
}
