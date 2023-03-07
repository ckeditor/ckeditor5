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
