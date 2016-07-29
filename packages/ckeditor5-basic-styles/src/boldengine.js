/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../feature.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import buildViewConverter from '../engine/conversion/buildviewconverter.js';
import AttributeCommand from '../command/attributecommand.js';

const BOLD = 'bold';

/**
 * Bold engine feature.
 *
 * It registers `bold` command and introduces `bold` attribute in the model, which renders to the view
 * as an `<strong>` element.
 *
 * @memberOf basic-styles
 * @extends ckeditor5.Feature
 */
export default class BoldEngine extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow bold attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: [ BOLD ] } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( BOLD )
			.toElement( 'strong' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'strong' )
			.fromElement( 'b' )
			.fromAttribute( 'style', { 'font-weight': 'bold' } )
			.toAttribute( BOLD, true );

		// Create bold command.
		editor.commands.set( BOLD, new AttributeCommand( editor, BOLD ) );
	}
}
