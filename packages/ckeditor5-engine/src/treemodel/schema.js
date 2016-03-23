/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import clone from '../../utils/lib/lodash/clone.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * SchemaItem is a singular registry item in {@link engine.treeModel.Schema} that groups and holds allow/disallow rules for
 * one entity. This class is used internally in {@link engine.treeModel.Schema} and should not be used outside it.
 *
 * @see engine.treeModel.Schema
 * @protected
 * @memberOf engine.treeModel
 */
export class SchemaItem {
	/**
	 * Creates SchemaItem instance.
	 *
	 * @param {engine.treeModel.Schema} schema Schema instance that owns this item.
	 */
	constructor( schema ) {
		/**
		 * Schema instance that owns this item.
		 *
		 * @private
		 * @member {engine.treeModel.Schema} engine.treeModel.SchemaItem#_schema
		 */
		this._schema = schema;

		/**
		 * Paths in which the entity, represented by this item, is allowed.
		 *
		 * @private
		 * @member {Array} engine.treeModel.SchemaItem#_allowed
		 */
		this._allowed = [];

		/**
		 * Paths in which the entity, represented by this item, is disallowed.
		 *
		 * @private
		 * @member {Array} engine.treeModel.SchemaItem#_disallowed
		 */
		this._disallowed = [];
	}

	/**
	 * Allows entity, represented by this item, to be in given path.
	 *
	 * @param {Array.<String>|String} path Path in which entity is allowed. String with item names separated by spaces may be passed.
	 * @param {String} [attribute] If set, this path will be used only for entities that have an attribute with this key.
	 */
	allow( path, attribute ) {
		this._addPath( '_allowed', path, attribute );
	}

	/**
	 * Disallows entity, represented by this item, to be in given path.
	 *
	 * @param {Array.<String>|String} path Path in which entity is disallowed. String with item names separated by spaces may be passed.
	 * @param {String} [attribute] If set, this path will be used only for entities that have an attribute with this key.
	 */
	disallow( path, attribute ) {
		this._addPath( '_disallowed', path, attribute );
	}

	/**
	 * Adds path to the SchemaItem instance.
	 *
	 * @private
	 * @param {String} member Name of the array member into which the path will be added. Possible values are `_allowed` or `_disallowed`.
	 * @param {Array.<String>|String} path Path to be added. String with item names separated by spaces may be passed.
	 * @param {String} [attribute] If set, this path will be used only for entities that have an attribute with this key.
	 */
	_addPath( member, path, attribute ) {
		if ( typeof path === 'string' ) {
			path = path.split( ' ' );
		} else {
			path = path.slice();
		}

		this[ member ].push( { path, attribute } );
	}

	/**
	 * Returns all paths of given type that were previously registered in the item.
	 *
	 * @private
	 * @param {String} type Paths' type. Possible values are `ALLOW` or `DISALLOW`.
	 * @param {String} [attribute] If set, only paths registered for given attribute will be returned.
	 * @returns {Array} Paths registered in the item.
	 */
	_getPaths( type, attribute ) {
		const source = type === 'ALLOW' ? this._allowed : this._disallowed;
		const paths = [];

		for ( let item of source ) {
			if ( item.attribute === attribute ) {
				paths.push( item.path.slice() );
			}
		}

		return paths;
	}

