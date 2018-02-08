/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/italicengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute, upcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
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

		// Allow italic attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: ITALIC } );

		// Build converter from model to view for data and editing pipelines.
		editor.conversion.for( 'downcast' )
			.add( downcastAttributeToElement( ITALIC, { view: 'i' } ) );

		// Build converter from view to model for data pipeline.
		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( { view: 'em', model: ITALIC } ) )
			.add( upcastElementToAttribute( { view: 'i', model: ITALIC } ) )
			.add( upcastAttributeToAttribute( { view: { style: { 'font-style': 'italic' } }, model: ITALIC } ) );

		// Create italic command.
		editor.commands.add( ITALIC, new AttributeCommand( editor, ITALIC ) );
	}
}
