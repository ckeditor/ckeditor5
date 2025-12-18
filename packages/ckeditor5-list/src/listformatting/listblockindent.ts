/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listblockindent
 */

import {
	type Editor,
	type MultiCommand,
	Plugin
} from 'ckeditor5/src/core.js';
import { ListEditing, type ListEditingPostFixerEvent } from '../list/listediting.js';
import { type IndentBlockConfig, _IndentUsingOffset } from '@ckeditor/ckeditor5-indent';
import {
	addMarginStylesRules,
	addPaddingStylesRules,
	type UpcastElementEvent
} from 'ckeditor5/src/engine.js';
import {
	type GetCallback
} from 'ckeditor5/src/utils.js';
import { IndentListBlockCommand } from './indentlistblockcommand.js';

/**
 * The list block indent plugin.
 *
 * It registers the `'indentListBlock'` and `'outdentListBlock'` commands.
 */
export class ListBlockIndent extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListBlockIndent' as const;
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
	public static get requires() {
		return [ ListEditing ] as const;
	}

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
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.extend( '$listItem', { allowAttributes: 'listBlockIndent' } );
		schema.setAttributeProperties( 'listBlockIndent', { isFormatting: true } );

		// TODO: useMargin is temporary flag to test margin vs padding conversion
		const config = editor.config.get( 'indentBlock' ) as IndentBlockConfig & { useMargin?: boolean };

		if ( config && config.classes && config.classes.length ) {
			// this._setupConversionUsingClasses( config.classes );

			// editor.commands.add( 'indentBlock', new IndentBlockCommand( editor, new IndentUsingClasses( {
			// 	direction: 'forward',
			// 	classes: config.classes
			// } ) ) );

			// editor.commands.add( 'outdentBlock', new IndentBlockCommand( editor, new IndentUsingClasses( {
			// 	direction: 'backward',
			// 	classes: config.classes
			// } ) ) );
		} else {
			if ( config.useMargin ) {
				editor.data.addStyleProcessorRules( addMarginStylesRules );
			} else {
				editor.data.addStyleProcessorRules( addPaddingStylesRules );
			}

			this._setupConversionUsingOffset();

			editor.commands.add( 'indentListBlock', new IndentListBlockCommand( editor, new _IndentUsingOffset( {
				direction: 'forward',
				offset: config.offset!,
				unit: config.unit!
			} ) ) );

			editor.commands.add( 'outdentListBlock', new IndentListBlockCommand( editor, new _IndentUsingOffset( {
				direction: 'backward',
				offset: config.offset!,
				unit: config.unit!
			} ) ) );
		}

		editor.keystrokes.set( 'tab', ( data, cancel ) => {
			const command = editor.commands.get( 'indentListBlock' )!;

			if ( command.isEnabled ) {
				command.execute();
				cancel();
			}
		} );

		// editor.keystrokes.set( 'shift+tab', ( data, cancel ) => {
		// const command = editor.commands.get( 'outdentListBlock' )!;

		// 	if ( command.isEnabled ) {
		// 		command.execute();
		// 		cancel();
		// 	}
		// } );

		const listEditing = editor.plugins.get( 'ListEditing' ) as ListEditing;

		// When pasting a list and the selection is collapsed at the beginning of the first list item,
		// or when a non-collapsed selection starts exactly at the beginning of that item,
		// the `listBlockIndent` attribute will be copied from the pasted list to the target list.
		//
		// In all other cases, the pasted list items will inherit the `listBlockIndent` attribute from the list
		// into which they are inserted.
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node, previous } of listNodes ) {
				if ( !previous ) {
					continue;
				}

				const previousNodeIndent = previous.getAttribute( 'listIndent' );
				const nodeIndent = node.getAttribute( 'listIndent' );
				const previousNodeListType = previous.getAttribute( 'listType' );
				const nodeListType = node.getAttribute( 'listType' );

				// If it's a beginning of a different list, stop copying the value of `listBlockIndent`.
				if ( previousNodeIndent === 0 && nodeIndent === 0 && previousNodeListType !== nodeListType ) {
					continue;
				}

				const currentBlockIndent = node.getAttribute( 'listBlockIndent' );
				const newBlockIndent = previous.getAttribute( 'listBlockIndent' );

				if ( currentBlockIndent === newBlockIndent ) {
					continue;
				}

				if ( newBlockIndent ) {
					writer.setAttribute( 'listBlockIndent', newBlockIndent, node );
					evt.return = true;
				} else if ( node.hasAttribute( 'listBlockIndent' ) ) {
					writer.removeAttribute( 'listBlockIndent', node );
					evt.return = true;
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		const indentCommand = editor.commands.get( 'indent' ) as MultiCommand;
		const outdentCommand = editor.commands.get( 'outdent' ) as MultiCommand;

		if ( !indentCommand || !outdentCommand ) {
			return;
		}

		indentCommand.registerChildCommand( editor.commands.get( 'indentListBlock' )! );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentListBlock' )! );
	}

	/**
	 * Setups conversion for using offset indents.
	 */
	private _setupConversionUsingOffset(): void {
		const editor = this.editor;
		const conversion = editor.conversion;
		const locale = editor.locale;
		let marginProperty: string;

		// TODO: useMargin is temporary flag to test margin vs padding conversion
		if ( ( editor.config.get( 'indentBlock' ) as IndentBlockConfig & { useMargin?: boolean } )?.useMargin !== false ) {
			marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
		} else {
			marginProperty = locale.contentLanguageDirection === 'rtl' ? 'padding-right' : 'padding-left';
		}

		const listEditing: ListEditing = editor.plugins.get( 'ListEditing' );

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:ol', listBlockIndentUpcastConverter( marginProperty ) );
			dispatcher.on<UpcastElementEvent>( 'element:ul', listBlockIndentUpcastConverter( marginProperty ) );
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'listBlockIndent',

			setAttributeOnDowncast( writer, value, element, options, modelElement ) {
				if ( value && modelElement.getAttribute( 'listIndent' ) == '0' ) {
					// writer.addClass( [ 'abc', element );
					writer.setStyle( marginProperty, value as string, element );
				} else {
					// writer.removeClass( 'abc', element );
					writer.removeStyle( marginProperty, element );
				}
			}
		} );
	}

	/**
	 * Setups conversion for using classes.
	 */
	// private _setupConversionUsingClasses( classes: Array<string> ) {
	// 	const definition: {
	// 		model: { key: string; values: Array<string> };
	// 		view: Record<string, DowncastAttributeDescriptor>;
	// 	} = {
	// 		model: {
	// 			key: 'blockIndent',
	// 			values: []
	// 		},
	// 		view: {}
	// 	};

	// 	for ( const className of classes ) {
	// 		definition.model.values.push( className );
	// 		definition.view[ className ] = {
	// 			key: 'class',
	// 			value: [ className ]
	// 		};
	// 	}

	// 	this.editor.conversion.attributeToAttribute( definition );
	// }
}

function listBlockIndentUpcastConverter( marginProperty: string ): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const { writer, schema, consumable } = conversionApi;

		if ( consumable.test( data.viewItem, { styles: marginProperty } ) === false ) {
			return;
		}

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const marginValue = data.viewItem.getStyle( marginProperty );

		if ( !marginValue ) {
			return;
		}

		let applied = false;

		for ( const item of data.modelRange!.getItems( { shallow: true } ) ) {
			if ( !schema.checkAttribute( item, 'listBlockIndent' ) ) {
				continue;
			}

			if ( item.hasAttribute( 'listBlockIndent' ) ) {
				continue;
			}

			writer.setAttribute( 'listBlockIndent', marginValue, item );
			applied = true;
		}

		if ( applied ) {
			consumable.consume( data.viewItem, { styles: marginProperty } );
		}
	};
}
