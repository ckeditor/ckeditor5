/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting
 */

import { type Editor, Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';

import { ListItemBoldIntegration } from './listformatting/listitemboldintegration.js';
import { ListItemItalicIntegration } from './listformatting/listitemitalicintegration.js';
import { ListItemFontSizeIntegration } from './listformatting/listitemfontsizeintegration.js';
import { ListItemFontColorIntegration } from './listformatting/listitemfontcolorintegration.js';
import { ListItemFontFamilyIntegration } from './listformatting/listitemfontfamilyintegration.js';
import { ListItemHeadingIntegration } from './listformatting/listitemheadingintegration.js';

import type {
	Model,
	ModelElement,
	ModelWriter,
	UpcastElementEvent
} from '@ckeditor/ckeditor5-engine';

import {
	isListItemBlock,
	getAllListItemBlocks,
	isFirstBlockOfListItem
} from './list/utils/model.js';

import type { DecoratedMethodEvent } from '@ckeditor/ckeditor5-utils';

/**
 * The list formatting plugin.
 *
 * It enables integration with formatting plugins to style the list marker.
 * The list marker is styled based on the consistent formatting applied to the content of the list item.
 *
 * The list of supported formatting plugins includes:
 * * Font color.
 * * Font size.
 * * Font family.
 * * Bold.
 * * Italic.
 * * Heading (and other block styles registered with {@link #registerMarkerFromBlockCheck}), when
 * {@link module:list/listconfig~ListConfig#enableListItemMarkerFromBlock `list.enableListItemMarkerFromBlock`} is enabled.
 */
export class ListFormatting extends Plugin {
	/**
	 * The list of loaded formatting.
	 */
	private readonly _loadedFormatting: Record<string, string> = {};

	/**
	 * Callbacks that decide if the marker should be rendered by the first block of a list item.
	 */
	private readonly _markerFromBlockChecks: Array<( block: ModelElement ) => boolean> = [];

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListFormatting' as const;
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
	public static get requires(): PluginDependenciesOf<[
		ListItemBoldIntegration,
		ListItemItalicIntegration,
		ListItemFontSizeIntegration,
		ListItemFontColorIntegration,
		ListItemFontFamilyIntegration,
		ListItemHeadingIntegration
	]> {
		return [
			ListItemBoldIntegration,
			ListItemItalicIntegration,
			ListItemFontSizeIntegration,
			ListItemFontColorIntegration,
			ListItemFontFamilyIntegration,
			ListItemHeadingIntegration
		];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'list.enableListItemMarkerFormatting', true );
		editor.config.define( 'list.enableListItemMarkerFromBlock', false );

		this.decorate( 'isMarkerFromBlock' );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		if ( !this._isMarkerFromBlockEnabled() ) {
			return;
		}

		// The `listItemMarkerFromBlock` attribute adds a class to `<li>`. The content styles then let the first
		// block of the list item (for example `<h2>`) render the marker, so the marker looks like that block.
		this.editor.plugins.get( 'ListEditing' ).registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'listItemMarkerFromBlock',

			setAttributeOnDowncast( writer, value, viewElement ) {
				/* v8 ignore next -- Downcast callbacks are only registered for meaningful list marker formatting values. */
				if ( value ) {
					writer.addClass( 'ck-list-marker-from-block', viewElement );
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		if ( !this._isMarkerFromBlockEnabled() ) {
			// Consume the class even if the feature is disabled, so it is not preserved by the general HTML support
			// (and does not hide the marker of a list item that no longer starts with a heading).
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on<UpcastElementEvent>( 'element:li', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { classes: 'ck-list-marker-from-block' } );
				} );
			} );
		}

		if ( !editor.config.get( 'list.enableListItemMarkerFormatting' ) ) {
			return;
		}

		if ( this._isMarkerFromBlockEnabled() ) {
			editor.model.schema.extend( '$listItem', { allowAttributes: 'listItemMarkerFromBlock' } );
			editor.model.schema.addAttributeCheck( context => {
				if ( !context.last.getAttribute( 'listItemId' ) ) {
					return false;
				}
			}, 'listItemMarkerFromBlock' );

			editor.conversion.for( 'upcast' ).attributeToAttribute( {
				model: 'listItemMarkerFromBlock',
				view: { name: 'li', classes: 'ck-list-marker-from-block' }
			} );
		}

		this._registerPostfixerForListItemFormatting();
	}

	/**
	 * Registers a callback that decides if the marker of a bulleted or numbered list item should be rendered
	 * by the first block of that list item (for example, a heading) instead of the `<li>` element.
	 *
	 * @param check The callback that receives the first block of a list item.
	 */
	public registerMarkerFromBlockCheck( check: ( block: ModelElement ) => boolean ): void {
		this._markerFromBlockChecks.push( check );
	}

	/**
	 * Registers a postfixer that ensures that the list item formatting attribute is consistent with the formatting
	 * applied to the content of the list item.
	 */
	private _registerPostfixerForListItemFormatting(): void {
		const model = this.editor.model;
		const isMarkerFromBlockEnabled = this._isMarkerFromBlockEnabled();

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			const modifiedListItems = new Set<ModelElement>();
			let returnValue = false;

			for ( const entry of changes ) {
				if ( entry.type === 'attribute' ) {
					if (
						entry.attributeKey == 'listItemId' ||
						entry.attributeKey == 'listType' ||
						this._isInlineOrSelectionFormatting( entry.attributeKey ) ||
						Object.values( this._loadedFormatting ).includes( entry.attributeKey )
					) {
						if ( isListItemBlock( entry.range.start.nodeAfter ) ) {
							modifiedListItems.add( entry.range.start.nodeAfter );
						}
						else if ( isListItemBlock( entry.range.start.parent ) ) {
							modifiedListItems.add( entry.range.start.parent );
						}
					}
					// A block attribute (for example, a class added by the style feature) may change the marker-from-block state.
					// The list attributes (such as `listIndent` or the ones set by this post-fixer) do not affect it.
					else if (
						isMarkerFromBlockEnabled &&
						!entry.attributeKey.startsWith( 'list' ) &&
						isListItemBlock( entry.range.start.nodeAfter )
					) {
						modifiedListItems.add( entry.range.start.nodeAfter );
					}
				}
				else {
					if ( isListItemBlock( entry.position.nodeAfter ) ) {
						modifiedListItems.add( entry.position.nodeAfter );
					}

					if ( isListItemBlock( entry.position.nodeBefore ) ) {
						modifiedListItems.add( entry.position.nodeBefore );
					}

					if ( isListItemBlock( entry.position.parent ) ) {
						modifiedListItems.add( entry.position.parent );
					}

					if ( entry.type == 'insert' && entry.name != '$text' ) {
						const range = writer.createRangeIn( entry.position.nodeAfter as ModelElement );

						for ( const item of range.getItems() ) {
							if ( isListItemBlock( item ) ) {
								modifiedListItems.add( item );
							}
						}
					}
				}
			}

			for ( const listItem of modifiedListItems ) {
				const formats = getListItemConsistentFormat( model, listItem, Object.keys( this._loadedFormatting ) );

				for ( const [ formatAttributeName, formatValue ] of Object.entries( formats ) ) {
					const listItemFormatAttributeName = this._loadedFormatting[ formatAttributeName ];

					if ( formatValue && setFormattingToListItem( writer, listItem, listItemFormatAttributeName, formatValue ) ) {
						returnValue = true;
					}
					else if ( !formatValue && removeFormattingFromListItem( writer, listItem, listItemFormatAttributeName ) ) {
						returnValue = true;
					}
				}

				if ( !isMarkerFromBlockEnabled ) {
					continue;
				}

				const firstBlock = isFirstBlockOfListItem( listItem ) ? listItem : getAllListItemBlocks( listItem )[ 0 ];

				if ( this.isMarkerFromBlock( firstBlock ) ) {
					if ( setFormattingToListItem( writer, listItem, 'listItemMarkerFromBlock', true ) ) {
						returnValue = true;
					}
				}
				else if ( removeFormattingFromListItem( writer, listItem, 'listItemMarkerFromBlock' ) ) {
					returnValue = true;
				}
			}

			return returnValue;
		} );
	}

	/**
	 * Registers an integration between a default attribute (e.g., `fontFamily`) and a new attribute
	 * intended specifically for list item elements (e.g., `listItemFontFamily`).
	 *
	 * These attributes are later used by the postfixer logic to determine whether to add the new attribute
	 * to the list item element, based on whether there is a consistent default formatting attribute
	 * applied within its content.
	 */
	public registerFormatAttribute( formatAttribute: string, listItemFormatAttribute: string ): void {
		this._loadedFormatting[ formatAttribute ] = listItemFormatAttribute;
	}

	/**
	 * Returns true if the marker of the list item that starts with the given block should be rendered by that block,
	 * that is, if the list item is bulleted or numbered and any of the registered checks passes.
	 *
	 * The method is decorated, so a feature that renders its own list markers (for example, the multi-level list)
	 * can opt out:
	 *
	 * ```ts
	 * listFormatting.on( 'isMarkerFromBlock', ( evt, [ block ] ) => {
	 * 	if ( block.getAttribute( 'listType' ) == 'customNumbered' ) {
	 * 		evt.return = false;
	 * 		evt.stop();
	 * 	}
	 * }, { priority: 'high' } );
	 * ```
	 *
	 * @param block The first block of a list item.
	 */
	public isMarkerFromBlock( block: ModelElement ): boolean {
		return isNumberedOrBulletedList( block ) && this._markerFromBlockChecks.some( check => check( block ) );
	}

	/**
	 * Returns true if the marker of a list item can be rendered by the first block of that list item, that is,
	 * if both `list.enableListItemMarkerFormatting` and `list.enableListItemMarkerFromBlock` are enabled.
	 */
	private _isMarkerFromBlockEnabled(): boolean {
		const config = this.editor.config;

		return !!config.get( 'list.enableListItemMarkerFormatting' ) && !!config.get( 'list.enableListItemMarkerFromBlock' );
	}

	/**
	 * Returns true if the given model attribute name is a supported inline formatting attribute.
	 */
	private _isInlineOrSelectionFormatting( attributeKey: string ): boolean {
		return attributeKey.replace( /^selection:/, '' ) in this._loadedFormatting;
	}
}

