/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/codeengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import AttributeCommand from './attributecommand';

const CODE = 'code';

/**
 * The code engine feature.
 *
 * It registers the `code` command and introduces the `code` attribute in the model which renders to the view
 * as a `<code>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow code attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: CODE } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( CODE )
			.toElement( 'code' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'code' )
			.fromAttribute( 'style', { 'word-wrap': 'break-word' } )
			.toAttribute( CODE, true );

		// Create code command.
		editor.commands.add( CODE, new AttributeCommand( editor, CODE ) );
	}
}
