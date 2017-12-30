/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

import Range from './range';

/**
 * @module engine/model/schema
 */

/**
 * @mixes module:utils/emittermixin~ObservableMixin
 */
export default class Schema {
	constructor() {
		this._sourceRules = {};

		// TODO events
		this.decorate( 'checkChild' );
		this.decorate( 'checkAttribute' );

		this.on( 'checkAttribute', ( evt, args ) => {
			args[ 0 ] = new SchemaContext( args[ 0 ] );
		}, { priority: 'highest' } );

		this.on( 'checkChild', ( evt, args ) => {
			args[ 0 ] = new SchemaContext( args[ 0 ] );
		}, { priority: 'highest' } );
	}

	register( itemName, rules ) {
		if ( this._sourceRules[ itemName ] ) {
			// TODO docs
			throw new CKEditorError( 'schema-cannot-register-item-twice: A single item cannot be registered twice in the schema.' );
		}

		this._sourceRules[ itemName ] = [
			Object.assign( {}, rules )
		];

		this._clearCache();
	}

	extend( itemName, rules ) {
		// TODO it should not throw if we want to allow e.g. adding attrs before element is registered
		// (which may be done by another feature).
		if ( !this._sourceRules[ itemName ] ) {
			// TODO docs
			throw new CKEditorError( 'schema-cannot-extend-missing-item: Cannot extend an item which was not registered yet.' );
		}

		this._sourceRules[ itemName ].push( Object.assign( {}, rules ) );

		this._clearCache();
	}

	getRules() {
		if ( !this._compiledRules ) {
			this._compile();
		}

		return this._compiledRules;
	}

	/**
	 * @param {module:engine/model/item~Item|SchemaContextItem|String} item
	 */
	getRule( item ) {
		let itemName;

		if ( typeof item == 'string' ) {
			itemName = item;
		} else if ( item.is && ( item.is( 'text' ) || item.is( 'textProxy' ) ) ) {
			itemName = '$text';
		}
		// Element or SchemaContextItem.
		else {
			itemName = item.name;
		}

		return this.getRules()[ itemName ];
	}

	isRegistered( itemName ) {
		return !!this.getRule( itemName );
	}

	isBlock( itemName ) {
		const rule = this.getRule( itemName );

		return !!( rule && rule.isBlock );
	}

	isLimit( itemName ) {
		const rule = this.getRule( itemName );

		return !!( rule && rule.isLimit );
	}

	isObject( itemName ) {
		const rule = this.getRule( itemName );

		return !!( rule && rule.isObject );
	}

	/**
	 * @param {module:engine/model/element~Element|module:engine/model/position~Position|Array.<String>} context
	 * @param {module:engine/model/node~Node|String}
	 */
	checkChild( context, child ) {
		const rule = this.getRule( child );

		if ( !rule ) {
			return false;
		}

		return this._checkContextMatch( rule, context );
	}

	/**
	 * @param {module:engine/model/node~Node} context
	 * @param {String}
	 */
	checkAttribute( context, attributeName ) {
		const rule = this.getRule( context.last );

		if ( !rule ) {
			return false;
		}

		return rule.allowAttributes.includes( attributeName );
	}

	/**
	 * Returns the lowest {@link module:engine/model/schema~Schema#isLimit limit element} containing the entire
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

		while ( !this.isLimit( element.name ) ) {
			if ( element.parent ) {
				element = element.parent;
			} else {
				break;
			}
		}

		return element;
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
			return this.checkAttribute( [ ...selection.getFirstPosition().getAncestors(), '$text' ], attribute );
		} else {
			const ranges = selection.getRanges();

			// For all ranges, check nodes in them until you find a node that is allowed to have the attribute.
			for ( const range of ranges ) {
				for ( const value of range ) {
					if ( this.checkAttribute( value.item, attribute ) ) {
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
				if ( !this.checkAttribute( value.item, attribute ) ) {
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
	 * Removes attributes disallowed the schema.
	 *
	 * @param {Iterable.<module:engine/model/node~Node>} nodes Nodes that will be filtered.
	 * @param {module:engine/model/writer~Writer} writer
	 */
	removeDisallowedAttributes( nodes, writer ) {
		for ( const node of nodes ) {
			for ( const attribute of node.getAttributeKeys() ) {
				if ( !this.checkAttribute( node, attribute ) ) {
					writer.removeAttribute( attribute, node );
				}
			}

			if ( node.is( 'element' ) ) {
				this.removeDisallowedAttributes( node.getChildren(), writer );
			}
		}
	}