	/**
	 * Checks whether this item has any registered path of given type that matches provided path.
	 *
	 * @private
	 * @param {String} type Paths' type. Possible values are `ALLOW` or `DISALLOW`.
	 * @param {Array.<String>} checkPath Path to check.
	 * @param {String} [attribute] If set, only paths registered for given attribute will be returned.
	 * @returns {Boolean} `true` if item has any registered matching path, `false` otherwise.
	 */
	_hasMatchingPath( type, checkPath, attribute ) {
		const itemPaths = this._getPaths( type, attribute );

		// We check every path registered (possibly with given attribute) in the item.
		for ( let itemPath of itemPaths ) {
			// We have one of paths registered in the item.

			// Now we have to check every item name from the path to check.
			for ( let checkName of checkPath ) {
				// Every item name is expanded to all names of items that item is extending.
				// So, if on item path, there is an item that is extended by item from checked path, it will
				// also be treated as matching.
				const chain = this._schema._extensionChains.get( checkName );

				// Since our paths have to match in given order, we always check against first item from item path.
				// So, if item path is: B D E
				// And checked path is: A B C D E
				// It will be matching (A won't match, B will match, C won't match, D and E will match)
				if ( chain.indexOf( itemPath[ 0 ] ) > -1 ) {
					// Every time we have a match, we remove it from `itemPath` so we can still check against first item.
					itemPath.shift();
				}
			}

			// If `itemPath` has no items it means that we removed all of them, so we matched all of them.
			// This means that we found a matching path.
			if ( itemPath.length === 0 ) {
				return true;
			}
		}

		// No matching path found.
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
 * Schema is a definition of the structure of the document. It allows to define which tree model items (element, text, etc.)
 * can be nested within which ones and which attributes can be applied to them. It's created during the run-time of the application,
 * typically by features. Also, the features can query the schema to learn what structure is allowed and act accordingly.
 *
 * For instance, if a feature wants to define that an attribute bold is allowed on the text it needs to register this rule like this:
 *
 *		editor.document.schema.allow( '$text', 'bold' );
 *
 * Note: items prefixed with `$` are special group of items. By default, `Schema` defines three special items:
 * * `$inline` represents all inline elements,
 * * `$text` is a sub-group of `$inline` and represents text nodes,
 * * `$block` represents block elements.
 *
 * When registering an item it's possible to tell that this item should inherit from some other existing item.
 * E.g. `p` can inherit from `$block`, so whenever given attribute is allowed on the `$block` it will automatically be
 * also allowed on the `p` element. By default, `$text` item already inherits from `$inline`.
 *
 * @memberOf engine.treeModel
 */
export default class Schema {
	/**
	 * Creates Schema instance.
	 */
	constructor() {
		/**
		 * Schema items registered in the schema.
		 *
		 * @private
		 * @member {Map} engine.treeModel.Schema#_items
		 */
		this._items = new Map();

		/**
		 * Description of what entities are a base for given entity.
		 *
		 * @private
		 * @member {Map} engine.treeModel.Schema#_extensionChains
		 */
		this._extensionChains = new Map();

		// Register some default abstract entities.
		this.registerItem( '$inline' );
		this.registerItem( '$block' );
		this.registerItem( '$text', '$inline' );

		// Allow inline elements inside block elements.
		this.allow( { name: '$inline', inside: '$block' } );
	}

	/**
	 * Allows given query in the schema.
	 *
	 *		// Allow text with bold attribute in all P elements.
	 *		schema.registerItem( 'p', '$block' );
	 *		schema.allow( { name: '$text', attribute: 'bold', inside: 'p' } );
	 *
	 *		// Allow header in Ps that are in DIVs
	 *		schema.registerItem( 'header', '$block' );
	 *		schema.registerItem( 'div', '$block' );
	 *		schema.allow( { name: 'header', inside: 'div p' } ); // inside: [ 'div', 'p' ] would also work.
	 *
	 * @param {engine.treeModel.SchemaQuery} query Allowed query.
	 */
	allow( query ) {
		this._getItem( query.name ).allow( query.inside, query.attribute );
	}

	/**
	 * Disallows given query in the schema.
	 *
	 * @see {@link engine.treeModel.Schema#allow}
	 * @param {engine.treeModel.SchemaQuery} query Disallowed query.
	 */
	disallow( query ) {
		this._getItem( query.name ).disallow( query.inside, query.attribute );
	}

	/**
	 * Checks whether entity with given name (and optionally, with given attribute) is allowed at given position.
	 *
	 *		// Check whether bold text can be placed at caret position.
	 *		let caretPos = editor.document.selection.getFirstPosition();
	 *		if ( schema.checkAtPosition( caretPos, '$text', 'bold' ) ) { ... }
	 *
	 * @param {engine.treeModel.Position} position Position to check at.
	 * @param {String} name Entity name to check.
	 * @param {String} [attribute] If set, schema will check for entity with given attribute.
	 * @returns {Boolean} `true` if entity is allowed, `false` otherwise
	 */
	checkAtPosition( position, name, attribute ) {
		if ( !this.hasItem( name ) ) {
			return false;
		}

		return this.checkQuery( {
			name: name,
			inside: Schema._makeItemsPathFromPosition( position ),
			attribute: attribute
		} );
	}

	/**
	 * Checks whether given query is allowed in schema.
	 *
	 *		// Check whether bold text is allowed in header element.
	 *		let query = {
	 *			name: '$text',
	 *			attribute: 'bold',
	 *			inside: 'header'
	 *		};
	 *		if ( schema.checkQuery( query ) ) { ... }
	 *
	 * @param {engine.treeModel.SchemaQuery} query Query to check.
	 * @returns {Boolean} `true` if given query is allowed in schema, `false` otherwise.
	 */
	checkQuery( query ) {
		if ( !this.hasItem( query.name ) ) {
			return false;
		}

		const path = ( typeof query.inside === 'string' ) ? query.inside.split( ' ' ) : query.inside;

		// Get extension chain of given item and retrieve all schema items that are extended by given item.
		const schemaItems = this._extensionChains.get( query.name ).map( ( name ) => {
			return this._getItem( name );
		} );

		// If there is matching disallow path, this query is not valid with schema.
		for ( let schemaItem of schemaItems ) {
			if ( schemaItem._hasMatchingPath( 'DISALLOW', path, query.attribute ) ) {
				return false;
			}
		}

		// At this point, the query is not disallowed.
		// If there is any allow path that matches query, this query is valid with schema.
		for ( let schemaItem of schemaItems ) {
			if ( schemaItem._hasMatchingPath( 'ALLOW', path, query.attribute ) ) {
				return true;
			}
		}

		// There are no allow paths that matches query. The query is not valid with schema.
		return false;
	}

	/**
	 * Checks whether there is an item registered under given name in schema.
	 *
	 * @param itemName
	 * @returns {boolean}
	 */
	hasItem( itemName ) {
		return this._items.has( itemName );
	}

	/**
	 * Registers given item name in schema.
	 *
	 *		// Register P element that should be treated like all block elements.
	 *		schema.registerItem( 'p', '$block' );
	 *
	 * @param {String} itemName Name to register.
	 * @param [isExtending] If set, new item will extend item with given name.
	 */
	registerItem( itemName, isExtending ) {
		if ( this.hasItem( itemName ) ) {
			/**
			 * Item with specified name already exists in schema.
			 *
			 * @error schema-item-exists
			 */
			throw new CKEditorError( 'schema-item-exists: Item with specified name already exists in schema.' );
		}

		if ( !!isExtending && !this.hasItem( isExtending ) ) {
			/**
			 * Item with specified name does not exist in schema.
			 *
			 * @error schema-no-item
			 */
			throw new CKEditorError( 'schema-no-item: Item with specified name does not exist in schema.' );
		}

		// Create new SchemaItem and add it to the items store.
		this._items.set( itemName, new SchemaItem( this ) );

		// Create an extension chain.
		// Extension chain has all item names that should be checked when that item is on path to check.
		// This simply means, that if item is not extending anything, it should have only itself in it's extension chain.
		// Since extending is not dynamic, we can simply get extension chain of extended item and expand it with registered name,
		// if the registered item is extending something.
		const chain = this.hasItem( isExtending ) ? this._extensionChains.get( isExtending ).concat( itemName ) : [ itemName ];
		this._extensionChains.set( itemName, chain );
	}

	/**
	 * Returns {@link engine.treeModel.SchemaItem schema item} that was registered in the schema under given name.
	 * If item has not been found, throws error.
	 *
	 * @private
	 * @param {String} itemName Name to look for in schema.
	 * @returns {engine.treeModel.SchemaItem} Schema item registered under given name.
	 */
	_getItem( itemName ) {
		if ( !this.hasItem( itemName ) ) {
			/**
			 * Item with specified name does not exist in schema.
			 *
			 * @error schema-no-item
			 */
			throw new CKEditorError( 'schema-no-item: Item with specified name does not exist in schema.' );
		}

		return this._items.get( itemName );
	}

	/**
	 * Gets position and traverses through it's parents to get their names and returns them.
	 *
	 * @private
	 * @param {engine.treeModel.Position} position Position to start building path from.
	 * @returns {Array.<String>} Path containing elements names from top-most to the one containing given position.
	 */
	static _makeItemsPathFromPosition( position ) {
		const path = [];
		let parent = position.parent;

		while ( parent !== null ) {
			path.push( parent.name );
			parent = parent.parent;
		}

		path.reverse();

		return path;
	}
}

/**
 * Object with query used by {@link engine.treeModel.Schema} to query schema or add allow/disallow rules to schema.
 *
 * @typedef {Object} engine.treeModel.SchemaQuery
 * @property {String} name Entity name.
 * @property {Array.<String>|String} inside Path inside which the entity is placed.
 * @property {String} [attribute] If set, the query applies only to entities that has attribute with given key.
 */
