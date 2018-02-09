/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/code/codeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import AttributeCommand from '../attributecommand';

const CODE = 'code';

/**
 * The code editing feature.
 *
 * It registers the `code` command and introduces the `code` attribute in the model which renders to the view
 * as a `<code>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow code attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: CODE } );

		// Build converter from model to view for data and editing pipelines.
		editor.conversion.for( 'downcast' )
			.add( downcastAttributeToElement( CODE, { view: 'code' } ) );

		// Build converter from view to model for data pipeline.
		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( { view: 'code', model: CODE } ) )
			.add( upcastElementToAttribute( { view: { style: { 'word-wrap': 'break-word' } }, model: CODE } ) );

		// Create code command.
		editor.commands.add( CODE, new AttributeCommand( editor, CODE ) );
	}
}
