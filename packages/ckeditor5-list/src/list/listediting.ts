/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list/listediting
 */

import {
	Plugin,
	type Editor,
	type MultiCommand
} from 'ckeditor5/src/core.js';

import type {
	DowncastAttributeEvent,
	DocumentChangeEvent,
	DowncastWriter,
	Element,
	Model,
	ModelInsertContentEvent,
	UpcastElementEvent,
	ViewDocumentTabEvent,
	ViewElement,
	ViewAttributeElement,
	Writer,
	DowncastRemoveEvent,
	MapperModelToViewPositionEvent
} from 'ckeditor5/src/engine.js';

import { Delete, type ViewDocumentDeleteEvent } from 'ckeditor5/src/typing.js';
import { Enter, type EnterCommand, type ViewDocumentEnterEvent } from 'ckeditor5/src/enter.js';
import { CKEditorError, type GetCallback } from 'ckeditor5/src/utils.js';

import ListIndentCommand from './listindentcommand.js';
import ListCommand from './listcommand.js';
import ListMergeCommand from './listmergecommand.js';
import ListSplitCommand from './listsplitcommand.js';
import ListUtils from './listutils.js';

import {
	bogusParagraphCreator,
	createModelToViewPositionMapper,
	listItemDowncastConverter,
	listItemDowncastRemoveConverter,
	listItemUpcastConverter,
	reconvertItemsOnDataChange
} from './converters.js';
import {
	findAndAddListHeadToMap,
	fixListIndents,
	fixListItemIds
} from './utils/postfixers.js';
import {
	getAllListItemBlocks,
	isFirstBlockOfListItem,
	isLastBlockOfListItem,
	isSingleListItem,
	getSelectedBlockObject,
	isListItemBlock,
	removeListAttributes,
	ListItemUid,
	type ListElement
} from './utils/model.js';
import {
	getViewElementIdForListType,
	getViewElementNameForListType
} from './utils/view.js';

import ListWalker, { ListBlocksIterable } from './utils/listwalker.js';

import {
	ClipboardPipeline,
	type ClipboardOutputTransformationEvent
} from 'ckeditor5/src/clipboard.js';

import '../../theme/documentlist.css';
import '../../theme/list.css';

/**
 * A list of base list model attributes.
 */
const LIST_BASE_ATTRIBUTES = [ 'listType', 'listIndent', 'listItemId' ];

export type ListType = 'numbered' | 'bulleted' | 'todo' | 'customNumbered' | 'customBulleted';

/**
 * Map of model attributes applicable to list blocks.
 */
export interface ListItemAttributesMap {
	listType?: ListType;
	listIndent?: number;
	listItemId?: string;
}

/**
 * The editing part of the document-list feature. It handles creating, editing and removing lists and list items.
 */
