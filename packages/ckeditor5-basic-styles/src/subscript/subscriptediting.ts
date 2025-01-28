/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/subscript/subscriptediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import AttributeCommand from '../attributecommand.js';

const SUBSCRIPT = 'subscript';

/**
 * The subscript editing feature.
 *
 * It registers the `sub` command and introduces the `sub` attribute in the model which renders to the view
 * as a `<sub>` element.
 */
export default class SubscriptEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'SubscriptEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		// Allow sub attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: SUBSCRIPT } );
		editor.model.schema.setAttributeProperties( SUBSCRIPT, {
			isFormatting: true,
			copyOnEnter: true
		} );

		// Build converter from model to view for data and editing pipelines.

		editor.conversion.attributeToElement( {
			model: SUBSCRIPT,
			view: 'sub',
			upcastAlso: [
				{
					styles: {
						'vertical-align': 'sub'
					}
				}
			]
		} );

		// Create sub command.
		editor.commands.add( SUBSCRIPT, new AttributeCommand( editor, SUBSCRIPT ) );
	}
}