/**
 * Returns the consistent format of the list item element.
 * If the list item contains multiple blocks, it checks only the first block.
 */
function getListItemConsistentFormat( model: Model, listItem: ModelElement, attributeKeys: Array<string> ) {
	if ( isFirstBlockOfListItem( listItem ) ) {
		return getSingleListItemConsistentFormat( model, listItem, attributeKeys );
	}

	// Always the first block of the list item should be checked for consistent formatting.
	const listItemBlocks = getAllListItemBlocks( listItem );

	return getSingleListItemConsistentFormat( model, listItemBlocks[ 0 ], attributeKeys );
}

/**
 * Returns the consistent format of a single list item element.
 */
function getSingleListItemConsistentFormat( model: Model, listItem: ModelElement, attributeKeys: Array<string> ) {
	// Only bulleted and numbered lists can have formatting (to-do lists are not supported).
	// Do not check internals of limit elements (for example, do not check table cells).
	if ( !isNumberedOrBulletedList( listItem ) || model.schema.isLimit( listItem ) ) {
		return Object.fromEntries( attributeKeys.map( attributeKey => [ attributeKey ] ) ) as Record<string, string | undefined>;
	}

	if ( listItem.isEmpty ) {
		return Object.fromEntries( attributeKeys.map( attributeKey => (
			[ attributeKey, listItem.getAttribute( `selection:${ attributeKey }` ) as string | undefined ]
		) ) );
	}

	const attributesToCheck = new Set( attributeKeys );
	const valuesMap: Record<string, string | undefined> = {};

	const range = model.createRangeIn( listItem );
	const walker = range.getWalker( { ignoreElementEnd: true } );

	for ( const { item } of walker ) {
		for ( const attributeKey of attributesToCheck ) {
			if ( model.schema.checkAttribute( item, attributeKey ) ) {
				const formatAttribute = item.getAttribute( attributeKey ) as string;

				if ( formatAttribute === undefined ) {
					attributesToCheck.delete( attributeKey );
					valuesMap[ attributeKey ] = undefined;
				}
				else if ( valuesMap[ attributeKey ] === undefined ) {
					// First item inside a list item block.
					valuesMap[ attributeKey ] = formatAttribute;
				}
				else if ( valuesMap[ attributeKey ] !== formatAttribute ) {
					// Following items in the same block of a list item.
					attributesToCheck.delete( attributeKey );
					valuesMap[ attributeKey ] = undefined;
				}
			} else if ( !( attributeKey in valuesMap ) ) {
				// Store it so a format would be removed when all items in the given list item does not allow that formatting.
				valuesMap[ attributeKey ] = undefined;
			}
		}

		// End early if all attributes have been checked and are inconsistent.
		if ( !attributesToCheck.size ) {
			break;
		}

		// Jump over inline limit elements as we expect only outside them to be the same formatting.
		if ( model.schema.isLimit( item ) ) {
			walker.jumpTo( model.createPositionAfter( item ) );
		}
	}

	return valuesMap;
}

