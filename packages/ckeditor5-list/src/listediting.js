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
					// if ( change.name == '$text' ) {
					// 	changes.push( change );
					//
					// 	continue;
					// }

					// TEMP
					changes.push( change );

					if ( change.type == 'insert' ) {
						let wasHandled = false;

						for ( let i = 0; i < this._lists.length; i++ ) {
							const list = this._lists[ i ];

							if ( list.range.start.path.length != change.position.path.length ) {
								continue;
							}

							if ( change.attributes.has( 'listItem' ) ) {
								const [ newRange ] = list.range._getTransformedByInsertion( change.position, change.length );

								if ( list.range.start.isEqual( change.position ) ) {
									const range = editor.model.createRange( change.position, newRange.end );

									console.log( '-- list grow at start', list.range.start.path + '-' + list.range.end.path,
										'to', range.start.path + '-' + range.end.path );

									list.range = range;
									wasHandled = true;
								} else if ( list.range.end.isEqual( change.position ) ) {
									const range = editor.model.createRange( newRange.start, change.position.getShiftedBy( change.length ) );

									console.log( '-- list grow at end', list.range.start.path + '-' + list.range.end.path,
										'to', range.start.path + '-' + range.end.path );

									list.range = range;
									wasHandled = true;
								} else if ( list.range.containsPosition( change.position ) ) {
									console.log( '-- list grow inside', list.range.start.path + '-' + list.range.end.path,
										'to', newRange.start.path + '-' + newRange.end.path );

									list.range = newRange;
									wasHandled = true;
								} else {
									list.range = newRange;
								}
							} else {
								const newRanges = list.range._getTransformedByInsertion( change.position, change.length, true );

								// Insertion was inside this list.
								if ( newRanges.length > 1 ) {
									console.log( '-- list split', list.range.start.path + '-' + list.range.end.path,
										'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path,
										'and', newRanges[ 1 ].start.path + '-' + newRanges[ 1 ].end.path );

									list.range = newRanges[ 0 ];
									this._lists.push( { range: newRanges[ 1 ] } );
								} else if ( !newRanges[ 0 ].isEqual( list.range ) ) {
									console.log( '-- list move', list.range.start.path + '-' + list.range.end.path,
										'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path );

									list.range = newRanges[ 0 ];
								}
							}
						}

						if ( !wasHandled && change.attributes.has( 'listItem' ) ) {
							const range = editor.model.createRange( change.position, change.position.getShiftedBy( change.length ) );

							console.log( '-- new list item', range.start.path + '-' + range.end.path );

							this._lists.push( { range } );
						}
					}

					if ( change.type == 'remove' ) {
						for ( let i = 0; i < this._lists.length; i++ ) {
							const list = this._lists[ i ];

							const newRange = list.range._getTransformedByDeletion( change.position, change.length );

							if ( list.range.isEqual( newRange ) ) {
								continue;
							}

							if ( !newRange || newRange.isCollapsed ) {
								console.log( '-- list removed', list.range.start.path + '-' + list.range.end.path );

								this._lists.splice( i--, 1 );
							} else if ( list.range.start.isEqual( change.position ) || list.range.containsPosition( change.position ) ) {
								console.log( '-- list shrink', list.range.start.path + '-' + list.range.end.path,
									'to', newRange.start.path + '-' + newRange.end.path );

								list.range = newRange;
							} else {
								console.log( '-- list move', list.range.start.path + '-' + list.range.end.path,
									'to', newRange.start.path + '-' + newRange.end.path );

								list.range = newRange;
							}
						}
					}

					// if ( change.type == 'attribute' ) {
					// 	if ( ![ 'listIndent', 'listType', 'listItem' ].includes( change.attributeKey ) ) {
					// 		return null;
					// 	}
					//
					// 	// Attribute was set.
					// 	if ( !change.attributeOldValue ) {
					// 		return [ change.range.start.nodeAfter ];
					// 	}
					//
					// 	// Attribute was removed.
					// 	if ( !change.attributeNewValue ) {
					// 		const result = [];
					//
					// 		// Check nodes before and after the removed attribute range.
					// 		const nodeBefore = change.range.start.nodeBefore;
					// 		const nodeAfter = change.range.end.nodeAfter;
					//
					// 		if ( nodeBefore && nodeBefore.hasAttribute( 'listItem' ) ) {
					// 			result.push( nodeBefore );
					// 		}
					//
					// 		if ( nodeAfter && nodeAfter.hasAttribute( 'listItem' ) ) {
					// 			result.push( nodeAfter );
					// 		}
					//
					// 		// TODO what if attributes on a whole list are removed?
					//
					// 		return result.length ? result : null;
					// 	}
					//
					//
					// 	// TEMP
					// 	changes.push( change );
					// }


					// const anchorElements = getListChangeAnchorElements( change );

					// if ( anchorElements ) {
					// 	// TODO use anchorElements
					//
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

		// editor.conversion.for( 'downcast' ).rangeToStructure( {
		// 	triggerBy: diffItem => {
		// 		if ( diffItem.name == '$text' ) {
		// 			return false;
		// 		}
		//
		// 		switch ( diffItem.type ) {
		// 			case 'attribute': {
		// 				if ( ![ 'listIndent', 'listType', 'listItem' ].includes( diffItem.attributeKey ) ) {
		// 					return false;
		// 				}
		//
		// 				console.log( 'trigger - attribute change at', diffItem.range.start.path );
		//
		// 				return true;
		// 			}
		//
		// 			case 'insert': {
		// 				const node = diffItem.position.nodeAfter;
		//
		// 				if ( !node.hasAttribute( 'listItem' ) ) {
		// 					return false;
		// 				}
		//
		// 				// TODO this is the case that can't be handled by the declarative triggerBy
		// 				//  maybe inserting node with watched attribute should trigger reconvert also in declarative API
		// 				console.log( 'trigger - insert at', diffItem.position.path );
		//
		// 				return true;
		// 			}
		//
		// 			case 'remove': {
		// 				if ( !diffItem.attributes.has( 'listItem' ) ) {
		// 					return false;
		// 				}
		//
		// 				// TODO this is the case that can't be handled by the declarative triggerBy
		// 				//  maybe removing node with watched attribute should trigger reconvert also in declarative API
		// 				console.log( 'trigger - remove at', diffItem.position.path );
		//
		// 				return true;
		// 			}
		// 		}
		//
		// 		return false;
		// 	},
		// 	model: element => {
		// 		const consumables = [];
		//
		// 		addConsumable( element, consumables );
		//
		// 		let node;
		// 		let startElement = element;
		// 		let endElement = element;
		//
		// 		while ( ( node = element.previousSibling ) && isListItem( node ) ) {
		// 			startElement = node;
		// 			addConsumable( node, consumables );
		// 		}
		//
		// 		while ( ( node = endElement.nextSibling ) && isListItem( node ) ) {
		// 			endElement = node;
		// 			addConsumable( node, consumables );
		// 		}
		//
		// 		const range = editor.model.createRange(
		// 			editor.model.createPositionBefore( startElement ),
		// 			editor.model.createPositionAfter( endElement )
		// 		);
		//
		// 		console.log( 'conversion range', range.start.path, '-', range.end.path );
		//
		// 		return {
		// 			range,
		// 			consumables
		// 		};
		//
		// 		function addConsumable( node, consumables ) {
		// 			for ( const attribute of [ 'listItem', 'listType', 'listIndent' ] ) {
		// 				if ( node.hasAttribute( attribute ) ) {
		// 					consumables.push( [ node, `attribute:${ attribute }` ] );
		// 				}
		// 			}
		// 		}
		// 	},
		// 	view: ( range, { writer, slotFor } ) => {
		// 		const modelElements = Array.from( range.getItems( { shallow: true } ) );
		//
		// 		if ( !modelElements.length ) {
		// 			return null;
		// 		}
		//
		// 		console.log( 'creating view' );
		//
		// 		const viewLists = [];
		// 		const listType = modelElements[ 0 ].getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';
		//
		// 		let viewList = writer.createContainerElement( listType );
		//
		// 		viewLists.push( viewList );
		//
		// 		// let previousItem = null;
		//
		// 		for ( const modelItem of modelElements ) {
		// 			if ( isListItem( modelItem ) ) {
		// 				const viewItem = createViewListItemElement( writer );
		//
		// 				writer.insert( writer.createPositionAt( viewList, 'end' ), viewItem );
		// 				writer.insert( writer.createPositionAt( viewItem, 0 ), slotFor( modelItem, 'self' ) );
		// 			} else {
		// 				// Some other element that lost it's list item properties.
		// 				viewList = writer.createContainerElement( listType );
		//
		// 				viewLists.push( viewList );
		//
		// 				writer.insert( writer.createPositionAt( viewList, 'end' ), slotFor( modelItem, 'self' ) );
		// 			}
		//
		// 			// const itemModelPosition = editor.model.createPositionBefore( modelItem );
		// 			//
		// 			// // Don't insert ol/ul or li if this is a continuation of some other list item.
		// 			// const isFirstInListItem = !findFirstSameListItemEntry( modelItem );
		// 			//
		// 			// console.log( 'converting', modelItem ); // eslint-disable-line
		// 			//
		// 			// consumable.consume( modelItem, 'attribute:listItem' );
		// 			// consumable.consume( modelItem, 'attribute:listType' );
		// 			// consumable.consume( modelItem, 'attribute:listIndent' );
		// 			//
		// 			// if ( isFirstInListItem ) {
		// 			// 	console.log( 'create list item' ); // eslint-disable-line
		// 			// 	let viewList;
		// 			//
		// 			// 	const listType = modelItem.getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';
		// 			// 	const previousIsListItem = previousItem && previousItem.is( 'element' ) && previousItem.hasAttribute( 'listItem' );
		// 			//
		// 			// 	// First element of the top level list.
		// 			// 	if (
		// 			// 		!previousIsListItem ||
		// 			// 		modelItem.getAttribute( 'listIndent' ) == 0 &&
		// 			// 		previousItem.getAttribute( 'listType' ) != modelItem.getAttribute( 'listType' )
		// 			// 	) {
		// 			// 		viewList = writer.createContainerElement( listType );
		// 			// 		writer.insert( mapper.toViewPosition( itemModelPosition ), viewList );
		// 			// 	}
		// 			//
		// 			// 	// Deeper nested list.
		// 			// 	else if ( previousItem.getAttribute( 'listIndent' ) < modelItem.getAttribute( 'listIndent' ) ) {
		// 			// 		const viewListItem = editing.mapper.toViewElement( previousItem ).findAncestor( 'li' );
		// 			//
		// 			// 		viewList = writer.createContainerElement( listType );
		// 			// 		writer.insert( view.createPositionAt( viewListItem, 'end' ), viewList );
		// 			// 	}
		// 			//
		// 			// 	// Same or shallower level.
		// 			// 	else {
		// 			// 		viewList = editing.mapper.toViewElement( previousItem ).findAncestor( isList );
		// 			//
		// 			// 		for ( let i = 0; i < previousItem.getAttribute( 'listIndent' ) - modelItem.getAttribute( 'listIndent' ); i++ ) {
		// 			// 			viewList = viewList.findAncestor( isList );
		// 			// 		}
		// 			// 	}
		// 			//
		// 			// 	// Inserting the li.
		// 			// 	const viewItem = createViewListItemElement( writer );
		// 			//
		// 			// 	writer.insert( writer.createPositionAt( viewList, 'end' ), viewItem );
		// 			// 	mapper.bindElements( modelItem, viewList );
		// 			// 	mapper.bindElements( modelItem, viewItem );
		// 			//
		// 			// 	writer.insert( writer.createPositionAt( viewItem, 0 ), slotFor( modelItem, 'self' ) );
		// 			// } else {
		// 			// 	writer.insert( mapper.toViewPosition( itemModelPosition ), slotFor( modelItem, 'self' ) );
		// 			// }
		// 			//
		// 			// previousItem = modelItem;
		// 		}
		//
		// 		// TODO should this return a fragment that would consist multiple lists (with slots for elements between lists)?
		// 		//  but how should the mapping be handled then?
		// 		return viewList;
		// 		// return writer.createDocumentFragment( viewLists );
		// 	}
		// } );

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
function getListChangeAnchorElements( change ) {
	if ( change.name == '$text' ) {
		return null;
	}

	switch ( change.type ) {
		case 'attribute': {
			if ( ![ 'listIndent', 'listType', 'listItem' ].includes( change.attributeKey ) ) {
				return null;
			}

			// Attribute was set.
			if ( !change.attributeOldValue ) {
				return [ change.range.start.nodeAfter ];
			}

			// Attribute was removed.
			if ( !change.attributeNewValue ) {
				const result = [];

				// Check nodes before and after the removed attribute range.
				const nodeBefore = change.range.start.nodeBefore;
				const nodeAfter = change.range.end.nodeAfter;

				if ( nodeBefore && nodeBefore.hasAttribute( 'listItem' ) ) {
					result.push( nodeBefore );
				}

				if ( nodeAfter && nodeAfter.hasAttribute( 'listItem' ) ) {
					result.push( nodeAfter );
				}

				// TODO what if attributes on a whole list are removed?

				return result.length ? result : null;
			}

			return null;
		}

		case 'insert': {
			const node = change.position.nodeAfter;

			// New element with an attribute.
			if ( node.hasAttribute( 'listItem' ) ) {
				return [ node ];
			}

			// New element without an attribute - list splitting.

			const result = [];

			// Check elements before and after inserted element.
			const previousSibling = node.previousSibling;
			const nextSibling = node.nextSibling;

			if ( previousSibling && previousSibling.hasAttribute( 'listItem' ) ) {
				result.push( previousSibling );
			}

			if ( nextSibling && nextSibling.hasAttribute( 'listItem' ) ) {
				result.push( nextSibling );
			}

			return result.length ? result : null;
		}

		case 'remove': {
			const result = [];

			// Doesn't matter if it had an attribute - this could trigger a list merge.
			// Check elements around the deletion position.
			const nodeBefore = change.position.nodeBefore;
			const nodeAfter = change.position.nodeAfter;

			if ( nodeBefore && nodeBefore.hasAttribute( 'listItem' ) ) {
				result.push( nodeBefore );
			}

			if ( nodeAfter && nodeAfter.hasAttribute( 'listItem' ) ) {
				result.push( nodeAfter );
			}

			// TODO what if the whole list is removed?

			return result.length ? result : null;
		}
	}

	return null;
}

function findListConversionRangeAndConsumables( element, editor ) {
	const consumables = [];
	addConsumable( element, consumables );

	let node;
	let startElement = element;
	let endElement = element;

	while ( ( node = startElement.previousSibling ) && isListItem( node ) ) {
		startElement = node;
		addConsumable( node, consumables );
	}

	while ( ( node = endElement.nextSibling ) && isListItem( node ) ) {
		endElement = node;
		addConsumable( node, consumables );
	}

	const range = editor.model.createRange(
		editor.model.createPositionBefore( startElement ),
		editor.model.createPositionAfter( endElement )
	);

	console.log( 'conversion range', range.start.path, '-', range.end.path );

	return {
		range,
		consumables
	};

	function addConsumable( node, consumables ) {
		for ( const attribute of [ 'listItem', 'listType', 'listIndent' ] ) {
			if ( node.hasAttribute( attribute ) ) {
				consumables.push( [ node, `attribute:${ attribute }` ] );
			}
		}
	}
}

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
