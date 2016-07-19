/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Position from './position.js';
import Element from './element.js';
import clone from '../../utils/lib/lodash/clone.js';
import isArray from '../../utils/lib/lodash/isArray.js';
import isString from '../../utils/lib/lodash/isString.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * SchemaItem is a singular registry item in {@link engine.model.Schema} that groups and holds allow/disallow rules for
 * one entity. This class is used internally in {@link engine.model.Schema} and should not be used outside it.
 *
 * @see engine.model.Schema
 * @protected
 * @memberOf engine.model
 */
export class SchemaItem {
	/**
	 * Creates SchemaItem instance.
	 *
	 * @param {engine.model.Schema} schema Schema instance that owns this item.
	 */
	constructor( schema ) {
		/**
		 * Schema instance that owns this item.
		 *
		 * @private
		 * @member {engine.model.Schema} engine.model.SchemaItem#_schema
		 */
		this._schema = schema;

		/**
		 * Paths in which the entity, represented by this item, is allowed.
		 *
		 * @private
		 * @member {Array} engine.model.SchemaItem#_allowed
		 */
		this._allowed = [];

		/**
		 * Paths in which the entity, represented by this item, is disallowed.
		 *
		 * @private
		 * @member {Array} engine.model.SchemaItem#_disallowed
		 */
		this._disallowed = [];

		/**
		 * Attributes that are required by the entity represented by this item.
		 *
		 * @protected
		 * @member {Array} engine.model.SchemaItem#_requiredAttributes
		 */
		this._requiredAttributes = [];
	}

	/**
	 * Allows entity, represented by this item, to be in given path.
	 *
	 * @param {Array.<String>} path Path in which entity is allowed.
	 * @param {Array.<String>|String} [attributes] If set, this path will be used only for entities that have attribute(s) with this key.
	 */
	allow( path, attributes ) {
		this._addPath( '_allowed', path, attributes );
	}

	/**
	 * Disallows entity, represented by this item, to be in given path.
	 *
	 * @param {Array.<String>} path Path in which entity is disallowed.
	 * @param {Array.<String>|String} [attributes] If set, this path will be used only for entities that have an attribute(s) with this key.
	 */
	disallow( path, attributes ) {
		this._addPath( '_disallowed', path, attributes );
	}

	/**
	 * Specifies that the entity, to be valid, requires given attributes set. It is possible to register multiple
	 * different attributes set. If there are more than one attributes set required, the entity will be valid if
	 * at least one of them is fulfilled.
	 *
	 * @param {Array.<String>} attributes Attributes that has to be set on the entity to make it valid.
	 */
	requireAttributes( attributes ) {
		this._requiredAttributes.push( attributes );
	}

	/**
	 * Adds path to the SchemaItem instance.
	 *
	 * @private
	 * @param {String} member Name of the array member into which the path will be added. Possible values are `_allowed` or `_disallowed`.
	 * @param {Array.<String>} path Path to add.
	 * @param {Array.<String>|String} [attributes] If set, this path will be used only for entities that have attribute(s) with this key.
	 */
	_addPath( member, path, attributes ) {
		path = path.slice();

		if ( !isArray( attributes ) ) {
			attributes = [ attributes ];
		}

		for ( let attribute of attributes ) {
			this[ member ].push( { path, attribute } );
		}
	}

	/**
	 * Returns all paths of given type that were previously registered in the item.
	 *
	 * @private
	 * @param {String} type Paths' type. Possible values are `allow` or `disallow`.
	 * @param {String} [attribute] If set, only paths registered for given attribute will be returned.
	 * @returns {Array} Paths registered in the item.
	 */
	_getPaths( type, attribute ) {
		const source = type === 'allow' ? this._allowed : this._disallowed;
		const paths = [];

		for ( let item of source ) {
			if ( item.attribute === attribute ) {
				paths.push( item.path );
			}
		}

		return paths;
	}

	/**
	 * Checks whether given set of attributes fulfills required attributes of this item.
	 *
	 * @protected
	 * @see engine.model.SchemaItem#requireAttributes
	 * @param {Array.<String>} attributesToCheck Attributes to check.
	 * @returns {Boolean} `true` if given set or attributes fulfills required attributes, `false` otherwise.
	 */
	_checkRequiredAttributes( attributesToCheck ) {
		let found = true;

		for ( let attributeSet of this._requiredAttributes ) {
			found = true;

			for ( let attribute of attributeSet ) {
				if ( attributesToCheck.indexOf( attribute ) == -1 ) {
					found = false;
					break;
				}
			}

			if ( found ) {
				break;
			}
		}

		return found;
	}

