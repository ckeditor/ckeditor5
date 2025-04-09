/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module line-height/lineheightediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import LineHeightCommand from './lineheightcommand.js';
import { LINE_HEIGHT } from './lineheightconfig.js';
import { getLineHeightStyleValue, normalizeOptions } from './utils.js';

/**
 * The line height editing feature.
 *
 * It introduces the {@link module:line-height/lineheightcommand~LineHeightCommand command} and the `lineHeight`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `style="line-height: ..."` style.
 */
export default class LineHeightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LineHeightEditing' as const;
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
	constructor( editor: Editor ) {
		super( editor );

		// Define default configuration using named presets.
		editor.config.define( LINE_HEIGHT, {
			options: [ 0.5, 1, 1.5, 2, 2.5 ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Allow line height attribute on block elements (paragraphs, headings, etc.)
		editor.model.schema.extend( '$block', { allowAttributes: LINE_HEIGHT } );
		editor.model.schema.setAttributeProperties( LINE_HEIGHT, {
			isFormatting: true
		} );

		// Get configured line height options.
		const configOptions = editor.config.get( 'lineHeight.options' );
		const options = normalizeOptions( Array.isArray( configOptions ) ? configOptions : [ 0.5, 1, 1.5, 2, 2.5 ] );

		// Setup conversion from model to view for set styles.
		editor.conversion.for( 'downcast' ).attributeToAttribute( {
			model: LINE_HEIGHT,
			view: ( modelAttributeValue: unknown ) => {
				if ( !modelAttributeValue ) {
					return null;
				}

				return {
					key: 'style',
					value: {
						'line-height': getLineHeightStyleValue( Number( modelAttributeValue ) )
					}
				};
			}
		} );

		// Setup conversion from view to model for existing styles.
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				key: 'style',
				value: /^line-height:(.+?)$/
			},
			model: {
				key: LINE_HEIGHT,
				value: ( viewStyleValue: string ) => {
					// Extract line height value from the view style value.
					const lineHeightValueString = viewStyleValue.match( /^line-height:(.+?)$/ )![ 1 ].trim();

					// Convert and validate the value
					const lineHeightValue = parseFloat( lineHeightValueString );

					if ( isNaN( lineHeightValue ) ) {
						return null;
					}

					// Find closest value in the options
					const option = options.find( option => option.model === lineHeightValue );

					if ( option ) {
						return option.model;
					}

					// Return the value if it fits in our range (0.1 to 10)
					return lineHeightValue >= 0.1 && lineHeightValue <= 10 ? lineHeightValue : null;
				}
			}
		} );

		// Add LineHeight command.
		editor.commands.add( LINE_HEIGHT, new LineHeightCommand( editor ) );
	}
}