export default class ListEditing extends Plugin {
	/**
	 * The list of registered downcast strategies.
	 */
	private readonly _downcastStrategies: Array<DowncastStrategy> = [];

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Enter, Delete, ListUtils, ClipboardPipeline ] as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'list.multiBlock', true );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		const multiBlock = editor.config.get( 'list.multiBlock' );

		if ( editor.plugins.has( 'LegacyListEditing' ) ) {
			/**
			 * The `List` feature can not be loaded together with the `LegacyList` plugin.
			 *
			 * @error list-feature-conflict
			 * @param conflictPlugin Name of the plugin.
			 */
			throw new CKEditorError( 'list-feature-conflict', this, { conflictPlugin: 'LegacyListEditing' } );
		}

		model.schema.register( '$listItem', { allowAttributes: LIST_BASE_ATTRIBUTES } );

		if ( multiBlock ) {
			model.schema.extend( '$container', { allowAttributesOf: '$listItem' } );
			model.schema.extend( '$block', { allowAttributesOf: '$listItem' } );
			model.schema.extend( '$blockObject', { allowAttributesOf: '$listItem' } );
		} else {
			model.schema.register( 'listItem', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );
		}

		for ( const attribute of LIST_BASE_ATTRIBUTES ) {
			model.schema.setAttributeProperties( attribute, {
				copyOnReplace: true
			} );
		}

		// Register commands.
		editor.commands.add( 'numberedList', new ListCommand( editor, 'numbered' ) );
		editor.commands.add( 'bulletedList', new ListCommand( editor, 'bulleted' ) );

		editor.commands.add( 'customNumberedList', new ListCommand(	editor,	'customNumbered', {	multiLevel: true } ) );
		editor.commands.add( 'customBulletedList', new ListCommand( editor, 'customBulleted', {	multiLevel: true } ) );

		editor.commands.add( 'indentList', new ListIndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new ListIndentCommand( editor, 'backward' ) );

		editor.commands.add( 'splitListItemBefore', new ListSplitCommand( editor, 'before' ) );
		editor.commands.add( 'splitListItemAfter', new ListSplitCommand( editor, 'after' ) );

		if ( multiBlock ) {
			editor.commands.add( 'mergeListItemBackward', new ListMergeCommand( editor, 'backward' ) );
			editor.commands.add( 'mergeListItemForward', new ListMergeCommand( editor, 'forward' ) );
		}

		this._setupDeleteIntegration();
		this._setupEnterIntegration();
		this._setupTabIntegration();
		this._setupClipboardIntegration();
		this._setupAccessibilityIntegration();
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const commands = editor.commands;
		const indent = commands.get( 'indent' ) as MultiCommand;
		const outdent = commands.get( 'outdent' ) as MultiCommand;

		if ( indent ) {
			// Priority is high due to integration with `IndentBlock` plugin. We want to indent list first and if it's not possible
			// user can indent content with `IndentBlock` plugin.
			indent.registerChildCommand( commands.get( 'indentList' )!, { priority: 'high' } );
		}

		if ( outdent ) {
			// Priority is lowest due to integration with `IndentBlock` and `IndentCode` plugins.
			// First we want to allow user to outdent all indendations from other features then he can oudent list item.
			outdent.registerChildCommand( commands.get( 'outdentList' )!, { priority: 'lowest' } );
		}

		// Register conversion and model post-fixer after other plugins had a chance to register their attribute strategies.
		this._setupModelPostFixing();
		this._setupConversion();
	}

	/**
	 * Registers a downcast strategy.
	 *
	 * **Note**: Strategies must be registered in the `Plugin#init()` phase so that it can be applied
	 * in the `ListEditing#afterInit()`.
	 *
	 * @param strategy The downcast strategy to register.
	 */
	public registerDowncastStrategy( strategy: DowncastStrategy ): void {
		this._downcastStrategies.push( strategy );
	}

	/**
	 * Returns list of model attribute names that should affect downcast conversion.
	 */
	public getListAttributeNames(): Array<string> {
		return [
			...LIST_BASE_ATTRIBUTES,
			...this._downcastStrategies.map( strategy => strategy.attributeName )
		];
	}

	/**
	 * Attaches the listener to the {@link module:engine/view/document~Document#event:delete} event and handles backspace/delete
	 * keys in and around document lists.
	 */
	private _setupDeleteIntegration() {
		const editor = this.editor;
		const mergeBackwardCommand: ListMergeCommand | undefined = editor.commands.get( 'mergeListItemBackward' );
		const mergeForwardCommand: ListMergeCommand | undefined = editor.commands.get( 'mergeListItemForward' );

		this.listenTo<ViewDocumentDeleteEvent>( editor.editing.view.document, 'delete', ( evt, data ) => {
			const selection = editor.model.document.selection;

			// Let the Widget plugin take care of block widgets while deleting (https://github.com/ckeditor/ckeditor5/issues/11346).
			if ( getSelectedBlockObject( editor.model ) ) {
				return;
			}

			editor.model.change( () => {
				const firstPosition = selection.getFirstPosition()!;

				if ( selection.isCollapsed && data.direction == 'backward' ) {
					if ( !firstPosition.isAtStart ) {
						return;
					}

					const positionParent = firstPosition.parent;

					if ( !isListItemBlock( positionParent ) ) {
						return;
					}

					const previousBlock = ListWalker.first( positionParent, {
						sameAttributes: 'listType',
						sameIndent: true
					} );

					// Outdent the first block of a first list item.
					if ( !previousBlock && positionParent.getAttribute( 'listIndent' ) === 0 ) {
						if ( !isLastBlockOfListItem( positionParent ) ) {
							editor.execute( 'splitListItemAfter' );
						}

						editor.execute( 'outdentList' );
					}
					// Merge block with previous one (on the block level or on the content level).
					else {
						if ( !mergeBackwardCommand || !mergeBackwardCommand.isEnabled ) {
							return;
						}

						mergeBackwardCommand.execute( {
							shouldMergeOnBlocksContentLevel: shouldMergeOnBlocksContentLevel( editor.model, 'backward' )
						} );
					}

					data.preventDefault();
					evt.stop();
				}
				// Non-collapsed selection or forward delete.
				else {
					// Collapsed selection should trigger forward merging only if at the end of a block.
					if ( selection.isCollapsed && !selection.getLastPosition()!.isAtEnd ) {
						return;
					}

					if ( !mergeForwardCommand || !mergeForwardCommand.isEnabled ) {
						return;
					}

					mergeForwardCommand.execute( {
						shouldMergeOnBlocksContentLevel: shouldMergeOnBlocksContentLevel( editor.model, 'forward' )
					} );

					data.preventDefault();
					evt.stop();
				}
			} );
		}, { context: 'li' } );
	}

	/**
	 * Attaches a listener to the {@link module:engine/view/document~Document#event:enter} event and handles enter key press
	 * in document lists.
	 */
	private _setupEnterIntegration() {
		const editor = this.editor;
		const model = editor.model;
		const commands = editor.commands;
		const enterCommand: EnterCommand = commands.get( 'enter' )!;

		// Overwrite the default Enter key behavior: outdent or split the list in certain cases.
		this.listenTo<ViewDocumentEnterEvent>( editor.editing.view.document, 'enter', ( evt, data ) => {
			const doc = model.document;
			const positionParent = doc.selection.getFirstPosition()!.parent;

			if (
				doc.selection.isCollapsed &&
				isListItemBlock( positionParent ) &&
				positionParent.isEmpty &&
				!data.isSoft
			) {
				const isFirstBlock = isFirstBlockOfListItem( positionParent );
				const isLastBlock = isLastBlockOfListItem( positionParent );

				// * a      →      * a
				// * []     →      []
				if ( isFirstBlock && isLastBlock ) {
					editor.execute( 'outdentList' );

					data.preventDefault();
					evt.stop();
				}
				// * []     →      * []
				//   a      →      * a
				else if ( isFirstBlock && !isLastBlock ) {
					editor.execute( 'splitListItemAfter' );

					data.preventDefault();
					evt.stop();
				}
				// * a      →      * a
				//   []     →      * []
				else if ( isLastBlock ) {
					editor.execute( 'splitListItemBefore' );

					data.preventDefault();
					evt.stop();
				}
			}
		}, { context: 'li' } );

		// In some cases, after the default block splitting, we want to modify the new block to become a new list item
		// instead of an additional block in the same list item.
		this.listenTo( enterCommand, 'afterExecute', () => {
			const splitCommand: ListSplitCommand = commands.get( 'splitListItemBefore' )!;

			// The command has not refreshed because the change block related to EnterCommand#execute() is not over yet.
			// Let's keep it up to date and take advantage of ListSplitCommand#isEnabled.
			splitCommand.refresh();

			if ( !splitCommand.isEnabled ) {
				return;
			}

			const doc = editor.model.document;
			const positionParent = doc.selection.getLastPosition()!.parent;
			const listItemBlocks = getAllListItemBlocks( positionParent as any );

			// Keep in mind this split happens after the default enter handler was executed. For instance:
			//
			// │       Initial state       │    After default enter    │   Here in #afterExecute   │
			// ├───────────────────────────┼───────────────────────────┼───────────────────────────┤
			// │          * a[]            │           * a             │           * a             │
			// │                           │             []            │           * []            │
			if ( listItemBlocks.length === 2 ) {
				splitCommand.execute();
			}
		} );
	}

	/**
	 * Attaches a listener to the {@link module:engine/view/document~Document#event:tab} event and handles tab key and tab+shift keys
	 * presses in document lists.
	 */
	private _setupTabIntegration() {
		const editor = this.editor;

		this.listenTo<ViewDocumentTabEvent>( editor.editing.view.document, 'tab', ( evt, data ) => {
			const commandName = data.shiftKey ? 'outdentList' : 'indentList';
			const command = this.editor.commands.get( commandName )!;

			if ( command.isEnabled ) {
				editor.execute( commandName );

				data.stopPropagation();
				data.preventDefault();
				evt.stop();
			}
		}, { context: 'li' } );
	}

	/**
	 * Registers the conversion helpers for the document-list feature.
	 */
	private _setupConversion() {
		const editor = this.editor;
		const model = editor.model;
		const attributeNames = this.getListAttributeNames();
		const multiBlock = editor.config.get( 'list.multiBlock' );
		const elementName = multiBlock ? 'paragraph' : 'listItem';

		editor.conversion.for( 'upcast' )
			// Convert <li> to a generic paragraph (or listItem element) so the content of <li> is always inside a block.
			// Setting the listType attribute to let other features (to-do list) know that this is part of a list item.
			// This is also important to properly handle simple lists so that paragraphs inside a list item won't break the list item.
			// <li>  <-- converted to listItem
			//   <p></p> <-- should be also converted to listItem, so it won't split and replace the listItem generated from the above li.
			.elementToElement( {
				view: 'li',
				model: ( viewElement, { writer } ) => writer.createElement( elementName, { listType: '' } )
			} )
			// Convert paragraph to the list block (without list type defined yet).
			// This is important to properly handle bogus paragraph and to-do lists.
			// Most of the time the bogus paragraph should not appear in the data of to-do list,
			// but if there is any marker or an attribute on the paragraph then the bogus paragraph
			// is preserved in the data, and we need to be able to detect this case.
			.elementToElement( {
				view: 'p',
				model: ( viewElement, { writer } ) => {
					if ( viewElement.parent && viewElement.parent.is( 'element', 'li' ) ) {
						return writer.createElement( elementName, { listType: '' } );
					}

					return null;
				},
				converterPriority: 'high'
			} )
			.add( dispatcher => {
				dispatcher.on<UpcastElementEvent>( 'element:li', listItemUpcastConverter() );
			} );

		if ( !multiBlock ) {
			editor.conversion.for( 'downcast' )
				.elementToElement( {
					model: 'listItem',
					view: 'p'
				} );
		}

		editor.conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: elementName,
				view: bogusParagraphCreator( attributeNames ),
				converterPriority: 'high'
			} )
			.add( dispatcher => {
				dispatcher.on<DowncastAttributeEvent<ListElement>>(
					'attribute',
					listItemDowncastConverter( attributeNames, this._downcastStrategies, model )
				);

				dispatcher.on<DowncastRemoveEvent>( 'remove', listItemDowncastRemoveConverter( model.schema ) );
			} );

		editor.conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: elementName,
				view: bogusParagraphCreator( attributeNames, { dataPipeline: true } ),
				converterPriority: 'high'
			} )
			.add( dispatcher => {
				dispatcher.on<DowncastAttributeEvent<ListElement>>(
					'attribute',
					listItemDowncastConverter( attributeNames, this._downcastStrategies, model, { dataPipeline: true } )
				);
			} );

		const modelToViewPositionMapper = createModelToViewPositionMapper( this._downcastStrategies, editor.editing.view );

		editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', modelToViewPositionMapper );
		editor.data.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', modelToViewPositionMapper );

		this.listenTo<DocumentChangeEvent>(
			model.document,
			'change:data',
			reconvertItemsOnDataChange( model, editor.editing, attributeNames, this ),
			{ priority: 'high' }
		);

		// For LI verify if an ID of the attribute element is correct.
		this.on<ListEditingCheckAttributesEvent>( 'checkAttributes:item', ( evt, { viewElement, modelAttributes } ) => {
			if ( viewElement.id != modelAttributes.listItemId ) {
				evt.return = true;
				evt.stop();
			}
		} );

		// For UL and OL check if the name and ID of element is correct.
		this.on<ListEditingCheckAttributesEvent>( 'checkAttributes:list', ( evt, { viewElement, modelAttributes } ) => {
			if (
				viewElement.name != getViewElementNameForListType( modelAttributes.listType ) ||
				viewElement.id != getViewElementIdForListType( modelAttributes.listType, modelAttributes.listIndent )
			) {
				evt.return = true;
				evt.stop();
			}
		} );
	}

	/**
	 * Registers model post-fixers.
	 */
	private _setupModelPostFixing() {
		const model = this.editor.model;
		const attributeNames = this.getListAttributeNames();

		// Register list fixing.
		// First the low level handler.
		model.document.registerPostFixer( writer => modelChangePostFixer( model, writer, attributeNames, this ) );

		// Then the callbacks for the specific lists.
		// The indentation fixing must be the first one...
		this.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			evt.return = fixListIndents( listNodes, writer ) || evt.return;
		}, { priority: 'high' } );

		// ...then the item ids... and after that other fixers that rely on the correct indentation and ids.
		this.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer, seenIds } ) => {
			evt.return = fixListItemIds( listNodes, seenIds, writer ) || evt.return;
		}, { priority: 'high' } );
	}

	/**
	 * Integrates the feature with the clipboard via {@link module:engine/model/model~Model#insertContent} and
	 * {@link module:engine/model/model~Model#getSelectedContent}.
	 */
	private _setupClipboardIntegration() {
		const model = this.editor.model;
		const clipboardPipeline: ClipboardPipeline = this.editor.plugins.get( 'ClipboardPipeline' );

		this.listenTo<ModelInsertContentEvent>( model, 'insertContent', createModelIndentPasteFixer( model ), { priority: 'high' } );

		// To enhance the UX, the editor should not copy list attributes to the clipboard if the selection
		// started and ended in the same list item.
		//
		// If the selection was enclosed in a single list item, there is a good chance the user did not want it
		// copied as a list item but plain blocks.
		//
		// This avoids pasting orphaned list items instead of paragraphs, for instance, straight into the root.
		//
		//	                       ┌─────────────────────┬───────────────────┐
		//	                       │ Selection           │ Clipboard content │
		//	                       ├─────────────────────┼───────────────────┤
		//	                       │ [* <Widget />]      │ <Widget />        │
		//	                       ├─────────────────────┼───────────────────┤
		//	                       │ [* Foo]             │ Foo               │
		//	                       ├─────────────────────┼───────────────────┤
		//	                       │ * Foo [bar] baz     │ bar               │
		//	                       ├─────────────────────┼───────────────────┤
		//	                       │ * Fo[o              │ o                 │
		//	                       │   ba]r              │ ba                │
		//	                       ├─────────────────────┼───────────────────┤
		//	                       │ * Fo[o              │ * o               │
		//	                       │ * ba]r              │ * ba              │
		//	                       ├─────────────────────┼───────────────────┤
		//	                       │ [* Foo              │ * Foo             │
		//	                       │  * bar]             │ * bar             │
		//	                       └─────────────────────┴───────────────────┘
		//
		// See https://github.com/ckeditor/ckeditor5/issues/11608, https://github.com/ckeditor/ckeditor5/issues/14969
		this.listenTo<ClipboardOutputTransformationEvent>( clipboardPipeline, 'outputTransformation', ( evt, data ) => {
			model.change( writer => {
				// Remove last block if it's empty.
				const allContentChildren = Array.from( data.content.getChildren() );
				const lastItem = allContentChildren[ allContentChildren.length - 1 ];

				if ( allContentChildren.length > 1 && lastItem.is( 'element' ) && lastItem.isEmpty ) {
					const contentChildrenExceptLastItem = allContentChildren.slice( 0, -1 );

					if ( contentChildrenExceptLastItem.every( isListItemBlock ) ) {
						writer.remove( lastItem );
					}
				}

				// Copy/cut only content of a list item (for drag-drop move the whole list item).
				if ( data.method == 'copy' || data.method == 'cut' ) {
					const allChildren = Array.from( data.content.getChildren() );
					const isSingleListItemSelected = isSingleListItem( allChildren );

					if ( isSingleListItemSelected ) {
						removeListAttributes( allChildren as Array<Element>, writer );
					}
				}
			} );
		} );
	}

	/**
	 * Informs editor accessibility features about keystrokes brought by the plugin.
	 */
	private _setupAccessibilityIntegration() {
		const editor = this.editor;
		const t = editor.t;

		editor.accessibility.addKeystrokeInfoGroup( {
			id: 'list',
			label: t( 'Keystrokes that can be used in a list' ),
			keystrokes: [
				{
					label: t( 'Increase list item indent' ),
					keystroke: 'Tab'
				},
				{
					label: t( 'Decrease list item indent' ),
					keystroke: 'Shift+Tab'
				}
			]
		} );
	}
}

