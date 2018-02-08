/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/underlineengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute, upcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
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

		// Allow strikethrough attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: UNDERLINE } );

		// Build converter from model to view for data and editing pipelines.
		editor.conversion.for( 'downcast' )
			.add( downcastAttributeToElement( UNDERLINE, { view: 'u' } ) );

		// Build converter from view to model for data pipeline.
		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( { view: 'u', model: UNDERLINE } ) )
			.add( upcastAttributeToAttribute( { view: { style: { 'text-decoration': 'underline' } }, model: UNDERLINE } ) );

		// Create underline command.
		editor.commands.add( UNDERLINE, new AttributeCommand( editor, UNDERLINE ) );
	}
}
