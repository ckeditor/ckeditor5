/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Enter } from 'ckeditor5/src/enter';
import { Delete } from 'ckeditor5/src/typing';
import { CKEditorError, uid } from 'ckeditor5/src/utils';

import {
	listItemDowncastConverter,
	listItemParagraphDowncastConverter,
	listItemUpcastConverter,
	listItemViewToModelLengthMapper,
	listUpcastCleanList,
	reconvertItemsOnDataChange
} from './converters';
import { findAddListHeadToMap, getListItemElements } from './utils';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListEditing';
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
		const model = editor.model;

		if ( editor.plugins.has( 'ListEditing' ) ) {
			/**
			 * The DocumentList feature can not be loaded together with List plugin.
			 *
			 * @error document-list-feature-conflict
			 * @param {String} conflictPlugin Name of the plugin.
			 */
			throw new CKEditorError( 'document-list-feature-conflict', this, { conflictPlugin: 'ListEditing' } );
		}

		model.schema.extend( '$container', {
			allowAttributes: [ 'listType', 'listIndent', 'listItemId' ]
		} );

		model.document.registerPostFixer( writer => modelChangePostFixer( model, writer ) );

		model.on( 'insertContent', createModelIndentPasteFixer( model ), { priority: 'high' } );

		this._setupConversion();
		this._enableEnterHandling();
	}

	/**
	 * TODO
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const model = editor.model;
		const attributes = [ 'listItemId', 'listType', 'listIndent' ];

		editor.conversion.for( 'upcast' )
			.elementToElement( { view: 'li', model: 'paragraph' } )
			.add( dispatcher => {
				dispatcher.on( 'element:li', listItemUpcastConverter() );
				dispatcher.on( 'element:ul', listUpcastCleanList(), { priority: 'high' } );
				dispatcher.on( 'element:ol', listUpcastCleanList(), { priority: 'high' } );
			} );

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => downcastConverters( dispatcher ) );
		editor.conversion.for( 'dataDowncast' ).add( dispatcher => downcastConverters( dispatcher, { dataPipeline: true } ) );

		function downcastConverters( dispatcher, options = {} ) {
			dispatcher.on( 'insert:paragraph', listItemParagraphDowncastConverter( attributes, model, options ), { priority: 'high' } );

			for ( const attributeName of attributes ) {
				dispatcher.on( `attribute:${ attributeName }`, listItemDowncastConverter( attributes, model ) );
			}
		}

		editor.data.mapper.registerViewToModelLength( 'li', listItemViewToModelLengthMapper( editor.data.mapper, model.schema ) );
		this.listenTo( model.document, 'change:data', reconvertItemsOnDataChange( model, editor.editing ) );
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_enableEnterHandling() {
		const editor = this.editor;
		const enterCommand = editor.commands.get( 'enter' );

		if ( enterCommand ) {
			this.listenTo( enterCommand, 'afterExecute', ( evt, { writer } ) => {
				const position = editor.model.document.selection.getFirstPosition();
				const positionParent = position.parent;

				if ( positionParent.hasAttribute( 'listItemId' ) && position.isAtEnd ) {
					const lastListItemElement = getListItemElements( positionParent, editor.model ).pop();

					if ( lastListItemElement == positionParent ) {
						writer.setAttribute( 'listItemId', uid(), lastListItemElement );
					}
				}
			} );
		}
	}
}

/**
 * TODO
 *
 * Post-fixer that reacts to changes on document and fixes incorrect model states.
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 *		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=1>Item 2</listItem>   <--- this is removed.
 *		<listItem listType="bulleted" listIndent=2>Item 3</listItem>
 *
 * The list structure after the middle element is removed:
 *
 * 		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=2>Item 3</listItem>
 *
 * Should become:
 *
 *		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=1>Item 3</listItem>   <--- note that indent got post-fixed.
 *
 * @param {module:engine/model/model~Model} model The data model.
 * @param {module:engine/model/writer~Writer} writer The writer to do changes with.
 * @returns {Boolean} `true` if any change has been applied, `false` otherwise.
 */
