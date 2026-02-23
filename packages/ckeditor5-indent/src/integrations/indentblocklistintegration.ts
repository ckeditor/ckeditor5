/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/integrations/indentblocklistintegration
 */

import {
	type ListEditingPostFixerEvent,
	type _ListIndentCommandAfterExecuteEvent
} from '@ckeditor/ckeditor5-list';
import { type GetCallback } from 'ckeditor5/src/utils.js';
import {
	type MultiCommand,
	Plugin
} from 'ckeditor5/src/core.js';
import {
	addMarginStylesRules,
	type ModelElement,
	type UpcastElementEvent
} from 'ckeditor5/src/engine.js';
import { IndentBlockListCommand } from './indentblocklistcommand.js';
import { IndentBlockListItemCommand } from './indentblocklistitemcommand.js';
import { IndentUsingOffset } from '../indentcommandbehavior/indentusingoffset.js';
import { IndentUsingClasses } from '../indentcommandbehavior/indentusingclasses.js';

/**
 * This integration enables using block indentation feature with lists.
 */
export class IndentBlockListIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'IndentBlockListIntegration' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Whether the Indent Block plugin uses classes to apply indentation
	 * (and thus whether the `'indentBlockList'` and `'indentBlockListItem'` commands use classes to increase/decrease indentation).
	 */
	public indentBlockUsingClasses = false;

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !this.editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		const config = editor.config.get( 'indentBlock' )!;

		this.indentBlockUsingClasses = !!( config.classes && config.classes.length );

		if ( this.indentBlockUsingClasses ) {
			this._setupConversionUsingClassesForListBlock( config.classes! );
			this._setupConversionUsingClassesForListItemBlock( config.classes! );

			editor.commands.add( 'indentBlockList', new IndentBlockListCommand( editor, new IndentUsingClasses( {
				direction: 'forward',
				classes: config.classes!
			} ) ) );

			editor.commands.add( 'outdentBlockList', new IndentBlockListCommand( editor, new IndentUsingClasses( {
				direction: 'backward',
				classes: config.classes!
			} ) ) );

			editor.commands.add( 'indentBlockListItem', new IndentBlockListItemCommand( editor, new IndentUsingClasses( {
				direction: 'forward',
				classes: config.classes!
			} ) ) );

			editor.commands.add( 'outdentBlockListItem', new IndentBlockListItemCommand( editor, new IndentUsingClasses( {
				direction: 'backward',
				classes: config.classes!
			} ) ) );
		} else {
			editor.data.addStyleProcessorRules( addMarginStylesRules );

			this._setupConversionUsingOffsetForListBlock();
			this._setupConversionUsingOffsetForListItemBlock();

			editor.commands.add( 'indentBlockList', new IndentBlockListCommand( editor, new IndentUsingOffset( {
				direction: 'forward',
				offset: config.offset!,
				unit: config.unit!
			} ) ) );

			editor.commands.add( 'outdentBlockList', new IndentBlockListCommand( editor, new IndentUsingOffset( {
				direction: 'backward',
				offset: config.offset!,
				unit: config.unit!
			} ) ) );

			editor.commands.add( 'indentBlockListItem', new IndentBlockListItemCommand( editor, new IndentUsingOffset( {
				direction: 'forward',
				offset: config.offset!,
				unit: config.unit!
			} ) ) );

			editor.commands.add( 'outdentBlockListItem', new IndentBlockListItemCommand( editor, new IndentUsingOffset( {
				direction: 'backward',
				offset: config.offset!,
				unit: config.unit!
			} ) ) );
		}

		const listEditing = editor.plugins.get( 'ListEditing' );

		// Make sure that all items in a single list (items at the same level & listType) have the same blockIndentList attribute value.
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node, previousNodeInList } of listNodes ) {
				// This is a first item of a nested list.
				if ( !previousNodeInList ) {
					continue;
				}

				if ( previousNodeInList.getAttribute( 'listType' ) != node.getAttribute( 'listType' ) ) {
					continue;
				}

				evt.return ||= ensureIndentValuesConsistency( 'blockIndentList', node, previousNodeInList, writer );

				if ( previousNodeInList.getAttribute( 'listItemId' ) != node.getAttribute( 'listItemId' ) ) {
					continue;
				}

				evt.return ||= ensureIndentValuesConsistency( 'blockIndentListItem', node, previousNodeInList, writer );
			}
		} );

		const indentCommand = editor.commands.get( 'indent' ) as MultiCommand;
		const outdentCommand = editor.commands.get( 'outdent' ) as MultiCommand;

		indentCommand.registerChildCommand( editor.commands.get( 'indentBlockList' )! );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentBlockList' )! );

		indentCommand.registerChildCommand( editor.commands.get( 'indentBlockListItem' )! );
		outdentCommand.registerChildCommand( editor.commands.get( 'outdentBlockListItem' )! );

		editor.keystrokes.set( 'tab', ( data, cancel ) => {
			const command = editor.commands.get( 'indentBlockList' )!;

			if ( command.isEnabled ) {
				command.execute( { firstListOnly: true } );
				cancel();
			}
		} );

		editor.keystrokes.set( 'shift+tab', ( data, cancel ) => {
			const command = editor.commands.get( 'outdentBlockList' )!;

			if ( command.isEnabled ) {
				command.execute( { firstListOnly: true } );
				cancel();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;

		if ( !editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		schema.extend( '$listItem', { allowAttributes: [ 'blockIndentList', 'blockIndentListItem' ] } );
		schema.setAttributeProperties( 'blockIndentList', { isFormatting: true } );
		schema.setAttributeProperties( 'blockIndentListItem', { isFormatting: true } );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'blockIndentList' );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'blockIndentListItem' );

		// Clear blockIndentList and blockIndentListItem when list indent changes.
		const clearBlockIndentAttributesOnListIndentChange = (
			_evt: unknown,
			changedBlocks: Array<ModelElement>
		) => {
			editor.model.change( writer => {
				for ( const node of changedBlocks ) {
					if ( node.hasAttribute( 'listItemId' ) ) {
						if ( node.hasAttribute( 'blockIndentList' ) ) {
							writer.removeAttribute( 'blockIndentList', node );
						}
						if ( node.hasAttribute( 'blockIndentListItem' ) ) {
							writer.removeAttribute( 'blockIndentListItem', node );
						}
					}
				}
			} );
		};

		const indentListCommand = editor.commands.get( 'indentList' );
		const outdentListCommand = editor.commands.get( 'outdentList' );

		if ( indentListCommand ) {
			this.listenTo<_ListIndentCommandAfterExecuteEvent>(
				indentListCommand,
				'afterExecute',
				clearBlockIndentAttributesOnListIndentChange
			);
		}
		if ( outdentListCommand ) {
			this.listenTo<_ListIndentCommandAfterExecuteEvent>(
				outdentListCommand,
				'afterExecute',
				clearBlockIndentAttributesOnListIndentChange
			);
		}
	}

	/**
	 * Setups conversion for list block indent using offset indents.
	 */
	private _setupConversionUsingOffsetForListBlock(): void {
		const editor = this.editor;
		const conversion = editor.conversion;
		const locale = editor.locale;
		const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
		const listEditing = editor.plugins.get( 'ListEditing' );

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:ol', listBlockIndentUpcastConverter( 'blockIndentList', marginProperty ) );
			dispatcher.on<UpcastElementEvent>( 'element:ul', listBlockIndentUpcastConverter( 'blockIndentList', marginProperty ) );
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'blockIndentList',

			setAttributeOnDowncast( writer, value, element ) {
				if ( value ) {
					writer.setStyle( marginProperty, value as string, element );
				}
			}
		} );
	}

	/**
	 * Setups conversion for list item block indent using offset indents.
	 */
	private _setupConversionUsingOffsetForListItemBlock(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const conversion = editor.conversion;
		const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
		const listEditing = editor.plugins.get( 'ListEditing' );

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>(
				'element:li',
				listBlockIndentUpcastConverter( 'blockIndentListItem', marginProperty ),
				{ priority: 'low' }
			);
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'blockIndentListItem',

			setAttributeOnDowncast( writer, value, element ) {
				if ( value ) {
					writer.setStyle( marginProperty, value as string, element );
				}
			}
		} );
	}

	/**
	 * Setups conversion for list block indent using classes.
	 */
	private _setupConversionUsingClassesForListBlock( classes: Array<string> ): void {
		const editor = this.editor;
		const conversion = editor.conversion;
		const listEditing = editor.plugins.get( 'ListEditing' );

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>(
				'element:ol',
				listBlockIndentUpcastConverterUsingClasses( 'blockIndentList', classes )
			);
			dispatcher.on<UpcastElementEvent>(
				'element:ul',
				listBlockIndentUpcastConverterUsingClasses( 'blockIndentList', classes )
			);
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'blockIndentList',

			setAttributeOnDowncast( writer, value, element ) {
				if ( value ) {
					writer.addClass( value as string, element );
				}
			}
		} );
	}

	/**
	 * Setups conversion for list item block indent using classes.
	 */
	private _setupConversionUsingClassesForListItemBlock( classes: Array<string> ): void {
		const editor = this.editor;
		const conversion = editor.conversion;
		const listEditing = editor.plugins.get( 'ListEditing' );

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>(
				'element:li',
				listBlockIndentUpcastConverterUsingClasses( 'blockIndentListItem', classes ),
				{ priority: 'low' }
			);
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'blockIndentListItem',

			setAttributeOnDowncast( writer, value, element ) {
				if ( value ) {
					writer.addClass( value as string, element );
				}
			}
		} );
	}
}

