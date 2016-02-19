/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import clone from '../lib/lodash/clone.js';
import CKEditorError from '../ckeditorerror.js';

export class SchemaItem {
	constructor( schema ) {
		if ( !schema ) {
			/**
			 * Schema item must have schema instance.
			 *
			 * @error schema-item-no-schema
			 */
			throw new CKEditorError( 'schema-item-no-schema: Schema item must have schema instance.' );
		}

		this._schema = schema;
		this._allowed = [];
		this._disallowed = [];
	}

	addAllowed( path, attribute ) {
		this._addPath( '_allowed', path, attribute );
	}

	addDisallowed( path, attribute ) {
		this._addPath( '_disallowed', path, attribute );
	}

	_addPath( member, path, attribute ) {
		if ( typeof path === 'string' ) {
			path = path.split( ' ' );
		}

		path = path.slice();

		this[ member ].push( { path, attribute } );
	}

	_getPaths( type, attribute ) {
		let source = type === 'ALLOW' ? this._allowed : this._disallowed;
		let paths = [];

		for ( let item of source ) {
			if ( item.attribute === attribute ) {
				paths.push( item.path.slice() );
			}
		}

		return paths;
	}

	_hasMatchingPath( type, checkPath, attribute ) {
		const itemPaths = this._getPaths( type, attribute );

		checkPath = checkPath.slice();

		for ( let itemPath of itemPaths ) {
			for ( let checkName of checkPath ) {
				let baseChain = this._schema._baseChains[ checkName ];

				if ( baseChain.indexOf( itemPath[ 0 ] ) > -1 ) {
					itemPath.shift();
				}
			}

			if ( itemPath.length === 0 ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} Clone of this object with the parent property replaced with its name.
	 */
	toJSON() {
		const json = clone( this );

		// Due to circular references we need to remove parent reference.
		json._schema = '[treeModel.Schema]';

		return json;
	}
}

/**
 * @class core.treeModel.Schema
 */
export default class Schema {
	constructor() {
		this._items = {};
		this._baseChains = {};

		this.registerItem( 'inline', null );
		this.registerItem( 'block', null );
		this.registerItem( 'root', null );

		this.allow( { name: 'block', inside: 'root' } );
		this.allow( { name: 'inline', inside: 'block' } );
	}

	allow( query ) {
		this._getItem( query.name ).addAllowed( query.inside, query.attribute );
	}

	disallow( query ) {
		this._getItem( query.name ).addDisallowed( query.inside, query.attribute );
	}

	_getItem( itemName ) {
		if ( !this.hasItem( itemName ) ) {
			/**
			 * Item with specified name does not exist in schema.
			 *
			 * @error schema-no-item
			 */
			throw new CKEditorError( 'schema-no-item: Item with specified name does not exist in schema.' );
		}

		return this._items[ itemName ];
	}

	hasItem( itemName ) {
		return !!this._items[ itemName ];
	}

	registerItem( itemName, baseOn ) {
		if ( this.hasItem( itemName ) ) {
			/**
			 * Item with specified name already exists in schema.
			 *
			 * @error schema-item-exists
			 */
			throw new CKEditorError( 'schema-item-exists: Item with specified name already exists in schema.' );
		}

		if ( !!baseOn && !this.hasItem( baseOn ) ) {
			/**
			 * Item with specified name does not exist in schema.
			 *
			 * @error schema-no-item
			 */
			throw new CKEditorError( 'schema-no-item: Item with specified name does not exist in schema.' );
		}

		this._items[ itemName ] = new SchemaItem( this );
		this._baseChains[ itemName ] = this.hasItem( baseOn ) ? this._baseChains[ baseOn ].concat( itemName ) : [ itemName ];
	}

	checkAtPosition( query, position ) {
		if ( !this.hasItem( query.name ) ) {
			return false;
		}

		const path = Schema._makeItemsPathFromPosition( position );

		return this.checkForPath( query, path );
	}

	checkForPath( query, path ) {
		if ( !this.hasItem( query.name ) ) {
			return false;
		}

		path = ( typeof path === 'string' ) ? path.split( ' ' ) : path;

		const schemaItems = this._baseChains[ query.name ].map( ( name ) => {
			return this._getItem( name );
		} );

		// If there is matching disallow path, this query is not valid with schema.
		for ( let schemaItem of schemaItems ) {
			if ( schemaItem._hasMatchingPath( 'DISALLOW', path, query.attribute ) ) {
				return false;
			}
		}

		// There are no disallow path that matches query.
		// If there is any allow path that matches query, this query is valid with schema.
		for ( let schemaItem of schemaItems ) {
			if ( schemaItem._hasMatchingPath( 'ALLOW', path, query.attribute ) ) {
				return true;
			}
		}

		// There are no allow paths that matches query. The query is not valid with schema.
		return false;
	}

	static _makeItemsPathFromPosition( position ) {
		let path = [];
		let parent = position.parent;

		while ( parent !== null ) {
			path.push( parent.name );
			parent = parent.parent;
		}

		return path;
	}
}