	_clearCache() {
		this._compiledRules = null;
	}

	_compile() {
		const compiledRules = {};
		const sourceRules = this._sourceRules;
		const itemNames = Object.keys( sourceRules );

		for ( const itemName of itemNames ) {
			compiledRules[ itemName ] = compileBaseItemRule( sourceRules[ itemName ], itemName );
		}

		for ( const itemName of itemNames ) {
			compileAllowContentOf( compiledRules, itemName );
		}

		for ( const itemName of itemNames ) {
			compileAllowWhere( compiledRules, itemName );
		}

		for ( const itemName of itemNames ) {
			compileAllowAttributesOf( compiledRules, itemName );
			compileInheritPropertiesFrom( compiledRules, itemName );
		}

		for ( const itemName of itemNames ) {
			cleanUpAllowIn( compiledRules, itemName );
			cleanUpAllowAttributes( compiledRules, itemName );
		}

		this._compiledRules = compiledRules;
	}

	_checkContextMatch( rule, context, contextItemIndex = context.length - 1 ) {
		const contextItem = context.getItem( contextItemIndex );

		if ( rule.allowIn.includes( contextItem.name ) ) {
			if ( contextItemIndex == 0 ) {
				return true;
			} else {
				const parentRule = this.getRule( contextItem );

				return this._checkContextMatch( parentRule, context, contextItemIndex - 1 );
			}
		} else {
			return false;
		}
	}
}

mix( Schema, ObservableMixin );

/**
 * @private
 */
export class SchemaContext {
	constructor( ctx ) {
		if ( Array.isArray( ctx ) ) {
			this._items = ctx.map( mapContextItem );
		}
		// Item or position (PS. It's ok that Position#getAncestors() doesn't accept params).
		else {
			this._items = ctx.getAncestors( { includeSelf: true } ).map( mapContextItem );
		}
	}

	get length() {
		return this._items.length;
	}

	get last() {
		return this._items[ this._items.length - 1 ];
	}

	/**
	 * Returns an iterator that iterates over all context items
	 *
	 * @returns {Iterator.<TODO>}
	 */
	[ Symbol.iterator ]() {
		return this._items[ Symbol.iterator ]();
	}

	getItem( index ) {
		return this._items[ index ];
	}

	* getNames() {
		yield* this._items.map( item => item.name );
	}

	matchEnd( query ) {
		return Array.from( this.getNames() ).join( ' ' ).endsWith( query );
	}
}

function compileBaseItemRule( sourceItemRules, itemName ) {
	const itemRule = {
		name: itemName,

		allowIn: [],
		allowContentOf: [],
		allowWhere: [],

		allowAttributes: [],
		allowAttributesOf: [],

		inheritTypesFrom: []
	};

	copyTypes( sourceItemRules, itemRule );

	copyProperty( sourceItemRules, itemRule, 'allowIn' );
	copyProperty( sourceItemRules, itemRule, 'allowContentOf' );
	copyProperty( sourceItemRules, itemRule, 'allowWhere' );

	copyProperty( sourceItemRules, itemRule, 'allowAttributes' );
	copyProperty( sourceItemRules, itemRule, 'allowAttributesOf' );

	copyProperty( sourceItemRules, itemRule, 'inheritTypesFrom' );

	makeInheritAllWork( sourceItemRules, itemRule );

	return itemRule;
}

function compileAllowContentOf( compiledRules, itemName ) {
	for ( const allowContentOfItemName of compiledRules[ itemName ].allowContentOf ) {
		// The allowContentOf property may point to an unregistered element.
		if ( compiledRules[ allowContentOfItemName ] ) {
			const allowedChildren = getAllowedChildren( compiledRules, allowContentOfItemName );

			allowedChildren.forEach( allowedItem => {
				allowedItem.allowIn.push( itemName );
			} );
		}
	}

	delete compiledRules[ itemName ].allowContentOf;
}

