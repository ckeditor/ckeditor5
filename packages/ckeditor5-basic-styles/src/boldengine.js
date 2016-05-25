/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import BuildModelConverterFor from '../engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '../engine/conversion/view-converter-builder.js';
import AttributeCommand from '../command/attributecommand.js';

const BOLD = 'bold';

export default class BoldEngine extends Feature {
	init() {
		const editor = this.editor;
		const document = editor.document;
		const schema = document.schema;
		const data = editor.data;

		// Schema.
		schema.allow( { name: '$inline', attributes: [ BOLD ] } );

		// Build converter from model to view for data pipeline.
		// TODO: Converter for editing pipeline.
		BuildModelConverterFor( data.modelToView )
			.fromAttribute( BOLD )
			.toElement( 'strong' );

		// Build converter from view to model for data pipeline.
		// TODO: Converter for editing pipeline.
		BuildViewConverterFor( data.viewToModel )
			.fromElement( 'strong' )
			.fromElement( 'b' )
			.fromAttribute( 'style', { 'font-weight': 'bold' } )
			.toAttribute( BOLD, true );

		// Command.
		const command = new AttributeCommand( editor, BOLD );
		editor.commands.set( BOLD, command );
	}
}
