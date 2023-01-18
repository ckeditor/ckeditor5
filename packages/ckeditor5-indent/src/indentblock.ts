/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentblock
 */

import { Plugin, type Editor, type MultiCommand } from 'ckeditor5/src/core';
import { addMarginRules, type AttributeDescriptor, type ViewElement } from 'ckeditor5/src/engine';

import IndentBlockCommand from './indentblockcommand';
import IndentUsingOffset from './indentcommandbehavior/indentusingoffset';
import IndentUsingClasses from './indentcommandbehavior/indentusingclasses';
import type { HeadingOption } from '@ckeditor/ckeditor5-heading';

const DEFAULT_ELEMENTS = [ 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6' ];

/**
 * The block indentation feature.
 *
 * It registers the `'indentBlock'` and `'outdentBlock'` commands.
 *
 * If the plugin {@link module:indent/indent~Indent} is defined, it also attaches the `'indentBlock'` and `'outdentBlock'` commands to
 * the `'indent'` and `'outdent'` commands.
 */
export default class IndentBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'indentBlock', {
			offset: 40,
			unit: 'px'
		} );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'IndentBlock' {
		return 'IndentBlock';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const configuration = editor.config.get( 'indentBlock' )!;

		if ( configuration.classes && configuration.classes.length ) {
			this._setupConversionUsingClasses( configuration.classes );

			editor.commands.add( 'indentBlock', new IndentBlockCommand( editor, new IndentUsingClasses( {
				direction: 'forward',
				classes: configuration.classes
			} ) ) );

			editor.commands.add( 'outdentBlock', new IndentBlockCommand( editor, new IndentUsingClasses( {
				direction: 'backward',
				classes: configuration.classes
			} ) ) );
		} else {
			editor.data.addStyleProcessorRules( addMarginRules );
			this._setupConversionUsingOffset();

			editor.commands.add( 'indentBlock', new IndentBlockCommand( editor, new IndentUsingOffset( {
				direction: 'forward',
				offset: configuration.offset!,
				unit: configuration.unit!
			} ) ) );

			editor.commands.add( 'outdentBlock', new IndentBlockCommand( editor, new IndentUsingOffset( {
				direction: 'backward',
				offset: configuration.offset!,
				unit: configuration.unit!
			} ) ) );
		}
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const schema = editor.model.schema;

		const indentCommand = editor.commands.get( 'indent' ) as MultiCommand;
		const outdentCommand = editor.commands.get( 'outdent' ) as MultiCommand;

		// Enable block indentation to heading configuration options. If it is not defined enable in paragraph and default headings.
		const options: Array<HeadingOption> = editor.config.get( 'heading.options' )!;
		const configuredElements = options && options.map( option => option.model );
		const knownElements = configuredElements || DEFAULT_ELEMENTS;

		knownElements.forEach( elementName => {
			if ( schema.isRegistered( elementName ) ) {
				schema.extend( elementName, { allowAttributes: 'blockIndent' } );
			}
		} );

		schema.setAttributeProperties( 'blockIndent', { isFormatting: true } );

		indentCommand.registerChildCommand( editor.commands.get( 'indentBlock' )! );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentBlock' )! );
	}

	/**
	 * Setups conversion for using offset indents.
	 */
	private _setupConversionUsingOffset(): void {
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
				value: ( viewElement: ViewElement ) => viewElement.getStyle( marginProperty )
			}
		} );

		conversion.for( 'downcast' ).attributeToAttribute( {
			model: 'blockIndent',
			view: modelAttributeValue => {
				return {
					key: 'style',
					value: {
						[ marginProperty as string ]: modelAttributeValue as string
					}
				};
			}
		} );
	}

	/**
	 * Setups conversion for using classes.
	 */
	private _setupConversionUsingClasses( classes: Array<string> ) {
		const definition: {
			model: { key: string; values: Array<string> };
			view: Record<string, AttributeDescriptor>;
		} = {
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
 */

/**
 * The configuration of the block indentation feature.
 *
 * If no {@link module:indent/indentblock~IndentBlockConfig#classes} are set, the block indentation feature will use
 * {@link module:indent/indentblock~IndentBlockConfig#offset} and {@link module:indent/indentblock~IndentBlockConfig#unit} to
 * create indentation steps.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		indentBlock: {
 * 			offset: 2,
 * 			unit: 'em'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * Alternatively, the block indentation feature may set one of defined {@link module:indent/indentblock~IndentBlockConfig#classes} as
 * indentation steps:
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		indentBlock: {
 * 			classes: [
 * 				'indent-a', // The first step - smallest indentation.
 * 				'indent-b',
 * 				'indent-c',
 * 				'indent-d',
 * 				'indent-e' // The last step - biggest indentation.
 * 			]
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * In the example above only 5 indentation steps will be available.
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface IndentBlockConfig {

	/**
	 * The size of indentation {@link module:indent/indentblock~IndentBlockConfig#unit units} for each indentation step.
	 *
	 * @default 40
	 */
	offset?: number;

	/**
	 * The unit used for indentation {@link module:indent/indentblock~IndentBlockConfig#offset}.
	 *
	 * @default 'px'
	 */
	unit?: string;

	/**
	 * An optional list of classes to use for indenting the editor content. If not set or set to an empty array, no classes will be used.
	 * The {@link module:indent/indentblock~IndentBlockConfig#unit `indentBlock.unit`} and
	 * {@link module:indent/indentblock~IndentBlockConfig#offset `indentBlock.offset`} properties will be used instead.
	 *
	 * @default undefined
	 */
	classes?: Array<string>;
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ IndentBlock.pluginName ]: IndentBlock;
	}

	interface CommandsMap {
		indentBlock: IndentBlockCommand;
		outdentBlock: IndentBlockCommand;
	}

	interface EditorConfig {

		/**
		 * The configuration of the {@link module:indent/indentblock~IndentBlock block indentation feature}.
		 *
		 * Read more in {@link module:indent/indentblock~IndentBlockConfig}.
		 */
		indentBlock?: IndentBlockConfig;
	}
}
