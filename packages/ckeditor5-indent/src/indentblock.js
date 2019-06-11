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
	constructor( editor ) {
		super( editor );

		editor.config.define( 'indentBlock', {
			offset: 1,
			unit: 'em'
		} );
	}

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
		const configuration = editor.config.get( 'indentBlock' );

		// TODO: better features inclusion
		// CKE4: context: { div: 1, dl: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, ul: 1, ol: 1, p: 1, pre: 1, table: 1 },
		schema.extend( 'paragraph', { allowAttributes: 'indent' } );
		schema.extend( 'heading1', { allowAttributes: 'indent' } );
		schema.extend( 'heading2', { allowAttributes: 'indent' } );
		schema.extend( 'heading3', { allowAttributes: 'indent' } );

		const useOffsetConfig = !configuration.classes || !configuration.classes.length;

		if ( useOffsetConfig ) {
			this._setupConversionUsingOffset( conversion );
		} else {
			this._setupConversionUsingClasses( configuration.classes, editor );
		}

		editor.commands.add( 'indentBlock', new IndentBlockCommand( editor, Object.assign( { direction: 'forward' }, configuration ) ) );
		editor.commands.add( 'outdentBlock', new IndentBlockCommand( editor, Object.assign( { direction: 'backward' }, configuration ) ) );

		const getCommandExecuter = commandName => {
			return ( data, cancel ) => {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );
					cancel();
				}
			};
		};

		editor.keystrokes.set( 'Tab', getCommandExecuter( 'indentBlock' ) );
		editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( 'outdentBlock' ) );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const indentCommand = editor.commands.get( 'indent' );
		const outdentCommand = editor.commands.get( 'outdent' );

		indentCommand.registerChildCommand( editor.commands.get( 'indentBlock' ) );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentBlock' ) );
	}

	_setupConversionUsingOffset( conversion ) {
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
	}

	_setupConversionUsingClasses( classes, editor ) {
		const definition = {
			model: {
				key: 'indent',
				values: []
			},
			view: {}
		};

		for ( const className of classes ) {
			definition.model.values.push( className );
			definition.view[ className ] = {
				key: 'class',
				value: [ className ]
			};
		}

		editor.conversion.attributeToAttribute( definition );
	}
}
