/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/schema
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

import Range from './range';

/**
 * The model's schema. It defines allowed and disallowed structures of nodes as well as their attributes.
 * The schema rules are usually defined by features and based on them the editing framework and features
 * make decisions how to process the model.
 *
 * The instance of schema is available in {@link module:engine/model/model~Model#schema `editor.model.schema`}.
 *
 * # Schema rules
 *
 * Schema defines allowed model structures and allowed attributes separately. They are also checked separately
 * by using the {@link #checkChild} and {@link #checkAttribute} methods.
 *
 * ## Defining allowed structures
 *
 * When a feature introduces a model element it should registered it in the schema. Besides
 * defining that such an element may exist in the model, the feature also needs to define where
 * this element may occur:
 *
 *		schema.register( 'myElement', {
 *			allowIn: '$root'
 *		} );
 *
 * This lets the schema know that `<myElement>` may be a child of the `<$root>` element. `$root` is one of generic
 * node types defined by the editing framework. By default, the editor names the main root element a `<$root>`,
 * so the above rule allows `<myElement>` in the main editor element.
 *
 * In other words, this would be correct:
 *
 *		<$root><myElement></myElement></$root>
 *
 * While this would not be correct:
 *
 *		<$root><foo><myElement></myElement></foo></$root>
 *
 * ## Generic node types
 *
 * There are three basic generic node types: `$root`, `$block` and `$text`.
 * They are defined as follows:
 *
 *		this.schema.register( '$root', {
 *			isLimit: true
 *		} );
 *		this.schema.register( '$block', {
 *			allowIn: '$root',
 *			isBlock: true
 *		} );
 *		this.schema.register( '$text', {
 *			allowIn: '$block'
 *		} );
 *
 * Those rules can then be reused by features to define their rules in a more extensible way.
 * For example, the {@link module:paragraph/paragraph~Paragraph} feature will define its rules as:
 *
 *		schema.register( 'paragraph', {
 *			inheritAllFrom: '$block'
 *		} );
 *
 * Which translates to:
 *
 *		schema.register( 'paragraph', {
 *			allowWhere: '$block',
 *			allowContentOf: '$block',
 *			allowAttributesOf: '$block',
 *			inheritTypesFrom: '$block'
 *		} );
 *
 * Which can be read as:
 *
 * * The `<paragraph>` element will be allowed in elements in which `<$block>` is allowed (e.g. in `<$root>`).
 * * The `<paragraph>` element will allow all nodes which are allowed in `<$block>` (e.g. `$text`).
 * * The `<paragraph>` element will allow all attributes allowed on `<$block>`.
 * * The `<paragraph>` element will inherit all `is*` properties of `<$block>` (e.g. `isBlock`).
 *
 * Thanks to the fact that `<paragraph>`'s rules are inherited from `<$block>` other features can use the `<$block>`
 * type to indirectly extend `<paragraph>`'s rules. For example, the {@link module:block-quote/blockquote~BlockQuote}
 * feature does this:
 *
 *		schema.register( 'blockQuote', {
 *			allowWhere: '$block',
 *			allowContentOf: '$root'
 *		} );
 *
 * Thanks to that, despite the fact that block quote and paragraph features know nothing about themselves, paragraphs
 * will be allowed in block quotes and block quotes will be allowed in all places where blocks are, so if anyone will
 * register a `<section>` element (with `allowContentOf: '$root'` rule), that `<section>` elements will allow
 * block quotes.
 *
 * The side effect of such a rule inheritance is that now `<blockQuote>` is allowed in `<blockQuote>` which needs to be
 * resolved by a callback which will disallow this specific structure.
 *
 * ## Defining advanced rules in `checkChild()`'s callbacks
 *
 * The {@link #checkChild} method which is the base method used to check whether some element is allowed in a given structure
 * is {@link module:utils/observablemixin~ObservableMixin#decorate decorated} with the {@link #event-checkChild} event.
 * It means that you can add listeners to implement your specific rules which are not limited by the declarative
 * {@link module:engine/model/schema~SchemaRuleDefinition} API.
 *
 * The block quote feature defines such a listener to disallow nested `<blockQuote>` structures:
 *
 * 		schema.on( 'checkChild', ( evt, args ) => {
 * 			// The checkChild()'s params.
 *			// Note that context is automatically normalized to SchemaContext instance by a highest-priority listener.
 *			const context = args[ 0 ];
 *			const child = args[ 1 ];
 *
 *			// Pass the child through getRule() to normalize it (child can be passed in multiple formats).
 *			const childRule = schema.getRule( child );
 *
 *			// If checkChild() is called with a context that ends with blockQuote and blockQuote as a child
 *			// to check, make the method return false and stop the event so no other listener will override your decision.
 *			if ( childRule && childRule.name == 'blockQuote' && context.matchEnd( 'blockQuote' ) ) {
 *				evt.stop();
 *				evt.return = false;
 *			}
 *		}, { priority: 'high' } );
 *
 * ## Defining attributes
 *
 * TODO
 *
 * ## Implementing additional constraints
 *
 * Schema's capabilities were limited to simple (and atomic) {@link #checkChild} and {@link #checkAttribute} on purpose.
 * One may imagine defining more complex rules such as "element `<x>` must be always followed by `<y>`". While it is
 * feasible to create an API which would enable feeding the schema with such definitions, it is unrealistic to then
 * expect that every editing feature will consider them when processing the model. It is also unrealistic to expect
 * that it will be done automatically by the schema and the editing engine themselves.
 *
 * For instance, let's get back to the "element `<x>` must be always followed by `<y>`" rule and this initial content:
 *
 *		<$root>
 *			<x>foo</x>
 *			<y>bar[bom</y>
 *			<z>bom]bar</z>
 *		</$root>
 *
 * Now, imagine the user presses the "block quote" button. Usually it would wrap the two selected blocks (`<y>` and `<z>`)
 * with a `<blockQuote>` element:
 *
 *		<$root>
 *			<x>foo</x>
 *			<blockQuote>
 *				<y>bar[bom</y>
 *				<z>bom]bar</z>
 *			</blockQuote>
 *		</$root>
 *
 * But it turns out that this creates an incorrect structure – `<x>` is not followed by `<y>` anymore.
 *
 * What should happen instead? There are at least 4 possible solutions: the block quote feature should not be
 * applicable in such a context, someone should create a new `<y>` right after `<x>`, `<x>` should be moved
 * inside `<blockQuote>` together with `<y>` or vice versa.
 *
 * While this is a relatively simple scenario (unlike most real-time collaboration scenarios),
 * it turns out that it's already hard to say what should happen and who should react to fix this content.
 *
 * Therefore, if your editor needs to implement such rules, it should do that through model's post-fixers
 * fixing incorrect content according to the rules that you'll define or actively prevent such situations
 * (e.g. by disabling certain features). It means that those constraints will be defined specifically for your
 * scenario by your code which answers the two problems that we had with generic rules – "who?" and "how?".
 *
 * @mixes module:utils/emittermixin~ObservableMixin
 */
