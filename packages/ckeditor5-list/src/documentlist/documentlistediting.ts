/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistediting
 */

import {
	Plugin,
	type MultiCommand
} from 'ckeditor5/src/core';

import type {
	DowncastAttributeEvent,
	DocumentChangeEvent,
	DowncastWriter,
	Element,
	Model,
	ModelGetSelectedContentEvent,
	ModelInsertContentEvent,
	UpcastElementEvent,
	ViewDocumentTabEvent,
	ViewElement,
	Writer
} from 'ckeditor5/src/engine';

import { Delete, type ViewDocumentDeleteEvent } from 'ckeditor5/src/typing';
import { Enter, type EnterCommand, type ViewDocumentEnterEvent } from 'ckeditor5/src/enter';
import { CKEditorError, type GetCallback } from 'ckeditor5/src/utils';

import DocumentListIndentCommand from './documentlistindentcommand';
import DocumentListCommand from './documentlistcommand';
import DocumentListMergeCommand from './documentlistmergecommand';
import DocumentListSplitCommand from './documentlistsplitcommand';
import DocumentListUtils from './documentlistutils';
import {
	bogusParagraphCreator,
	listItemDowncastConverter,
	listItemUpcastConverter,
	listUpcastCleanList,
	reconvertItemsOnDataChange
} from './converters';
import {
	findAndAddListHeadToMap,
	fixListIndents,
	fixListItemIds
} from './utils/postfixers';
import {
	getAllListItemBlocks,
	isFirstBlockOfListItem,
	isLastBlockOfListItem,
	isSingleListItem,
	getSelectedBlockObject,
	isListItemBlock,
	removeListAttributes,
	type ListElement
} from './utils/model';
import {
	getViewElementIdForListType,
	getViewElementNameForListType
} from './utils/view';

import ListWalker, {
	iterateSiblingListBlocks,
	ListBlocksIterable
} from './utils/listwalker';

import '../../theme/documentlist.css';
import '../../theme/list.css';

/**
 * A list of base list model attributes.
 */
const LIST_BASE_ATTRIBUTES = [ 'listType', 'listIndent', 'listItemId' ];

/**
 * Map of model attributes applicable to list blocks.
 */
export interface ListItemAttributesMap {
	listType?: 'numbered' | 'bulleted';
	listIndent?: number;
	listItemId?: string;
}

/**
 * The editing part of the document-list feature. It handles creating, editing and removing lists and list items.
 */
export default class DocumentListEditing extends Plugin {
	/**
	 * The list of registered downcast strategies.
	 */
	private readonly _downcastStrategies: Array<DowncastStrategy> = [];

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DocumentListEditing' {
		return 'DocumentListEditing';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Enter, Delete, DocumentListUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;

		if ( editor.plugins.has( 'ListEditing' ) ) {
			/**
			 * The `DocumentList` feature can not be loaded together with the `List` plugin.
			 *
			 * @error document-list-feature-conflict
			 * @param conflictPlugin Name of the plugin.
			 */
			throw new CKEditorError( 'document-list-feature-conflict', this, { conflictPlugin: 'ListEditing' } );
		}

		model.schema.extend( '$container', { allowAttributes: LIST_BASE_ATTRIBUTES } );
		model.schema.extend( '$block', { allowAttributes: LIST_BASE_ATTRIBUTES } );
		model.schema.extend( '$blockObject', { allowAttributes: LIST_BASE_ATTRIBUTES } );

		for ( const attribute of LIST_BASE_ATTRIBUTES ) {
			model.schema.setAttributeProperties( attribute, {
				copyOnReplace: true
			} );
		}

		// Register commands.
		editor.commands.add( 'numberedList', new DocumentListCommand( editor, 'numbered' ) );
		editor.commands.add( 'bulletedList', new DocumentListCommand( editor, 'bulleted' ) );

		editor.commands.add( 'indentList', new DocumentListIndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new DocumentListIndentCommand( editor, 'backward' ) );

		editor.commands.add( 'mergeListItemBackward', new DocumentListMergeCommand( editor, 'backward' ) );
		editor.commands.add( 'mergeListItemForward', new DocumentListMergeCommand( editor, 'forward' ) );

		editor.commands.add( 'splitListItemBefore', new DocumentListSplitCommand( editor, 'before' ) );
		editor.commands.add( 'splitListItemAfter', new DocumentListSplitCommand( editor, 'after' ) );

