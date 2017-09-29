/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/schema
 */

import Position from './position';
import Element from './element';
import Range from './range';
import DocumentSelection from './documentselection';
import clone from '@ckeditor/ckeditor5-utils/src/lib/lodash/clone';
import isArray from '@ckeditor/ckeditor5-utils/src/lib/lodash/isArray';
import isString from '@ckeditor/ckeditor5-utils/src/lib/lodash/isString';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
 */
export default class Schema {
	/**
	 * Creates Schema instance.
	 */
	constructor() {
		/**
		 * Names of elements which have "object" nature. This means that these
		 * elements should be treated as whole, never merged, can be selected from outside, etc.
		 * Just like images, placeholder widgets, etc.
		 *
		 * @member {Set.<String>} module:engine/model/schema~Schema#objects
		 */
		this.objects = new Set();

		/**
		 * Names of elements to which editing operations should be limited.
		 * For example, the <kbd>Enter</kbd> should not split such elements and
		 * <kbd>Backspace</kbd> should not be able to leave or modify such elements.
		 *
		 * @member {Set.<String>} module:engine/model/schema~Schema#limits
		 */
		this.limits = new Set();

		/**
		 * Schema items registered in the schema.
		 *
		 * @private
		 * @member {Map} module:engine/model/schema~Schema#_items
		 */
		this._items = new Map();

		/**
		 * Description of what entities are a base for given entity.
		 *
		 * @private
		 * @member {Map} module:engine/model/schema~Schema#_extensionChains
		 */
		this._extensionChains = new Map();

		// Register some default abstract entities.
		this.registerItem( '$root' );
		this.registerItem( '$block' );
		this.registerItem( '$inline' );
		this.registerItem( '$text', '$inline' );

		this.allow( { name: '$block', inside: '$root' } );
		this.allow( { name: '$inline', inside: '$block' } );

		this.limits.add( '$root' );

		// TMP!
		// Create an "all allowed" context in the schema for processing the pasted content.
		// Read: https://github.com/ckeditor/ckeditor5-engine/issues/638#issuecomment-255086588

		this.registerItem( '$clipboardHolder', '$root' );
		this.allow( { name: '$inline', inside: '$clipboardHolder' } );
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
	 * @param {module:engine/model/schema~SchemaQuery} query Allowed query.
	 */
	allow( query ) {
		this._getItem( query.name ).allow( Schema._normalizeQueryPath( query.inside ), query.attributes );
	}

	/**
	 * Disallows given query in the schema.
	 *
	 * @see #allow
	 * @param {module:engine/model/schema~SchemaQuery} query Disallowed query.
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
	 * @param {module:engine/model/schema~SchemaQuery} query Query to check.
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
		const schemaItems = this._extensionChains.get( query.name ).map( name => {
			return this._getItem( name );
		} );

		// First check if the query meets at required attributes for this item.
		if ( !this._getItem( query.name )._checkRequiredAttributes( query.attributes ) ) {
			return false;
		}

		// If there is matching disallow path, this query is not valid with schema.
		for ( const attribute of query.attributes ) {
			for ( const schemaItem of schemaItems ) {
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
		for ( const attribute of query.attributes ) {
			// Skip all attributes that are stored in elements.
			// This isn't perfect solution but we have to deal with it for now.
			// `attribute` may have `undefined` value.
			if ( attribute && DocumentSelection._isStoreAttributeKey( attribute ) ) {
				continue;
			}

			let matched = false;

			for ( const schemaItem of schemaItems ) {
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
	 * @returns {Boolean}
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
			 * @error model-schema-item-exists
			 */
			throw new CKEditorError( 'model-schema-item-exists: Item with specified name already exists in schema.' );
		}

