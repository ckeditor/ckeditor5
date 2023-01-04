/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/superscript/superscriptediting
 */

import { Plugin } from 'ckeditor5/src/core';
import AttributeCommand from '../attributecommand';

const SUPERSCRIPT = 'superscript';

/**
 * The superscript editing feature.
 *
 * It registers the `super` command and introduces the `super` attribute in the model which renders to the view
 * as a `<super>` element.
 */
export default class SuperscriptEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SuperscriptEditing' {
		return 'SuperscriptEditing';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		// Allow super attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: SUPERSCRIPT } );
		editor.model.schema.setAttributeProperties( SUPERSCRIPT, {
			isFormatting: true,
			copyOnEnter: true
		} );

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

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		superscript: AttributeCommand;
	}

	interface PluginsMap {
		[ SuperscriptEditing.pluginName ]: SuperscriptEditing;
	}
}
