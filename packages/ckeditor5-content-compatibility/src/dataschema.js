/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/dataschema
 */

import { cloneDeep } from 'lodash-es';
import toArray from '@ckeditor/ckeditor5-utils/src/toarray';

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
	constructor( editor ) {
		this.editor = editor;

		this._definitions = {};

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
		this._definitions[ model ] = { view, model, schema };
	}

	/**
	 * Returns model-view-pairs for the added data schema definitions.
	 *
	 * This method will only return pairs when if
	 * {@link module:content-compatibility/dataschema~DataSchemaDefinition#view view} has been set.
	 *
	 * @returns {Object[]} result
	 */
	getModelViewMapping() {
		return Object.values( this._definitions )
			.filter( def => def.view && def.model )
			.map( def => ( { model: def.model, view: def.view } ) );
	}

	/**
	 * Registers model schema item for the given
	 * {@link module:content-compatibility/dataschema~DataSchemaDefinition data schema definition} name.
	 *
	 * @param {String} name
	 */
	enable( name ) {
		const schema = this.editor.model.schema;

		if ( schema.isRegistered( name ) ) {
			return;
		}

		const definition = this._definitions[ name ];
		const schemaDefinition = cloneDeep( definition.schema );

		for ( const reference of this._getReferences( name ) ) {
			this.enable( reference );
		}

		schema.register( name, schemaDefinition );

		if ( schema.allowText ) {
			schema.extend( '$text', { allowIn: name } );
		}
	}

	/**
	 * Resolves all model references registered for the given data schema definition.
	 *
	 * @private
	 * @param {String} name Data schema model name.
	 * @returns {Iterable<String>}
	 */
	* _getReferences( name ) {
		// TODO extend with the rest of schema properties based on other model types.
		const { schema } = this._definitions[ name ];

		for ( const model of toArray( schema.inheritAllFrom || [] ) ) {
			if ( this._definitions[ model ] ) {
				yield model;
			}
		}
	}
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
