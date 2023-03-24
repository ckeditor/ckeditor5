/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/documentlist
 */

import { isEqual } from 'lodash-es';
import { Plugin } from 'ckeditor5/src/core';
import type { UpcastElementEvent } from 'ckeditor5/src/engine';
import type { GetCallback } from 'ckeditor5/src/utils';
import type {
	DocumentListEditing,
	DocumentListEditingPostFixerEvent,
	IndentCommand,
	DocumentListIndentCommand
} from '@ckeditor/ckeditor5-list';

import { type GHSViewAttributes, setViewAttributes } from '../conversionutils';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter';

/**
 * Provides the General HTML Support integration with the {@link module:list/documentlist~DocumentList Document List} feature.
 */
export default class DocumentListElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DocumentListElementSupport' {
		return 'DocumentListElementSupport';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'DocumentListEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );
		const documentListEditing: DocumentListEditing = editor.plugins.get( 'DocumentListEditing' );

		// Register downcast strategy.
		// Note that this must be done before document list editing registers conversion in afterInit.
		documentListEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'htmlLiAttributes',

			setAttributeOnDowncast( writer, attributeValue: GHSViewAttributes, viewElement ) {
				setViewAttributes( writer, attributeValue, viewElement );
			}
		} );

		documentListEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'htmlListAttributes',

			setAttributeOnDowncast( writer, viewAttributes: GHSViewAttributes, viewElement ) {
				setViewAttributes( writer, viewAttributes, viewElement );
			}
		} );

		dataFilter.on<DataFilterRegisterEvent>( 'register', ( evt, definition ) => {
			if ( ![ 'ul', 'ol', 'li' ].includes( definition.view! ) ) {
				return;
			}

			evt.stop();

			// Do not register same converters twice.
			if ( schema.checkAttribute( '$block', 'htmlListAttributes' ) ) {
				return;
			}

			schema.extend( '$block', { allowAttributes: [ 'htmlListAttributes', 'htmlLiAttributes' ] } );
			schema.extend( '$blockObject', { allowAttributes: [ 'htmlListAttributes', 'htmlLiAttributes' ] } );
			schema.extend( '$container', { allowAttributes: [ 'htmlListAttributes', 'htmlLiAttributes' ] } );

			conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on<UpcastElementEvent>(
					'element:ul', viewToModelListAttributeConverter( 'htmlListAttributes', dataFilter ), { priority: 'low' }
				);
				dispatcher.on<UpcastElementEvent>(
					'element:ol', viewToModelListAttributeConverter( 'htmlListAttributes', dataFilter ), { priority: 'low' }
				);
				dispatcher.on<UpcastElementEvent>(
					'element:li', viewToModelListAttributeConverter( 'htmlLiAttributes', dataFilter ), { priority: 'low' }
				);
			} );
		} );

		// Make sure that all items in a single list (items at the same level & listType) have the same properties.
		// Note: This is almost an exact copy from DocumentListPropertiesEditing.
		documentListEditing.on<DocumentListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			const previousNodesByIndent = []; // Last seen nodes of lower indented lists.

			for ( const { node, previous } of listNodes ) {
				// For the first list block there is nothing to compare with.
				if ( !previous ) {
					continue;
				}

				const nodeIndent = node.getAttribute( 'listIndent' );
				const previousNodeIndent = previous.getAttribute( 'listIndent' );

				let previousNodeInList = null; // It's like `previous` but has the same indent as current node.

				// Let's find previous node for the same indent.
				// We're going to need that when we get back to previous indent.
				if ( nodeIndent > previousNodeIndent ) {
					previousNodesByIndent[ previousNodeIndent ] = previous;
				}
				// Restore the one for given indent.
				else if ( nodeIndent < previousNodeIndent ) {
					previousNodeInList = previousNodesByIndent[ nodeIndent ];
					previousNodesByIndent.length = nodeIndent;
				}
				// Same indent.
				else {
					previousNodeInList = previous;
				}

				// This is a first item of a nested list.
				if ( !previousNodeInList ) {
					continue;
				}

				if ( previousNodeInList.getAttribute( 'listType' ) == node.getAttribute( 'listType' ) ) {
					const value = previousNodeInList.getAttribute( 'htmlListAttributes' );

					if ( !isEqual( node.getAttribute( 'htmlListAttributes' ), value ) ) {
						writer.setAttribute( 'htmlListAttributes', value, node );
						evt.return = true;
					}
				}

				if ( previousNodeInList.getAttribute( 'listItemId' ) == node.getAttribute( 'listItemId' ) ) {
					const value = previousNodeInList.getAttribute( 'htmlLiAttributes' );

					if ( !isEqual( node.getAttribute( 'htmlLiAttributes' ), value ) ) {
						writer.setAttribute( 'htmlLiAttributes', value, node );
						evt.return = true;
					}
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		if ( !editor.commands.get( 'indentList' ) ) {
			return;
		}

		// Reset list attributes after indenting list items.
		const indentList: IndentCommand | DocumentListIndentCommand = editor.commands.get( 'indentList' )!;
		this.listenTo( indentList, 'afterExecute', ( evt, changedBlocks ) => {
			editor.model.change( writer => {
				for ( const node of changedBlocks ) {
					// Just reset the attribute.
					// If there is a previous indented list that this node should be merged into,
					// the postfixer will unify all the attributes of both sub-lists.
					writer.setAttribute( 'htmlListAttributes', {}, node );
				}
			} );
		} );
	}
}

/**
 * View-to-model conversion helper preserving allowed attributes on {@link TODO}
 * feature model element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelListAttributeConverter( attributeName: string, dataFilter: DataFilter ) {
	const callback: GetCallback<UpcastElementEvent> = ( evt, data, conversionApi ) => {
		const viewElement = data.viewItem;

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

		for ( const item of data.modelRange!.getItems( { shallow: true } ) ) {
			// Apply only to list item blocks.
			if ( !item.hasAttribute( 'listItemId' ) ) {
				continue;
			}

			// Set list attributes only on same level items, those nested deeper are already handled
			// by the recursive conversion.
			if ( item.hasAttribute( attributeName ) ) {
				continue;
			}

			conversionApi.writer.setAttribute( attributeName, viewAttributes || {}, item );
		}
	};

	return callback;
}
