/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/utils/automaticdecorators
 */

import {
	toMap,
	priorities,
	type ArrayOrItem,
	type GetCallback
} from 'ckeditor5/src/utils.js';

import type {
	DowncastAttributeEvent,
	DowncastDispatcher,
	ModelElement,
	ModelSelection,
	ModelItem,
	ModelDocumentSelection,
	ViewElement,
	ViewDowncastWriter
} from 'ckeditor5/src/engine.js';

import type { NormalizedLinkDecoratorAutomaticDefinition } from '../utils.js';

/**
 * Helper class that ties together all {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition} and provides
 * the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement downcast dispatchers} for them.
 */
export class AutomaticLinkDecorators {
	/**
	 * Stores the definition of {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators}.
	 * This data is used as a source for a downcast dispatcher to create a proper conversion to output data.
	 */
	private _definitions = new Set<NormalizedLinkDecoratorAutomaticDefinition>();

	/**
	 * A callback that checks if a decorator can be applied to a given element.
	 * Returns `true` if there is a conflict preventing the decorator from being applied.
	 */
	private _conflictChecker?: LinkDecoratorConflictChecker;

	/**
	 * Gives information about the number of decorators stored in the {@link module:link/utils/automaticdecorators~AutomaticLinkDecorators}
	 * instance.
	 */
	public get length(): number {
		return this._definitions.size;
	}

	/**
	 * Sets a callback that checks if a decorator can be applied to a given element.
	 *
	 * @param checker A function that returns `true` if there is a conflict preventing the decorator from being applied.
	 */
	public setConflictChecker( checker: LinkDecoratorConflictChecker ): void {
		this._conflictChecker = checker;
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
			const elementCreator = (
				item: NormalizedLinkDecoratorAutomaticDefinition,
				viewWriter: ViewDowncastWriter
			) => {
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

				return viewElement;
			};

			const createConverter = ( isApplyingConverter: boolean ): GetCallback<DowncastAttributeEvent> => {
				return ( evt, data, conversionApi ) => {
					if ( !data.attributeKey.startsWith( 'link' ) ) {
						return;
					}

					// There is only test as this behavior decorates links and
					// it is run before dispatcher which actually consumes this node.
					// This allows on writing own dispatcher with highest priority,
					// which blocks both native converter and this additional decoration.
					if ( data.attributeKey == 'linkHref' && !conversionApi.consumable.test( data.item, 'attribute:linkHref' ) ) {
						return;
					}

					// Automatic decorators for block links are handled e.g. in LinkImageEditing.
					if ( !data.item.is( 'selection' ) && !conversionApi.schema.isInline( data.item ) ) {
						return;
					}

					for ( const decorator of this._definitions ) {
						// Check if automatic decorator is matched and does not conflict with any other active manual decorator.
						if (
							decorator.callback( data.item.getAttribute( 'linkHref' ) as string | null ) &&
							!this._conflictChecker?.( decorator, data.item ) &&
							isApplyingConverter
						) {
							if ( data.item.is( 'selection' ) ) {
								conversionApi.writer.wrap(
									conversionApi.writer.document.selection.getFirstRange()!,
									elementCreator( decorator, conversionApi.writer )
								);
							} else {
								conversionApi.writer.wrap(
									conversionApi.mapper.toViewRange( data.range ),
									elementCreator( decorator, conversionApi.writer )
								);
							}
						} else {
							conversionApi.writer.unwrap(
								conversionApi.mapper.toViewRange( data.range ),
								elementCreator( decorator, conversionApi.writer )
							);
						}
					}
				};
			};

			dispatcher.on<DowncastAttributeEvent>( 'attribute', createConverter( false ), { priority: 'high' } );
			// Apply decorators after all automatic and manual decorators are removed so removing one decorator
			// won't strip part of the other decorator's attributes, classes or styles.
			dispatcher.on<DowncastAttributeEvent>( 'attribute', createConverter( true ), { priority: priorities.high - 1 } );
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
			// TODO handle wrap/unwrap on different priorities.
			dispatcher.on<DowncastAttributeEvent<ModelElement>>( 'attribute:linkHref:imageBlock', ( evt, data, { writer, mapper } ) => {
				const viewFigure = mapper.toViewElement( data.item )!;
				const linkInImage = Array.from( viewFigure.getChildren() )
					.find( ( child ): child is ViewElement => child.is( 'element', 'a' ) );

				// It's not guaranteed that the anchor is present in the image block during execution of this dispatcher.
				// It might have been removed during the execution of unlink command that runs the image link downcast dispatcher
				// that is executed before this one and removes the anchor from the image block.
				if ( !linkInImage ) {
					return;
				}

				for ( const item of this._definitions ) {
					const attributes = toMap( item.attributes );

					if (
						item.callback( data.attributeNewValue as string | null ) &&
						!this._conflictChecker?.( item, data.item )
					) {
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

/**
 * A callback that checks if a decorator can be applied to a given element.
 * Returns `true` if there is a conflict preventing the decorator from being applied.
 */
export type LinkDecoratorConflictChecker = (
	decorator: NormalizedLinkDecoratorAutomaticDefinition,
	modelItem: ModelItem | ModelSelection | ModelDocumentSelection
) => boolean | undefined;