export default class Schema {
	/**
	 * Creates schema instance.
	 */
	constructor() {
		this._sourceRules = {};

		// TODO docs
		this.decorate( 'checkChild' );
		this.decorate( 'checkAttribute' );

		this.on( 'checkAttribute', ( evt, args ) => {
			args[ 0 ] = new SchemaContext( args[ 0 ] );
		}, { priority: 'highest' } );

		this.on( 'checkChild', ( evt, args ) => {
			args[ 0 ] = new SchemaContext( args[ 0 ] );
		}, { priority: 'highest' } );
	}

	/**
	 * Registers schema item. Can only be called once for every item name.
	 *
	 * @param {String} itemName
	 * @param {module:engine/model/schema~SchemaRuleDefintion} rules
	 */
	register( itemName, rules ) {
		if ( this._sourceRules[ itemName ] ) {
			// TODO docs
			throw new CKEditorError( 'schema-cannot-register-item-twice: A single item cannot be registered twice in the schema.', {
				itemName
			} );
		}

		this._sourceRules[ itemName ] = [
			Object.assign( {}, rules )
		];

		this._clearCache();
	}

	/**
	 * Extends a {@link #register registered} item's rules.
	 *
	 * Extending properties such as `allowIn` will add more items to the existing properties,
	 * while redefining properties such as `isBlock` will override the previously defined ones.
	 *
	 *		schema.register( 'foo', {
	 *			allowIn: '$root',
	 *			isBlock: true;
	 *		} );
	 *		schema.extend( 'foo', {
	 *			allowIn: 'blockQuote',
	 *			isBlock: false
	 *		} );
	 *
	 *		schema.getRule( 'foo' );
	 *		//	{
	 *		//		allowIn: [ '$root', 'blockQuote' ],
	 *		// 		isBlock: false
	 *		//	}
	 *
	 * @param {String} itemName
	 * @param {module:engine/model/schema~SchemaRuleDefintion} rules
	 */
	extend( itemName, rules ) {
		if ( !this._sourceRules[ itemName ] ) {
			// TODO docs
			throw new CKEditorError( 'schema-cannot-extend-missing-item: Cannot extend an item which was not registered yet.', {
				itemName
			} );
		}

		this._sourceRules[ itemName ].push( Object.assign( {}, rules ) );

		this._clearCache();
	}

	/**
	 * Returns all registered items.
	 *
	 * @returns {Object.<String,module:engine/model/schema~SchemaRuleDefintion>}
	 */
	getRules() {
		if ( !this._compiledRules ) {
			this._compile();
		}

		return this._compiledRules;
	}

	/**
	 * Returns a definition of the given item or `undefined` if item is not registered.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 * @returns {module:engine/model/schema~SchemaRuleDefintion}
	 */
	getRule( item ) {
		let itemName;

		if ( typeof item == 'string' ) {
			itemName = item;
		} else if ( item.is && ( item.is( 'text' ) || item.is( 'textProxy' ) ) ) {
			itemName = '$text';
		}
		// Element or module:engine/model/schema~SchemaContextItem.
		else {
			itemName = item.name;
		}

		return this.getRules()[ itemName ];
	}

	/**
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isRegistered( item ) {
		return !!this.getRule( item );
	}

	/**
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isBlock( item ) {
		const rule = this.getRule( item );

		return !!( rule && rule.isBlock );
	}

	/**
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isLimit( item ) {
		const rule = this.getRule( item );

		return !!( rule && rule.isLimit );
	}

	/**
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isObject( item ) {
		const rule = this.getRule( item );

		return !!( rule && rule.isObject );
	}

	/**
	 * @param {SchemaContextDefinition} context
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
	 * @param {SchemaContextDefinition} context
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

		while ( !this.isLimit( element ) ) {
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
 * @typedef {Object} module:engine/model/schema~SchemaRuleDefinition
 */

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
	 * Returns an iterator that iterates over all context items.
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

/**
 * TODO
 *
 * @typedef {module:engine/model/node~Node|module:engine/model/position~Position|
 * Array.<String|module:engine/model/node~Node>} module:engine/model/schema~SchemaContextDefinition
 */

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