/**
 * The attribute to attribute downcast strategy for UL, OL, LI elements.
 */
export interface AttributeDowncastStrategy {

	/**
	 * The scope of the downcast (whether it applies to LI or OL/UL).
	 */
	scope: 'list' | 'item';

	/**
	 * The model attribute name.
	 */
	attributeName: string;

	/**
	 * Sets the property on the view element.
	 */
	setAttributeOnDowncast( writer: DowncastWriter, value: unknown, element: ViewElement ): void;
}

/**
 * The custom marker downcast strategy.
 */
export interface ItemMarkerDowncastStrategy {

	/**
	 * The scope of the downcast.
	 */
	scope: 'itemMarker';

	/**
	 * The model attribute name.
	 */
	attributeName: string;

	/**
	 * Creates a view element for a custom item marker.
	 */
	createElement(
		writer: DowncastWriter,
		modelElement: Element,
		{ dataPipeline }: { dataPipeline?: boolean }
	): ViewElement | null;

	/**
	 * Creates an AttributeElement to be used for wrapping a first block of a list item.
	 */
	createWrapperElement?(
		writer: DowncastWriter,
		modelElement: Element,
		{ dataPipeline }: { dataPipeline?: boolean }
	): ViewAttributeElement;

	/**
	 * Should return true if the given list block can be wrapped with the wrapper created by `createWrapperElement()`
	 * or only the marker element should be wrapped.
	 */
	canWrapElement?( modelElement: Element ): boolean;

