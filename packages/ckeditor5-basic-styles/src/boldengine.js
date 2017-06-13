/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/boldengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ToggleAttributeCommand from '@ckeditor/ckeditor5-core/src/command/toggleattributecommand';

const BOLD = 'bold';

/**
 * The bold engine feature.
 *
 * It registers the `bold` command and introduces the `bold` attribute in the model which renders to the view
 * as a `<strong>` element.
 *
 * @extends module:core/plugin~Plugin
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
		editor.document.schema.allow( { name: '$inline', attributes: [ BOLD ], inside: '$block' } );

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
		editor.commands.add( BOLD, new ToggleAttributeCommand( editor, BOLD ) );
	}
}