		this._setupDeleteIntegration();
		this._setupEnterIntegration();
		this._setupTabIntegration();
		this._setupClipboardIntegration();
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
	 * in the `DocumentListEditing#afterInit()`.
	 *
	 * @param strategy The downcast strategy to register.
	 */
	public registerDowncastStrategy( strategy: DowncastStrategy ): void {
		this._downcastStrategies.push( strategy );
	}

	/**
	 * Returns list of model attribute names that should affect downcast conversion.
	 */
	private _getListAttributeNames() {
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
		const mergeBackwardCommand: DocumentListMergeCommand = editor.commands.get( 'mergeListItemBackward' )!;
		const mergeForwardCommand: DocumentListMergeCommand = editor.commands.get( 'mergeListItemForward' )!;

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
						if ( !mergeBackwardCommand.isEnabled ) {
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

					if ( !mergeForwardCommand.isEnabled ) {
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
			const splitCommand: DocumentListSplitCommand = commands.get( 'splitListItemBefore' )!;

			// The command has not refreshed because the change block related to EnterCommand#execute() is not over yet.
			// Let's keep it up to date and take advantage of DocumentListSplitCommand#isEnabled.
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
		const attributeNames = this._getListAttributeNames();

		editor.conversion.for( 'upcast' )
			.elementToElement( { view: 'li', model: 'paragraph' } )
			.add( dispatcher => {
				dispatcher.on<UpcastElementEvent>( 'element:li', listItemUpcastConverter() );
				dispatcher.on<UpcastElementEvent>( 'element:ul', listUpcastCleanList(), { priority: 'high' } );
				dispatcher.on<UpcastElementEvent>( 'element:ol', listUpcastCleanList(), { priority: 'high' } );
			} );

		editor.conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'paragraph',
				view: bogusParagraphCreator( attributeNames ),
				converterPriority: 'high'
			} );

		editor.conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'paragraph',
				view: bogusParagraphCreator( attributeNames, { dataPipeline: true } ),
				converterPriority: 'high'
			} );

		editor.conversion.for( 'downcast' )
			.add( dispatcher => {
				dispatcher.on<DowncastAttributeEvent<ListElement>>(
					'attribute',
					listItemDowncastConverter( attributeNames, this._downcastStrategies, model )
				);
			} );

		this.listenTo<DocumentChangeEvent>(
			model.document,
			'change:data',
			reconvertItemsOnDataChange( model, editor.editing, attributeNames, this ),
			{ priority: 'high' }
		);

		// For LI verify if an ID of the attribute element is correct.
		this.on<DocumentListEditingCheckAttributesEvent>( 'checkAttributes:item', ( evt, { viewElement, modelAttributes } ) => {
			if ( viewElement.id != modelAttributes.listItemId ) {
				evt.return = true;
				evt.stop();
			}
		} );

		// For UL and OL check if the name and ID of element is correct.
		this.on<DocumentListEditingCheckAttributesEvent>( 'checkAttributes:list', ( evt, { viewElement, modelAttributes } ) => {
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
		const attributeNames = this._getListAttributeNames();

		// Register list fixing.
		// First the low level handler.
		model.document.registerPostFixer( writer => modelChangePostFixer( model, writer, attributeNames, this ) );

		// Then the callbacks for the specific lists.
		// The indentation fixing must be the first one...
		this.on<DocumentListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			evt.return = fixListIndents( listNodes, writer ) || evt.return;
		}, { priority: 'high' } );

		// ...then the item ids... and after that other fixers that rely on the correct indentation and ids.
		this.on<DocumentListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer, seenIds } ) => {
			evt.return = fixListItemIds( listNodes, seenIds, writer ) || evt.return;
		}, { priority: 'high' } );
	}

	/**
	 * Integrates the feature with the clipboard via {@link module:engine/model/model~Model#insertContent} and
	 * {@link module:engine/model/model~Model#getSelectedContent}.
	 */
	private _setupClipboardIntegration() {
		const model = this.editor.model;

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
		// See https://github.com/ckeditor/ckeditor5/issues/11608.
		this.listenTo<ModelGetSelectedContentEvent>( model, 'getSelectedContent', ( evt, [ selection ] ) => {
			const isSingleListItemSelected = isSingleListItem( Array.from( selection.getSelectedBlocks() ) );

			if ( isSingleListItemSelected ) {
				model.change( writer => removeListAttributes( Array.from( evt.return!.getChildren() as any ), writer ) );
			}
		} );
	}
}

