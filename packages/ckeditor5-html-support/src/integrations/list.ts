/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/list
 */

import { isEqual } from 'es-toolkit/compat';
import { Plugin } from '@ckeditor/ckeditor5-core';
import type { UpcastElementEvent, ViewElement, ModelItem } from '@ckeditor/ckeditor5-engine';
import type { GetCallback } from '@ckeditor/ckeditor5-utils';
import type {
	ListEditing,
	ListEditingPostFixerEvent,
	LegacyIndentCommand,
	ListIndentCommand,
	ListType,
	ListUtils
} from '@ckeditor/ckeditor5-list';

import { getHtmlAttributeName, setViewAttributes } from '../utils.js';
import { DataFilter, type HtmlSupportDataFilterRegisterEvent } from '../datafilter.js';

/**
 * Provides the General HTML Support integration with the {@link module:list/list~List List} feature.
 */
export class ListElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListElementSupport' as const;
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
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );
		const listEditing: ListEditing = editor.plugins.get( 'ListEditing' );
		const listUtils: ListUtils = editor.plugins.get( 'ListUtils' );
		const viewElements = [ 'ul', 'ol', 'li' ];

		// Register downcast strategy.
		// Note that this must be done before document list editing registers conversion in afterInit.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'htmlLiAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'htmlUlAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'htmlOlAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		dataFilter.on<HtmlSupportDataFilterRegisterEvent>( 'register', ( evt, definition ) => {
			if ( !viewElements.includes( definition.view! ) ) {
				return;
			}

			evt.stop();

			// Do not register same converters twice.
			if ( schema.checkAttribute( '$block', 'htmlLiAttributes' ) ) {
				return;
			}

			const allowAttributes = viewElements.map( element => getHtmlAttributeName( element ) );

			schema.extend( '$listItem', { allowAttributes } );

			conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on<UpcastElementEvent>(
					'element:ul', viewToModelListAttributeConverter( 'htmlUlAttributes', 'list', dataFilter ), { priority: 'low' }
				);
				dispatcher.on<UpcastElementEvent>(
					'element:ol', viewToModelListAttributeConverter( 'htmlOlAttributes', 'list', dataFilter ), { priority: 'low' }
				);
				dispatcher.on<UpcastElementEvent>(
					'element:li', viewToModelListAttributeConverter( 'htmlLiAttributes', 'item', dataFilter ), { priority: 'low' }
				);
			} );
		} );

		// Make sure that all items in a single list (items at the same level & listType) have the same properties.
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node, previousNodeInList } of listNodes ) {
				// This is a first item of a nested list.
				if ( !previousNodeInList ) {
					continue;
				}

				if ( previousNodeInList.getAttribute( 'listType' ) == node.getAttribute( 'listType' ) ) {
					const attribute = getAttributeFromListType( previousNodeInList.getAttribute( 'listType' ) );
					const value = previousNodeInList.getAttribute( attribute );

					if (
						!isEqual( node.getAttribute( attribute ), value ) &&
						writer.model.schema.checkAttribute( node, attribute )
					) {
						if ( value === undefined ) {
							writer.removeAttribute( attribute, node );
						} else {
							writer.setAttribute( attribute, value, node );
						}
						evt.return = true;
					}
				}

				if ( previousNodeInList.getAttribute( 'listItemId' ) == node.getAttribute( 'listItemId' ) ) {
					const value = previousNodeInList.getAttribute( 'htmlLiAttributes' );

					if (
						!isEqual( node.getAttribute( 'htmlLiAttributes' ), value ) &&
						writer.model.schema.checkAttribute( node, 'htmlLiAttributes' )
					) {
						if ( value === undefined ) {
							writer.removeAttribute( 'htmlLiAttributes', node );
						} else {
							writer.setAttribute( 'htmlLiAttributes', value, node );
						}
						evt.return = true;
					}
				}
			}
		} );

		// Remove `ol` attributes from `ul` elements and vice versa.
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node } of listNodes ) {
				const listType = node.getAttribute( 'listType' );

				if ( !listUtils.isNumberedListType( listType ) && node.getAttribute( 'htmlOlAttributes' ) ) {
					writer.removeAttribute( 'htmlOlAttributes', node );
					evt.return = true;
				}

				if ( listUtils.isNumberedListType( listType ) && node.getAttribute( 'htmlUlAttributes' ) ) {
					writer.removeAttribute( 'htmlUlAttributes', node );
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

		if ( !editor.commands.get( 'indentList' ) ) {
			return;
		}

		// Reset list attributes after indenting list items.
		const indentList: LegacyIndentCommand | ListIndentCommand = editor.commands.get( 'indentList' )!;

		this.listenTo( indentList, 'afterExecute', ( evt, changedBlocks ) => {
			editor.model.change( writer => {
				for ( const node of changedBlocks ) {
					const attribute = getAttributeFromListType( node.getAttribute( 'listType' ) );

					if ( !editor.model.schema.checkAttribute( node, attribute ) ) {
						continue;
					}

					// Clear any attribute inherited from the outer list. If the indented item joins an
					// existing nested list, the postfixer will copy the right value from a sibling.
					writer.removeAttribute( attribute, node );
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
function viewToModelListAttributeConverter(
	attributeName: string,
	scope: 'list' | 'item',
	dataFilter: DataFilter
): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const viewElement = data.viewItem;

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

		if ( scope === 'list' && !viewAttributes ) {
			return;
		}

		const store = conversionApi.store as Record<string, unknown>;
		store.htmlSupportItemToClosestList ??= new Map();

		const itemToClosestList = store.htmlSupportItemToClosestList as Map<ModelItem, ViewElement | null>;
		const closestList = scope === 'item' ? findClosestListAncestor( viewElement ) : null;

		for ( const item of data.modelRange!.getItems( { shallow: true } ) ) {
			if ( !item.hasAttribute( 'listItemId' ) ) {
				// Not an element inside a list.
				continue;
			}

			if ( scope === 'item' ) {
				// Converting `<li>`.
				if ( itemToClosestList.has( item ) ) {
					// This list item was already visited.
					continue;
				}

				// Mark that this list item was already visited.
				itemToClosestList.set( item, closestList );
			} else {
				// Converting `<ul>`/`<ol>`.
				if ( itemToClosestList.get( item ) !== viewElement ) {
					// This list item was already visited.
					continue;
				}
			}

			// Set `<ul>`/`<ol>`/`<li>` custom attributes if any.
			if ( viewAttributes && conversionApi.writer.model.schema.checkAttribute( item, attributeName ) ) {
				conversionApi.writer.setAttribute( attributeName, viewAttributes, item );
			}
		}
	};
}

/**
 * Walks up the view tree from the given element and returns the first `<ul>`/`<ol>` ancestor,
 * or `null` if there isn't one.
 */
function findClosestListAncestor( viewElement: ViewElement ): ViewElement | null {
	let node = viewElement.parent;

	while ( node ) {
		if ( node.is( 'element', 'ul' ) || node.is( 'element', 'ol' ) ) {
			return node;
		}

		node = node.parent;
	}

	return null;
}

/**
 * Returns HTML attribute name based on provided list type.
 */
function getAttributeFromListType( listType: ListType ) {
	return listType === 'numbered' || listType == 'customNumbered' ?
		'htmlOlAttributes' :
		'htmlUlAttributes';
}
