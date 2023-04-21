/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/bold/boldediting
 */

import { Plugin } from 'ckeditor5/src/core';
import AttributeCommand from '../attributecommand';

const BOLD = 'bold';

/**
 * The bold editing feature.
 *
 * It registers the `'bold'` command and introduces the `bold` attribute in the model which renders to the view
 * as a `<strong>` element.
 */
export default class BoldEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'BoldEditing' {
		return 'BoldEditing';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		// Allow bold attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: BOLD } );
		editor.model.schema.setAttributeProperties( BOLD, {
			isFormatting: true,
			copyOnEnter: true
		} );

		// Build converter from model to view for data and editing pipelines.
		editor.conversion.attributeToElement( {
			model: BOLD,
			view: 'strong',
			upcastAlso: [
				'b',
				viewElement => {
					const fontWeight = viewElement.getStyle( 'font-weight' );

					if ( !fontWeight ) {
						return null;
					}

					// Value of the `font-weight` attribute can be defined as a string or a number.
					if ( fontWeight == 'bold' || Number( fontWeight ) >= 600 ) {
						return {
							name: true,
							styles: [ 'font-weight' ]
						};
					}

					return null;
				}
			]
		} );

		// Create bold command.
		editor.commands.add( BOLD, new AttributeCommand( editor, BOLD ) );

		// Set the Ctrl+B keystroke.
		editor.keystrokes.set( 'CTRL+B', BOLD );
	}
}
