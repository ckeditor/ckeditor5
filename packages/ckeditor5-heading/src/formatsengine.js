/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import BuildModelConverterFor from '../engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '../engine/conversion/view-converter-builder.js';
import Paragraph from '../paragraph/paragraph.js';

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

		// Schema.
		schema.registerItem( 'heading1', '$block' );
		schema.registerItem( 'heading2', '$block' );
		schema.registerItem( 'heading3', '$block' );

		// Build converter from model to view for data pipeline.
		BuildModelConverterFor( data.modelToView, editing.modelToView )
			.fromElement( 'heading1' )
			.toElement( 'h2' );

		BuildModelConverterFor( data.modelToView )
			.fromElement( 'heading2' )
			.toElement( 'h3' );

		BuildModelConverterFor( data.modelToView )
			.fromElement( 'heading3' )
			.toElement( 'h4' );

		// Build converter from view to model for data pipeline.
		BuildViewConverterFor( data.viewToModel )
			.fromElement( 'h2' )
			.toElement( 'heading1' );

		BuildViewConverterFor( data.viewToModel )
			.fromElement( 'h3' )
			.toElement( 'heading2' );

		BuildViewConverterFor( data.viewToModel )
			.fromElement( 'h4' )
			.toElement( 'heading3' );

		// TODO: register command.
	}
}
