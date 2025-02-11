/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/dataschema
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { toArray } from 'ckeditor5/src/utils.js';
import defaultConfig from './schemadefinitions.js';
import { mergeWith } from 'es-toolkit/compat';
import type { AttributeProperties, SchemaItemDefinition } from 'ckeditor5/src/engine.js';

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in HTML support.
 *
 * Data schema is represented by data schema definitions.
 *
 * To add new definition for block element,
 * use {@link module:html-support/dataschema~DataSchema#registerBlockElement} method:
 *
 * ```ts
 * dataSchema.registerBlockElement( {
 * 	view: 'section',
 * 	model: 'my-section',
 * 	modelSchema: {
 * 		inheritAllFrom: '$block'
 * 	}
 * } );
 * ```
 *
 * To add new definition for inline element,
 * use {@link module:html-support/dataschema~DataSchema#registerInlineElement} method:
 *
 * ```
 * dataSchema.registerInlineElement( {
 * 	view: 'span',
 * 	model: 'my-span',
 * 	attributeProperties: {
 * 		copyOnEnter: true
 * 	}
 * } );
 * ```
 */
export default class DataSchema extends Plugin {
	/**
	 * A map of registered data schema definitions.
	 */
	private readonly _definitions: Array<DataSchemaDefinition> = [];

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'DataSchema' as const;
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
		for ( const definition of defaultConfig.block ) {
			this.registerBlockElement( definition );
		}

		for ( const definition of defaultConfig.inline ) {
			this.registerInlineElement( definition );
		}
	}

	/**
	 * Add new data schema definition describing block element.
	 */
	public registerBlockElement( definition: DataSchemaBlockElementDefinition ): void {
		this._definitions.push( { ...definition, isBlock: true } );
	}

	/**
	 * Add new data schema definition describing inline element.
	 */
	public registerInlineElement( definition: DataSchemaInlineElementDefinition ): void {
		this._definitions.push( { ...definition, isInline: true } );
	}

	/**
	 * Updates schema definition describing block element with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param definition Definition update.
	 */
	public extendBlockElement( definition: DataSchemaBlockElementDefinition ): void {
		this._extendDefinition( { ...definition, isBlock: true } );
	}

	/**
	 * Updates schema definition describing inline element with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param definition Definition update.
	 */
	public extendInlineElement( definition: DataSchemaInlineElementDefinition ): void {
		this._extendDefinition( { ...definition, isInline: true } );
	}

	/**
	 * Returns all definitions matching the given view name.
	 *
	 * @param includeReferences Indicates if this method should also include definitions of referenced models.
	 */
	public getDefinitionsForView( viewName: string | RegExp, includeReferences: boolean = false ): Set<DataSchemaDefinition> {
		const definitions = new Set<DataSchemaDefinition>();

		for ( const definition of this._getMatchingViewDefinitions( viewName ) ) {
			if ( includeReferences ) {
				for ( const reference of this._getReferences( definition.model ) ) {
					definitions.add( reference );
				}
			}

			definitions.add( definition );
		}

		return definitions;
	}

	/**
	 * Returns definitions matching the given model name.
	 */
	public getDefinitionsForModel( modelName: string ): Array<DataSchemaDefinition> {
		return this._definitions.filter( definition => definition.model == modelName );
	}

	/**
	 * Returns definitions matching the given view name.
	 */
	private _getMatchingViewDefinitions( viewName: string | RegExp ): Array<DataSchemaDefinition> {
		return this._definitions.filter( def => def.view && testViewName( viewName, def.view ) );
	}

	/**
	 * Resolves all definition references registered for the given data schema definition.
	 *
	 * @param modelName Data schema model name.
	 */
	private* _getReferences( modelName: string ): Iterable<DataSchemaDefinition> {
		const inheritProperties = [
			'inheritAllFrom',
			'inheritTypesFrom',
			'allowWhere',
			'allowContentOf',
			'allowAttributesOf'
		] as const;

		const definitions = this._definitions.filter( definition => definition.model == modelName );

		for ( const { modelSchema } of definitions ) {
			if ( !modelSchema ) {
				continue;
			}

			for ( const property of inheritProperties ) {
				for ( const referenceName of toArray( modelSchema[ property ] || [] ) ) {
					const definitions = this._definitions.filter( definition => definition.model == referenceName );

					for ( const definition of definitions ) {
						if ( referenceName !== modelName ) {
							yield* this._getReferences( definition.model );
							yield definition;
						}
					}
				}
			}
		}
	}

	/**
	 * Updates schema definition with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param definition Definition update.
	 */
	private _extendDefinition( definition: DataSchemaDefinition ): void {
		const currentDefinitions = Array.from( this._definitions.entries() )
			.filter( ( [ , currentDefinition ] ) => currentDefinition.model == definition.model );

		if ( currentDefinitions.length == 0 ) {
			this._definitions.push( definition );

			return;
		}

		for ( const [ idx, currentDefinition ] of currentDefinitions ) {
			this._definitions[ idx ] = mergeWith( {}, currentDefinition, definition, ( target, source ) => {
				return Array.isArray( target ) ? target.concat( source ) : undefined;
			} );
		}
	}
}

/**
 * Test view name against the given pattern.
 */
function testViewName( pattern: string | RegExp, viewName: string ): boolean {
	if ( typeof pattern === 'string' ) {
		return pattern === viewName;
	}

	if ( pattern instanceof RegExp ) {
		return pattern.test( viewName );
	}

	return false;
}

/**
 * A base definition of {@link module:html-support/dataschema~DataSchema data schema}.
 */
export interface DataSchemaDefinition {

	/**
	 * Name of the model.
	 */
	model: string;

	/**
	 * Name of the view element.
	 */
	view?: string;

	/**
	 * Indicates that the definition describes object element.
	 */
	isObject?: boolean;

	/**
	 * The model schema item definition describing registered model.
	 */
	modelSchema?: SchemaItemDefinition;

	/**
	 * Indicates that the definition describes block element.
	 * Set by {@link module:html-support/dataschema~DataSchema#registerBlockElement} method.
	 */
	isBlock?: boolean;

	/**
	 * Indicates that the definition describes inline element.
	 */
	isInline?: boolean;

	/**
	 * Indicates that the definition describes an empty HTML element like `<hr>`.
	 */
	isEmpty?: boolean;
}

/**
 * A definition of {@link module:html-support/dataschema~DataSchema data schema} for block elements.
 */
export interface DataSchemaBlockElementDefinition extends DataSchemaDefinition {

	/**
	 * Should be used when an element can behave both as a sectioning element (e.g. article) and
	 * element accepting only inline content (e.g. paragraph).
	 * If an element contains only inline content, this option will be used as a model name.
	 */
	paragraphLikeModel?: string;
}

/**
 * A definition of {@link module:html-support/dataschema~DataSchema data schema} for inline elements.
 */
export interface DataSchemaInlineElementDefinition extends DataSchemaDefinition {

	/**
	 *  Additional metadata describing the model attribute.
	 */
	attributeProperties?: AttributeProperties;

	/**
	 * Element priority. Decides in what order elements are wrapped by
	 * {@link module:engine/view/downcastwriter~DowncastWriter}.
	 * Set by {@link module:html-support/dataschema~DataSchema#registerInlineElement} method.
	 */
	priority?: number;

	/**
	 * The name of the model attribute that generates the same view element. GHS inline attribute
	 * will be removed from the model tree as soon as the coupled attribute is removed. See
	 * {@link module:html-support/datafilter~DataFilter#_registerCoupledAttributesPostFixer GHS post-fixer} for more details.
	 */
	coupledAttribute?: string;

	/**
	 * Indicates that element should not be converted as a model text attribute.
	 * It is used to map view elements that do not have a separate model element but their data is stored in a model attribute.
	 * For example `<tbody>` element does not have a dedicated model element and GHS stores attributes of `<tbody>`
	 * in the `htmlTbodyAttributes` model attribute of the `table` model element.
	 */
	appliesToBlock?: boolean | string;

	/**
	 * Indicates that an element should be preserved even if it has no content.
	 */
	allowEmpty?: boolean;
}
