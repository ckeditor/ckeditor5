/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

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
			args[ 0 ] = getContext( args[ 0 ] );
		}, { priority: 'highest' } );

		this.on( 'checkChild', ( evt, args ) => {
			args[ 0 ] = getContext( args[ 0 ] );
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

	getRule( item ) {
		let itemName;

		if ( typeof item == 'string' ) {
			itemName = item;
		} else if ( item.is && item.is( 'text' ) ) {
			itemName = '$text';
		}
		// Element or context item.
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

	checkChild( context, child ) {
		const rule = this.getRule( child );

		if ( !rule ) {
			return false;
		}

		return this._checkContextMatch( rule, context );
	}

	checkAttribute( context, attributeName ) {
		const rule = this.getRule( context[ context.length - 1 ] );

		if ( !rule ) {
			return false;
		}

		return rule.allowAttributes.includes( attributeName );
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
		}

		for ( const itemName of itemNames ) {
			cleanUpAllowIn( compiledRules, itemName );
			cleanUpAllowAttributes( compiledRules, itemName );
		}

		this._compiledRules = compiledRules;
	}

	_checkContextMatch( rule, context, contextItemIndex = context.length - 1 ) {
		const contextItem = context[ contextItemIndex ];

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

function compileBaseItemRule( sourceItemRules, itemName ) {
	const itemRule = {
		name: itemName,

		allowIn: [],
		allowContentOf: [],
		allowWhere: [],

		allowAttributes: [],
		allowAttributesOf: []
	};

	copyTypes( sourceItemRules, itemRule );

	copyProperty( sourceItemRules, itemRule, 'allowIn' );
	copyProperty( sourceItemRules, itemRule, 'allowContentOf' );
	copyProperty( sourceItemRules, itemRule, 'allowWhere' );

	copyProperty( sourceItemRules, itemRule, 'allowAttributes' );
	copyProperty( sourceItemRules, itemRule, 'allowAttributesOf' );

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
		}
	}
}

function getAllowedChildren( compiledRules, itemName ) {
	const itemRule = compiledRules[ itemName ];

	return getValues( compiledRules ).filter( rule => rule.allowIn.includes( itemRule.name ) );
}

function getContext( node ) {
	return node.getAncestors( { includeSelf: true } ).map( node => {
		return {
			name: node.is( 'text' ) ? '$text' : node.name,
			* getAttributes() {
				yield* node.getAttributes();
			}
		};
	} );
}

function getValues( obj ) {
	return Object.keys( obj ).map( key => obj[ key ] );
}
