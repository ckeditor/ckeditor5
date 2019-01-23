/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/superscript/superscriptediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AttributeCommand from '../attributecommand';

const SUPERSCRIPT = 'superscript';

/**
 * The superscript editing feature.
 *
 * It registers the `super` command and introduces the `super` attribute in the model which renders to the view
 * as a `<super>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SuperscriptEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		// Allow super attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: SUPERSCRIPT } );

		// Build converter from model to view for data and editing pipelines.

		editor.conversion.attributeToElement( {
			model: SUPERSCRIPT,
			view: 'sup',
			upcastAlso: [
				{
					styles: {
						'vertical-align': 'super'
					}
				}
			]
		} );

		// Create super command.
		editor.commands.add( SUPERSCRIPT, new AttributeCommand( editor, SUPERSCRIPT ) );
	}
}
