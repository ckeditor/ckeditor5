/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import BuildModelConverterFor from '../engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '../engine/conversion/view-converter-builder.js';

export default class BoldEngine extends Feature {
	init() {
		const editor = this.editor;
		const document = editor.document;
		const schema = document.schema;
		const data = editor.data;

		// Schema.
		schema.allow( { name: '$inline', attributes: [ 'bold' ], inside: '$block' } );

		// Build converter from model to view for data and editing pipelines.
		BuildModelConverterFor( data.modelToView )
			.fromAttribute( 'bold' )
			.toElement( 'strong' );

		// Build converter from view to model for data and editing pipelines.
		BuildViewConverterFor( data.viewToModel )
			.fromElement( 'strong' )
			.fromElement( 'b' )
			.fromAttribute( 'style', { 'font-weight': 'bold' } )
			.toAttribute( 'bold', true );
	}
}
