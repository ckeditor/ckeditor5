/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from '../core/plugin.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import buildViewConverter from '../engine/conversion/buildviewconverter.js';
import ToggleAttributeCommand from '../core/command/toggleattributecommand.js';

const ITALIC = 'italic';

/**
 * The italic engine feature.
 *
 * It registers the `italic` command and introduces the `italic` attribute in the model which renders to the view
 * as an `<em>` element.
 *
 * @memberOf basic-styles
 * @extends core.Plugin
 */
export default class ItalicEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow italic attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: [ ITALIC ] } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( ITALIC )
			.toElement( 'em' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'em' )
			.fromElement( 'i' )
			.fromAttribute( 'style', { 'font-style': 'italic' } )
			.toAttribute( ITALIC, true );

		// Create italic command.
		editor.commands.set( ITALIC, new ToggleAttributeCommand( editor, ITALIC ) );
	}
}