function listBlockIndentUpcastConverterUsingClasses( attributeName: string, classes: Array<string> ): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const { writer, consumable } = conversionApi;

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const viewClasses = Array.from( data.viewItem.getClassNames() );
		const matchedClass = classes.find( cls => viewClasses.includes( cls ) );

		if ( matchedClass === undefined ) {
			return;
		}

		let applied = false;
		let indentLevel;

		for ( const item of data.modelRange!.getItems( { shallow: true } ) ) {
			if ( indentLevel === undefined ) {
				indentLevel = item.getAttribute( 'listIndent' );
			}

			if ( item.hasAttribute( attributeName ) ) {
				continue;
			}

			if ( item.getAttribute( 'listIndent' ) !== indentLevel ) {
				continue;
			}

			writer.setAttribute( attributeName, matchedClass, item );
			applied = true;
		}

		if ( applied ) {
			consumable.consume( data.viewItem, { classes: matchedClass } );
		}
	};
}

function listBlockIndentUpcastConverter( attributeName: string, marginProperty: string ): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const { writer, consumable } = conversionApi;

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const marginValue = data.viewItem.getStyle( marginProperty );
		let applied = false;
		let indentLevel;

		for ( const item of data.modelRange!.getItems( { shallow: true } ) ) {
			if ( indentLevel === undefined ) {
				indentLevel = item.getAttribute( 'listIndent' );
			}

			if ( item.hasAttribute( attributeName ) ) {
				continue;
			}

			if ( item.getAttribute( 'listIndent' ) !== indentLevel ) {
				continue;
			}

			writer.setAttribute( attributeName, marginValue, item );
			applied = true;
		}

		if ( applied ) {
			consumable.consume( data.viewItem, { styles: marginProperty } );
		}
	};
}

function ensureIndentValuesConsistency( attributeName: string, node: any, previousNodeInList: any, writer: any ): boolean {
	const prevNodeIndentListValue = previousNodeInList.getAttribute( attributeName );

	if ( node.getAttribute( attributeName ) === prevNodeIndentListValue ) {
		return false;
	}

	if ( prevNodeIndentListValue ) {
		writer.setAttribute( attributeName, prevNodeIndentListValue, node );
	} else {
		writer.removeAttribute( attributeName, node );
	}

	return true;
}
