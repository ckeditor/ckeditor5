/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/dataschema
 */

import { Plugin } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

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

		this._registerDefaultDefinitions();
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DataSchema';
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
	 * Registers default data schema definitions.
	 *
	 * @private
	*/
	_registerDefaultDefinitions() {
		// Block elements.
		this.registerBlockElement( {
			model: '$htmlBlock',
			modelSchema: {
				allowChildren: '$block',
				allowIn: [ '$root', '$htmlBlock' ],
				isBlock: true
			}
		} );

		this.registerBlockElement( {
			model: 'codeBlock',
			view: 'pre'
		} );

		this.registerBlockElement( {
			model: 'paragraph',
			view: 'p'
		} );

		this.registerBlockElement( {
			model: 'blockQuote',
			view: 'blockquote'
		} );

		this.registerBlockElement( {
			model: 'listItem',
			view: 'li'
		} );

		this.registerBlockElement( {
			model: 'htmlPre',
			view: 'pre',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		} );

		// TODO Remove it once we have proper support for div elements.
		this.registerBlockElement( {
			model: 'htmlDiv',
			view: 'div',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
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

		this.registerBlockElement( {
			view: 'form',
			model: 'htmlForm',
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
			modelSchema: {
				allowChildren: '$block',
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
			modelSchema: {
				allowChildren: '$text',
				allowIn: 'htmlDetails'
			}
		} );

		// Block objects.
		this.registerBlockElement( {
			model: '$htmlObjectBlock',
			isObject: true,
			modelSchema: {
				isObject: true,
				isBlock: true,
				allowWhere: '$block'
			}
		} );

		// Inline elements.
		this.registerInlineElement( {
			view: 'code',
			model: 'htmlCode'
		} );

		this.registerInlineElement( {
			view: 'a',
			model: 'htmlA',
			priority: 5
		} );

		this.registerInlineElement( {
			view: 'strong',
			model: 'htmlStrong'
		} );

		this.registerInlineElement( {
			view: 'i',
			model: 'htmlI'
		} );

		this.registerInlineElement( {
			view: 's',
			model: 'htmlS'
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

		this.registerInlineElement( {
			view: 'label',
			model: 'htmlLabel',
			attributeProperties: {
				copyOnEnter: true
			}
		} );

		// Inline objects
		this.registerInlineElement( {
			model: '$htmlObjectInline',
			isObject: true,
			modelSchema: {
				isObject: true,
				isInline: true,
				allowWhere: '$text',
				allowAttributesOf: '$text'
			}
		} );

		this.registerInlineElement( {
			view: 'object',
			model: 'htmlObject',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		this.registerInlineElement( {
			view: 'iframe',
			model: 'htmlIframe',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		this.registerInlineElement( {
			view: 'input',
			model: 'htmlInput',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		this.registerInlineElement( {
			view: 'button',
			model: 'htmlButton',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		this.registerInlineElement( {
			view: 'textarea',
			model: 'htmlTextarea',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		this.registerInlineElement( {
			view: 'select',
			model: 'htmlSelect',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		this.registerInlineElement( {
			view: 'video',
			model: 'htmlVideo',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		this.registerInlineElement( {
			view: 'audio',
			model: 'htmlAudio',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );
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
 * @extends module:html-support/dataschema~DataSchemaDefinition
 */

/**
 * A definition of {@link module:html-support/dataschema~DataSchema data schema} for inline elements.
 *
 * @typedef {Object} module:html-support/dataschema~DataSchemaInlineElementDefinition
 * @property {module:engine/model/schema~AttributeProperties} [attributeProperties] Additional metadata describing the model attribute.
 * @property {Boolean} isInline Indicates that the definition descibes inline element.
 * @property {Number} [priority] Element priority. Decides in what order elements are wrapped by
 * {@link module:engine/view/downcastwriter~DowncastWriter}.
 * Set by {@link module:html-support/dataschema~DataSchema#registerInlineElement} method.
 * @extends module:html-support/dataschema~DataSchemaDefinition
 */
