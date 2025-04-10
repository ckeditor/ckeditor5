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
import type { ViewElement } from 'ckeditor5/src/engine.js';

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
			options: [ 0.5, 1, 1.65, 2, 2.5, 3 ]
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

		// Downcast conversion for editing (model to view)
		editor.conversion.for( 'editingDowncast' ).attributeToAttribute( {
			model: LINE_HEIGHT,
			view: modelAttributeValue => {
				if ( !modelAttributeValue ) {
					return null;
				}

				return {
					key: 'style',
					value: `line-height:${ modelAttributeValue }`
				};
			}
		} );

		// Downcast conversion for data (model to data)
		editor.conversion.for( 'dataDowncast' ).attributeToAttribute( {
			model: LINE_HEIGHT,
			view: modelAttributeValue => {
				if ( !modelAttributeValue ) {
					return null;
				}

				return {
					key: 'style',
					value: `line-height:${ modelAttributeValue }`
				};
			}
		} );

		// Upcast conversion (view to model)
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				styles: {
					'line-height': /^.+$/
				}
			},
			model: {
				key: LINE_HEIGHT,
				value: ( viewElement: ViewElement ) => {
					const lineHeightValue = viewElement.getStyle( 'line-height' );

					if ( !lineHeightValue ) {
						return null;
					}

					const value = parseFloat( lineHeightValue );

					// Skip if it's not a valid number
					if ( isNaN( value ) ) {
						return null;
					}

					// Skip if outside the allowed range
					if ( value < 0.1 || value > 10 ) {
						return null;
					}

					return value;
				}
			}
		} );

		// Add LineHeight command.
		editor.commands.add( LINE_HEIGHT, new LineHeightCommand( editor ) );
	}
}
