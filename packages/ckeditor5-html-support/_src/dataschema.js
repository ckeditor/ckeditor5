/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/dataschema
 */

import { Plugin } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';
import defaultConfig from './schemadefinitions';
import { mergeWith } from 'lodash-es';

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in HTML support.
 *
 * Data schema is represented by data schema definitions.
 *
 * To add new definition for block element,
 * use {@link module:html-support/dataschema~DataSchema#registerBlockElement} method:
 *
 *		dataSchema.registerBlockElement( {
 *			view: 'section',
 *			model: 'my-section',
 *			modelSchema: {
 *				inheritAllFrom: '$block'
 *			}
 *		} );
 *
 * To add new definition for inline element,
 * use {@link module:html-support/dataschema~DataSchema#registerInlineElement} method:
 *
 *		dataSchema.registerInlineElement( {
 *			view: 'span',
 *			model: 'my-span',
 *			attributeProperties: {
 *				copyOnEnter: true
 *			}
 *		} );
 *
 * @extends module:core/plugin~Plugin
 */
export default class DataSchema extends Plugin {
	constructor( editor ) {
		super( editor );

		/**
		 * A map of registered data schema definitions.
		 *
		 * @readonly
		 * @private
		 * @member {Map.<String, module:html-support/dataschema~DataSchemaDefinition>} #_definitions
		 */
		this._definitions = new Map();
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DataSchema';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		for ( const definition of defaultConfig.block ) {
			this.registerBlockElement( definition );
		}

		for ( const definition of defaultConfig.inline ) {
			this.registerInlineElement( definition );
		}
	}

	/**
	 * Add new data schema definition describing block element.
	 *
	 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	registerBlockElement( definition ) {
		this._definitions.set( definition.model, { ...definition, isBlock: true } );
	}

	/**
	 * Add new data schema definition describing inline element.
	 *
	 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	registerInlineElement( definition ) {
		this._definitions.set( definition.model, { ...definition, isInline: true } );
	}

	/**
	 * Updates schema definition describing block element with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param {module:html-support/dataschema~DataSchemaBlockElementDefinition} definition Definition update.
	 */
	extendBlockElement( definition ) {
		this._extendDefinition( { ...definition, isBlock: true } );
	}

	/**
	 * Updates schema definition describing inline element with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @param {module:html-support/dataschema~DataSchemaInlineElementDefinition} definition Definition update.
	 */
	extendInlineElement( definition ) {
		this._extendDefinition( { ...definition, isInline: true } );
	}

	/**
	 * Returns all definitions matching the given view name.
	 *
	 * @param {String|RegExp} viewName
	 * @param {Boolean} [includeReferences] Indicates if this method should also include definitions of referenced models.
	 * @returns {Set.<module:html-support/dataschema~DataSchemaDefinition>}
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
	 * @returns {Array.<module:html-support/dataschema~DataSchemaDefinition>}
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
	 * @returns {Iterable.<module:html-support/dataschema~DataSchemaDefinition>}
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

	/**
	 * Updates schema definition with new properties.
	 *
	 * Creates new scheme if it doesn't exist.
	 * Array properties are concatenated with original values.
	 *
	 * @private
	 * @param {module:html-support/dataschema~DataSchemaDefinition} definition Definition update.
	 */
	_extendDefinition( definition ) {
		const currentDefinition = this._definitions.get( definition.model );

		const mergedDefinition = mergeWith( {}, currentDefinition, definition, ( target, source ) => {
			return Array.isArray( target ) ? target.concat( source ) : undefined;
		} );

		this._definitions.set( definition.model, mergedDefinition );
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
 * A base definition of {@link module:html-support/dataschema~DataSchema data schema}.
 *
 * @typedef {Object} module:html-support/dataschema~DataSchemaDefinition
 * @property {String} model Name of the model.
 * @property {String} [view] Name of the view element.
 * @property {Boolean} [isObject] Indicates that the definition describes object element.
 * @property {module:engine/model/schema~SchemaItemDefinition} [modelSchema] The model schema item definition describing registered model.
 */

/**
 * A definition of {@link module:html-support/dataschema~DataSchema data schema} for block elements.
 *
 * @typedef {Object} module:html-support/dataschema~DataSchemaBlockElementDefinition
 * @property {Boolean} isBlock Indicates that the definition describes block element.
 * Set by {@link module:html-support/dataschema~DataSchema#registerBlockElement} method.
 * @property {String} [paragraphLikeModel] Should be used when an element can behave both as a sectioning element (e.g. article) and
 * element accepting only inline content (e.g. paragraph).
 * If an element contains only inline content, this option will be used as a model
 * name.
 * @extends module:html-support/dataschema~DataSchemaDefinition
 */

/**
 * A definition of {@link module:html-support/dataschema~DataSchema data schema} for inline elements.
 *
 * @typedef {Object} module:html-support/dataschema~DataSchemaInlineElementDefinition
 * @property {module:engine/model/schema~AttributeProperties} [attributeProperties] Additional metadata describing the model attribute.
 * @property {Boolean} isInline Indicates that the definition describes inline element.
 * @property {Number} [priority] Element priority. Decides in what order elements are wrapped by
 * {@link module:engine/view/downcastwriter~DowncastWriter}.
 * Set by {@link module:html-support/dataschema~DataSchema#registerInlineElement} method.
 * @property {String} [coupledAttribute] The name of the model attribute that generates the same view element. GHS inline attribute
 * will be removed from the model tree as soon as the coupled attribute is removed. See
 * {@link module:html-support/datafilter~DataFilter#_registerModelPostFixer GHS post-fixer} for more details.
 * @extends module:html-support/dataschema~DataSchemaDefinition
 */
