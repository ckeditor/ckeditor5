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
import { CKEditorError } from 'ckeditor5/src/utils';

import DocumentListIndentCommand from './documentlistindentcommand';
import {
	listItemDowncastConverter,
	listItemParagraphDowncastConverter,
	listItemUpcastConverter,
	listItemViewToModelLengthMapper,
	listUpcastCleanList,
	reconvertItemsOnDataChange
} from './converters';
import {
	findAndAddListHeadToMap,
	fixListIndents,
	fixListItemIds
} from './utils';

/**
 * The editing part of the document-list feature. It handles creating, editing and removing lists and list items.
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

		// Register commands for indenting.
		editor.commands.add( 'indentList', new DocumentListIndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new DocumentListIndentCommand( editor, 'backward' ) );
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

	/**
	 * Registers the conversion helpers for the document-list feature.
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
}

/**
 * Post-fixer that reacts to changes on document and fixes incorrect model states.
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 *		<paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 *		<paragraph listType="bulleted" listItemId="b" listIndent=1>Item 2</paragraph>   <--- this is removed.
 *		<paragraph listType="bulleted" listItemId="c" listIndent=2>Item 3</paragraph>
 *
 * The list structure after the middle element is removed:
 *
 * 		<paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 *		<paragraph listType="bulleted" listItemId="c" listIndent=2>Item 3</paragraph>
 *
 * Should become:
 *
 *		<paragraph listType="bulleted" listItemId="a" listIndent=0>Item 1</paragraph>
 *		<paragraph listType="bulleted" listItemId="c" listIndent=1>Item 3</paragraph>   <--- note that indent got post-fixed.
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

			findAndAddListHeadToMap( entry.position, itemToListHead );

			// Insert of a non-list item - check if there is a list after it.
			if ( !entry.attributes.has( 'listItemId' ) ) {
				findAndAddListHeadToMap( entry.position.getShiftedBy( entry.length ), itemToListHead );
			}

			// Check if there is no nested list.
			for ( const { item: innerItem, previousPosition } of model.createRangeIn( item ) ) {
				if ( innerItem.is( 'element' ) && innerItem.hasAttribute( 'listItemId' ) ) {
					findAndAddListHeadToMap( previousPosition, itemToListHead );
				}
			}
		}
		// Removed list item.
		else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
			findAndAddListHeadToMap( entry.position, itemToListHead );
		}
		// Changed list item indent or type.
		else if ( entry.type == 'attribute' && [ 'listIndent', 'listType' ].includes( entry.attributeKey ) ) {
			findAndAddListHeadToMap( entry.range.start, itemToListHead );

			if ( entry.attributeNewValue === null ) {
				findAndAddListHeadToMap( entry.range.start.getShiftedBy( 1 ), itemToListHead );
			}
		}
	}

	// Make sure that IDs are not shared by split list.
	const seenIds = new Set();

	for ( const listHead of itemToListHead.values() ) {
		applied = fixListIndents( listHead, writer ) || applied;
		applied = fixListItemIds( listHead, seenIds, writer ) || applied;
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
 *		<paragraph listType="bulleted" listItemId="a" listIndent=0>A</paragraph>
 *		<paragraph listType="bulleted" listItemId="b" listIndent=1>B^</paragraph>
 *		// At ^ paste:  <paragraph listType="bulleted" listItemId="x" listIndent=4>X</paragraph>
 *		//              <paragraph listType="bulleted" listItemId="y" listIndent=5>Y</paragraph>
 *		<paragraph listType="bulleted" listItemId="c" listIndent=2>C</paragraph>
 *
 * Should become:
 *
 *		<paragraph listType="bulleted" listItemId="a" listIndent=0>A</paragraph>
 *		<paragraph listType="bulleted" listItemId="b" listIndent=1>BX</paragraph>
 *		<paragraph listType="bulleted" listItemId="y" listIndent=2>Y/paragraph>
 *		<paragraph listType="bulleted" listItemId="c" listIndent=2>C</paragraph>
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