export function modelChangePostFixer( model, writer ) {
	const changes = model.document.differ.getChanges();
	const itemToListHead = new Map();

	let applied = false;

	for ( const entry of changes ) {
		if ( entry.type == 'insert' && entry.name != '$text' ) {
			const item = entry.position.nodeAfter;

			// Remove attributes in case of renamed element.
			if ( !model.schema.checkAttribute( item, 'listItemId' ) ) {
				for ( const attributeName of Array.from( item.getAttributeKeys() ) ) {
					if ( attributeName.startsWith( 'list' ) ) {
						writer.removeAttribute( attributeName, item );

						applied = true;
					}
				}
			}

			findAddListHeadToMap( entry.position, itemToListHead );

			// Insert of a non-list item - check if there is a list after it.
			if ( !entry.attributes.has( 'listItemId' ) ) {
				findAddListHeadToMap( entry.position.getShiftedBy( entry.length ), itemToListHead );
			}

			// Check if there is no nested list.
			for ( const { item: innerItem, previousPosition } of model.createRangeIn( item ) ) {
				if ( innerItem.is( 'element' ) && innerItem.hasAttribute( 'listItemId' ) ) {
					findAddListHeadToMap( previousPosition, itemToListHead );
				}
			}
		}
		// Removed list item.
		else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
			findAddListHeadToMap( entry.position, itemToListHead );
		}
		// Changed list item indent or type.
		else if ( entry.type == 'attribute' && [ 'listIndent', 'listType' ].includes( entry.attributeKey ) ) {
			findAddListHeadToMap( entry.range.start, itemToListHead );

			if ( entry.attributeNewValue === null ) {
				findAddListHeadToMap( entry.range.start.getShiftedBy( 1 ), itemToListHead );
			}
		}
	}

	for ( const listHead of itemToListHead.values() ) {
		fixListIndents( listHead );
		fixListTypes( listHead );
		fixListItemIds( listHead );
	}

	return applied;

	function fixListIndents( item ) {
		let maxIndent = 0;
		let fixBy = null;

		for (
			item;
			item && item.hasAttribute( 'listItemId' );
			item = item.nextSibling
		) {
			const itemIndent = item.getAttribute( 'listIndent' );

			if ( itemIndent > maxIndent ) {
				let newIndent;

				if ( fixBy === null ) {
					fixBy = itemIndent - maxIndent;
					newIndent = maxIndent;
				} else {
					if ( fixBy > itemIndent ) {
						fixBy = itemIndent;
					}

					newIndent = itemIndent - fixBy;
				}

				writer.setAttribute( 'listIndent', newIndent, item );

				applied = true;
			} else {
				fixBy = null;
				maxIndent = item.getAttribute( 'listIndent' ) + 1;
			}
		}
	}

	function fixListTypes( item ) {
		const typesStack = [];

		for (
			let prev = null;
			item && item.hasAttribute( 'listItemId' );
			prev = item, item = item.nextSibling
		) {
			const itemIndent = item.getAttribute( 'listIndent' );

			if ( prev && itemIndent < prev.getAttribute( 'listIndent' ) ) {
				typesStack.length = itemIndent + 1;
			}

			// Allow different types of lists at the top level.
			if ( itemIndent == 0 ) {
				continue;
			}

			if ( typesStack[ itemIndent ] ) {
				const type = typesStack[ itemIndent ];

				if ( item.getAttribute( 'listType' ) != type ) {
					writer.setAttribute( 'listType', type, item );

					applied = true;
				}
			} else {
				typesStack[ itemIndent ] = item.getAttribute( 'listType' );
			}
		}
	}

	function fixListItemIds( item ) {
		const visited = new Set();

		for (
			item;
			item && item.hasAttribute( 'listItemId' );
			item = item.nextSibling
		) {
			if ( visited.has( item ) ) {
				continue;
			}

			const blocks = getListItemElements( item, model, 'forward' );

			let listType = item.getAttribute( 'listType' );
			let listItemId = item.getAttribute( 'listItemId' );

			for ( const block of blocks ) {
				visited.add( block );

				if ( block.getAttribute( 'listType' ) != listType ) {
					listItemId = uid();
					listType = block.getAttribute( 'listType' );
				}

				if ( block.getAttribute( 'listItemId' ) != listItemId ) {
					writer.setAttribute( 'listItemId', listItemId, block );

					applied = true;
				}
			}
		}
	}
}

/**
 * TODO
 *
 * A fixer for pasted content that includes list items.
 *
 * It fixes indentation of pasted list items so the pasted items match correctly to the context they are pasted into.
 *
 * Example:
 *
 *		<listItem listType="bulleted" listIndent=0>A</listItem>
 *		<listItem listType="bulleted" listIndent=1>B^</listItem>
 *		// At ^ paste:  <listItem listType="bulleted" listIndent=4>X</listItem>
 *		//              <listItem listType="bulleted" listIndent=5>Y</listItem>
 *		<listItem listType="bulleted" listIndent=2>C</listItem>
 *
 * Should become:
 *
 *		<listItem listType="bulleted" listIndent=0>A</listItem>
 *		<listItem listType="bulleted" listIndent=1>BX</listItem>
 *		<listItem listType="bulleted" listIndent=2>Y/listItem>
 *		<listItem listType="bulleted" listIndent=2>C</listItem>
 *
 */
function createModelIndentPasteFixer( model ) {
	return ( evt, [ content, selectable ] ) => {
		// Check whether inserted content starts from a `listItem`. If it does not, it means that there are some other
		// elements before it and there is no need to fix indents, because even if we insert that content into a list,
		// that list will be broken.
		// Note: we also need to handle singular elements because inserting item with indent 0 into 0,1,[],2
		// would create incorrect model.
		let item = content.is( 'documentFragment' ) ? content.getChild( 0 ) : content;

		if ( !item || !item.hasAttribute( 'listItemId' ) ) {
			return;
		}

		let selection;

		if ( !selectable ) {
			selection = model.document.selection;
		} else {
			selection = model.createSelection( selectable );
		}

		// Get a reference list item. Inserted list items will be fixed according to that item.
		const pos = selection.getFirstPosition();
		let refItem = null;

		if ( pos.parent.hasAttribute( 'listItemId' ) ) {
			refItem = pos.parent;
		} else if ( pos.nodeBefore && pos.nodeBefore.hasAttribute( 'listItemId' ) ) {
			refItem = pos.nodeBefore;
		}

		// If there is `refItem` it means that we do insert list items into an existing list.
		if ( !refItem ) {
			return;
		}

		// First list item in `data` has indent equal to 0 (it is a first list item). It should have indent equal
		// to the indent of reference item. We have to fix the first item and all of it's children and following siblings.
		// Indent of all those items has to be adjusted to reference item.
		const indentChange = refItem.getAttribute( 'listIndent' );

		// Fix only if there is anything to fix.
		if ( indentChange == 0 ) {
			return;
		}

		model.change( writer => {
			// Adjust indent of all "first" list items in inserted data.
			while ( item && item.hasAttribute( 'listItemId' ) ) {
				writer.setAttribute( 'listIndent', item.getAttribute( 'listIndent' ) + indentChange, item );

				item = item.nextSibling;
			}
		} );
	};
}