	/**
	 * Should return true if the custom marker can be injected into a given list block.
	 * Otherwise, custom marker view element is always injected before the block element.
	 */
	canInjectMarkerIntoElement?( modelElement: Element ): boolean;
}

/**
 * The downcast strategy.
 */
export type DowncastStrategy = AttributeDowncastStrategy | ItemMarkerDowncastStrategy;

/**
 * Post-fixer that reacts to changes on document and fixes incorrect model states (invalid `listItemId` and `listIndent` values).
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent=1>Item 2</paragraph>   <--- this is removed.
 * <paragraph listType="bulleted" listItemId="c" listIndent=2>Item 3</paragraph>
 * ```
 *
 * The list structure after the middle element is removed:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent=2>Item 3</paragraph>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent=1>Item 3</paragraph>   <--- note that indent got post-fixed.
 * ```
 *
 * @param model The data model.
 * @param writer The writer to do changes with.
 * @param attributeNames The list of all model list attributes (including registered strategies).
 * @param ListEditing The document list editing plugin.
 * @returns `true` if any change has been applied, `false` otherwise.
 */
function modelChangePostFixer(
	model: Model,
	writer: Writer,
	attributeNames: Array<string>,
	listEditing: ListEditing
) {
	const changes = model.document.differ.getChanges();
	const itemToListHead = new Map<ListElement, ListElement>();
	const multiBlock = listEditing.editor.config.get( 'list.multiBlock' );

	let applied = false;

	for ( const entry of changes ) {
		if ( entry.type == 'insert' && entry.name != '$text' ) {
			const item = entry.position.nodeAfter!;

			// Remove attributes in case of renamed element.
			if ( !model.schema.checkAttribute( item, 'listItemId' ) ) {
				for ( const attributeName of Array.from( item.getAttributeKeys() ) ) {
					if ( attributeNames.includes( attributeName ) ) {
						writer.removeAttribute( attributeName, item );

						applied = true;
					}
				}
			}

			findAndAddListHeadToMap( entry.position, itemToListHead );

			// Insert of a non-list item - check if there is a list after it.
			if ( !entry.attributes.has( 'listItemId' ) ) {
				findAndAddListHeadToMap( entry.position.getShiftedBy( entry.length ), itemToListHead );
			}

			// Check if there is no nested list.
			for ( const { item: innerItem, previousPosition } of model.createRangeIn( item as Element ) ) {
				if ( isListItemBlock( innerItem ) ) {
					findAndAddListHeadToMap( previousPosition, itemToListHead );
				}
			}
		}
		// Removed list item or block adjacent to a list.
		else if ( entry.type == 'remove' ) {
			findAndAddListHeadToMap( entry.position, itemToListHead );
		}
		// Changed list item indent or type.
		else if ( entry.type == 'attribute' && attributeNames.includes( entry.attributeKey ) ) {
			findAndAddListHeadToMap( entry.range.start, itemToListHead );

			if ( entry.attributeNewValue === null ) {
				findAndAddListHeadToMap( entry.range.start.getShiftedBy( 1 ), itemToListHead );
			}
		}

		// Make sure that there is no left over listItem element without attributes or a block with list attributes that is not a listItem.
		if ( !multiBlock && entry.type == 'attribute' && LIST_BASE_ATTRIBUTES.includes( entry.attributeKey ) ) {
			const element = entry.range.start.nodeAfter!;

			if ( entry.attributeNewValue === null && element && element.is( 'element', 'listItem' ) ) {
				writer.rename( element, 'paragraph' );
				applied = true;
			} else if ( entry.attributeOldValue === null && element && element.is( 'element' ) && element.name != 'listItem' ) {
				writer.rename( element, 'listItem' );
				applied = true;
			}
		}
	}

	// Make sure that IDs are not shared by split list.
	const seenIds = new Set<string>();

	for ( const listHead of itemToListHead.values() ) {
		applied = listEditing.fire<ListEditingPostFixerEvent>( 'postFixer', {
			listNodes: new ListBlocksIterable( listHead ),
			listHead,
			writer,
			seenIds
		} ) || applied;
	}

	return applied;
}

