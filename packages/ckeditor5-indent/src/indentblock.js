/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentblock
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import IndentBlockCommand from './indentblockcommand';
import IndentUsingOffset from './indentcommandbehavior/indentusingoffset';
import IndentUsingClasses from './indentcommandbehavior/indentusingclasses';
import { addMarginRules } from '@ckeditor/ckeditor5-engine/src/view/styles/margin';

/**
 * The block indentation feature.
 *
 * It registers the `'indentBlock'` and `'outdentBlock'` commands.
 *
 * If the plugin {@link module:indent/indent~Indent} is defined, it also attaches the `'indentBlock'` and `'outdentBlock'` commands to
 * the `'indent'` and `'outdent'` commands.
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
			offset: 40,
			unit: 'px'
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
		const configuration = editor.config.get( 'indentBlock' );

		const useOffsetConfig = !configuration.classes || !configuration.classes.length;

		const indentConfig = Object.assign( { direction: 'forward' }, configuration );
		const outdentConfig = Object.assign( { direction: 'backward' }, configuration );

		if ( useOffsetConfig ) {
			editor.data.addStyleProcessorRules( addMarginRules );
			this._setupConversionUsingOffset( editor.conversion );

			editor.commands.add( 'indentBlock', new IndentBlockCommand( editor, new IndentUsingOffset( indentConfig ) ) );
			editor.commands.add( 'outdentBlock', new IndentBlockCommand( editor, new IndentUsingOffset( outdentConfig ) ) );
		} else {
			this._setupConversionUsingClasses( configuration.classes );
			editor.commands.add( 'indentBlock', new IndentBlockCommand( editor, new IndentUsingClasses( indentConfig ) ) );
			editor.commands.add( 'outdentBlock', new IndentBlockCommand( editor, new IndentUsingClasses( outdentConfig ) ) );
		}
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const schema = editor.model.schema;

		const indentCommand = editor.commands.get( 'indent' );
		const outdentCommand = editor.commands.get( 'outdent' );

		// Enable block indentation by default in paragraph and default headings.
		const knownElements = [ 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6' ];

		knownElements.forEach( elementName => {
			if ( schema.isRegistered( elementName ) ) {
				schema.extend( elementName, { allowAttributes: 'blockIndent' } );
			}
		} );

		indentCommand.registerChildCommand( editor.commands.get( 'indentBlock' ) );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentBlock' ) );
	}

	/**
	 * Setups conversion for using offset indents.
	 *
	 * @private
	 */
	_setupConversionUsingOffset() {
		const conversion = this.editor.conversion;
		const locale = this.editor.locale;
		const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';

		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				styles: {
					[ marginProperty ]: /[\s\S]+/
				}
			},
			model: {
				key: 'blockIndent',
				value: viewElement => viewElement.getStyle( marginProperty )
			}
		} );

		conversion.for( 'downcast' ).attributeToAttribute( {
			model: 'blockIndent',
			view: modelAttributeValue => {
				return {
					key: 'style',
					value: {
						[ marginProperty ]: modelAttributeValue
					}
				};
			}
		} );
	}

	/**
	 * Setups conversion for using classes.
	 *
	 * @param {Array.<String>} classes
	 * @private
	 */
	_setupConversionUsingClasses( classes ) {
		const definition = {
			model: {
				key: 'blockIndent',
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

		this.editor.conversion.attributeToAttribute( definition );
	}
}

/**
 * The configuration of the {@link module:indent/indentblock~IndentBlock block indentation feature}.
 *
 * Read more in {@link module:indent/indentblock~IndentBlockConfig}.
 *
 * @member {module:indent/indentblock~IndentBlockConfig} module:core/editor/editorconfig~EditorConfig#indentBlock
 */

/**
 * The configuration of the block indentation feature.
 *
 * If no {@link module:indent/indentblock~IndentBlockConfig#classes} are set, the block indentation feature will use
 * {@link module:indent/indentblock~IndentBlockConfig#offset} and {@link module:indent/indentblock~IndentBlockConfig#unit} to
 * create indentation steps.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				indentBlock: {
 *					offset: 2,
 *					unit: 'em'
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * Alternatively, the block indentation feature may set one of defined {@link module:indent/indentblock~IndentBlockConfig#classes} as
 * indentation steps:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				indentBlock: {
 *					classes: [
 *						'indent-a', // The first step - smallest indentation.
 *						'indent-b',
 *						'indent-c',
 *						'indent-d',
 *						'indent-e' // The last step - biggest indentation.
 *					]
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * In the example above only 5 indentation steps will be available.
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface IndentBlockConfig
 */

/**
 * The size of indentation {@link module:indent/indentblock~IndentBlockConfig#unit units} for each indentation step.
 *
 * @default 40
 * @member {Number} module:indent/indentblock~IndentBlockConfig#offset
 */

/**
 * The unit used for indentation {@link module:indent/indentblock~IndentBlockConfig#offset}.
 *
 * @default 'px'
 * @member {String} module:indent/indentblock~IndentBlockConfig#unit
 */

/**
 * An optional list of classes to use for indenting the editor content. If not set or set to an empty array, no classes will be used.
 * The {@link module:indent/indentblock~IndentBlockConfig#unit `indentBlock.unit`} and
 * {@link module:indent/indentblock~IndentBlockConfig#offset `indentBlock.offset`} properties will be used instead.
 *
 * @default undefined
 * @member {Array.<String>|undefined} module:indent/indentblock~IndentBlockConfig#classes
 */