function compileAllowWhere( compiledRules, itemName ) {
	for ( const allowWhereItemName of compiledRules[ itemName ].allowWhere ) {
		const inheritFrom = compiledRules[ allowWhereItemName ];

		// The allowWhere property may point to an unregistered element.
		if ( inheritFrom ) {
			const allowedIn = inheritFrom.allowIn;

			compiledRules[ itemName ].allowIn.push( ...allowedIn );
		}
	}

	delete compiledRules[ itemName ].allowWhere;
}

function compileAllowAttributesOf( compiledRules, itemName ) {
	for ( const allowAttributeOfItem of compiledRules[ itemName ].allowAttributesOf ) {
		const inheritFrom = compiledRules[ allowAttributeOfItem ];

		if ( inheritFrom ) {
			const inheritAttributes = inheritFrom.allowAttributes;

			compiledRules[ itemName ].allowAttributes.push( ...inheritAttributes );
		}
	}

	delete compiledRules[ itemName ].allowAttributesOf;
}

function compileInheritPropertiesFrom( compiledRules, itemName ) {
	const item = compiledRules[ itemName ];

	for ( const inheritPropertiesOfItem of item.inheritTypesFrom ) {
		const inheritFrom = compiledRules[ inheritPropertiesOfItem ];

		if ( inheritFrom ) {
			const typeNames = Object.keys( inheritFrom ).filter( name => name.startsWith( 'is' ) );

			for ( const name of typeNames ) {
				if ( !( name in item ) ) {
					item[ name ] = inheritFrom[ name ];
				}
			}
		}
	}

	delete item.inheritTypesFrom;
}

// Remove items which weren't registered (because it may break some checks or we'd need to complicate them).
// Make sure allowIn doesn't contain repeated values.
function cleanUpAllowIn( compiledRules, itemName ) {
	const itemRule = compiledRules[ itemName ];
	const existingItems = itemRule.allowIn.filter( itemToCheck => compiledRules[ itemToCheck ] );

	itemRule.allowIn = Array.from( new Set( existingItems ) );
}

function cleanUpAllowAttributes( compiledRules, itemName ) {
	const itemRule = compiledRules[ itemName ];

	itemRule.allowAttributes = Array.from( new Set( itemRule.allowAttributes ) );
}

function copyTypes( sourceItemRules, itemRule ) {
	for ( const sourceItemRule of sourceItemRules ) {
		const typeNames = Object.keys( sourceItemRule ).filter( name => name.startsWith( 'is' ) );

		for ( const name of typeNames ) {
			itemRule[ name ] = sourceItemRule[ name ];
		}
	}
}

function copyProperty( sourceItemRules, itemRule, propertyName ) {
	for ( const sourceItemRule of sourceItemRules ) {
		if ( typeof sourceItemRule[ propertyName ] == 'string' ) {
			itemRule[ propertyName ].push( sourceItemRule[ propertyName ] );
		} else if ( Array.isArray( sourceItemRule[ propertyName ] ) ) {
			itemRule[ propertyName ].push( ...sourceItemRule[ propertyName ] );
		}
	}
}

function makeInheritAllWork( sourceItemRules, itemRule ) {
	for ( const sourceItemRule of sourceItemRules ) {
		const inheritFrom = sourceItemRule.inheritAllFrom;

		if ( inheritFrom ) {
			itemRule.allowContentOf.push( inheritFrom );
			itemRule.allowWhere.push( inheritFrom );
			itemRule.allowAttributesOf.push( inheritFrom );
			itemRule.inheritTypesFrom.push( inheritFrom );
		}
	}
}

function getAllowedChildren( compiledRules, itemName ) {
	const itemRule = compiledRules[ itemName ];

	return getValues( compiledRules ).filter( rule => rule.allowIn.includes( itemRule.name ) );
}

function getValues( obj ) {
	return Object.keys( obj ).map( key => obj[ key ] );
}

function mapContextItem( ctxItem ) {
	if ( typeof ctxItem == 'string' ) {
		return {
			name: ctxItem,

			* getAttributeKeys() {},

			getAttribute() {}
		};
	} else {
		return {
			// '$text' means text nodes and text proxies.
			name: ctxItem.is( 'element' ) ? ctxItem.name : '$text',

			* getAttributeKeys() {
				yield* ctxItem.getAttributeKeys();
			},

			getAttribute( key ) {
				return ctxItem.getAttribute( key );
			}
		};
	}
}
