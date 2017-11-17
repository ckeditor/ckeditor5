/**
 * @license Copyright (c) 2017, CKSource - Rémy Hubscher. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/strikeengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import AttributeCommand from './attributecommand';

const STRIKE = 'strike';

/**
 * The strike engine feature.
 *
 * It registers the `strike` command and introduces the
 * `strikesthrough` attribute in the model which renders to the view
 * as a `<s>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class StrikeEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow strike attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: STRIKE, inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.document.schema.allow( { name: '$inline', attributes: STRIKE, inside: '$clipboardHolder' } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( STRIKE )
			.toElement( 's' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 's' )
			.fromElement( 'del' )
			.fromElement( 'strike' )
			.fromAttribute( 'style', { 'text-decoration': 'line-through' } )
			.toAttribute( STRIKE, true );

		// Create strike command.
		editor.commands.add( STRIKE, new AttributeCommand( editor, STRIKE ) );
	}
}
