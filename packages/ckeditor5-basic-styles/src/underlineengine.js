/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/underlineengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import AttributeCommand from './attributecommand';

const UNDERLINE = 'underline';

/**
 * The underline engine feature.
 *
 * It registers the `underline` command and introduces the `underline` attribute in the model which renders to the view
 * as an `<u>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UnderlineEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow underline attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: UNDERLINE, inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.document.schema.allow( { name: '$inline', attributes: UNDERLINE, inside: '$clipboardHolder' } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( UNDERLINE )
			.toElement( 'u' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'u' )
			.fromAttribute( 'style', { 'text-decoration': 'underline' } )
			.toAttribute( UNDERLINE, true );

		// Create underline command.
		editor.commands.add( UNDERLINE, new AttributeCommand( editor, UNDERLINE ) );
	}
}