/**
 * The downcast strategy.
 */
export interface DowncastStrategy {

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
 * @param documentListEditing The document list editing plugin.
 * @returns `true` if any change has been applied, `false` otherwise.
 */
function modelChangePostFixer(
	model: Model,
	writer: Writer,
	attributeNames: Array<string>,
	documentListEditing: DocumentListEditing
) {
	const changes = model.document.differ.getChanges();
	const itemToListHead = new Map<ListElement, ListElement>();

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
	}

	// Make sure that IDs are not shared by split list.
	const seenIds = new Set<string>();

	for ( const listHead of itemToListHead.values() ) {
		applied = documentListEditing.fire<DocumentListEditingPostFixerEvent>( 'postFixer', {
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
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>A</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent=1>B^</paragraph>
 * // At ^ paste:  <paragraph listType="bulleted" listItemId="x" listIndent=4>X</paragraph>
 * //              <paragraph listType="bulleted" listItemId="y" listIndent=5>Y</paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent=2>C</paragraph>
 * ```
 *
 * Should become:
 *
 * ```xml
 * <paragraph listType="bulleted" listItemId="a" listIndent=0>A</paragraph>
 * <paragraph listType="bulleted" listItemId="b" listIndent=1>BX</paragraph>
 * <paragraph listType="bulleted" listItemId="y" listIndent=2>Y/paragraph>
 * <paragraph listType="bulleted" listItemId="c" listIndent=2>C</paragraph>
 * ```
 */
function createModelIndentPasteFixer( model: Model ): GetCallback<ModelInsertContentEvent> {
	return ( evt, [ content, selectable ] ) => {
		// Check whether inserted content starts from a `listItem`. If it does not, it means that there are some other
		// elements before it and there is no need to fix indents, because even if we insert that content into a list,
		// that list will be broken.
		// Note: we also need to handle singular elements because inserting item with indent 0 into 0,1,[],2
		// would create incorrect model.
		const item = content.is( 'documentFragment' ) ? content.getChild( 0 ) : content;

		if ( !isListItemBlock( item ) ) {
			return;
		}

		let selection;

		if ( !selectable ) {
			selection = model.document.selection;
		} else {
			selection = model.createSelection( selectable );
		}

		// Get a reference list item. Inserted list items will be fixed according to that item.
		const pos = selection.getFirstPosition()!;
		let refItem = null;

		if ( isListItemBlock( pos.parent ) ) {
			refItem = pos.parent;
		} else if ( isListItemBlock( pos.nodeBefore ) ) {
			refItem = pos.nodeBefore;
		}

		// If there is `refItem` it means that we do insert list items into an existing list.
		if ( !refItem ) {
			return;
		}

		// First list item in `data` has indent equal to 0 (it is a first list item). It should have indent equal
		// to the indent of reference item. We have to fix the first item and all of it's children and following siblings.
		// Indent of all those items has to be adjusted to reference item.
		const indentChange = refItem.getAttribute( 'listIndent' ) - item.getAttribute( 'listIndent' );

		// Fix only if there is anything to fix.
		if ( indentChange <= 0 ) {
			return;
		}

		model.change( writer => {
			// Adjust indent of all "first" list items in inserted data.
			for ( const { node } of iterateSiblingListBlocks( item, 'forward' ) ) {
				writer.setAttribute( 'listIndent', node.getAttribute( 'listIndent' ) + indentChange, node );
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
 * @eventName ~DocumentListEditing#postFixer
 * @param listHead The head element of a list.
 * @param writer The writer to do changes with.
 * @param seenIds The set of already known IDs.
 * @returns If a post-fixer made a change of the model tree, it should return `true`.
 */
export type DocumentListEditingPostFixerEvent = {
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
 * @eventName ~DocumentListEditing#checkAttributes
 */
export type DocumentListEditingCheckAttributesEvent = {
	name: 'checkAttributes' | 'checkAttributes:list' | 'checkAttributes:item';
	args: [ {
		viewElement: ViewElement & { id?: string };
		modelAttributes: ListItemAttributesMap;
	} ];
	return: boolean;
};
