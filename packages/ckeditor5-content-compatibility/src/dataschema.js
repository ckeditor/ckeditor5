/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/dataschema
 */

import { cloneDeep } from 'lodash-es';
import { toArray } from 'ckeditor5/src/utils';

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in content compatibility support.
 *
 * Data schema is represented by data schema definitions. To add new definition, use {@link #register} method:
 *
 *		dataSchema.register( { view: 'section', model: 'my-section' }, {
 *			inheritAllFrom: '$block'
 *		} );
 *
 * Once registered, definition can be enabled in editor's model:
 *
 *		dataSchema.enable( 'my-section' );
 */
export default class DataSchema {
	constructor() {
		this._definitions = new Map();

		// Add block elements.
		this.register( { model: '$ghsBlock' }, {
			inheritAllFrom: '$block',
			allowIn: '$ghsBlock'
		} );

		this.register( { view: 'article', model: 'ghsArticle' }, { inheritAllFrom: '$ghsBlock' } );
		this.register( { view: 'section', model: 'ghsSection' }, { inheritAllFrom: '$ghsBlock' } );

		// Add data list elements.
		this.register( { view: 'dl', model: 'ghsDl' }, {
			allowIn: [ '$ghsBlock', '$root' ],
			isBlock: true
		} );

		this.register( { model: '$ghsDatalist' }, {
			allowIn: 'ghsDl',
			isBlock: true,
			allowContentOf: '$ghsBlock',
			allowText: true
		} );

		this.register( { view: 'dt', model: 'ghsDt' }, { inheritAllFrom: '$ghsDatalist' } );
		this.register( { view: 'dd', model: 'ghsDd' }, { inheritAllFrom: '$ghsDatalist' } );

		// Add details elements.
		this.register( { view: 'details', model: 'ghsDetails' }, { inheritAllFrom: '$ghsBlock' } );

		this.register( { view: 'summary', model: 'ghsSummary' }, {
			allowIn: 'ghsDetails',
			allowText: true
		} );
	}

	/**
	 * Add new data schema definition.
	 *
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	register( { view, model }, schema ) {
		this._definitions.set( model, { view, model, schema } );
	}

	/**
	 * Returns all definitions matching the given view name.
	 *
	 * @param {String} viewName
	 * @returns {Iterable<*>}
	 */
	* getDefinitionsForView( viewName ) {
		const definitions = Array.from( this._definitions.values() )
			.filter( def => def.view && testViewName( viewName, def.view ) );

		for ( const definition of definitions ) {
			yield this.getDefinition( definition.model );
		}
	}

	/**
	 * Returns definition for the given model name.
	 *
	 * Definition will also include `references` property including all definitions
	 * referenced by this definition.
	 *
	 * @param {String} modelName
	 * @returns {module:content-compatibility/dataschema~DataSchemaDefinition}
	 */
	getDefinition( modelName ) {
		const definition = cloneDeep( this._definitions.get( modelName ) );

		definition.references = this._getReferences( modelName );

		return definition;
	}

	/**
	 * Resolves all definition references registered for the given data schema definition.
	 *
	 * @private
	 * @param {String} modelName Data schema model name.
	 * @returns {Iterable<String>}
	 */
	* _getReferences( modelName ) {
		const { schema } = this._definitions.get( modelName );
		const inheritProperties = [ 'inheritAllFrom', 'inheritTypesFrom', 'allowWhere', 'allowContentOf', 'allowAttributesOf' ];

		for ( const property of inheritProperties ) {
			for ( const referenceName of toArray( schema[ property ] || [] ) ) {
				const definition = this._definitions.get( referenceName );

				if ( referenceName !== modelName && definition ) {
					yield* this._getReferences( definition.model );
					yield definition;
				}
			}
		}
	}
}

/**
 * Test view name against the given pattern.
 *
 * @private
 * @param {String|RegExp} pattern
 * @param {String} viewName
 * @returns {Boolean}
 */
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
 * A definition of {@link module:content-compatibility/dataschema data schema}.
 *
 * @typedef {Object} module:content-compatibility/dataschema~DataSchemaDefinition
 * @property {String} [view] Name of the view element.
 * @property {String} model Name of the model element.
 * @property {String|module:engine/model/schema~SchemaItemDefinition} schema Name of the schema to inherit
 * or custom schema item definition.
 */