/**
 * A fixer for pasted content that includes list items.
 *
 * It fixes indentation of pasted list items so the pasted items match correctly to the context they are pasted into.
 *
 * Example:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent="1">B^</paragraph>
 * // At ^ paste:  <paragraph listType="numbered" listItemId="x" listIndent="0">X</paragraph>
 * //              <paragraph listType="numbered" listItemId="y" listIndent="1">Y</paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent="1">BX</paragraph>
 * <paragraph listType="bulleted" listItemId="y" listIndent="2">Y/paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>
 * ```
 */
function createModelIndentPasteFixer( model: Model ): GetCallback<ModelInsertContentEvent> {
	return ( evt, [ content, selectable ] ) => {
		const items = content.is( 'documentFragment' ) ?
			Array.from( content.getChildren() ) :
			[ content ];

		if ( !items.length ) {
			return;
		}

		const selection = selectable ?
			model.createSelection( selectable ) :
			model.document.selection;

		const position = selection.getFirstPosition()!;

		// Get a reference list item. Attributes of the inserted list items will be fixed according to that item.
		let refItem: ListElement;

		if ( isListItemBlock( position.parent ) ) {
			refItem = position.parent;
		} else if ( isListItemBlock( position.nodeBefore ) ) {
			refItem = position.nodeBefore;
		} else {
			return; // Content is not copied into a list.
		}

		model.change( writer => {
			const refType = refItem.getAttribute( 'listType' );
			const refIndent = refItem.getAttribute( 'listIndent' );
			const firstElementIndent = items[ 0 ].getAttribute( 'listIndent' ) as number || 0;
			const indentDiff = Math.max( refIndent - firstElementIndent, 0 );

			for ( const item of items ) {
				const isListItem = isListItemBlock( item );

				if ( refItem.is( 'element', 'listItem' ) && item.is( 'element', 'paragraph' ) ) {
					/**
					 * When paragraphs or a plain text list is pasted into a simple list, convert
					 * the `<paragraphs>' to `<listItem>' to avoid breaking the target list.
					 *
					 * See https://github.com/ckeditor/ckeditor5/issues/13826.
					 */
					writer.rename( item as Element, 'listItem' );
				}

				writer.setAttributes( {
					listIndent: ( isListItem ? item.getAttribute( 'listIndent' ) : 0 ) + indentDiff,
					listItemId: isListItem ? item.getAttribute( 'listItemId' ) : ListItemUid.next(),
					listType: refType
				}, item );
			}
		} );
	};
}

