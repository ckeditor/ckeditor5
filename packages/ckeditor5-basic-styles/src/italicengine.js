/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/italicengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import AttributeCommand from './attributecommand';

const ITALIC = 'italic';

/**
 * The italic engine feature.
 *
 * It registers the `italic` command and introduces the `italic` attribute in the model which renders to the view
 * as an `<em>` element.
 *
 * @extends module:core/plugin~Plugin
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
		editor.document.schema.allow( { name: '$inline', attributes: ITALIC, inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.document.schema.allow( { name: '$inline', attributes: ITALIC, inside: '$clipboardHolder' } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( ITALIC )
			.toElement( 'i' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'em' )
			.fromElement( 'i' )
			.fromAttribute( 'style', { 'font-style': 'italic' } )
			.toAttribute( ITALIC, true );

		// Create italic command.
		editor.commands.add( ITALIC, new AttributeCommand( editor, ITALIC ) );
	}
}