/**
 * Adds the specified formatting attribute to the list item element.
 */
function setFormattingToListItem(
	writer: ModelWriter,
	listItem: ModelElement,
	attributeKey: string,
	attributeValue: unknown
): boolean {
	// Multi-block items should have consistent formatting.
	const listItemBlocks = getAllListItemBlocks( listItem );
	let wasChanged = false;

	for ( const listItem of listItemBlocks ) {
		if ( !listItem.hasAttribute( attributeKey ) || listItem.getAttribute( attributeKey ) !== attributeValue ) {
			writer.setAttribute( attributeKey, attributeValue, listItem );
			wasChanged = true;
		}
	}

	return wasChanged;
}

/**
 * Removes the specified formatting attribute from the list item element.
 */
function removeFormattingFromListItem(
	writer: ModelWriter,
	listItem: ModelElement,
	attributeKey: string
): boolean {
	// Multi-block items should have consistent formatting.
	const listItemBlocks = getAllListItemBlocks( listItem );
	let wasChanged = false;

	for ( const listItem of listItemBlocks ) {
		if ( listItem.hasAttribute( attributeKey ) ) {
			writer.removeAttribute( attributeKey, listItem );
			wasChanged = true;
		}
	}

	return wasChanged;
}

/**
 * Checks if the given list type is a numbered or bulleted list.
 */
function isNumberedOrBulletedList( listItem: ModelElement ): boolean {
	return [ 'numbered', 'bulleted', 'customNumbered', 'customBulleted' ].includes( listItem.getAttribute( 'listType' ) as string );
}

/**
 * Event fired by the decorated {@link module:list/listformatting~ListFormatting#isMarkerFromBlock} method.
 */
export type ListFormattingIsMarkerFromBlockEvent = DecoratedMethodEvent<ListFormatting, 'isMarkerFromBlock'>;
