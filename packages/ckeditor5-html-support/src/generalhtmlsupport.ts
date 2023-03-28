/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/generalhtmlsupport
 */

import { Plugin } from 'ckeditor5/src/core';
import { toArray, type ArrayOrItem } from 'ckeditor5/src/utils';

import DataFilter from './datafilter';
import CodeBlockElementSupport from './integrations/codeblock';
import DualContentModelElementSupport from './integrations/dualcontent';
import HeadingElementSupport from './integrations/heading';
import ImageElementSupport from './integrations/image';
import MediaEmbedElementSupport from './integrations/mediaembed';
import ScriptElementSupport from './integrations/script';
import TableElementSupport from './integrations/table';
import StyleElementSupport from './integrations/style';
import DocumentListElementSupport from './integrations/documentlist';
import CustomElementSupport from './integrations/customelement';
import type { DataSchemaInlineElementDefinition } from './dataschema';
import type { DocumentSelection, Item, Model, Range, Selectable, Writer } from 'ckeditor5/src/engine';
import type { GHSViewAttributes } from './conversionutils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { GeneralHtmlSupportConfig } from './generalhtmlsupportconfig';

type LimitedSelectable = Exclude<Selectable, Iterable<Range> | null>;

/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:html-support/datafilter~DataFilter data filter} configuration
 * and features integration with the General HTML Support.
 */
export default class GeneralHtmlSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'GeneralHtmlSupport' {
		return 'GeneralHtmlSupport';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [
			DataFilter,
			CodeBlockElementSupport,
			DualContentModelElementSupport,
			HeadingElementSupport,
			ImageElementSupport,
			MediaEmbedElementSupport,
			ScriptElementSupport,
			TableElementSupport,
			StyleElementSupport,
			DocumentListElementSupport,
			CustomElementSupport
		] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const dataFilter = editor.plugins.get( DataFilter );