	/**
	 * Checks whether this item has any registered path of given type that matches provided path.
	 *
	 * @protected
	 * @param {String} type Paths' type. Possible values are `allow` or `disallow`.
	 * @param {Array.<String>} checkPath Path to check.
	 * @param {String} [attribute] If set, only paths registered for given attribute will be checked.
	 * @returns {Boolean} `true` if item has any registered matching path, `false` otherwise.
	 */
	_hasMatchingPath( type, checkPath, attribute ) {
		const itemPaths = this._getPaths( type, attribute );

		// We check every path registered (possibly with given attribute) in the item.
		for ( let itemPath of itemPaths ) {
			// Pointer to last found item from `itemPath`.
			let i = 0;

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
				if ( chain.indexOf( itemPath[ i ] ) > -1 ) {
					// Move pointer as we found element under index `i`.
					i++;
				}
			}

			// If `itemPath` has no items it means that we removed all of them, so we matched all of them.
			// This means that we found a matching path.
			if ( i === itemPath.length ) {
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
		json._schema = '[model.Schema]';

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
 *
 * * `$inline` represents all inline elements,
 * * `$text` is a sub-group of `$inline` and represents text nodes,
 * * `$block` represents block elements,
 * * `$root` represents default editing roots (those that allow only `$block`s inside them).
 *
 * When registering an item it's possible to tell that this item should inherit from some other existing item.
 * E.g. `p` can inherit from `$block`, so whenever given attribute is allowed on the `$block` it will automatically be
 * also allowed on the `p` element. By default, `$text` item already inherits from `$inline`.
 *
 * @memberOf engine.model
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
		 * @member {Map} engine.model.Schema#_items
		 */
		this._items = new Map();

		/**
		 * Description of what entities are a base for given entity.
		 *
		 * @private
		 * @member {Map} engine.model.Schema#_extensionChains
		 */
		this._extensionChains = new Map();

		// Register some default abstract entities.
		this.registerItem( '$root' );
		this.registerItem( '$block' );
		this.registerItem( '$inline' );
		this.registerItem( '$text', '$inline' );

		this.allow( { name: '$block', inside: '$root' } );
		this.allow( { name: '$inline', inside: '$block' } );
	}

	/**
	 * Allows given query in the schema.
	 *
	 *		// Allow text with bold attribute in all P elements.
	 *		schema.registerItem( 'p', '$block' );
	 *		schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
	 *
	 *		// Allow header in Ps that are in DIVs
	 *		schema.registerItem( 'header', '$block' );
	 *		schema.registerItem( 'div', '$block' );
	 *		schema.allow( { name: 'header', inside: 'div p' } ); // inside: [ 'div', 'p' ] would also work.
	 *
	 * @param {engine.model.SchemaQuery} query Allowed query.
	 */
	allow( query ) {
		this._getItem( query.name ).allow( Schema._normalizeQueryPath( query.inside ), query.attributes );
	}

	/**
	 * Disallows given query in the schema.
	 *
	 * @see {@link engine.model.Schema#allow}
	 * @param {engine.model.SchemaQuery} query Disallowed query.
	 */
	disallow( query ) {
		this._getItem( query.name ).disallow( Schema._normalizeQueryPath( query.inside ), query.attributes );
	}

	/**
	 * Makes a requirement in schema that entity represented by given item has to have given set of attributes. Some
	 * elements in the model might require some attributes to be set. If multiple sets of attributes are required it
	 * is enough that the entity fulfills only one set.
	 *
	 *		// "a" element must either have "href" attribute or "name" attribute
	 *		schema.requireAttributes( 'a', [ 'href' ] );
	 *		schema.requireAttributes( 'a', [ 'name' ] );
	 *		// "img" element must have both "src" and "alt" attributes
	 *		schema.requireAttributes( 'img', [ 'src', 'alt' ] );
	 *
	 * @param {String} name Entity name.
	 * @param {Array.<String>} attributes Attributes that has to be set on the entity to make it valid.
	 */
	requireAttributes( name, attributes ) {
		this._getItem( name ).requireAttributes( attributes );
	}

	/**
	 * Checks whether given query is allowed in schema.
	 *
	 *		// Check whether bold text is allowed in header element.
	 *		let query = {
	 *			name: '$text',
	 *			attributes: 'bold',
	 *			inside: 'header'
	 *		};
	 *		if ( schema.check( query ) ) { ... }
	 *
	 *		// Check whether bold and italic text can be placed at caret position.
	 *		let caretPos = editor.document.selection.getFirstPosition();
	 *		let query = {
	 *			name: '$text',
	 *			attributes: [ 'bold', 'italic' ],
	 *			inside: caretPos
	 *		};
	 *		if ( schema.check( query ) ) { ... }
	 *
	 *		// Check whether image with alt, src and title is allowed in given elements path.
	 *		let quoteElement = new Element( 'quote' );
	 *		let query = {
	 *			name: 'img',
	 *			attributes: [ 'alt', 'src', 'title' ],
	 *			// It is possible to mix strings with elements.
	 *			// Query will check whether "img" can be inside "quoteElement" that is inside a block element.
	 *			inside: [ '$block', quoteElement ]
	 *		};
	 *		if ( schema.check( query ) ) { ... }
	 *
	 * @param {engine.model.SchemaQuery} query Query to check.
	 * @returns {Boolean} `true` if given query is allowed in schema, `false` otherwise.
	 */
	check( query ) {
		if ( !this.hasItem( query.name ) ) {
			return false;
		}

		// If attributes property is a string or undefined, wrap it in an array for easier processing.
		if ( !isArray( query.attributes ) ) {
			query.attributes = [ query.attributes ];
		} else if ( query.attributes.length === 0 ) {
			// To simplify algorithms, when a SchemaItem path is added "without" attribute, it is added with
			// attribute equal to undefined. This means that algorithms can work the same way for specified attributes
			// and no-atrtibutes, but we have to fill empty array with "fake" undefined value for algorithms reasons.
			query.attributes.push( undefined );
		}

		// Normalize the path to an array of strings.
		const path = Schema._normalizeQueryPath( query.inside );

		// Get extension chain of given item and retrieve all schema items that are extended by given item.
		const schemaItems = this._extensionChains.get( query.name ).map( ( name ) => {
			return this._getItem( name );
		} );

		// First check if the query meets at required attributes for this item.
		if ( !this._getItem( query.name )._checkRequiredAttributes( query.attributes ) ) {
			return false;
		}

		// If there is matching disallow path, this query is not valid with schema.
		for ( let attribute of query.attributes ) {
			for ( let schemaItem of schemaItems ) {
				if ( schemaItem._hasMatchingPath( 'disallow', path, attribute ) ) {
					return false;
				}
			}
		}

		// At this point, the query is not disallowed.
		// If there are correct allow paths that match the query, this query is valid with schema.
		// Since we are supporting multiple attributes, we have to make sure that if attributes are set,
		// we have allowed paths for all of them.
		// Keep in mind that if the query has no attributes, query.attribute was converted to an array
		// with a single `undefined` value. This fits the algorithm well.
		for ( let attribute of query.attributes ) {
			let matched = false;

			for ( let schemaItem of schemaItems ) {
				if ( schemaItem._hasMatchingPath( 'allow', path, attribute ) ) {
					matched = true;
					break;
				}
			}

			// The attribute has not been matched, so it is not allowed by any schema item.
			// The query is disallowed.
			if ( !matched ) {
				return false;
			}
		}

		return true;
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
	 * Returns {@link engine.model.SchemaItem schema item} that was registered in the schema under given name.
	 * If item has not been found, throws error.
	 *
	 * @private
	 * @param {String} itemName Name to look for in schema.
	 * @returns {engine.model.SchemaItem} Schema item registered under given name.
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
	 * Normalizes a path to an entity by converting it from {@link engine.model.SchemaPath} to an array of strings.
	 *
	 * @protected
	 * @param {engine.model.SchemaPath} path Path to normalize.
	 * @returns {Array.<String>} Normalized path.
	 */
	static _normalizeQueryPath( path ) {
		let normalized = [];

		if ( isArray( path ) ) {
			for ( let pathItem of path ) {
				if ( pathItem instanceof Element ) {
					normalized.push( pathItem.name );
				} else if ( isString( pathItem ) ) {
					normalized.push( pathItem );
				}
			}
		} else if ( path instanceof Position ) {
			let parent = path.parent;

			while ( parent !== null ) {
				normalized.push( parent.name );
				parent = parent.parent;
			}

			normalized.reverse();
		} else if ( isString( path ) ) {
			normalized = path.split( ' ' );
		}

		return normalized;
	}
}

/**
 * Object with query used by {@link engine.model.Schema} to query schema or add allow/disallow rules to schema.
 *
 * @typedef {Object} engine.model.SchemaQuery
 * @property {String} name Entity name.
 * @property {engine.model.SchemaPath} inside Path inside which the entity is placed.
 * @property {Array.<String>|String} [attributes] If set, the query applies only to entities that has attribute(s) with given key.
 */

/**
 * Path to an entity, begins from the top-most ancestor. Can be passed in multiple formats. Internally, normalized to
 * an array of strings. If string is passed, entities from the path should be divided by ` ` (space character). If
 * an array is passed, unrecognized items are skipped. If position is passed, it is assumed that the entity is at given position.
 *
 * @typedef {String|Array.<String|engine.model.Element>|engine.model.Position} engine.model.SchemaPath
 */
