/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from '../core/plugin.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import buildViewConverter from '../engine/conversion/buildviewconverter.js';
import ToggleAttributeCommand from '../core/command/toggleattributecommand.js';

const BOLD = 'bold';

/**
 * The bold engine feature.
 *
 * It registers the `bold` command and introduces the `bold` attribute in the model which renders to the view
 * as a `<strong>` element.
 *
 * @memberOf basic-styles
 * @extends core.Plugin
 */
export default class BoldEngine extends Plugin {
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
		editor.commands.set( BOLD, new ToggleAttributeCommand( editor, BOLD ) );
	}
}