		// Load the filtering configuration.
		dataFilter.loadAllowedConfig( editor.config.get( 'htmlSupport.allow' ) || [] );
		dataFilter.loadDisallowedConfig( editor.config.get( 'htmlSupport.disallow' ) || [] );
	}

	/**
	 * Returns a GHS model attribute name related to a given view element name.
	 *
	 * @param viewElementName A view element name.
	 */
	private getGhsAttributeNameForElement( viewElementName: string ): string {
		const dataSchema = this.editor.plugins.get( 'DataSchema' );
		const definitions = Array.from( dataSchema.getDefinitionsForView( viewElementName, false ) );

		if (
			definitions &&
			definitions.length &&
			( definitions[ 0 ] as DataSchemaInlineElementDefinition ).isInline &&
			!definitions[ 0 ].isObject
		) {
			return definitions[ 0 ].model;
		}

		return 'htmlAttributes';
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it includes the given class name.
	 *
	 * @internal
	 * @param viewElementName A view element name.
	 * @param className The css class to add.
	 * @param selectable The selection or element to update.
	 */
	public addModelHtmlClass( viewElementName: string, className: ArrayOrItem<string>, selectable: LimitedSelectable ): void {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'classes', classes => {
					for ( const value of toArray( className ) ) {
						classes.add( value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it does not include the given class name.
	 *
	 * @internal
	 * @param viewElementName A view element name.
	 * @param className The css class to remove.
	 * @param selectable The selection or element to update.
	 */
	public removeModelHtmlClass( viewElementName: string, className: ArrayOrItem<string>, selectable: LimitedSelectable ): void {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'classes', classes => {
					for ( const value of toArray( className ) ) {
						classes.delete( value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it includes the given attribute.
	 *
	 * @param viewElementName A view element name.
	 * @param attributes The object with attributes to set.
	 * @param selectable The selection or element to update.
	 */
	private setModelHtmlAttributes( viewElementName: string, attributes: Record<string, unknown>, selectable: LimitedSelectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'attributes', attributesMap => {
					for ( const [ key, value ] of Object.entries( attributes ) ) {
						attributesMap.set( key, value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it does not include the given attribute.
	 *
	 * @param viewElementName A view element name.
	 * @param attributeName The attribute name (or names) to remove.
	 * @param selectable The selection or element to update.
	 */
	private removeModelHtmlAttributes( viewElementName: string, attributeName: ArrayOrItem<string>, selectable: LimitedSelectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'attributes', attributesMap => {
					for ( const key of toArray( attributeName ) ) {
						attributesMap.delete( key );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it includes a given style.
	 *
	 * @param viewElementName A view element name.
	 * @param styles The object with styles to set.
	 * @param selectable The selection or element to update.
	 */
	private setModelHtmlStyles( viewElementName: string, styles: Record<string, string>, selectable: LimitedSelectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'styles', stylesMap => {
					for ( const [ key, value ] of Object.entries( styles ) ) {
						stylesMap.set( key, value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it does not include a given style.
	 *
	 * @param viewElementName A view element name.
	 * @param properties The style (or styles list) to remove.
	 * @param selectable The selection or element to update.
	 */
	private removeModelHtmlStyles( viewElementName: string, properties: ArrayOrItem<string>, selectable: LimitedSelectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'styles', stylesMap => {
					for ( const key of toArray( properties ) ) {
						stylesMap.delete( key );
					}
				} );
			}
		} );
	}
}

/**
 * Returns an iterator over an items in the selectable that accept given GHS attribute.
 */
function* getItemsToUpdateGhsAttribute(
	model: Model,
	selectable: LimitedSelectable,
	ghsAttributeName: string
): IterableIterator<Item | DocumentSelection> {
	if ( selectable.is( 'documentSelection' ) && selectable.isCollapsed ) {
		if ( model.schema.checkAttributeInSelection( selectable, ghsAttributeName ) ) {
			yield selectable;
		}
	} else {
		for ( const range of getValidRangesForSelectable( model, selectable, ghsAttributeName ) ) {
			yield* range.getItems( { shallow: true } );
		}
	}
}

/**
 * Translates a given selectable to an iterable of ranges.
 */
function getValidRangesForSelectable(
	model: Model,
	selectable: LimitedSelectable,
	ghsAttributeName: string
): Iterable<Range> {
	if ( selectable.is( 'node' ) || selectable.is( '$text' ) || selectable.is( '$textProxy' ) ) {
		if ( model.schema.checkAttribute( selectable, ghsAttributeName ) ) {
			return [ model.createRangeOn( selectable ) ];
		} else {
			return [];
		}
	} else {
		return model.schema.getValidRanges( model.createSelection( selectable ).getRanges(), ghsAttributeName );
	}
}

interface CallbackMap {
	classes: ( t: Set<string> ) => void;
	attributes: ( t: Map<string, unknown> ) => void;
	styles: ( t: Map<string, string> ) => void;
}

/**
 * Updates a GHS attribute on a specified item.
 * @param callback That receives a map or set as an argument and should modify it (add or remove entries).
 */
function modifyGhsAttribute<T extends keyof GHSViewAttributes>(
	writer: Writer,
	item: Item | DocumentSelection,
	ghsAttributeName: string,
	subject: T,
	callback: CallbackMap[T]
) {
	const oldValue = item.getAttribute( ghsAttributeName ) as Record<string, any>;
	const newValue: Record<string, any> = {};

	for ( const kind of [ 'attributes', 'styles', 'classes' ] as Array<T> ) {
		// Properties other than `subject` should be assigned from `oldValue`.
		if ( kind != subject ) {
			if ( oldValue && oldValue[ kind ] ) {
				newValue[ kind ] = oldValue[ kind ];
			}
			continue;
		}
		// `callback` should be applied on property [`subject`].
		if ( subject == 'classes' ) {
			const values = new Set<string>( oldValue && oldValue.classes || [] );
			( callback as CallbackMap['classes'] )( values );
			if ( values.size ) {
				newValue[ kind ] = Array.from( values ) as GHSViewAttributes[T];
			}
			continue;
		}

		const values = new Map<string, unknown>( Object.entries( oldValue && oldValue[ kind ] || {} ) );
		( callback as CallbackMap['attributes'] )( values );
		if ( values.size ) {
			newValue[ kind ] = Object.fromEntries( values ) as GHSViewAttributes[T];
		}
	}

	if ( Object.keys( newValue ).length ) {
		if ( item.is( 'documentSelection' ) ) {
			writer.setSelectionAttribute( ghsAttributeName, newValue );
		} else {
			writer.setAttribute( ghsAttributeName, newValue, item );
		}
	} else if ( oldValue ) {
		if ( item.is( 'documentSelection' ) ) {
			writer.removeSelectionAttribute( ghsAttributeName );
		} else {
			writer.removeAttribute( ghsAttributeName, item );
		}
	}
}