/**
 * Decides whether the merge should be accompanied by the model's `deleteContent()`, for instance, to get rid of the inline
 * content in the selection or take advantage of the heuristics in `deleteContent()` that helps convert lists into paragraphs
 * in certain cases.
 */
function shouldMergeOnBlocksContentLevel( model: Model, direction: 'backward' | 'forward' ) {
	const selection = model.document.selection;

	if ( !selection.isCollapsed ) {
		return !getSelectedBlockObject( model );
	}

	if ( direction === 'forward' ) {
		return true;
	}

	const firstPosition = selection.getFirstPosition()!;
	const positionParent = firstPosition.parent;
	const previousSibling = positionParent.previousSibling!;

	if ( model.schema.isObject( previousSibling ) ) {
		return false;
	}

	if ( ( previousSibling as Element ).isEmpty ) {
		return true;
	}

	return isSingleListItem( [ positionParent as Element, previousSibling ] );
}

/**
 * Event fired on changes detected on the model list element to verify if the view representation of a list element
 * is representing those attributes.
 *
 * It allows triggering a re-wrapping of a list item.
 *
 * @internal
 * @eventName ~ListEditing#postFixer
 * @param listHead The head element of a list.
 * @param writer The writer to do changes with.
 * @param seenIds The set of already known IDs.
 * @returns If a post-fixer made a change of the model tree, it should return `true`.
 */
