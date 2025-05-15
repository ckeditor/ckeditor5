/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/generalhtmlsupport
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { toArray, type ArrayOrItem } from 'ckeditor5/src/utils.js';

import DataFilter from './datafilter.js';
import CodeBlockElementSupport from './integrations/codeblock.js';
import DualContentModelElementSupport from './integrations/dualcontent.js';
import HeadingElementSupport from './integrations/heading.js';
import ImageElementSupport from './integrations/image.js';
import MediaEmbedElementSupport from './integrations/mediaembed.js';
import ScriptElementSupport from './integrations/script.js';
import TableElementSupport from './integrations/table.js';
import StyleElementSupport from './integrations/style.js';
import ListElementSupport from './integrations/list.js';
import HorizontalLineElementSupport from './integrations/horizontalline.js';
import CustomElementSupport from './integrations/customelement.js';
import type { DataSchemaInlineElementDefinition } from './dataschema.js';
import type { DocumentSelection, Item, Model, Range, Selectable } from 'ckeditor5/src/engine.js';
import { getHtmlAttributeName, modifyGhsAttribute } from './utils.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { GeneralHtmlSupportConfig } from './generalhtmlsupportconfig.js';

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
	public static get pluginName() {
		return 'GeneralHtmlSupport' as const;
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
			ListElementSupport,
			HorizontalLineElementSupport,
			CustomElementSupport
		] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const dataFilter = editor.plugins.get( DataFilter );

		// Load the allowed empty inline elements' configuration.
		// Note that this modifies DataSchema so must be loaded before registering filtering rules.
		dataFilter.loadAllowedEmptyElementsConfig( editor.config.get( 'htmlSupport.allowEmpty' ) || [] );

		// Load the filtering configuration.
		dataFilter.loadAllowedConfig( editor.config.get( 'htmlSupport.allow' ) || [] );
		dataFilter.loadDisallowedConfig( editor.config.get( 'htmlSupport.disallow' ) || [] );
	}

	/**
	 * Returns a GHS model attribute name related to a given view element name.
	 *
	 * @internal
	 * @param viewElementName A view element name.
	 */
	public getGhsAttributeNameForElement( viewElementName: string ): string {
		const dataSchema = this.editor.plugins.get( 'DataSchema' );
		const definitions = Array.from( dataSchema.getDefinitionsForView( viewElementName, false ) );

		const inlineDefinition = definitions.find( definition => (
			( definition as DataSchemaInlineElementDefinition ).isInline && !definitions[ 0 ].isObject
		) );

		if ( inlineDefinition ) {
			return inlineDefinition.model;
		}

		return getHtmlAttributeName( viewElementName );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it includes the given class name.
	 *
	 * @internal
	 * @param viewElementName A view element name.
	 * @param className The css class to add.
	 * @param selectable The selection or element to update.
	 */
	public addModelHtmlClass( viewElementName: string, className: ArrayOrItem<string>, selectable: Selectable ): void {
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
	public removeModelHtmlClass( viewElementName: string, className: ArrayOrItem<string>, selectable: Selectable ): void {
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
	private setModelHtmlAttributes( viewElementName: string, attributes: Record<string, unknown>, selectable: Selectable ) {
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
	private removeModelHtmlAttributes( viewElementName: string, attributeName: ArrayOrItem<string>, selectable: Selectable ) {
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
	private setModelHtmlStyles( viewElementName: string, styles: Record<string, string>, selectable: Selectable ) {
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
	private removeModelHtmlStyles( viewElementName: string, properties: ArrayOrItem<string>, selectable: Selectable ) {
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
	selectable: Selectable,
	ghsAttributeName: string
): IterableIterator<Item | DocumentSelection> {
	if ( !selectable ) {
		return;
	}

	if ( !( Symbol.iterator in selectable ) && selectable.is( 'documentSelection' ) && selectable.isCollapsed ) {
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
	selectable: NonNullable<Selectable>,
	ghsAttributeName: string
): Iterable<Range> {
	if (
		!( Symbol.iterator in selectable ) &&
		(
			selectable.is( 'node' ) ||
			selectable.is( '$text' ) ||
			selectable.is( '$textProxy' )
		)
	) {
		if ( model.schema.checkAttribute( selectable, ghsAttributeName ) ) {
			return [ model.createRangeOn( selectable ) ];
		} else {
			return [];
		}
	} else {
		return model.schema.getValidRanges( model.createSelection( selectable ).getRanges(), ghsAttributeName );
	}
}
