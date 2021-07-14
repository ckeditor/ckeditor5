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
import uid from '@ckeditor/ckeditor5-utils/src/uid';
import { insertSlotted } from '@ckeditor/ckeditor5-engine/src/conversion/downcasthelpers';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';

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
		editing.mapper.registerViewToModelLength( 'ul', getViewListItemLength );
		editing.mapper.registerViewToModelLength( 'ol', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'li', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'ul', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'ol', getViewListItemLength );

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
		// editing.mapper.on( 'modelToViewPosition', modelToViewPosition );
		// data.mapper.on( 'modelToViewPosition', modelToViewPosition );

		// function modelToViewPosition( evt, data ) {
		// 	if ( data.isPhantom || data.viewPosition ) {
		// 		return;
		// 	}
		//
		// 	const modelItem = data.modelPosition.nodeAfter;
		//
		// 	if ( !isListItem( modelItem ) ) {
		// 		return;
		// 	}
		//
		// 	const firstModelItem = findFirstSameListItemEntry( modelItem ) || modelItem;
		// 	const viewElement = data.mapper.toViewElement( firstModelItem );
		//
		// 	if ( !viewElement ) {
		// 		return;
		// 	}
		//
		// 	const listView = viewElement.is( 'element', 'li' ) ? viewElement : viewElement.findAncestor( 'li' );
		//
		// 	if ( !listView ) {
		// 		return;
		// 	}
		//
		// 	data.viewPosition = editing.mapper.findPositionIn( listView, data.modelPosition.offset - firstModelItem.startOffset );
		// }

		this._lists = []; // { range, view }

		editor.conversion.for( 'downcast' ).add( dispatcher => {
			// An abstract name of the model structure conversion.
			const magicUid = uid();

			dispatcher.on( 'reduceChanges', ( evt, data ) => {
				const changes = [];

				for ( const change of data.changes ) {
					// TEMP
					changes.push( change );

					if ( change.type == 'insert' ) {
						const insertionRange = editor.model.createRange( change.position, change.position.getShiftedBy( change.length ) );

						for ( const { type, item: element, previousPosition: position, length } of insertionRange ) {
							if ( type != 'elementStart' ) {
								continue;
							}

							let wasHandled = false;

							for ( let i = 0; i < this._lists.length; i++ ) {
								const list = this._lists[ i ];

								if ( compareArrays( list.range.start.getParentPath(), position.getParentPath() ) != 'same' ) {
									continue;
								}

								if ( element.hasAttribute( 'listItem' ) ) {
									const [ newRange ] = list.range._getTransformedByInsertion( position, length );

									if ( list.range.start.isEqual( position ) ) {
										const range = editor.model.createRange( position, newRange.end );

										// @if CK_DEBUG // console.log( '-- list grow at start',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', range.start.path + '-' + range.end.path );

										list.range = range;
										wasHandled = true;
									} else if ( list.range.end.isEqual( position ) ) {
										const range = editor.model.createRange( newRange.start, position.getShiftedBy( length ) );

										// @if CK_DEBUG // console.log( '-- list grow at end',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', range.start.path + '-' + range.end.path );

										list.range = range;
										wasHandled = true;
									} else if ( list.range.containsPosition( position ) ) {
										// @if CK_DEBUG // console.log( '-- list grow inside',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

										list.range = newRange;
										wasHandled = true;
									} else {
										// @if CK_DEBUG // console.log( '-- ????',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

										list.range = newRange;
									}
								} else {
									const newRanges = list.range._getTransformedByInsertion( position, length, true );

									// Insertion was inside this list.
									if ( newRanges.length > 1 ) {
										// @if CK_DEBUG // console.log( '-- list split',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path,
										// @if CK_DEBUG // 		'and', newRanges[ 1 ].start.path + '-' + newRanges[ 1 ].end.path );

										list.range = newRanges[ 0 ];
										this._lists.push( { range: newRanges[ 1 ] } );
									} else if ( !newRanges[ 0 ].isEqual( list.range ) ) {
										// @if CK_DEBUG // console.log( '-- list move',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path );

										list.range = newRanges[ 0 ];
									}
								}
							}

							if ( !wasHandled && element.hasAttribute( 'listItem' ) ) {
								const range = editor.model.createRange( position, position.getShiftedBy( length ) );

								// @if CK_DEBUG // console.log( '-- new list item', range.start.path + '-' + range.end.path );

								this._lists.push( { range } );
							}
						}
					}

					else if ( change.type == 'remove' ) {
						for ( let i = 0; i < this._lists.length; i++ ) {
							const list = this._lists[ i ];

							const newRange = list.range._getTransformedByDeletion( change.position, change.length );

							if ( !newRange || newRange.isCollapsed ) {
								// @if CK_DEBUG // console.log( '-- list removed', list.range.start.path + '-' + list.range.end.path );

								this._lists.splice( i--, 1 );

								continue;
							}

							if ( list.range.isEqual( newRange ) ) {
								continue;
							}

							if ( list.range.start.isEqual( change.position ) || list.range.containsPosition( change.position ) ) {
								// @if CK_DEBUG // console.log( '-- list shrink',
								// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
								// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

								list.range = newRange;
							} else {
								// @if CK_DEBUG // console.log( '-- list move',
								// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
								// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

								list.range = newRange;
							}
						}
					}

					else if ( change.type == 'attribute' ) {
						if ( [ 'listIndent', 'listType', 'listItem' ].includes( change.attributeKey ) ) {
							const changedRange = change.range.isFlat ? change.range :
								editor.model.createRange( change.range.start, change.range.start.getShiftedBy( 1 ) );

							let wasHandled = false;

							for ( let i = 0; i < this._lists.length; i++ ) {
								const list = this._lists[ i ];

								if ( compareArrays( list.range.start.getParentPath(), change.range.start.getParentPath() ) != 'same' ) {
									continue;
								}

								// Attribute was set.
								if ( change.attributeOldValue === null ) {
									if ( list.range.start.isEqual( changedRange.end ) ) {
										const range = editor.model.createRange( changedRange.start, list.range.end );

										// @if CK_DEBUG // console.log( '-- list grow at start',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', range.start.path + '-' + range.end.path );

										list.range = range;
										wasHandled = true;
									} else if ( list.range.end.isEqual( changedRange.start ) ) {
										const range = editor.model.createRange( list.range.start, changedRange.end );

										// @if CK_DEBUG // console.log( '-- list grow at end',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', range.start.path + '-' + range.end.path );

										list.range = range;
										wasHandled = true;
									} else if ( list.range.isIntersecting( changedRange ) ) {
										// @if CK_DEBUG // console.log( '-- list added secondary attribute',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path );
										wasHandled = true;
									}
								}

								// Attribute was removed.
								else if ( change.attributeNewValue === null ) {
									const newRanges = list.range.getDifference( changedRange );

									// Does not affect this list.
									if ( newRanges.length == 1 && newRanges[ 0 ].isEqual( list.range ) ) {
										continue;
									}

									if ( newRanges.length > 1 ) {
										// @if CK_DEBUG // console.log( '-- list split',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path,
										// @if CK_DEBUG // 		'and', newRanges[ 1 ].start.path + '-' + newRanges[ 1 ].end.path );

										list.range = newRanges[ 0 ];
										this._lists.push( { range: newRanges[ 1 ] } );
									} else if ( newRanges.length ) {
										// @if CK_DEBUG // console.log( '-- list shrink',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path,
										// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path );

										list.range = newRanges[ 0 ];
									} else {
										// @if CK_DEBUG // console.log( '-- list removed',
										// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path );

										this._lists.splice( i--, 1 );
									}
								}

								// Attribute value was changed.
								else if ( change.range.isIntersecting( list.range ) ) {
									// @if CK_DEBUG // console.log( '-- list attr change',
									// @if CK_DEBUG // 		list.range.start.path + '-' + list.range.end.path );
								}
							}

							// New attribute on new list.
							if ( !wasHandled && change.attributeOldValue === null ) {
								// @if CK_DEBUG // console.log( '-- new list item', changedRange.start.path + '-' + changedRange.end.path );

								this._lists.push( { range: changedRange } );
							}
						}
					}

					// 	const position = change.position || change.range.start;
					//
					// 	const otherChange = changes.find( entry => (
					// 		entry.type == 'range' &&
					// 		entry.magicUid == magicUid &&
					// 		entry.range.containsPosition( position ) &&
					// 		entry.range.start.path.length == position.path.length
					// 	) );
					//
					// 	// Range is already marked for reconversion, so skip this change.
					// 	if ( otherChange ) {
					// 		otherChange.related.push( change );
					// 	} else {
					// 		const changedElement = position.nodeAfter;
					// 		const { range, consumables } = findListConversionRangeAndConsumables( changedElement, editor );
					//
					// 		// // TODO this should check if there is a multi-multi mapping for that range
					// 		// if ( editor.editing.mapper.toViewElement( changedElement ) ) {
					// 		// 	changes.push( {
					// 		// 		type: 'remove',
					// 		// 		position: range.start,
					// 		// 		length: range.end.offset - range.start.offset
					// 		// 	} );
					// 		// }
					//
					// 		changes.push( {
					// 			type: 'range',
					// 			related: [ change ],
					// 			magicUid,
					// 			range,
					// 			consumables
					// 		} );
					// 	}
					// } else {
					// 	changes.push( change );
					// }
				}

				console.log( 'lists:', ...this._lists.map( ( { range } ) => range.start.path + '-' + range.end.path ) );

				data.changes = changes;
			} );

			dispatcher.on( `insertRange:${ magicUid }`, ( evt, data, conversionApi ) => {
				insertSlotted( data, conversionApi, conversionApi => (
					buildViewForRange( data.range, conversionApi.writer, conversionApi.slotFor )
				) );
			} );
		} );

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

