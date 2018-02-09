/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/schema
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

import Range from './range';
import Position from './position';
import Element from './element';
import TreeWalker from './treewalker';

/**
 * The model's schema. It defines allowed and disallowed structures of nodes as well as nodes' attributes.
 * The schema is usually defined by features and based on them the editing framework and features
 * make decisions how to change and process the model.
 *
 * The instance of schema is available in {@link module:engine/model/model~Model#schema `editor.model.schema`}.
 *
 * # Schema definitions
 *
 * Schema defines allowed model structures and allowed attributes separately. They are also checked separately
 * by using the {@link ~Schema#checkChild} and {@link ~Schema#checkAttribute} methods.
 *
 * ## Defining allowed structures
 *
 * When a feature introduces a model element it should register it in the schema. Besides
 * defining that such an element may exist in the model, the feature also needs to define where
 * this element may be placed:
 *
 *		schema.register( 'myElement', {
 *			allowIn: '$root'
 *		} );
 *
 * This lets the schema know that `<myElement>` may be a child of the `<$root>` element. `$root` is one of generic
 * nodes defined by the editing framework. By default, the editor names the main root element a `<$root>`,
 * so the above definition allows `<myElement>` in the main editor element.
 *
 * In other words, this would be correct:
 *
 *		<$root><myElement></myElement></$root>
 *
 * While this would not be correct:
 *
 *		<$root><foo><myElement></myElement></foo></$root>
 *
 * ## Generic items
 *
 * There are three basic generic items: `$root`, `$block` and `$text`.
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
 * These definitions can then be reused by features to create their own definitions in a more extensible way.
 * For example, the {@link module:paragraph/paragraph~Paragraph} feature will define its item as:
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
 * Thanks to the fact that `<paragraph>`'s definition is inherited from `<$block>` other features can use the `<$block>`
 * type to indirectly extend `<paragraph>`'s definition. For example, the {@link module:block-quote/blockquote~BlockQuote}
 * feature does this:
 *
 *		schema.register( 'blockQuote', {
 *			allowWhere: '$block',
 *			allowContentOf: '$root'
 *		} );
 *
 * Thanks to that, despite the fact that block quote and paragraph features know nothing about themselves, paragraphs
 * will be allowed in block quotes and block quotes will be allowed in all places where blocks are. So if anyone will
 * register a `<section>` element (with `allowContentOf: '$root'` rule), that `<section>` elements will allow
 * block quotes too.
 *
 * The side effect of such a definition inheritance is that now `<blockQuote>` is allowed in `<blockQuote>` which needs to be
 * resolved by a callback which will disallow this specific structure.
 *
 * You can read more about the format of an item definition in {@link module:engine/model/schema~SchemaItemDefinition}.
 *
 * ## Defining advanced rules in `checkChild()`'s callbacks
 *
 * The {@link ~Schema#checkChild} method which is the base method used to check whether some element is allowed in a given structure
 * is {@link module:utils/observablemixin~ObservableMixin#decorate a decorated method}.
 * It means that you can add listeners to implement your specific rules which are not limited by the declarative
 * {@link module:engine/model/schema~SchemaItemDefinition API}.
 *
 * Those listeners can be added either by listening directly to the {@link ~Schema#event:checkChild} event or
 * by using the handy {@link ~Schema#addChildCheck} method.
 *
 * For instance, the block quote feature defines such a listener to disallow nested `<blockQuote>` structures:
 *
 *		schema.addChildCheck( context, childDefinition ) => {
 *			// Note that context is automatically normalized to SchemaContext instance and
 *			// child to its definition (SchemaCompiledItemDefinition).
 *
 *			// If checkChild() is called with a context that ends with blockQuote and blockQuote as a child
 *			// to check, make the checkChild() method return false.
 *			if ( context.endsWith( 'blockQuote' ) && childDefinition.name == 'blockQuote' ) {
 *				return false;
 *			}
 *		} );
 *
 * ## Defining attributes
 *
 * TODO
 *
 * ## Implementing additional constraints
 *
 * Schema's capabilities were limited to simple (and atomic) {@link ~Schema#checkChild} and
 * {@link ~Schema#checkAttribute} checks on purpose.
 * One may imagine that schema should support defining more complex rules such as
 * "element `<x>` must be always followed by `<y>`".
 * While it is feasible to create an API which would enable feeding the schema with such definitions,
 * it is unfortunately unrealistic to then expect that every editing feature will consider those rules when processing the model.
 * It is also unrealistic to expect that it will be done automatically by the schema and the editing engine themselves.
 *
 * For instance, let's get back to the "element `<x>` must be always followed by `<y>`" rule and this initial content:
 *
 *		<$root>
 *			<x>foo</x>
 *			<y>bar[bom</y>
 *			<z>bom]bar</z>
 *		</$root>
 *
 * Now, imagine that the user presses the "block quote" button. Usually it would wrap the two selected blocks
 * (`<y>` and `<z>`) with a `<blockQuote>` element:
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
 * Therefore, if your editor needs to implement such rules, you should do that through model's post-fixers
 * fixing incorrect content or actively prevent such situations (e.g. by disabling certain features).
 * It means that those constraints will be defined specifically for your scenario by your code which
 * makes their implementation much easier.
 *
 * So the answer for who and how should implement additional constraints is your features or your editor
 * through CKEditor 5's rich and open API.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Schema {
	/**
	 * Creates schema instance.
	 */
	constructor() {
		this._sourceDefinitions = {};

		this.decorate( 'checkChild' );
		this.decorate( 'checkAttribute' );

		this.on( 'checkAttribute', ( evt, args ) => {
			args[ 0 ] = new SchemaContext( args[ 0 ] );
		}, { priority: 'highest' } );

		this.on( 'checkChild', ( evt, args ) => {
			args[ 0 ] = new SchemaContext( args[ 0 ] );
			args[ 1 ] = this.getDefinition( args[ 1 ] );
		}, { priority: 'highest' } );
	}

	/**
	 * Registers schema item. Can only be called once for every item name.
	 *
	 *		schema.register( 'paragraph', {
	 *			inheritAllFrom: '$block'
	 *		} );
	 *
	 * @param {String} itemName
	 * @param {module:engine/model/schema~SchemaItemDefinition} definition
	 */
	register( itemName, definition ) {
		if ( this._sourceDefinitions[ itemName ] ) {
			// TODO docs
			throw new CKEditorError( 'schema-cannot-register-item-twice: A single item cannot be registered twice in the schema.', {
				itemName
			} );
		}

		this._sourceDefinitions[ itemName ] = [
			Object.assign( {}, definition )
		];

		this._clearCache();
	}

	/**
	 * Extends a {@link #register registered} item's definition.
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
	 *		schema.getDefinition( 'foo' );
	 *		//	{
	 *		//		allowIn: [ '$root', 'blockQuote' ],
	 *		// 		isBlock: false
	 *		//	}
	 *
	 * @param {String} itemName
	 * @param {module:engine/model/schema~SchemaItemDefinition} definition
	 */
	extend( itemName, definition ) {
		if ( !this._sourceDefinitions[ itemName ] ) {
			// TODO docs
			throw new CKEditorError( 'schema-cannot-extend-missing-item: Cannot extend an item which was not registered yet.', {
				itemName
			} );
		}

		this._sourceDefinitions[ itemName ].push( Object.assign( {}, definition ) );

		this._clearCache();
	}

	/**
	 * Returns all registered items.
	 *
	 * @returns {Object.<String,module:engine/model/schema~SchemaCompiledItemDefinition>}
	 */
	getDefinitions() {
		if ( !this._compiledDefinitions ) {
			this._compile();
		}

		return this._compiledDefinitions;
	}

	/**
	 * Returns a definition of the given item or `undefined` if item is not registered.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 * @returns {module:engine/model/schema~SchemaCompiledItemDefinition}
	 */
	getDefinition( item ) {
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

		return this.getDefinitions()[ itemName ];
	}

	/**
	 * Returns `true` if the given item is registered in the schema.
	 *
	 *		schema.isRegistered( 'paragraph' ); // -> true
	 *		schema.isRegistered( editor.model.document.getRoot() ); // -> true
	 *		schema.isRegistered( 'foo' ); // -> false
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isRegistered( item ) {
		return !!this.getDefinition( item );
	}

	/**
	 * Returns `true` if the given item is defined to be
	 * a block by {@link module:engine/model/schema~SchemaItemDefinition}'s `isBlock` property.
	 *
	 *		schema.isBlock( 'paragraph' ); // -> true
	 *		schema.isBlock( '$root' ); // -> false
	 *
	 *		const paragraphElement = writer.createElement( 'paragraph' );
	 *		schema.isBlock( paragraphElement ); // -> true
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isBlock( item ) {
		const def = this.getDefinition( item );

		return !!( def && def.isBlock );
	}

	/**
	 * Returns `true` if the given item is defined to be
	 * a limit element by {@link module:engine/model/schema~SchemaItemDefinition}'s `isLimit` property.
	 *
	 *		schema.isLimit( 'paragraph' ); // -> false
	 *		schema.isLimit( '$root' ); // -> true
	 *		schema.isLimit( editor.model.document.getRoot() ); // -> true
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isLimit( item ) {
		const def = this.getDefinition( item );

		return !!( def && def.isLimit );
	}

	/**
	 * Returns `true` if the given item is defined to be
	 * a object element by {@link module:engine/model/schema~SchemaItemDefinition}'s `isObject` property.
	 *
	 *		schema.isObject( 'paragraph' ); // -> false
	 *		schema.isObject( 'image' ); // -> true
	 *
	 *		const imageElement = writer.createElement( 'image' );
	 *		schema.isObject( imageElement ); // -> true
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isObject( item ) {
		const def = this.getDefinition( item );

		return !!( def && def.isObject );
	}

	/**
	 * Checks whether the given node (`child`) can be a child of the given context.
	 *
	 *		schema.checkChild( model.document.getRoot(), paragraph ); // -> false
	 *
	 *		schema.register( 'paragraph', {
	 *			allowIn: '$root'
	 *		} );
	 *		schema.checkChild( model.document.getRoot(), paragraph ); // -> true
	 *
	 * @fires checkChild
	 * @param {module:engine/model/schema~SchemaContextDefinition} context Context in which the child will be checked.
	 * @param {module:engine/model/node~Node|String} def The child to check.
	 */
	checkChild( context, def ) {
		// Note: context and child are already normalized here to a SchemaContext and SchemaCompiledItemDefinition.
		if ( !def ) {
			return false;
		}

		return this._checkContextMatch( def, context );
	}

	/**
	 * Checks whether the given attribute can be applied in the given context (on the last
	 * item of the context).
	 *
	 *		schema.checkAttribute( textNode, 'bold' ); // -> false
	 *
	 *		schema.extend( '$text', {
	 *			allowAttributes: 'bold'
	 *		} );
	 *		schema.checkAttribute( textNode, 'bold' ); // -> true
	 *
	 * @fires checkAttribute
	 * @param {module:engine/model/schema~SchemaContextDefinition} context Context in which the attribute will be checked.
	 * @param {String} attributeName
	 */
	checkAttribute( context, attributeName ) {
		const def = this.getDefinition( context.last );

		if ( !def ) {
			return false;
		}

		return def.allowAttributes.includes( attributeName );
	}

	/**
	 * Checks whether the given element (`elementToMerge`) can be merged with the specified base element (`positionOrBaseElement`).
	 *
	 * In other words – whether `elementToMerge`'s children {@link #checkChild are allowed} in the `positionOrBaseElement`.
	 *
	 * This check ensures that elements merged with {@link module:engine/model/writer~Writer#merge `Writer#merge()`}
	 * will be valid.
	 *
	 * Instead of elements, you can pass the instance of {@link module:engine/model/position~Position} class as the `positionOrBaseElement`.
	 * It means that the elements before and after the position will be checked whether they can be merged.
	 *
	 * @param {module:engine/model/position~Position|module:engine/model/element~Element} positionOrBaseElement The position or base
	 * element to which the `elementToMerge` will be merged.
	 * @param {module:engine/model/element~Element} elementToMerge The element to merge. Required if `positionOrBaseElement` is a element.
	 * @returns {Boolean}
	 */
	checkMerge( positionOrBaseElement, elementToMerge = null ) {
		if ( positionOrBaseElement instanceof Position ) {
			const nodeBefore = positionOrBaseElement.nodeBefore;
			const nodeAfter = positionOrBaseElement.nodeAfter;

			if ( !( nodeBefore instanceof Element ) ) {
				/**
				 * The node before the merge position must be an element.
				 *
				 * @error schema-check-merge-no-element-before
				 */
				throw new CKEditorError( 'schema-check-merge-no-element-before: The node before the merge position must be an element.' );
			}

			if ( !( nodeAfter instanceof Element ) ) {
				/**
				 * The node after the merge position must be an element.
				 *
				 * @error schema-check-merge-no-element-after
				 */
				throw new CKEditorError( 'schema-check-merge-no-element-after: The node after the merge position must be an element.' );
			}

			return this.checkMerge( nodeBefore, nodeAfter );
		}

		for ( const child of elementToMerge.getChildren() ) {
			if ( !this.checkChild( positionOrBaseElement, child ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Allows registering a callback to the {@link #checkChild} method calls.
	 *
	 * Callbacks allow you to implement rules which are not otherwise possible to achieve
	 * by using the declarative API of {@link module:engine/model/schema~SchemaItemDefinition}.
	 * For example, by using this method you can disallow elements in specific contexts.
	 *
	 * This method is a shorthand for using the {@link #event:checkChild} event. For even better control,
	 * you can use that event instead.
	 *
	 * Example:
	 *
	 *		// Disallow heading1 directly inside a blockQuote.
	 *		schema.addChildCheck( ( context, childDefinition ) => {
	 *			if ( context.endsWith( 'blockQuote' ) && childDefinition.name == 'heading1' ) {
	 *				return false;
	 *			}
	 *		} );
	 *
	 * Which translates to:
	 *
	 *		schema.on( 'checkChild', ( evt, args ) => {
	 *			const context = args[ 0 ];
	 *			const childDefinition = args[ 1 ];
	 *
	 *			if ( context.endsWith( 'blockQuote' ) && childDefinition && childDefinition.name == 'heading1' ) {
	 *				// Prevent next listeners from being called.
	 *				evt.stop();
	 *				// Set the checkChild()'s return value.
	 *				evt.return = false;
	 *			}
	 *		}, { priority: 'high' } );
	 *
	 * @param {Function} callback The callback to be called. It is called with two parameters:
	 * {@link module:engine/model/schema~SchemaContext} (context) instance and
	 * {@link module:engine/model/schema~SchemaCompiledItemDefinition} (child-to-check definition).
	 * The callback may return `true/false` to override `checkChild()`'s return value. If it does not return
	 * a boolean value, the default algorithm (or other callbacks) will define `checkChild()`'s return value.
	 */
	addChildCheck( callback ) {
		this.on( 'checkChild', ( evt, [ ctx, childDef ] ) => {
			// checkChild() was called with a non-registered child.
			// In 99% cases such check should return false, so not to overcomplicate all callbacks
			// don't even execute them.
			if ( !childDef ) {
				return;
			}

			const retValue = callback( ctx, childDef );

			if ( typeof retValue == 'boolean' ) {
				evt.stop();
				evt.return = retValue;
			}
		}, { priority: 'high' } );
	}

	/**
	 * Allows registering a callback to the {@link #checkAttribute} method calls.
	 *
	 * Callbacks allow you to implement rules which are not otherwise possible to achieve
	 * by using the declarative API of {@link module:engine/model/schema~SchemaItemDefinition}.
	 * For example, by using this method you can disallow attribute if node to which it is applied
	 * is contained within some other element (e.g. you want to disallow `bold` on `$text` within `heading1`).
	 *
	 * This method is a shorthand for using the {@link #event:checkAttribute} event. For even better control,
	 * you can use that event instead.
	 *
	 * Example:
	 *
	 *		// Disallow bold on $text inside heading1.
	 *		schema.addChildCheck( ( context, attributeName ) => {
	 *			if ( context.endsWith( 'heading1 $text' ) && attributeName == 'bold' ) {
	 *				return false;
	 *			}
	 *		} );
	 *
	 * Which translates to:
	 *
	 *		schema.on( 'checkAttribute', ( evt, args ) => {
	 *			const context = args[ 0 ];
	 *			const attributeName = args[ 1 ];
	 *
	 *			if ( context.endsWith( 'heading1 $text' ) && attributeName == 'bold' ) {
	 *				// Prevent next listeners from being called.
	 *				evt.stop();
	 *				// Set the checkAttribute()'s return value.
	 *				evt.return = false;
	 *			}
	 *		}, { priority: 'high' } );
	 *
	 * @param {Function} callback The callback to be called. It is called with two parameters:
	 * {@link module:engine/model/schema~SchemaContext} (context) instance and attribute name.
	 * The callback may return `true/false` to override `checkAttribute()`'s return value. If it does not return
	 * a boolean value, the default algorithm (or other callbacks) will define `checkAttribute()`'s return value.
	 */
	addAttributeCheck( callback ) {
		this.on( 'checkAttribute', ( evt, [ ctx, attributeName ] ) => {
			const retValue = callback( ctx, attributeName );

			if ( typeof retValue == 'boolean' ) {
				evt.stop();
				evt.return = retValue;
			}
		}, { priority: 'high' } );
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
			.reduce( ( element, range ) => {
				const rangeCommonAncestor = range.getCommonAncestor();

				if ( !element ) {
					return rangeCommonAncestor;
				}

				return element.getCommonAncestor( rangeCommonAncestor, { includeSelf: true } );
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
	 * Transforms the given set of ranges into a set of ranges where the given attribute is allowed (and can be applied).
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
	 * Basing on given `position`, finds and returns a {@link module:engine/model/range~Range Range} instance that is
	 * nearest to that `position` and is a correct range for selection.
	 *
	 * Correct selection range might be collapsed - when it's located in position where text node can be placed.
	 * Non-collapsed range is returned when selection can be placed around element marked as "object" in
	 * {@link module:engine/model/schema~Schema schema}.
	 *
	 * Direction of searching for nearest correct selection range can be specified as:
	 * * `both` - searching will be performed in both ways,
	 * * `forward` - searching will be performed only forward,
	 * * `backward` - searching will be performed only backward.
	 *
	 * When valid selection range cannot be found, `null` is returned.
	 *
	 * @param {module:engine/model/position~Position} position Reference position where new selection range should be looked for.
	 * @param {'both'|'forward'|'backward'} [direction='both'] Search direction.
	 * @returns {module:engine/model/range~Range|null} Nearest selection range or `null` if one cannot be found.
	 */
	getNearestSelectionRange( position, direction = 'both' ) {
		// Return collapsed range if provided position is valid.
		if ( this.checkChild( position, '$text' ) ) {
			return new Range( position );
		}

		let backwardWalker, forwardWalker;

		if ( direction == 'both' || direction == 'backward' ) {
			backwardWalker = new TreeWalker( { startPosition: position, direction: 'backward' } );
		}

		if ( direction == 'both' || direction == 'forward' ) {
			forwardWalker = new TreeWalker( { startPosition: position } );
		}

		for ( const data of combineWalkers( backwardWalker, forwardWalker ) ) {
			const type = ( data.walker == backwardWalker ? 'elementEnd' : 'elementStart' );
			const value = data.value;

			if ( value.type == type && this.isObject( value.item ) ) {
				return Range.createOn( value.item );
			}

			if ( this.checkChild( value.nextPosition, '$text' ) ) {
				return new Range( value.nextPosition );
			}
		}

		return null;
	}

	/**
	 * Tries to find position ancestors that allows to insert given node.
	 * It starts searching from the given position and goes node by node to the top of the model tree
	 * as long as {@link module:engine/model/schema~Schema#isLimit limit element},
	 * {@link module:engine/model/schema~Schema#isObject object element} or top-most ancestor won't be reached.
	 *
	 * @params {module:engine/model/node~Node} node Node for which allowed parent should be found.
	 * @params {module:engine/model/position~Position} position Position from searching will start.
	 * @returns {module:engine/model/element~Element|null} element Allowed parent or null if nothing was found.
	 */
	findAllowedParent( node, position ) {
		let parent = position.parent;

		while ( parent ) {
			if ( this.checkChild( parent, node ) ) {
				return parent;
			}

			// Do not split limit elements and objects.
			if ( this.isLimit( parent ) || this.isObject( parent ) ) {
				return null;
			}

			parent = parent.parent;
		}

		return null;
	}

	/**
	 * Removes attributes disallowed by the schema.
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

	/**
	 * @private
	 */
	_clearCache() {
		this._compiledDefinitions = null;
	}

	/**
	 * @private
	 */
	_compile() {
		const compiledDefinitions = {};
		const sourceRules = this._sourceDefinitions;
		const itemNames = Object.keys( sourceRules );

		for ( const itemName of itemNames ) {
			compiledDefinitions[ itemName ] = compileBaseItemRule( sourceRules[ itemName ], itemName );
		}

		for ( const itemName of itemNames ) {
			compileAllowContentOf( compiledDefinitions, itemName );
		}

		for ( const itemName of itemNames ) {
			compileAllowWhere( compiledDefinitions, itemName );
		}

		for ( const itemName of itemNames ) {
			compileAllowAttributesOf( compiledDefinitions, itemName );
			compileInheritPropertiesFrom( compiledDefinitions, itemName );
		}

		for ( const itemName of itemNames ) {
			cleanUpAllowIn( compiledDefinitions, itemName );
			cleanUpAllowAttributes( compiledDefinitions, itemName );
		}

		this._compiledDefinitions = compiledDefinitions;
	}

	/**
	 * @private
	 * @param {module:engine/model/schema~SchemaCompiledItemDefinition} def
	 * @param {module:engine/model/schema~SchemaContext} context
	 * @param {Number} contextItemIndex
	 */
	_checkContextMatch( def, context, contextItemIndex = context.length - 1 ) {
		const contextItem = context.getItem( contextItemIndex );

		if ( def.allowIn.includes( contextItem.name ) ) {
			if ( contextItemIndex == 0 ) {
				return true;
			} else {
				const parentRule = this.getDefinition( contextItem );

				return this._checkContextMatch( parentRule, context, contextItemIndex - 1 );
			}
		} else {
			return false;
		}
	}
}

mix( Schema, ObservableMixin );

/**
 * Event fired when the {@link #checkChild} method is called. It allows plugging in
 * additional behavior – e.g. implementing rules which cannot be defined using the declarative
 * {@link module:engine/model/schema~SchemaItemDefinition} interface.
 *
 * **Note:** The {@link #addChildCheck} method is a more handy way to register callbacks. Internally,
 * it registers a listener to this event but comes with a simpler API and it is the recommended choice
 * in most of the cases.
 *
 * The {@link #checkChild} method fires an event because it is
 * {@link module:utils/observablemixin~ObservableMixin#decorate decorated} with it. Thanks to that you can
 * use this event in a various way, but the most important use case is overriding standard behaviour of the
 * `checkChild()` method. Let's see a typical listener template:
 *
 *		schema.on( 'checkChild', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const childDefinition = args[ 1 ];
 *		}, { priority: 'high' } );
 *
 * The listener is added with a `high` priority to be executed before the default method is really called. The `args` callback
 * parameter contains arguments passed to `checkChild( context, child )`. However, the `context` parameter is already
 * normalized to a {@link module:engine/model/schema~SchemaContext} instance and `child` to a
 * {@link module:engine/model/schema~SchemaCompiledItemDefinition} instance, so you don't have to worry about
 * the various ways how `context` and `child` may be passed to `checkChild()`.
 *
 * **Note:** `childDefinition` may be `undefined` if `checkChild()` was called with a non-registered element.
 *
 * So, in order to implement a rule "disallow `heading1` in `blockQuote`" you can add such a listener:
 *
 *		schema.on( 'checkChild', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const childDefinition = args[ 1 ];
 *
 *			if ( context.endsWith( 'blockQuote' ) && childDefinition && childDefinition.name == 'heading1' ) {
 *				// Prevent next listeners from being called.
 *				evt.stop();
 *				// Set the checkChild()'s return value.
 *				evt.return = false;
 *			}
 *		}, { priority: 'high' } );
 *
 * Allowing elements in specific contexts will be a far less common use case, because it's normally handled by
 * `allowIn` rule from {@link module:engine/model/schema~SchemaItemDefinition} but if you have a complex scenario
 * where `listItem` should be allowed only in element `foo` which must be in element `bar`, then this would be the way:
 *
 *		schema.on( 'checkChild', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const childDefinition = args[ 1 ];
 *
 *			if ( context.endsWith( 'bar foo' ) && childDefinition.name == 'listItem' ) {
 *				// Prevent next listeners from being called.
 *				evt.stop();
 *				// Set the checkChild()'s return value.
 *				evt.return = true;
 *			}
 *		}, { priority: 'high' } );
 *
 * @event checkChild
 * @param {Array} args The `checkChild()`'s arguments.
 */

/**
 * Event fired when the {@link #checkAttribute} method is called. It allows plugging in
 * additional behavior – e.g. implementing rules which cannot be defined using the declarative
 * {@link module:engine/model/schema~SchemaItemDefinition} interface.
 *
 * **Note:** The {@link #addAttributeCheck} method is a more handy way to register callbacks. Internally,
 * it registers a listener to this event but comes with a simpler API and it is the recommended choice
 * in most of the cases.
 *
 * The {@link #checkAttribute} method fires an event because it's
 * {@link module:utils/observablemixin~ObservableMixin#decorate decorated} with it. Thanks to that you can
 * use this event in a various way, but the most important use case is overriding standard behaviour of the
 * `checkAttribute()` method. Let's see a typical listener template:
 *
 *		schema.on( 'checkAttribute', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const attributeName = args[ 1 ];
 *		}, { priority: 'high' } );
 *
 * The listener is added with a `high` priority to be executed before the default method is really called. The `args` callback
 * parameter contains arguments passed to `checkAttribute( context, attributeName )`. However, the `context` parameter is already
 * normalized to a {@link module:engine/model/schema~SchemaContext} instance, so you don't have to worry about
 * the various ways how `context` may be passed to `checkAttribute()`.
 *
 * So, in order to implement a rule "disallow `bold` in a text which is in a `heading1` you can add such a listener:
 *
 *		schema.on( 'checkAttribute', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const atributeName = args[ 1 ];
 *
 *			if ( context.endsWith( 'heading1 $text' ) && attributeName == 'bold' ) {
 *				// Prevent next listeners from being called.
 *				evt.stop();
 *				// Set the checkAttribute()'s return value.
 *				evt.return = false;
 *			}
 *		}, { priority: 'high' } );
 *
 * Allowing attributes in specific contexts will be a far less common use case, because it's normally handled by
 * `allowAttributes` rule from {@link module:engine/model/schema~SchemaItemDefinition} but if you have a complex scenario
 * where `bold` should be allowed only in element `foo` which must be in element `bar`, then this would be the way:
 *
 *		schema.on( 'checkAttribute', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const atributeName = args[ 1 ];
 *
 *			if ( context.endsWith( 'bar foo $text' ) && attributeName == 'bold' ) {
 *				// Prevent next listeners from being called.
 *				evt.stop();
 *				// Set the checkAttribute()'s return value.
 *				evt.return = true;
 *			}
 *		}, { priority: 'high' } );
 *
 * @event checkAttribute
 * @param {Array} args The `checkAttribute()`'s arguments.
 */

/**
 * A definition of a {@link module:engine/model/schema~Schema schema} item.
 *
 * You can define the following rules:
 *
 * * `allowIn` – a string or an array of strings. Defines in which other items this item will be allowed.
 * * `allowAttributes` – a string or an array of strings. Defines allowed attributes of the given item.
 * * `allowContentOf` – a string or an array of strings. Inherit "allowed children" from other items.
 * * `allowWhere` – a string or an array of strings. Inherit "allowed in" from other items.
 * * `allowAttributesOf` – a string or an array of strings. Inherit attributes from other items.
 * * `inheritTypesFrom` – a string or an array of strings. Inherit `is*` properties of other items.
 * * `inheritAllFrom` – a string. A shorthand for `allowContentOf`, `allowWhere`, `allowAttributesOf`, `inheritTypesFrom`.
 * * additionall, you can define the following `is*` properties: `isBlock`, `isLimit`, `isObject`. Read about them below.
 *
 * # The is* properties
 *
 * There are 3 commonly used `is*` properties. Their role is to assign additional semantics to schema items.
 * You can define more properties but you will also need to implement support for them in the existing editor features.
 *
 * * `isBlock` – whether this item is paragraph-like. Generally speaking, a content is usually made out of blocks
 * like paragraphs, list items, images, headings, etc. All these elements are marked as blocks. A block
 * should not allow another block inside. Note: there's also the `$block` generic item which has `isBlock` set to `true`.
 * Most block type items will inherit from `$block` (through `inheritAllFrom`).
 * * `isLimit` – can be understood as whether this element should not be split by <kbd>Enter</kbd>.
 * Examples of limit elements – `$root`, table cell, image caption, etc. In other words, all actions which happen inside
 * a limit element are limitted to its content.
 * * `isObject` – whether item is "self-contained" and should be treated as a whole. Examples of object elements –
 * `image`, `table`, `video`, etc.
 *
 * # Generic items
 *
 * There are three basic generic items: `$root`, `$block` and `$text`.
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
 * They reflect a typical editor content which is contained within one root, consists of several blocks
 * (paragraphs, lists items, headings, images) which, in turn, may contain text inside.
 *
 * By inheriting from the generic items you can define new items which will get extended by other editor features.
 * Read more about generic types in the {@linkTODO Defining schema} guide.
 *
 * # Example definitions
 *
 * Allow `paragraph` in roots and block quotes:
 *
 *		schema.register( 'paragraph', {
 *			allowIn: [ '$root', 'blockQuote' ],
 *			isBlock: true
 *		} );
 *
 * Allow `paragraph` everywhere where `$block` is allowed (i.e. in `$root`):
 *
 *		schema.register( 'paragraph', {
 *			allowWhere: '$block',
 *			isBlock: true
 *		} );
 *
 * Make `image` a block object, which is allowed everywhere where `$block` is.
 * Also, allow `src` and `alt` attributes on it:
 *
 *		schema.register( 'image', {
 *			allowWhere: '$block',
 *			allowAttributes: [ 'src', 'alt' ],
 *			isBlock: true,
 *			isObject: true
 *		} );
 *
 * Make `caption` allowed in `image` and make it allow all the content of `$block`s (usually, `$text`).
 * Also, mark it as a limit element so it can't be split:
 *
 *		schema.register( 'caption', {
 *			allowIn: 'image',
 *			allowContentOf: '$block',
 *			isLimit: true
 *		} );
 *
 * Make `listItem` inherit all from `$block` but also allow additional attributes:
 *
 *		schema.register( 'listItem', {
 *			inheritAllFrom: '$block',
 *			allowAttributes: [ 'type', 'indent' ]
 *		} );
 *
 * Which translates to:
 *
 *		schema.register( 'listItem', {
 *			allowWhere: '$block',
 *			allowContentOf: '$block',
 *			allowAttributesOf: '$block',
 *			inheritTypesFrom: '$block',
 *			allowAttributes: [ 'type', 'indent' ]
 *		} );
 *
 * # Tips
 *
 * * Check schema definitions of existing features to see how they are defined.
 * * If you want to publish your feature so other developers can use it, try to use
 * generic items as much as possible.
 * * Keep your model clean – limit it to the actual data and store information in an normalized way.
 * * Remember about definining the `is*` properties. They don't affect the allowed structures, but they can
 * affect how editor features treat your elements.
 *
 * @typedef {Object} module:engine/model/schema~SchemaItemDefinition
 */

/**
 * A simplified version of {@link module:engine/model/schema~SchemaItemDefinition} after
 * compilation by the {@link module:engine/model/schema~Schema schema}.
 * Rules feed to the schema by {@link module:engine/model/schema~Schema#register}
 * and {@link module:engine/model/schema~Schema#extend} are defined in the
 * {@link module:engine/model/schema~SchemaItemDefinition} format.
 * Later on, they are compiled to `SchemaCompiledItemDefition` so when you use e.g.
 * the {@link module:engine/model/schema~Schema#getDefinition} method you get the compiled version.
 *
 * The compiled version contains only the following properties:
 *
 * * `name` property,
 * * `is*` properties,
 * * `allowIn` array,
 * * `allowAttributes` array.
 *
 * @typedef {Object} module:engine/model/schema~SchemaCompiledItemDefinition
 */

/**
 * A schema context – a list of ancestors of a given position in the document.
 *
 * Considering such a position:
 *
 *		<$root>
 *			<blockQuote>
 *				<paragraph>
 *					^
 *				</paragraph>
 *			</blockQuote>
 *		</$root>
 *
 * The context of this position is its {@link module:engine/model/position~Position#getAncestors lists of ancestors}:
 *
 *		[ rootElement, blockQuoteElement, paragraphElement ]
 *
 * Contexts are used in the {@link module:engine/model/schema~Schema#event:checkChild `Schema#checkChild`} and
 * {@link module:engine/model/schema~Schema#event:checkAttribute `Schema#checkAttribute`} events as a definition
 * of a place in the document where the check occurs. The context instances are created based on the first arguments
 * of the {@link module:engine/model/schema~Schema#checkChild `Schema#checkChild()`} and
 * {@link module:engine/model/schema~Schema#checkAttribute `Schema#checkAttribute()`} methods so when
 * using these methods you need to use {@link module:engine/model/schema~SchemaContextDefinition}s.
 */
export class SchemaContext {
	/**
	 * Creates an instance of the context.
	 *
	 * @param {module:engine/model/schema~SchemaContextDefinition} context
	 */
	constructor( context ) {
		if ( context instanceof SchemaContext ) {
			return context;
		}

		if ( typeof context == 'string' ) {
			context = [ context ];
		} else if ( !Array.isArray( context ) ) {
			// `context` is item or position.
			// Position#getAncestors() doesn't accept any parameters but it works just fine here.
			context = context.getAncestors( { includeSelf: true } );
		}

		if ( context[ 0 ] && typeof context[ 0 ] != 'string' && context[ 0 ].is( 'documentFragment' ) ) {
			context.shift();
		}

		this._items = context.map( mapContextItem );
	}

	/**
	 * Number of items.
	 *
	 * @type {Number}
	 */
	get length() {
		return this._items.length;
	}

	/**
	 * The last item (the lowest node).
	 *
	 * @type {module:engine/model/schema~SchemaContextItem}
	 */
	get last() {
		return this._items[ this._items.length - 1 ];
	}

	/**
	 * Iterable interface.
	 *
	 * Iterates over all context items.
	 *
	 * @returns {Iterable.<module:engine/model/schema~SchemaContextItem>}
	 */
	[ Symbol.iterator ]() {
		return this._items[ Symbol.iterator ]();
	}

	/**
	 * Returns new SchemaContext instance with additional item
	 *
	 * Item can be added as:
	 *
	 * 		const context = new SchemaContext( [ '$root' ] );
	 *
	 * 		// An element.
	 * 		const fooElement = writer.createElement( 'fooElement' );
	 * 		const newContext = context.push( fooElement ); // [ '$root', 'fooElement' ]
	 *
	 * 		// A text node.
	 * 		const text = writer.createText( 'foobar' );
	 * 		const newContext = context.push( text ); // [ '$root', '$text' ]
	 *
	 * 		// A string (element name).
	 * 		const newContext = context.push( 'barElement' ); // [ '$root', 'barElement' ]
	 *
	 * **Note** {module:engine/model/node~Node} that is already in the model tree will be added as the only item (without ancestors).
	 *
	 * @param {String|module:engine/model/node~Node|Array<String|module:engine/model/node~Node>} item Item that will be added
	 * to current context.
	 * @returns {module:engine/model/schema~SchemaContext} New SchemaContext instance with additional item.
	 */
	push( item ) {
		const ctx = new SchemaContext( [ item ] );

		ctx._items = [ ...this._items, ...ctx._items ];

		return ctx;
	}

	/**
	 * Gets an item on the given index.
	 *
	 * @returns {module:engine/model/schema~SchemaContextItem}
	 */
	getItem( index ) {
		return this._items[ index ];
	}

	/**
	 * Returns the names of items.
	 *
	 * @returns {Iterable.<String>}
	 */
	* getNames() {
		yield* this._items.map( item => item.name );
	}

	/**
	 * Checks whether the context ends with the given nodes.
	 *
	 *		const ctx = new SchemaContext( [ rootElement, paragraphElement, textNode ] );
	 *
	 *		ctx.endsWith( '$text' ); // -> true
	 *		ctx.endsWith( 'paragraph $text' ); // -> true
	 *		ctx.endsWith( '$root' ); // -> false
	 *		ctx.endsWith( 'paragraph' ); // -> false
	 *
	 * @param {String} query
	 * @returns {Boolean}
	 */
	endsWith( query ) {
		return Array.from( this.getNames() ).join( ' ' ).endsWith( query );
	}
}

/**
 * The definition of a {@link module:engine/model/schema~SchemaContext schema context}.
 *
 * Contexts can be created in multiple ways:
 *
 * * By defining a **node** – in this cases this node and all its ancestors will be used.
 * * By defining a **position** in the document – in this case all its ancestors will be used.
 * * By defining an **array of nodes** – in this case this array defines the entire context.
 * * By defining a **name of node** - in this case node will be "mocked". It is not recommended because context
 * will be unrealistic (e.g. attributes of these nodes are not specified). However, at times this may be the only
 * way to define the context (e.g. when checking some hypothetical situation).
 * * By defining an **array of node names** (potentially, mixed with real nodes) – The same as **name of node**
 * but it is possible to create a path.
 * * By defining a {@link module:engine/model/schema~SchemaContext} instance - in this case the same instance as provided
 * will be return.
 *
 * Examples of context definitions passed to the {@link module:engine/model/schema~Schema#checkChild `Schema#checkChild()`}
 * method:
 *
 *		// Assuming that we have a $root > blockQuote > paragraph structure, the following code
 *		// will check node 'foo' in the following context:
 *		// [ rootElement, blockQuoteElement, paragraphElement ]
 *		const contextDefinition = paragraphElement;
 * 		const childToCheck = 'foo';
 *		schema.checkChild( contextDefinition, childToCheck );
 *
 *		// Also check in [ rootElement, blockQuoteElement, paragraphElement ].
 *		schema.checkChild( Position.createAt( paragraphElement ), 'foo' );
 *
 *		// Check in [ rootElement, paragraphElement ].
 *		schema.checkChild( [ rootElement, paragraphElement ], 'foo' );
 *
 *		// Check only fakeParagraphElement.
 *		schema.checkChild( 'paragraph', 'foo' );
 *
 *		// Check in [ fakeRootElement, fakeBarElement, paragraphElement ].
 *		schema.checkChild( [ '$root', 'bar', paragraphElement ], 'foo' );
 *
 * All these `checkChild()` calls will fire {@link module:engine/model/schema~Schema#event:checkChild `Schema#checkChild`}
 * events in which `args[ 0 ]` is an instance of the context. Therefore, you can write a listener like this:
 *
 *		schema.on( 'checkChild', ( evt, args ) => {
 *			const ctx = args[ 0 ];
 *
 *			console.log( Array.from( ctx.getNames() ) );
 *		} );
 *
 * Which will log the following:
 *
 *		[ '$root', 'blockQuote', 'paragraph' ]
 *		[ '$root', 'paragraph' ]
 *		[ '$root', 'bar', 'paragraph' ]
 *
 * Note: When using the {@link module:engine/model/schema~Schema#checkAttribute `Schema#checkAttribute()`} method
 * you may want to check whether a text node may have an attribute. A {@link module:engine/model/text~Text} is a
 * correct way to define a context so you can do this:
 *
 *		schema.checkAttribute( textNode, 'bold' );
 *
 * But sometimes you want to check whether a text at a given position might've had some attribute,
 * in which case you can create a context by mising an array of elements with a `'$text'` string:
 *
 *		// Check in [ rootElement, paragraphElement, textNode ].
 *		schema.checkChild( [ ...positionInParagraph.getAncestors(), '$text' ], 'bold' );
 *
 * @typedef {module:engine/model/node~Node|module:engine/model/position~Position|module:engine/model/schema~SchemaContext|
 * String|Array.<String|module:engine/model/node~Node>} module:engine/model/schema~SchemaContextDefinition
 */

/**
 * An item of the {@link module:engine/model/schema~SchemaContext schema context}.
 *
 * It contains 3 properties:
 *
 * * `name` – the name of this item,
 * * `* getAttributeKeys()` – a generator of keys of item attributes,
 * * `getAttribute( keyName )` – a method to get attribute values.
 *
 * The context item interface is a highly simplified version of {@link module:engine/model/node~Node} and its role
 * is to expose only the information which schema checks are able to provide (which is the name of the node and
 * node's attributes).
 *
 *		schema.on( 'checkChild', ( evt, args ) => {
 *			const ctx = args[ 0 ];
 *			const firstItem = ctx.getItem( 0 );
 *
 *			console.log( firstItem.name ); // -> '$root'
 *			console.log( firstItem.getAttribute( 'foo' ) ); // -> 'bar'
 *			console.log( Array.from( firstItem.getAttributeKeys() ) ); // -> [ 'foo', 'faa' ]
 *		} );
 *
 * @typedef {Object} module:engine/model/schema~SchemaContextItem
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

function compileAllowContentOf( compiledDefinitions, itemName ) {
	for ( const allowContentOfItemName of compiledDefinitions[ itemName ].allowContentOf ) {
		// The allowContentOf property may point to an unregistered element.
		if ( compiledDefinitions[ allowContentOfItemName ] ) {
			const allowedChildren = getAllowedChildren( compiledDefinitions, allowContentOfItemName );

			allowedChildren.forEach( allowedItem => {
				allowedItem.allowIn.push( itemName );
			} );
		}
	}

	delete compiledDefinitions[ itemName ].allowContentOf;
}

function compileAllowWhere( compiledDefinitions, itemName ) {
	for ( const allowWhereItemName of compiledDefinitions[ itemName ].allowWhere ) {
		const inheritFrom = compiledDefinitions[ allowWhereItemName ];

		// The allowWhere property may point to an unregistered element.
		if ( inheritFrom ) {
			const allowedIn = inheritFrom.allowIn;

			compiledDefinitions[ itemName ].allowIn.push( ...allowedIn );
		}
	}

	delete compiledDefinitions[ itemName ].allowWhere;
}

function compileAllowAttributesOf( compiledDefinitions, itemName ) {
	for ( const allowAttributeOfItem of compiledDefinitions[ itemName ].allowAttributesOf ) {
		const inheritFrom = compiledDefinitions[ allowAttributeOfItem ];

		if ( inheritFrom ) {
			const inheritAttributes = inheritFrom.allowAttributes;

			compiledDefinitions[ itemName ].allowAttributes.push( ...inheritAttributes );
		}
	}

	delete compiledDefinitions[ itemName ].allowAttributesOf;
}

function compileInheritPropertiesFrom( compiledDefinitions, itemName ) {
	const item = compiledDefinitions[ itemName ];

	for ( const inheritPropertiesOfItem of item.inheritTypesFrom ) {
		const inheritFrom = compiledDefinitions[ inheritPropertiesOfItem ];

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
function cleanUpAllowIn( compiledDefinitions, itemName ) {
	const itemRule = compiledDefinitions[ itemName ];
	const existingItems = itemRule.allowIn.filter( itemToCheck => compiledDefinitions[ itemToCheck ] );

	itemRule.allowIn = Array.from( new Set( existingItems ) );
}

function cleanUpAllowAttributes( compiledDefinitions, itemName ) {
	const itemRule = compiledDefinitions[ itemName ];

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

function getAllowedChildren( compiledDefinitions, itemName ) {
	const itemRule = compiledDefinitions[ itemName ];

	return getValues( compiledDefinitions ).filter( def => def.allowIn.includes( itemRule.name ) );
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

// Generator function returning values from provided walkers, switching between them at each iteration. If only one walker
// is provided it will return data only from that walker.
//
// @param {module:engine/module/treewalker~TreeWalker} [backward] Walker iterating in backward direction.
// @param {module:engine/module/treewalker~TreeWalker} [forward] Walker iterating in forward direction.
// @returns {Iterable.<Object>} Object returned at each iteration contains `value` and `walker` (informing which walker returned
// given value) fields.
function* combineWalkers( backward, forward ) {
	let done = false;

	while ( !done ) {
		done = true;

		if ( backward ) {
			const step = backward.next();

			if ( !step.done ) {
				done = false;
				yield {
					walker: backward,
					value: step.value
				};
			}
		}

		if ( forward ) {
			const step = forward.next();

			if ( !step.done ) {
				done = false;
				yield {
					walker: forward,
					value: step.value
				};
			}
		}
	}
}
