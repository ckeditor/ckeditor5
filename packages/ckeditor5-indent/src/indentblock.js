/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent-block/indentblock
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import IndentBlockCommand from './indentblockcommand';

/**
 * The block indentation feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class IndentBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'IndentBlock';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		// TODO: better features inclusion
		schema.extend( 'paragraph', { allowAttributes: 'indent' } );
		schema.extend( 'heading1', { allowAttributes: 'indent' } );

		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				styles: {
					'margin-left': /[\s\S]+/
				}
			},
			model: {
				key: 'indent',
				value: viewElement => {
					return viewElement.getStyle( 'margin-left' );
				}
			}
		} );

		conversion.for( 'downcast' ).attributeToAttribute( {
			model: 'indent',
			view: modelAttributeValue => {
				return {
					key: 'style',
					value: {
						'margin-left': modelAttributeValue
					}
				};
			}
		} );

		editor.commands.add( 'indentBlock', new IndentBlockCommand( editor ) );
		editor.commands.add( 'outdentBlock', new IndentBlockCommand( editor ) );
	}

	afterInit() {
		const editor = this.editor;
		const indentCommand = editor.commands.get( 'indent' );
		const outdentCommand = editor.commands.get( 'outdent' );

		indentCommand.registerChildCommand( editor.commands.get( 'indentBlock' ) );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentBlock' ) );
	}
}
