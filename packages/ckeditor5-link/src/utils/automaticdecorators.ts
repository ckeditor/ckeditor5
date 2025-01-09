/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/utils/automaticdecorators
 */

import { toMap, type ArrayOrItem } from 'ckeditor5/src/utils.js';
import type { DowncastAttributeEvent, DowncastDispatcher, Element, ViewElement } from 'ckeditor5/src/engine.js';
import type { NormalizedLinkDecoratorAutomaticDefinition } from '../utils.js';

/**
 * Helper class that ties together all {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition} and provides
 * the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement downcast dispatchers} for them.
 */
export default class AutomaticDecorators {
	/**
	 * Stores the definition of {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators}.
	 * This data is used as a source for a downcast dispatcher to create a proper conversion to output data.
	 */
	private _definitions = new Set<NormalizedLinkDecoratorAutomaticDefinition>();

	/**
	 * Gives information about the number of decorators stored in the {@link module:link/utils/automaticdecorators~AutomaticDecorators}
	 * instance.
	 */
	public get length(): number {
		return this._definitions.size;
	}

	/**
	 * Adds automatic decorator objects or an array with them to be used during downcasting.
	 *
	 * @param item A configuration object of automatic rules for decorating links. It might also be an array of such objects.
	 */
	public add( item: ArrayOrItem<NormalizedLinkDecoratorAutomaticDefinition> ): void {
		if ( Array.isArray( item ) ) {
			item.forEach( item => this._definitions.add( item ) );
		} else {
			this._definitions.add( item );
		}
	}

	/**
	 * Provides the conversion helper used in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method.
	 *
	 * @returns A dispatcher function used as conversion helper in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}.
	 */
	public getDispatcher(): ( dispatcher: DowncastDispatcher ) => void {
		return dispatcher => {
			dispatcher.on<DowncastAttributeEvent>( 'attribute:linkHref', ( evt, data, conversionApi ) => {
				// There is only test as this behavior decorates links and
				// it is run before dispatcher which actually consumes this node.
				// This allows on writing own dispatcher with highest priority,
				// which blocks both native converter and this additional decoration.
				if ( !conversionApi.consumable.test( data.item, 'attribute:linkHref' ) ) {
					return;
				}

				// Automatic decorators for block links are handled e.g. in LinkImageEditing.
				if ( !( data.item.is( 'selection' ) || conversionApi.schema.isInline( data.item ) ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewSelection = viewWriter.document.selection;

				for ( const item of this._definitions ) {
					const viewElement = viewWriter.createAttributeElement( 'a', item.attributes, {
						priority: 5
					} );

					if ( item.classes ) {
						viewWriter.addClass( item.classes, viewElement );
					}

					for ( const key in item.styles ) {
						viewWriter.setStyle( key, item.styles[ key ], viewElement );
					}

					viewWriter.setCustomProperty( 'link', true, viewElement );

					if ( item.callback( data.attributeNewValue as string | null ) ) {
						if ( data.item.is( 'selection' ) ) {
							viewWriter.wrap( viewSelection.getFirstRange()!, viewElement );
						} else {
							viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
						}
					} else {
						viewWriter.unwrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
					}
				}
			}, { priority: 'high' } );
		};
	}

	/**
	 * Provides the conversion helper used in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method
	 * when linking images.
	 *
	 * @returns A dispatcher function used as conversion helper in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}.
	 */
	public getDispatcherForLinkedImage(): ( dispatcher: DowncastDispatcher ) => void {
		return dispatcher => {
			dispatcher.on<DowncastAttributeEvent<Element>>( 'attribute:linkHref:imageBlock', ( evt, data, { writer, mapper } ) => {
				const viewFigure = mapper.toViewElement( data.item )!;
				const linkInImage = Array.from( viewFigure.getChildren() )
					.find( ( child ): child is ViewElement => child.is( 'element', 'a' ) )!;

				// It's not guaranteed that the anchor is present in the image block during execution of this dispatcher.
				// It might have been removed during the execution of unlink command that runs the image link downcast dispatcher
				// that is executed before this one and removes the anchor from the image block.
				if ( !linkInImage ) {
					return;
				}

				for ( const item of this._definitions ) {
					const attributes = toMap( item.attributes );

					if ( item.callback( data.attributeNewValue as string | null ) ) {
						for ( const [ key, val ] of attributes ) {
							// Left for backward compatibility. Since v30 decorator should
							// accept `classes` and `styles` separately from `attributes`.
							if ( key === 'class' ) {
								writer.addClass( val, linkInImage );
							} else {
								writer.setAttribute( key, val, linkInImage );
							}
						}

						if ( item.classes ) {
							writer.addClass( item.classes, linkInImage );
						}

						for ( const key in item.styles ) {
							writer.setStyle( key, item.styles[ key ], linkInImage );
						}
					} else {
						for ( const [ key, val ] of attributes ) {
							if ( key === 'class' ) {
								writer.removeClass( val, linkInImage );
							} else {
								writer.removeAttribute( key, linkInImage );
							}
						}

						if ( item.classes ) {
							writer.removeClass( item.classes, linkInImage );
						}

						for ( const key in item.styles ) {
							writer.removeStyle( key, linkInImage );
						}
					}
				}
			} );
		};
	}
}