		if ( !!isExtending && !this.hasItem( isExtending ) ) {
			throw new CKEditorError( 'model-schema-no-item: Item with specified name does not exist in schema.' );
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
	 * Checks whether item of given name is extending item of another given name.
	 *
	 * @param {String} childItemName Name of the child item.
	 * @param {String} parentItemName Name of the parent item.
	 * @returns {Boolean} `true` if child item extends parent item, `false` otherwise.
	 */
	itemExtends( childItemName, parentItemName ) {
		if ( !this.hasItem( childItemName ) || !this.hasItem( parentItemName ) ) {
			throw new CKEditorError( 'model-schema-no-item: Item with specified name does not exist in schema.' );
		}

		const chain = this._extensionChains.get( childItemName );

		return chain.some( itemName => itemName == parentItemName );
	}

	/**
	 * Checks whether the attribute is allowed in selection:
	 *
	 * * if the selection is not collapsed, then checks if the attribute is allowed on any of nodes in that range,
	 * * if the selection is collapsed, then checks if on the selection position there's a text with the
	 * specified attribute allowed.
	 *
	 * @param {module:engine/model/selection~Selection} selection Selection which will be checked.
	 * @param {String} attribute The name of the attribute to check.
	 * @returns {Boolean}
	 */
	checkAttributeInSelection( selection, attribute ) {
		if ( selection.isCollapsed ) {
			// Check whether schema allows for a text with the attribute in the selection.
			return this.check( { name: '$text', inside: selection.getFirstPosition(), attributes: attribute } );
		} else {
			const ranges = selection.getRanges();

			// For all ranges, check nodes in them until you find a node that is allowed to have the attribute.
			for ( const range of ranges ) {
				for ( const value of range ) {
					// If returned item does not have name property, it is a TextFragment.
					const name = value.item.name || '$text';

					// Attribute should be checked together with existing attributes.
					// See https://github.com/ckeditor/ckeditor5-engine/issues/1110.
					const attributes = Array.from( value.item.getAttributeKeys() ).concat( attribute );

					if ( this.check( { name, inside: value.previousPosition, attributes } ) ) {
						// If we found a node that is allowed to have the attribute, return true.
						return true;
					}
				}
			}
		}

		// If we haven't found such node, return false.
		return false;
	}

	/**
	 * Transforms the given set ranges into a set of ranges where the given attribute is allowed (and can be applied).
	 *
	 * @param {Array.<module:engine/model/range~Range>} ranges Ranges to be validated.
	 * @param {String} attribute The name of the attribute to check.
	 * @returns {Array.<module:engine/model/range~Range>} Ranges in which the attribute is allowed.
	 */
	getValidRanges( ranges, attribute ) {
		const validRanges = [];

		for ( const range of ranges ) {
			let last = range.start;
			let from = range.start;
			const to = range.end;

			for ( const value of range.getWalker() ) {
				const name = value.item.name || '$text';
				const itemPosition = Position.createBefore( value.item );

				if ( !this.check( { name, inside: itemPosition, attributes: attribute } ) ) {
					if ( !from.isEqual( last ) ) {
						validRanges.push( new Range( from, last ) );
					}

					from = value.nextPosition;
				}

				last = value.nextPosition;
			}

			if ( from && !from.isEqual( to ) ) {
				validRanges.push( new Range( from, to ) );
			}
		}

		return validRanges;
	}

	/**
	 * Returns the lowest {@link module:engine/model/schema~Schema#limits limit element} containing the entire
	 * selection or the root otherwise.
	 *
	 * @param {module:engine/model/selection~Selection} selection Selection which returns the common ancestor.
	 * @returns {module:engine/model/element~Element}
	 */
	getLimitElement( selection ) {
		// Find the common ancestor for all selection's ranges.
		let element = Array.from( selection.getRanges() )
			.reduce( ( node, range ) => {
				if ( !node ) {
					return range.getCommonAncestor();
				}

				return node.getCommonAncestor( range.getCommonAncestor() );
			}, null );

		while ( !this.limits.has( element.name ) ) {
			if ( element.parent ) {
				element = element.parent;
			} else {
				break;
			}
		}

		return element;
	}

	/**
	 * Removes disallowed by {@link module:engine/model/schema~Schema schema} attributes from given nodes.
	 * When {@link module:engine/model/batch~Batch batch} parameter is provided then attributes will be removed
	 * using that batch, by creating {@link module:engine/model/delta/attributedelta~AttributeDelta attribute deltas}.
	 * Otherwise, attributes will be removed directly from provided nodes using {@link module:engine/model/node~Node node} API.
	 *
	 * @param {Iterable.<module:engine/model/node~Node>} nodes Nodes that will be filtered.
	 * @param {module:engine/model/schema~SchemaPath} inside Path inside which schema will be checked.
	 * @param {module:engine/model/batch~Batch} [batch] Batch to which the deltas will be added.
	 */
	removeDisallowedAttributes( nodes, inside, batch ) {
		for ( const node of nodes ) {
			const name = node.is( 'text' ) ? '$text' : node.name;
			const attributes = Array.from( node.getAttributeKeys() );
			const queryPath = Schema._normalizeQueryPath( inside );

			// When node with attributes is not allowed in current position.
			if ( !this.check( { name, attributes, inside: queryPath } ) ) {
				// Let's remove attributes one by one.
				// TODO: this should be improved to check all combination of attributes.
				for ( const attribute of node.getAttributeKeys() ) {
					if ( !this.check( { name, attributes: attribute, inside: queryPath } ) ) {
						if ( batch ) {
							batch.removeAttribute( node, attribute );
						} else {
							node.removeAttribute( attribute );
						}
					}
				}
			}

			if ( node.is( 'element' ) ) {
				this.removeDisallowedAttributes( node.getChildren(), queryPath.concat( node.name ), batch );
			}
		}
	}

	/**
	 * Returns {@link module:engine/model/schema~SchemaItem schema item} that was registered in the schema under given name.
	 * If item has not been found, throws error.
	 *
	 * @private
	 * @param {String} itemName Name to look for in schema.
	 * @returns {module:engine/model/schema~SchemaItem} Schema item registered under given name.
	 */
	_getItem( itemName ) {
		if ( !this.hasItem( itemName ) ) {
			throw new CKEditorError( 'model-schema-no-item: Item with specified name does not exist in schema.' );
		}

		return this._items.get( itemName );
	}

	/**
	 * Normalizes a path to an entity by converting it from {@link module:engine/model/schema~SchemaPath} to an array of strings.
	 *
	 * @protected
	 * @param {module:engine/model/schema~SchemaPath} path Path to normalize.
	 * @returns {Array.<String>} Normalized path.
	 */
	static _normalizeQueryPath( path ) {
		let normalized = [];

		if ( isArray( path ) ) {
			for ( const pathItem of path ) {
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
 * SchemaItem is a singular registry item in {@link module:engine/model/schema~Schema} that groups and holds allow/disallow rules for
 * one entity. This class is used internally in {@link module:engine/model/schema~Schema} and should not be used outside it.
 *
 * @see module:engine/model/schema~Schema
 * @protected
 */
export class SchemaItem {
	/**
	 * Creates SchemaItem instance.
	 *
	 * @param {module:engine/model/schema~Schema} schema Schema instance that owns this item.
	 */
	constructor( schema ) {
		/**
		 * Schema instance that owns this item.
		 *
		 * @private
		 * @member {module:engine/model/schema~Schema} module:engine/model/schema~SchemaItem#_schema
		 */
		this._schema = schema;

		/**
		 * Paths in which the entity, represented by this item, is allowed.
		 *
		 * @private
		 * @member {Array} module:engine/model/schema~SchemaItem#_allowed
		 */
		this._allowed = [];

		/**
		 * Paths in which the entity, represented by this item, is disallowed.
		 *
		 * @private
		 * @member {Array} module:engine/model/schema~SchemaItem#_disallowed
		 */
		this._disallowed = [];

		/**
		 * Attributes that are required by the entity represented by this item.
		 *
		 * @protected
		 * @member {Array} module:engine/model/schema~SchemaItem#_requiredAttributes
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

		for ( const attribute of attributes ) {
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

		for ( const item of source ) {
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
	 * @see module:engine/model/schema~SchemaItem#requireAttributes
	 * @param {Array.<String>} attributesToCheck Attributes to check.
	 * @returns {Boolean} `true` if given set or attributes fulfills required attributes, `false` otherwise.
	 */
	_checkRequiredAttributes( attributesToCheck ) {
		let found = true;

		for ( const attributeSet of this._requiredAttributes ) {
			found = true;

			for ( const attribute of attributeSet ) {
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
	 * Checks whether this item has any registered path of given type that matches the provided path.
	 *
	 * @protected
	 * @param {String} type Paths' type. Possible values are `allow` or `disallow`.
	 * @param {Array.<String>} pathToCheck Path to check.
	 * @param {String} [attribute] If set, only paths registered for given attribute will be checked.
	 * @returns {Boolean} `true` if item has any registered matching path, `false` otherwise.
	 */
	_hasMatchingPath( type, pathToCheck, attribute ) {
		const registeredPaths = this._getPaths( type, attribute );

		for ( const registeredPathPath of registeredPaths ) {
			if ( matchPaths( this._schema, pathToCheck, registeredPathPath ) ) {
				return true;
			}
		}

		return false;
	}
}

/**
 * Object with query used by {@link module:engine/model/schema~Schema} to query schema or add allow/disallow rules to schema.
 *
 * @typedef {Object} module:engine/model/schema~SchemaQuery
 * @property {String} name Entity name.
 * @property {module:engine/model/schema~SchemaPath} inside Path inside which the entity is placed.
 * @property {Array.<String>|String} [attributes] If set, the query applies only to entities that has attribute(s) with given key.
 */

/**
 * Path to an entity, begins from the top-most ancestor. Can be passed in multiple formats. Internally, normalized to
 * an array of strings. If string is passed, entities from the path should be divided by ` ` (space character). If
 * an array is passed, unrecognized items are skipped. If position is passed, it is assumed that the entity is at given position.
 *
 * @typedef {String|Array.<String|module:engine/model/element~Element>|module:engine/model/position~Position}
 * module:engine/model/schema~SchemaPath
 */

// Checks whether the given pathToCheck and registeredPath right ends match.
//
// pathToCheck: C, D
// registeredPath: A, B, C, D
// result: OK
//
// pathToCheck: A, B, C
// registeredPath: A, B, C, D
// result: NOK
//
// Note – when matching paths, element extension chains (inheritance) are taken into consideration.
//
// @param {Schema} schema
// @param {Array.<String>} pathToCheck
// @param {Array.<String>} registeredPath
function matchPaths( schema, pathToCheck, registeredPath ) {
	// Start checking from the right end of both tables.
	let registeredPathIndex = registeredPath.length - 1;
	let pathToCheckIndex = pathToCheck.length - 1;

	// And finish once reaching an end of the shorter table.
	while ( registeredPathIndex >= 0 && pathToCheckIndex >= 0 ) {
		const checkName = pathToCheck[ pathToCheckIndex ];

		// Fail when checking a path which contains element which aren't even registered to the schema.
		if ( !schema.hasItem( checkName ) ) {
			return false;
		}

		const extChain = schema._extensionChains.get( checkName );

		if ( extChain.includes( registeredPath[ registeredPathIndex ] ) ) {
			registeredPathIndex--;
			pathToCheckIndex--;
		} else {
			return false;
		}
	}

	return true;
}

/**
 * Item with specified name does not exist in schema.
 *
 * @error model-schema-no-item
 */
