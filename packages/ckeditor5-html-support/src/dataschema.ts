/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/dataschema
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';
import defaultConfig from './schemadefinitions';
import { mergeWith } from 'lodash-es';
import type { AttributeProperties, SchemaItemDefinition } from 'ckeditor5/src/engine';

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
	private readonly _definitions: Map<string, DataSchemaDefinition>;

	constructor( editor: Editor ) {
		super( editor );

		this._definitions = new Map();
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DataSchema' {
		return 'DataSchema';
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
		this._definitions.set( definition.model, { ...definition, isBlock: true } );
	}

	/**
	 * Add new data schema definition describing inline element.
	 */
	public registerInlineElement( definition: DataSchemaInlineElementDefinition ): void {
		this._definitions.set( definition.model, { ...definition, isInline: true } );
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
	 * Returns definitions matching the given view name.
	 */
	private _getMatchingViewDefinitions( viewName: string | RegExp ): Array<DataSchemaDefinition> {
		return Array.from( this._definitions.values() )
			.filter( def => def.view && testViewName( viewName, def.view ) );
	}

	/**
	 * Resolves all definition references registered for the given data schema definition.
	 *
	 * @param modelName Data schema model name.
	 */
	private* _getReferences( modelName: string ): Iterable<DataSchemaDefinition> {
		const { modelSchema } = this._definitions.get( modelName )!;

		if ( !modelSchema ) {
			return;
		}

		const inheritProperties = [ 'inheritAllFrom', 'inheritTypesFrom', 'allowWhere', 'allowContentOf', 'allowAttributesOf' ];

		for ( const property of inheritProperties ) {
			for ( const referenceName of toArray( ( modelSchema as any )[ property ] || [] ) ) {
				const definition = this._definitions.get( referenceName );

				if ( referenceName !== modelName && definition ) {
					yield* this._getReferences( definition.model );
					yield definition;
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
		const currentDefinition = this._definitions.get( definition.model );

		const mergedDefinition = mergeWith( {}, currentDefinition, definition, ( target, source ) => {
			return Array.isArray( target ) ? target.concat( source ) : undefined;
		} );

		this._definitions.set( definition.model, mergedDefinition );
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
	 * {@link module:html-support/datafilter~DataFilter#_registerModelPostFixer GHS post-fixer} for more details.
	 */
	coupledAttribute?: string;
}