export type ListEditingPostFixerEvent = {
	name: 'postFixer';
	args: [ {
		listNodes: ListBlocksIterable;
		listHead: Element;
		writer: Writer;
		seenIds: Set<string>;
	} ];
	return: boolean;
};

/**
 * Event fired on changes detected on the model list element to verify if the view representation of a list element
 * is representing those attributes.
 *
 * It allows triggering a re-wrapping of a list item.
 *
 * **Note**: For convenience this event is namespaced and could be captured as `checkAttributes:list` or `checkAttributes:item`.
 *
 * @internal
 * @eventName ~ListEditing#checkAttributes
 */
export type ListEditingCheckAttributesEvent = {
	name: 'checkAttributes' | 'checkAttributes:list' | 'checkAttributes:item';
	args: [ {
		viewElement: ViewElement & { id?: string };
		modelAttributes: ListItemAttributesMap;
	} ];
	return: boolean;
};

/**
 * Event fired on changes detected on the model list element to verify if the view representation of a list block element
 * is representing those attributes.
 *
 * It allows triggering a reconversion of a list item block.
 *
 * @internal
 * @eventName ~ListEditing#checkElement
 */
export type ListEditingCheckElementEvent = {
	name: 'checkElement';
	args: [ {
		viewElement: ViewElement;
		modelElement: Element;
	} ];
	return: boolean;
};