function isListItem( node ) {
	return !!node && node.is( 'element' ) && node.hasAttribute( 'listItem' );
}

/**
 *	* insert element
 *		* with list attribute
 *			* before/after list - find range from current element
 *			* inside list - find range from current element
 *			* between lists - find range from current element
 *		* without list attribute
 *			* before/after list - doesn't affect list
 * 			* inside list - splits list - find range from SIBLING elements
 *			* between lists - doesn't affect list (same as before/after)
 *	* remove element
 *		* with list attribute
 *			* start/end of list - it's already gone from the model - find range from SIBLING elements
 *			* inside list - it's already gone from the model - find range from SIBLING elements
 *		* without list attribute
 *			* before/after list - doesn't affect list
 *			* between lists - it's already gone from the model - find range from SIBLING elements
 *	* attribute
 *		* set list attribute
 *			* before/after list - find range from current element
 *			* between lists - find range from current element
 *		* remove list attribute
 *			* start/end of list - find range from SIBLING elements
 *			* inside list - split list - find range from SIBLING elements
 *		* change list attribute
 *			* start/end of list - find range from current element
 *			* inside list - find range from current element
 */

function buildViewForRange( range, writer, slotFor ) {
	const modelElements = Array.from( range.getItems( { shallow: true } ) );

	if ( !modelElements.length ) {
		return null;
	}

	console.log( 'creating view' );

	const listType = modelElements[ 0 ].getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';

	const viewList = writer.createContainerElement( listType );

	// let previousItem = null;

	for ( const modelItem of modelElements ) {
		const viewItem = createViewListItemElement( writer );

		writer.insert( writer.createPositionAt( viewList, 'end' ), viewItem );
		writer.insert( writer.createPositionAt( viewItem, 0 ), slotFor( modelItem, 'self' ) );

		// const itemModelPosition = editor.model.createPositionBefore( modelItem );
		//
		// // Don't insert ol/ul or li if this is a continuation of some other list item.
		// const isFirstInListItem = !findFirstSameListItemEntry( modelItem );
		//
		// console.log( 'converting', modelItem ); // eslint-disable-line
		//
		// consumable.consume( modelItem, 'attribute:listItem' );
		// consumable.consume( modelItem, 'attribute:listType' );
		// consumable.consume( modelItem, 'attribute:listIndent' );
		//
		// if ( isFirstInListItem ) {
		// 	console.log( 'create list item' ); // eslint-disable-line
		// 	let viewList;
		//
		// 	const listType = modelItem.getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';
		// 	const previousIsListItem = previousItem && previousItem.is( 'element' ) && previousItem.hasAttribute( 'listItem' );
		//
		// 	// First element of the top level list.
		// 	if (
		// 		!previousIsListItem ||
		// 		modelItem.getAttribute( 'listIndent' ) == 0 &&
		// 		previousItem.getAttribute( 'listType' ) != modelItem.getAttribute( 'listType' )
		// 	) {
		// 		viewList = writer.createContainerElement( listType );
		// 		writer.insert( mapper.toViewPosition( itemModelPosition ), viewList );
		// 	}
		//
		// 	// Deeper nested list.
		// 	else if ( previousItem.getAttribute( 'listIndent' ) < modelItem.getAttribute( 'listIndent' ) ) {
		// 		const viewListItem = editing.mapper.toViewElement( previousItem ).findAncestor( 'li' );
		//
		// 		viewList = writer.createContainerElement( listType );
		// 		writer.insert( view.createPositionAt( viewListItem, 'end' ), viewList );
		// 	}
		//
		// 	// Same or shallower level.
		// 	else {
		// 		viewList = editing.mapper.toViewElement( previousItem ).findAncestor( isList );
		//
		// 		for ( let i = 0; i < previousItem.getAttribute( 'listIndent' ) - modelItem.getAttribute( 'listIndent' ); i++ ) {
		// 			viewList = viewList.findAncestor( isList );
		// 		}
		// 	}
		//
		// 	// Inserting the li.
		// 	const viewItem = createViewListItemElement( writer );
		//
		// 	writer.insert( writer.createPositionAt( viewList, 'end' ), viewItem );
		// 	mapper.bindElements( modelItem, viewList );
		// 	mapper.bindElements( modelItem, viewItem );
		//
		// 	writer.insert( writer.createPositionAt( viewItem, 0 ), slotFor( modelItem, 'self' ) );
		// } else {
		// 	writer.insert( mapper.toViewPosition( itemModelPosition ), slotFor( modelItem, 'self' ) );
		// }
		//
		// previousItem = modelItem;
	}

	return viewList;
}
