/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/dataschema
 */

import { toArray } from 'ckeditor5/src/utils';

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in content compatibility support.
 *
 * Data schema is represented by data schema definitions. To add new definition, use {@link #register} method:
 *
 *		dataSchema.register( {
 *			view: 'section',
 *			model: 'my-section',
 *			modelSchema: {
 *				inheritAllFrom: '$block'
 *			}
 *		} );
 */
export default class DataSchema {
	constructor() {
		/**
		 * A map of registered data schema definitions via {@link #register} method.
		 *
		 * @readonly
		 * @private
		 * @member {Map.<String, module:content-compatibility/dataschema~DataSchemaBlockElementDefinition
		 * |module:content-compatibility/dataschema~DataSchemaInlineElementDefinition>} #_definitions
		 */
		this._definitions = new Map();

		this.registerBlockElement( {
			model: '$htmlBlock',
			allowChildren: '$block',
			modelSchema: {
				allowIn: [ '$root', '$htmlBlock' ],
				isBlock: true
			}
		} );

		this.registerBlockElement( {
			view: 'article',
			model: 'htmlArticle',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		} );

		this.registerBlockElement( {
			view: 'section',
			model: 'htmlSection',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		} );

		// Add data list elements.
		this.registerBlockElement( {
			view: 'dl',
			model: 'htmlDl',
			modelSchema: {
				allowIn: [ '$htmlBlock', '$root' ],
				isBlock: true
			}
		} );

		this.registerBlockElement( {
			model: '$htmlDatalist',
			allowChildren: '$block',
			modelSchema: {
				allowIn: 'htmlDl',
				isBlock: true
			}
		} );

		this.registerBlockElement( {
			view: 'dt',
			model: 'htmlDt',
			modelSchema: {
				inheritAllFrom: '$htmlDatalist'
			}
		} );

		this.registerBlockElement( {
			view: 'dd',
			model: 'htmlDd',
			modelSchema: {
				inheritAllFrom: '$htmlDatalist'
			}
		} );

		// Add details elements.
		this.registerBlockElement( {
			view: 'details',
			model: 'htmlDetails',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		} );

		this.registerBlockElement( {
			view: 'summary',
			model: 'htmlSummary',
			allowChildren: '$text',
			modelSchema: {
				allowIn: 'htmlDetails'
			}
		} );

		this.registerInlineElement( {
			view: 'span',
			model: 'htmlSpan',
			attributeProperties: {
				copyOnEnter: true
			}
		} );

		this.registerInlineElement( {
			view: 'cite',
			model: 'htmlCite',
			attributeProperties: {
				copyOnEnter: true
			}
		} );
	}

	/**
	 * Add new data schema definition for block element.
	 *
	 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	registerBlockElement( definition ) {
		this._definitions.set( definition.model, { ...definition, isBlock: true } );
	}

	/**
	 * Add new data schema definition for inline element.
	 *
	 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	registerInlineElement( definition ) {
		this._definitions.set( definition.model, { ...definition, isInline: true } );
	}

	/**
	 * Returns all definitions matching the given view name.
	 *
	 * @param {String|RegExp} viewName
	 * @param {Boolean} [includeReferences] Indicates if this method should also include definitions of referenced models.
	 * @returns {Set.<module:content-compatibility/dataschema~DataSchemaBlockElementDefinition
	 * |module:content-compatibility/dataschema~DataSchemaInlineElementDefinition>}
	 */
	getDefinitionsForView( viewName, includeReferences ) {
		const definitions = new Set();

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
	 *
	 * @private
	 * @param {String|RegExp} viewName
	 * @returns {Array.<module:content-compatibility/dataschema~DataSchemaBlockElementDefinition
	 * |module:content-compatibility/dataschema~DataSchemaInlineElementDefinition>}
	 */
	_getMatchingViewDefinitions( viewName ) {
		return Array.from( this._definitions.values() )
			.filter( def => def.view && testViewName( viewName, def.view ) );
	}

	/**
	 * Resolves all definition references registered for the given data schema definition.
	 *
	 * @private
	 * @param {String} modelName Data schema model name.
	 * @returns {Iterable.<module:content-compatibility/dataschema~DataSchemaBlockElementDefinition
	 * |module:content-compatibility/dataschema~DataSchemaInlineElementDefinition>}
	 */
	* _getReferences( modelName ) {
		const { modelSchema } = this._definitions.get( modelName );

		if ( !modelSchema ) {
			return;
		}

		const inheritProperties = [ 'inheritAllFrom', 'inheritTypesFrom', 'allowWhere', 'allowContentOf', 'allowAttributesOf' ];

		for ( const property of inheritProperties ) {
			for ( const referenceName of toArray( modelSchema[ property ] || [] ) ) {
				const definition = this._definitions.get( referenceName );

				if ( referenceName !== modelName && definition ) {
					yield* this._getReferences( definition.model );
					yield definition;
				}
			}
		}
	}
}

// Test view name against the given pattern.
//
// @private
// @param {String|RegExp} pattern
// @param {String} viewName
// @returns {Boolean}
function testViewName( pattern, viewName ) {
	if ( typeof pattern === 'string' ) {
		return pattern === viewName;
	}

	if ( pattern instanceof RegExp ) {
		return pattern.test( viewName );
	}

	return false;
}

/**
 * A definition of {@link module:content-compatibility/dataschema~DataSchema data schema} for block elements.
 *
 * @typedef {Object} module:content-compatibility/dataschema~DataSchemaBlockElementDefinition
 * @property {String} [view] Name of the view element.
 * @property {String} model Name of the model element.
 * @property {module:engine/model/schema~SchemaItemDefinition} modelSchema The model schema item definition describing registered model.
 * @property {String|Array.<String>} [allowChildren] Extends the given children list to allow definition model.
 */

/**
 * A definition of {@link module:content-compatibility/dataschema~DataSchema data schema} for inline elements.
 *
 * @typedef {Object} module:content-compatibility/dataschema~DataSchemaInlineElementDefinition
 * @property {String} view Name of the view element.
 * @property {String} model Name of the model attribute key.
 * @property {module:engine/model/schema~AttributeProperties} [attributeProperties] Additional metadata describing the model attribute.
 */
