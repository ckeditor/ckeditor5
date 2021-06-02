/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listediting
 */

import ListCommand from './listcommand';
import IndentCommand from './indentcommand';

import { Plugin } from 'ckeditor5/src/core';
import { Enter } from 'ckeditor5/src/enter';
import { Delete } from 'ckeditor5/src/typing';

import {
	modelIndentPasteFixer,
	viewToModelPosition, isList
} from './converters';
import { createViewListItemElement } from './utils';

/**
 * The engine of the list feature. It handles creating, editing and removing lists and list items.
 *
 * It registers the `'numberedList'`, `'bulletedList'`, `'indentList'` and `'outdentList'` commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Enter, Delete ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.model.schema.extend( '$block', {
			allowAttributes: [ 'listIndent', 'listItem' ]
		} );

		// // Schema.
		// // Note: in case `$block` will ever be allowed in `listItem`, keep in mind that this feature
		// // uses `Selection#getSelectedBlocks()` without any additional processing to obtain all selected list items.
		// // If there are blocks allowed inside list item, algorithms using `getSelectedBlocks()` will have to be modified.
		// editor.model.schema.register( 'listItem', {
		// 	inheritAllFrom: '$block',
		// 	allowAttributes: [ 'listType', 'listIndent' ]
		// } );

		// Converters.
		const data = editor.data;
		const editing = editor.editing;
		const view = editing.view;

		// editor.model.document.registerPostFixer( writer => modelChangePostFixer( editor.model, writer ) );

		editing.mapper.registerViewToModelLength( 'li', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'li', getViewListItemLength );

		function getViewListItemLength( element ) {
			let length = 0;

			for ( const child of element.getChildren() ) {
				if ( isList( child ) ) {
					for ( const item of child.getChildren() ) {
						length += getViewListItemLength( item );
					}
				} else {
					length += editing.mapper.getModelLength( child );
				}
			}

			return length;
		}

		editing.mapper.on( 'viewToModelPosition', viewToModelPosition( editor.model ) );
		editing.mapper.on( 'modelToViewPosition', modelToViewPosition );
		data.mapper.on( 'modelToViewPosition', modelToViewPosition );

		function modelToViewPosition( evt, data ) {
			if ( data.isPhantom ) {
				return;
			}

			const modelItem = data.modelPosition.nodeAfter;

			if ( !modelItem || !modelItem.is( 'element' ) || !modelItem.hasAttribute( 'listItem' ) ) {
				return;
			}

			const firstModelItem = findFirstSameListItemEntry( modelItem ) || modelItem;
			const viewElement = data.mapper.toViewElement( firstModelItem );

			if ( !viewElement ) {
				return;
			}

			const listView = viewElement.is( 'element', 'li' ) ? viewElement : viewElement.findAncestor( 'li' );

			if ( !listView ) {
				return;
			}

			data.viewPosition = editing.mapper.findPositionIn( listView, data.modelPosition.offset - firstModelItem.startOffset );
		}

		editor.conversion.for( 'downcast' ).rangeToStructure( {
			triggerBy: diffItem => {
				let element = null;

				switch ( diffItem.type ) {
					case 'attribute':
						if ( ![ 'listIndent', 'listType', 'listItem' ].includes( diffItem.attributeKey ) ) {
							return;
						}

						element = diffItem.range.start.nodeAfter;

						break;

					case 'insert':
						element = diffItem.position.nodeAfter;

						if ( !element.hasAttribute( 'listItem' ) ) {
							return;
						}

						break;

					// TODO remove
					// Find sibling list item for removed list item.
					// // if ( diffItem.type == 'remove' ) {
					// // 	const nodeBefore = diffItem.position.nodeBefore;
					// // 	const nodeAfter = diffItem.position.nodeAfter;
					// //
					// // 	if ( nodeBefore && nodeBefore.is( 'element' ) && nodeBefore.hasAttribute( 'listItem' ) ) {
					// // 		removedElement = nodeBefore;
					// // 	} else if ( nodeAfter && nodeAfter.is( 'element' ) && nodeAfter.hasAttribute( 'listItem' ) ) {
					// // 		removedElement = nodeAfter;
					// // 	}
					// // }
				}

				if ( !element ) {
					return;
				}

				let startElement = element;
				let endElement = element;

				let node;

				while (
					( node = startElement.previousSibling ) &&
					node.is( 'element' ) && node.hasAttribute( 'listItem' )
				) {
					startElement = node;
				}

				while (
					( node = endElement.nextSibling ) &&
					node.is( 'element' ) && node.hasAttribute( 'listItem' )
				) {
					endElement = node;
				}

				return editor.model.createRange(
					editor.model.createPositionBefore( startElement ),
					editor.model.createPositionAfter( endElement )
				);
			},
			model: data => {
				return {};
			},
			view: ( data, { writer, slotFor } ) => {
				data;
			}
		} );

		// editor.conversion.for( 'downcast' ).add( dispatcher => {
		// 	dispatcher.on( 'insert', ( evt, data, { consumable, writer, mapper } ) => {
		// 		if (
		// 			!consumable.test( data.item, 'attribute:listItem' ) ||
		// 			!consumable.test( data.item, 'attribute:listType' ) ||
		// 			!consumable.test( data.item, 'attribute:listIndent' )
		// 		) {
		// 			return;
		// 		}
		//
		// 		const modelItem = data.item;
		// 		const previousItem = modelItem.previousSibling;
		//
		// 		// Don't insert ol/ul or li if this is a continuation of some other list item.
		// 		const isFirstInListItem = !findFirstSameListItemEntry( modelItem );
		//
		// 		console.log( 'converting', modelItem ); // eslint-disable-line
		//
		// 		consumable.consume( modelItem, 'attribute:listItem' );
		// 		consumable.consume( modelItem, 'attribute:listType' );
		// 		consumable.consume( modelItem, 'attribute:listIndent' );
		//
		// 		let contentViewPosition;
		//
		// 		// Get the previously converted list item content element.
		// 		const viewChildContent = mapper.toViewElement( modelItem );
		//
		// 		if ( isFirstInListItem ) {
		// 			console.log( 'create list item' ); // eslint-disable-line
		// 			let viewList;
		//
		// 			const listType = modelItem.getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';
		// 			const previousIsListItem = previousItem && previousItem.is( 'element' ) && previousItem.hasAttribute( 'listItem' );
		//
		// 			// First element of the top level list.
		// 			if (
		// 				!previousIsListItem ||
		// 				modelItem.getAttribute( 'listIndent' ) == 0 &&
		// 				previousItem.getAttribute( 'listType' ) != modelItem.getAttribute( 'listType' )
		// 			) {
		// 				viewList = writer.createContainerElement( listType );
		// 				writer.insert( mapper.toViewPosition( data.range.start ), viewList );
		// 			}
		//
		// 			// Deeper nested list.
		// 			else if ( previousItem.getAttribute( 'listIndent' ) < modelItem.getAttribute( 'listIndent' ) ) {
		// 				const viewListItem = editing.mapper.toViewElement( previousItem ).findAncestor( 'li' );
		//
		// 				viewList = writer.createContainerElement( listType );
		// 				writer.insert( view.createPositionAt( viewListItem, 'end' ), viewList );
		// 			}
		//
		// 			// Same or shallower level.
		// 			else {
		// 				viewList = editing.mapper.toViewElement( previousItem ).findAncestor( isList );
		//
		// 				for ( let i = 0; i < previousItem.getAttribute( 'listIndent' ) - modelItem.getAttribute( 'listIndent' ); i++ ) {
		// 					viewList = viewList.findAncestor( isList );
		// 				}
		// 			}
		//
		// 			// Inserting the li.
		// 			const viewItem = createViewListItemElement( writer );
		//
		// 			writer.insert( writer.createPositionAt( viewList, 'end' ), viewItem );
		// 			mapper.bindElements( modelItem, viewList );
		// 			mapper.bindElements( modelItem, viewItem );
		//
		// 			contentViewPosition = writer.createPositionAt( viewItem, 0 );
		// 		} else {
		// 			contentViewPosition = mapper.toViewPosition( data.range.start );
		// 		}
		//
		// 		// The content of this list item was already converted before so just insert it into the new list item.
		// 		if ( viewChildContent ) {
		// 			writer.insert( contentViewPosition, viewChildContent );
		// 			mapper.bindElements( modelItem, viewChildContent );
		//
		// 			evt.stop();
		// 		}
		//
		// 		// Let the list item content get converted.
		// 	}, { priority: 'high' } );
		// } );

		// editor.conversion.for( 'editingDowncast' )
		// 	.add( dispatcher => {
		// 		dispatcher.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		// 		dispatcher.on( 'insert:listItem', modelViewInsertion( editor.model ) );
		// 		dispatcher.on( 'attribute:listType:listItem', modelViewChangeType, { priority: 'high' } );
		// 		dispatcher.on( 'attribute:listType:listItem', modelViewMergeAfterChangeType, { priority: 'low' } );
		// 		dispatcher.on( 'attribute:listIndent:listItem', modelViewChangeIndent( editor.model ) );
		// 		dispatcher.on( 'remove:listItem', modelViewRemove( editor.model ) );
		// 		dispatcher.on( 'remove', modelViewMergeAfter, { priority: 'low' } );
		// 	} );

		// editor.conversion.for( 'dataDowncast' )
		// 	.add( dispatcher => {
		// 		dispatcher.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		// 		dispatcher.on( 'insert:listItem', modelViewInsertion( editor.model ) );
		// 	} );
		//
		// editor.conversion.for( 'upcast' )
		// 	.add( dispatcher => {
		// 		dispatcher.on( 'element:ul', cleanList, { priority: 'high' } );
		// 		dispatcher.on( 'element:ol', cleanList, { priority: 'high' } );
		// 		dispatcher.on( 'element:li', cleanListItem, { priority: 'high' } );
		// 		dispatcher.on( 'element:li', viewModelConverter );
		// 	} );

		// Fix indentation of pasted items.
		editor.model.on( 'insertContent', modelIndentPasteFixer, { priority: 'high' } );

		// Register commands for numbered and bulleted list.
		editor.commands.add( 'numberedList', new ListCommand( editor, 'numbered' ) );
		editor.commands.add( 'bulletedList', new ListCommand( editor, 'bulleted' ) );

		// Register commands for indenting.
		editor.commands.add( 'indentList', new IndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new IndentCommand( editor, 'backward' ) );

		const viewDocument = editing.view.document;

		// Overwrite default Enter key behavior.
		// If Enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			const doc = this.editor.model.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if ( doc.selection.isCollapsed && positionParent.name == 'listItem' && positionParent.isEmpty ) {
				this.editor.execute( 'outdentList' );

				data.preventDefault();
				evt.stop();
			}
		}, { context: 'li' } );

		// Overwrite default Backspace key behavior.
		// If Backspace key is pressed with selection collapsed on first position in first list item, outdent it. #83
		this.listenTo( viewDocument, 'delete', ( evt, data ) => {
			// Check conditions from those that require less computations like those immediately available.
			if ( data.direction !== 'backward' ) {
				return;
			}

			const selection = this.editor.model.document.selection;

			if ( !selection.isCollapsed ) {
				return;
			}

			const firstPosition = selection.getFirstPosition();

			if ( !firstPosition.isAtStart ) {
				return;
			}

			const positionParent = firstPosition.parent;

			if ( positionParent.name !== 'listItem' ) {
				return;
			}

			const previousIsAListItem = positionParent.previousSibling && positionParent.previousSibling.name === 'listItem';

			if ( previousIsAListItem ) {
				return;
			}

			this.editor.execute( 'outdentList' );

			data.preventDefault();
			evt.stop();
		}, { context: 'li' } );

		const getCommandExecuter = commandName => {
			return ( data, cancel ) => {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );
					cancel();
				}
			};
		};

		editor.keystrokes.set( 'Tab', getCommandExecuter( 'indentList' ) );
		editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( 'outdentList' ) );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const commands = this.editor.commands;

		const indent = commands.get( 'indent' );
		const outdent = commands.get( 'outdent' );

		if ( indent ) {
			indent.registerChildCommand( commands.get( 'indentList' ) );
		}

		if ( outdent ) {
			outdent.registerChildCommand( commands.get( 'outdentList' ) );
		}
	}
}

function findFirstSameListItemEntry( modelItem ) {
	let node = modelItem.previousSibling;

	// Find closest node with the same listItem attribute.
	while (
		node && node.is( 'element' ) && node.hasAttribute( 'listItem' ) &&
		node.getAttribute( 'listItem' ) != modelItem.getAttribute( 'listItem' )
	) {
		node = node.previousSibling;
	}

	if ( !node || !node.is( 'element' ) || node.getAttribute( 'listItem' ) != modelItem.getAttribute( 'listItem' ) ) {
		return null;
	}

	// Find farthest one.
	let previous = null;

	while (
		( previous = node.previousSibling ) && previous.is( 'element' ) &&
		previous.getAttribute( 'listItem' ) == modelItem.getAttribute( 'listItem' )
	) {
		node = previous;
	}

	return node;
}
