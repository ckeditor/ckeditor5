/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
import Text from './text';
import TreeWalker from './treewalker';

/**
 * The model's schema. It defines allowed and disallowed structures of nodes as well as nodes' attributes.
 * The schema is usually defined by features and based on them the editing framework and features
 * make decisions how to change and process the model.
 *
 * The instance of schema is available in {@link module:engine/model/model~Model#schema `editor.model.schema`}.
 *
 * Read more about the schema in:
 *
 * * {@glink framework/guides/architecture/editing-engine#schema Schema} section of the
 * {@glink framework/guides/architecture/editing-engine Introduction to the Editing engine architecture}.
 * * {@glink framework/guides/deep-dive/schema Schema deep dive} guide.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Schema {
	/**
	 * Creates schema instance.
	 */
	constructor() {
		this._sourceDefinitions = {};

		/**
		 * A dictionary containing attribute properties.
		 *
		 * @private
		 * @member {Object.<String,String>}
		 */
		this._attributeProperties = {};

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
			/**
			 * A single item cannot be registered twice in the schema.
			 *
			 * This situation may happen when:
			 *
			 * * Two or more plugins called {@link #register `register()`} with the same name. This will usually mean that
			 * there is a collision between plugins which try to use the same element in the model. Unfortunately,
			 * the only way to solve this is by modifying one of these plugins to use a unique model element name.
			 * * A single plugin was loaded twice. This happens when it is installed by npm/yarn in two versions
			 * and usually means one or more of the following issues:
			 *     * a version mismatch (two of your dependencies require two different versions of this plugin),
			 *     * incorrect imports (this plugin is somehow imported twice in a way which confuses webpack),
			 *     * mess in `node_modules/` (`rm -rf node_modules/` may help).
			 *
			 * **Note:** Check the logged `itemName` to better understand which plugin was duplicated/conflicting.
			 *
			 * @param itemName The name of the model element that is being registered twice.
			 * @error schema-cannot-register-item-twice
			 */
			throw new CKEditorError(
				'schema-cannot-register-item-twice: A single item cannot be registered twice in the schema.',
				this,
				{
					itemName
				}
			);
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
			/**
			 * Cannot extend an item which was not registered yet.
			 *
			 * This error happens when a plugin tries to extend the schema definition of an item which was not
			 * {@link #register registered} yet.
			 *
			 * @param itemName The name of the model element which is being extended.
			 * @error schema-cannot-extend-missing-item
			 */
			throw new CKEditorError( 'schema-cannot-extend-missing-item: Cannot extend an item which was not registered yet.', this, {
				itemName
			} );
		}

		this._sourceDefinitions[ itemName ].push( Object.assign( {}, definition ) );

		this._clearCache();
	}

	/**
	 * Returns data of all registered items.
	 *
	 * This method should normally be used for reflection purposes (e.g. defining a clone of a certain element,
	 * checking a list of all block elements, etc).
	 * Use specific methods (such as {@link #checkChild `checkChild()`} or {@link #isLimit `isLimit()`})
	 * in other cases.
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
	 * Returns a definition of the given item or `undefined` if an item is not registered.
	 *
	 * This method should normally be used for reflection purposes (e.g. defining a clone of a certain element,
	 * checking a list of all block elements, etc).
	 * Use specific methods (such as {@link #checkChild `checkChild()`} or {@link #isLimit `isLimit()`})
	 * in other cases.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 * @returns {module:engine/model/schema~SchemaCompiledItemDefinition}
	 */
	getDefinition( item ) {
		let itemName;

		if ( typeof item == 'string' ) {
			itemName = item;
		} else if ( item.is && ( item.is( '$text' ) || item.is( '$textProxy' ) ) ) {
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
	 * a block by the {@link module:engine/model/schema~SchemaItemDefinition}'s `isBlock` property.
	 *
	 *		schema.isBlock( 'paragraph' ); // -> true
	 *		schema.isBlock( '$root' ); // -> false
	 *
	 *		const paragraphElement = writer.createElement( 'paragraph' );
	 *		schema.isBlock( paragraphElement ); // -> true
	 *
	 * See the {@glink framework/guides/deep-dive/schema#block-elements Block elements} section of the Schema deep dive
	 * guide for more details.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isBlock( item ) {
		const def = this.getDefinition( item );

		return !!( def && def.isBlock );
	}

	/**
	 * Returns `true` if the given item should be treated as a limit element.
	 *
	 * It considers an item to be a limit element if its
	 * {@link module:engine/model/schema~SchemaItemDefinition}'s
	 * {@link module:engine/model/schema~SchemaItemDefinition#isLimit `isLimit`} or
	 * {@link module:engine/model/schema~SchemaItemDefinition#isObject `isObject`} property
	 * was set to `true`.
	 *
	 *		schema.isLimit( 'paragraph' ); // -> false
	 *		schema.isLimit( '$root' ); // -> true
	 *		schema.isLimit( editor.model.document.getRoot() ); // -> true
	 *		schema.isLimit( 'image' ); // -> true
	 *
	 * See the {@glink framework/guides/deep-dive/schema#limit-elements Limit elements} section of the Schema deep dive
	 * guide for more details.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isLimit( item ) {
		const def = this.getDefinition( item );

		if ( !def ) {
			return false;
		}

		return !!( def.isLimit || def.isObject );
	}

	/**
	 * Returns `true` if the given item should be treated as an object element.
	 *
	 * It considers an item to be an object element if its
	 * {@link module:engine/model/schema~SchemaItemDefinition}'s
	 * {@link module:engine/model/schema~SchemaItemDefinition#isObject `isObject`} property
	 * was set to `true`.
	 *
	 *		schema.isObject( 'paragraph' ); // -> false
	 *		schema.isObject( 'image' ); // -> true
	 *
	 *		const imageElement = writer.createElement( 'image' );
	 *		schema.isObject( imageElement ); // -> true
	 *
	 * See the {@glink framework/guides/deep-dive/schema#object-elements Object elements} section of the Schema deep dive
	 * guide for more details.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isObject( item ) {
		const def = this.getDefinition( item );

		return !!( def && def.isObject );
	}

	/**
	 * Returns `true` if the given item is defined to be
	 * an inline element by the {@link module:engine/model/schema~SchemaItemDefinition}'s `isInline` property.
	 *
	 *		schema.isInline( 'paragraph' ); // -> false
	 *		schema.isInline( 'softBreak' ); // -> true
	 *
	 *		const text = writer.createText('foo' );
	 *		schema.isInline( text ); // -> true
	 *
	 * See the {@glink framework/guides/deep-dive/schema#inline-elements Inline elements} section of the Schema deep dive
	 * guide for more details.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isInline( item ) {
		const def = this.getDefinition( item );

		return !!( def && def.isInline );
	}

	/**
	 * Returns `true` if the given item is defined to be
	 * a selectable element by the {@link module:engine/model/schema~SchemaItemDefinition}'s `isSelectable` property.
	 *
	 *		TODO
	 *
	 * See the {@glink framework/guides/deep-dive/schema#TODO Selectable elements} section of the Schema deep dive}
	 * guide for more details.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/schema~SchemaContextItem|String} item
	 */
	isSelectable( item ) {
		const def = this.getDefinition( item );

		if ( !def ) {
			return false;
		}

		return !!( def.isSelectable || def.isObject );
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
	 * Note: When verifying whether the given node can be a child of the given context, the
	 * schema also verifies the entire context &mdash; from its root to its last element. Therefore, it is possible
	 * for `checkChild()` to return `false` even though the context's last element can contain the checked child.
	 * It happens if one of the context's elements does not allow its child.
	 *
	 * @fires checkChild
	 * @param {module:engine/model/schema~SchemaContextDefinition} context The context in which the child will be checked.
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
	 * @param {module:engine/model/schema~SchemaContextDefinition} context The context in which the attribute will be checked.
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
	 * In other words &mdash; whether `elementToMerge`'s children {@link #checkChild are allowed} in the `positionOrBaseElement`.
	 *
	 * This check ensures that elements merged with {@link module:engine/model/writer~Writer#merge `Writer#merge()`}
	 * will be valid.
	 *
	 * Instead of elements, you can pass the instance of the {@link module:engine/model/position~Position} class as the
	 * `positionOrBaseElement`. It means that the elements before and after the position will be checked whether they can be merged.
	 *
	 * @param {module:engine/model/position~Position|module:engine/model/element~Element} positionOrBaseElement The position or base
	 * element to which the `elementToMerge` will be merged.
	 * @param {module:engine/model/element~Element} elementToMerge The element to merge. Required if `positionOrBaseElement` is an element.
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
				throw new CKEditorError(
					'schema-check-merge-no-element-before: The node before the merge position must be an element.',
					this
				);
			}

			if ( !( nodeAfter instanceof Element ) ) {
				/**
				 * The node after the merge position must be an element.
				 *
				 * @error schema-check-merge-no-element-after
				 */
				throw new CKEditorError(
					'schema-check-merge-no-element-after: The node after the merge position must be an element.',
					this
				);
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
	 *		schema.addAttributeCheck( ( context, attributeName ) => {
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
	 * This method allows assigning additional metadata to the model attributes. For example,
	 * {@link module:engine/model/schema~AttributeProperties `AttributeProperties#isFormatting` property} is
	 * used to mark formatting attributes (like `bold` or `italic`).
	 *
	 *		// Mark bold as a formatting attribute.
	 *		schema.setAttributeProperties( 'bold', {
	 *			isFormatting: true
	 *		} );
	 *
	 *		// Override code not to be considered a formatting markup.
	 *		schema.setAttributeProperties( 'code', {
	 *			isFormatting: false
	 *		} );
	 *
	 * Properties are not limited to members defined in the
	 * {@link module:engine/model/schema~AttributeProperties `AttributeProperties` type} and you can also use custom properties:
	 *
	 *		schema.setAttributeProperties( 'blockQuote', {
	 *			customProperty: 'value'
	 *		} );
	 *
	 * Subsequent calls with the same attribute will extend its custom properties:
	 *
	 *		schema.setAttributeProperties( 'blockQuote', {
	 *			one: 1
	 *		} );
	 *
	 *		schema.setAttributeProperties( 'blockQuote', {
	 *			two: 2
	 *		} );
	 *
	 *		console.log( schema.getAttributeProperties( 'blockQuote' ) );
	 *		// Logs: { one: 1, two: 2 }
	 *
	 * @param {String} attributeName A name of the attribute to receive the properties.
	 * @param {module:engine/model/schema~AttributeProperties} properties A dictionary of properties.
	 */
	setAttributeProperties( attributeName, properties ) {
		this._attributeProperties[ attributeName ] = Object.assign( this.getAttributeProperties( attributeName ), properties );
	}

	/**
	 * Returns properties associated with a given model attribute. See {@link #setAttributeProperties `setAttributeProperties()`}.
	 *
	 * @param {String} attributeName A name of the attribute.
	 * @returns {module:engine/model/schema~AttributeProperties}
	 */
	getAttributeProperties( attributeName ) {
		return this._attributeProperties[ attributeName ] || {};
	}

	/**
	 * Returns the lowest {@link module:engine/model/schema~Schema#isLimit limit element} containing the entire
	 * selection/range/position or the root otherwise.
	 *
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection|
	 * module:engine/model/range~Range|module:engine/model/position~Position} selectionOrRangeOrPosition
	 * The selection/range/position to check.
	 * @returns {module:engine/model/element~Element} The lowest limit element containing
	 * the entire `selectionOrRangeOrPosition`.
	 */
	getLimitElement( selectionOrRangeOrPosition ) {
		let element;

		if ( selectionOrRangeOrPosition instanceof Position ) {
			element = selectionOrRangeOrPosition.parent;
		} else {
			const ranges = selectionOrRangeOrPosition instanceof Range ?
				[ selectionOrRangeOrPosition ] :
				Array.from( selectionOrRangeOrPosition.getRanges() );

			// Find the common ancestor for all selection's ranges.
			element = ranges
				.reduce( ( element, range ) => {
					const rangeCommonAncestor = range.getCommonAncestor();

					if ( !element ) {
						return rangeCommonAncestor;
					}

					return element.getCommonAncestor( rangeCommonAncestor, { includeSelf: true } );
				}, null );
		}

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
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
	 * Selection which will be checked.
	 * @param {String} attribute The name of the attribute to check.
	 * @returns {Boolean}
	 */
	checkAttributeInSelection( selection, attribute ) {
		if ( selection.isCollapsed ) {
			const firstPosition = selection.getFirstPosition();
			const context = [
				...firstPosition.getAncestors(),
				new Text( '', selection.getAttributes() )
			];

			// Check whether schema allows for a text with the attribute in the selection.
			return this.checkAttribute( context, attribute );
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
	 * @returns {Iterable.<module:engine/model/range~Range>} Ranges in which the attribute is allowed.
	 */
	* getValidRanges( ranges, attribute ) {
		ranges = convertToMinimalFlatRanges( ranges );

		for ( const range of ranges ) {
			yield* this._getValidRangesForRange( range, attribute );
		}
	}

	/**
	 * Basing on given `position`, finds and returns a {@link module:engine/model/range~Range range} which is
	 * nearest to that `position` and is a correct range for selection.
	 *
	 * The correct selection range might be collapsed when it is located in a position where the text node can be placed.
	 * Non-collapsed range is returned when selection can be placed around element marked as an "object" in
	 * the {@link module:engine/model/schema~Schema schema}.
	 *
	 * Direction of searching for the nearest correct selection range can be specified as:
	 *
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

		// Never leave a limit element.
		const limitElement = position.getAncestors().reverse().find( item => this.isLimit( item ) ) || position.root;

		if ( direction == 'both' || direction == 'backward' ) {
			backwardWalker = new TreeWalker( {
				boundaries: Range._createIn( limitElement ),
				startPosition: position,
				direction: 'backward'
			} );
		}

		if ( direction == 'both' || direction == 'forward' ) {
			forwardWalker = new TreeWalker( {
				boundaries: Range._createIn( limitElement ),
				startPosition: position
			} );
		}

		for ( const data of combineWalkers( backwardWalker, forwardWalker ) ) {
			const type = ( data.walker == backwardWalker ? 'elementEnd' : 'elementStart' );
			const value = data.value;

			if ( value.type == type && this.isObject( value.item ) ) {
				return Range._createOn( value.item );
			}

			if ( this.checkChild( value.nextPosition, '$text' ) ) {
				return new Range( value.nextPosition );
			}
		}

		return null;
	}

	/**
	 * Tries to find position ancestors that allow to insert a given node.
	 * It starts searching from the given position and goes node by node to the top of the model tree
	 * as long as a {@link module:engine/model/schema~Schema#isLimit limit element}, an
	 * {@link module:engine/model/schema~Schema#isObject object element} or a topmost ancestor is not reached.
	 *
	 * @param {module:engine/model/position~Position} position The position that the search will start from.
	 * @param {module:engine/model/node~Node|String} node The node for which an allowed parent should be found or its name.
	 * @returns {module:engine/model/element~Element|null} element Allowed parent or null if nothing was found.
	 */
	findAllowedParent( position, node ) {
		let parent = position.parent;

		while ( parent ) {
			if ( this.checkChild( parent, node ) ) {
				return parent;
			}

			// Do not split limit elements.
			if ( this.isLimit( parent ) ) {
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
			// When node is a `Text` it has no children, so just filter it out.
			if ( node.is( '$text' ) ) {
				removeDisallowedAttributeFromNode( this, node, writer );
			}
			// In a case of `Element` iterates through positions between nodes inside this element
			// and filter out node before the current position, or position parent when position
			// is at start of an element. Using positions prevent from omitting merged nodes
			// see https://github.com/ckeditor/ckeditor5-engine/issues/1789.
			else {
				const rangeInNode = Range._createIn( node );
				const positionsInRange = rangeInNode.getPositions();

				for ( const position of positionsInRange ) {
					const item = position.nodeBefore || position.parent;

					removeDisallowedAttributeFromNode( this, item, writer );
				}
			}
		}
	}

	/**
	 * Creates an instance of the schema context.
	 *
	 * @param {module:engine/model/schema~SchemaContextDefinition} context
	 * @returns {module:engine/model/schema~SchemaContext}
	 */
	createContext( context ) {
		return new SchemaContext( context );
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

	/**
	 * Takes a flat range and an attribute name. Traverses the range recursively and deeply to find and return all ranges
	 * inside the given range on which the attribute can be applied.
	 *
	 * This is a helper function for {@link ~Schema#getValidRanges}.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range The range to process.
	 * @param {String} attribute The name of the attribute to check.
	 * @returns {Iterable.<module:engine/model/range~Range>} Ranges in which the attribute is allowed.
	 */
	* _getValidRangesForRange( range, attribute ) {
		let start = range.start;
		let end = range.start;

		for ( const item of range.getItems( { shallow: true } ) ) {
			if ( item.is( 'element' ) ) {
				yield* this._getValidRangesForRange( Range._createIn( item ), attribute );
			}

			if ( !this.checkAttribute( item, attribute ) ) {
				if ( !start.isEqual( end ) ) {
					yield new Range( start, end );
				}

				start = Position._createAfter( item );
			}

			end = Position._createAfter( item );
		}

		if ( !start.isEqual( end ) ) {
			yield new Range( start, end );
		}
	}
}

mix( Schema, ObservableMixin );

/**
 * Event fired when the {@link #checkChild} method is called. It allows plugging in
 * additional behavior, for example implementing rules which cannot be defined using the declarative
 * {@link module:engine/model/schema~SchemaItemDefinition} interface.
 *
 * **Note:** The {@link #addChildCheck} method is a more handy way to register callbacks. Internally,
 * it registers a listener to this event but comes with a simpler API and it is the recommended choice
 * in most of the cases.
 *
 * The {@link #checkChild} method fires an event because it is
 * {@link module:utils/observablemixin~ObservableMixin#decorate decorated} with it. Thanks to that you can
 * use this event in various ways, but the most important use case is overriding standard behavior of the
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
 * {@link module:engine/model/schema~SchemaCompiledItemDefinition} instance, so you do not have to worry about
 * the various ways how `context` and `child` may be passed to `checkChild()`.
 *
 * **Note:** `childDefinition` may be `undefined` if `checkChild()` was called with a non-registered element.
 *
 * So, in order to implement a rule "disallow `heading1` in `blockQuote`", you can add such a listener:
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
 * Allowing elements in specific contexts will be a far less common use case, because it is normally handled by the
 * `allowIn` rule from {@link module:engine/model/schema~SchemaItemDefinition}. But if you have a complex scenario
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
 * additional behavior, for example implementing rules which cannot be defined using the declarative
 * {@link module:engine/model/schema~SchemaItemDefinition} interface.
 *
 * **Note:** The {@link #addAttributeCheck} method is a more handy way to register callbacks. Internally,
 * it registers a listener to this event but comes with a simpler API and it is the recommended choice
 * in most of the cases.
 *
 * The {@link #checkAttribute} method fires an event because it is
 * {@link module:utils/observablemixin~ObservableMixin#decorate decorated} with it. Thanks to that you can
 * use this event in various ways, but the most important use case is overriding the standard behavior of the
 * `checkAttribute()` method. Let's see a typical listener template:
 *
 *		schema.on( 'checkAttribute', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const attributeName = args[ 1 ];
 *		}, { priority: 'high' } );
 *
 * The listener is added with a `high` priority to be executed before the default method is really called. The `args` callback
 * parameter contains arguments passed to `checkAttribute( context, attributeName )`. However, the `context` parameter is already
 * normalized to a {@link module:engine/model/schema~SchemaContext} instance, so you do not have to worry about
 * the various ways how `context` may be passed to `checkAttribute()`.
 *
 * So, in order to implement a rule "disallow `bold` in a text which is in a `heading1`, you can add such a listener:
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
 * Allowing attributes in specific contexts will be a far less common use case, because it is normally handled by the
 * `allowAttributes` rule from {@link module:engine/model/schema~SchemaItemDefinition}. But if you have a complex scenario
 * where `bold` should be allowed only in element `foo` which must be in element `bar`, then this would be the way:
 *
 *		schema.on( 'checkAttribute', ( evt, args ) => {
 *			const context = args[ 0 ];
 *			const attributeName = args[ 1 ];
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
 * * {@link ~SchemaItemDefinition#allowIn `allowIn`} &ndash; Defines in which other items this item will be allowed.
 * * {@link ~SchemaItemDefinition#allowAttributes `allowAttributes`} &ndash; Defines allowed attributes of the given item.
 * * {@link ~SchemaItemDefinition#allowContentOf `allowContentOf`} &ndash; Inherits "allowed children" from other items.
 * * {@link ~SchemaItemDefinition#allowWhere `allowWhere`} &ndash; Inherits "allowed in" from other items.
 * * {@link ~SchemaItemDefinition#allowAttributesOf `allowAttributesOf`} &ndash; Inherits attributes from other items.
 * * {@link ~SchemaItemDefinition#inheritTypesFrom `inheritTypesFrom`} &ndash; Inherits `is*` properties of other items.
 * * {@link ~SchemaItemDefinition#inheritAllFrom `inheritAllFrom`} &ndash;
 * A shorthand for `allowContentOf`, `allowWhere`, `allowAttributesOf`, `inheritTypesFrom`.
 *
 * # The `is*` properties
 *
 * There are a couple commonly used `is*` properties. Their role is to assign additional semantics to schema items.
 * You can define more properties but you will also need to implement support for them in the existing editor features.
 *
 * * {@link ~SchemaItemDefinition#isBlock `isBlock`} &ndash; Whether this item is paragraph-like.
 * Generally speaking, content is usually made out of blocks like paragraphs, list items, images, headings, etc.
 * * {@link ~SchemaItemDefinition#isInline `isInline`} &ndash; Whether an item is "text-like" and should be treated as an inline node.
 * Examples of inline elements: `$text`, `softBreak` (`<br>`), etc.
 * * {@link ~SchemaItemDefinition#isLimit `isLimit`} &ndash; It can be understood as whether this element
 * should not be split by <kbd>Enter</kbd>. Examples of limit elements: `$root`, table cell, image caption, etc.
 * In other words, all actions that happen inside a limit element are limited to its content.
 * All objects are treated as limit elements, too.
 * * {@link ~SchemaItemDefinition#isObject `isObject`} &ndash; Whether an item is "self-contained" and should be treated as a whole.
 * Examples of object elements: `image`, `table`, `video`, etc. An object is also a limit, so
 * {@link module:engine/model/schema~Schema#isLimit `isLimit()`} returns `true` for object elements automatically.
 *
 * Read more about the meaning of these types in the
 * {@glink framework/guides/deep-dive/schema#defining-additional-semantics dedicated section of the Schema deep dive} guide.
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
 *			allowIn: '$block',
 *			isInline: true
 *		} );
 *
 * They reflect typical editor content that is contained within one root, consists of several blocks
 * (paragraphs, lists items, headings, images) which, in turn, may contain text inside.
 *
 * By inheriting from the generic items you can define new items which will get extended by other editor features.
 * Read more about generic types in the {@glink framework/guides/deep-dive/schema Schema deep dive} guide.
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
 * Also, allow `src` and `alt` attributes in it:
 *
 *		schema.register( 'image', {
 *			allowWhere: '$block',
 *			allowAttributes: [ 'src', 'alt' ],
 *			isBlock: true,
 *			isObject: true
 *		} );
 *
 * Make `caption` allowed in `image` and make it allow all the content of `$block`s (usually, `$text`).
 * Also, mark it as a limit element so it cannot be split:
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
 *			allowAttributes: [ 'listType', 'listIndent' ]
 *		} );
 *
 * Which translates to:
 *
 *		schema.register( 'listItem', {
 *			allowWhere: '$block',
 *			allowContentOf: '$block',
 *			allowAttributesOf: '$block',
 *			inheritTypesFrom: '$block',
 *			allowAttributes: [ 'listType', 'listIndent' ]
 *		} );
 *
 * # Tips
 *
 * * Check schema definitions of existing features to see how they are defined.
 * * If you want to publish your feature so other developers can use it, try to use
 * generic items as much as possible.
 * * Keep your model clean. Limit it to the actual data and store information in a normalized way.
 * * Remember about defining the `is*` properties. They do not affect the allowed structures, but they can
 * affect how the editor features treat your elements.
 *
 * @typedef {Object} module:engine/model/schema~SchemaItemDefinition
 *
 * @property {String|Array.<String>} allowIn Defines in which other items this item will be allowed.
 * @property {String|Array.<String>} allowAttributes Defines allowed attributes of the given item.
 * @property {String|Array.<String>} allowContentOf Inherits "allowed children" from other items.
 * @property {String|Array.<String>} allowWhere Inherits "allowed in" from other items.
 * @property {String|Array.<String>} allowAttributesOf Inherits attributes from other items.
 * @property {String|Array.<String>} inheritTypesFrom Inherits `is*` properties of other items.
 * @property {String} inheritAllFrom A shorthand for `allowContentOf`, `allowWhere`, `allowAttributesOf`, `inheritTypesFrom`.
 *
 * @property {Boolean} isBlock
 * Whether this item is paragraph-like. Generally speaking, content is usually made out of blocks
 * like paragraphs, list items, images, headings, etc. All these elements are marked as blocks. A block
 * should not allow another block inside. Note: There is also the `$block` generic item which has `isBlock` set to `true`.
 * Most block type items will inherit from `$block` (through `inheritAllFrom`).
 *
 * Read more about the block elements in the
 * {@glink framework/guides/deep-dive/schema#block-elements Block elements} section of the Schema deep dive} guide.
 *
 * @property {Boolean} isInline
 * Whether an item is "text-like" and should be treated as an inline node. Examples of inline elements:
 * `$text`, `softBreak` (`<br>`), etc.
 *
 * Read more about the inline elements in the
 * {@glink framework/guides/deep-dive/schema#inline-elements Inline elements} section of the Schema deep dive} guide.
 *
 * @property {Boolean} isLimit
 * It can be understood as whether this element should not be split by <kbd>Enter</kbd>.
 * Examples of limit elements: `$root`, table cell, image caption, etc. In other words, all actions that happen inside
 * a limit element are limited to its content.
 *
 * Read more about the limit elements in the
 * {@glink framework/guides/deep-dive/schema#limit-elements Limit elements} section of the Schema deep dive} guide.
 *
 * @property {Boolean} isObject
 * Whether an item is "self-contained" and should be treated as a whole. Examples of object elements:
 * `image`, `table`, `video`, etc.
 *
 * **Note:** An object is also a limit, so
 * {@link module:engine/model/schema~Schema#isLimit `isLimit()`} returns `true` for object elements automatically.
 *
 * Read more about the object elements in the
 * {@glink framework/guides/deep-dive/schema#object-elements Object elements} section of the Schema deep dive} guide.
 */

/**
 * A simplified version of {@link module:engine/model/schema~SchemaItemDefinition} after
 * compilation by the {@link module:engine/model/schema~Schema schema}.
 * Rules fed to the schema by {@link module:engine/model/schema~Schema#register}
 * and {@link module:engine/model/schema~Schema#extend} methods are defined in the
 * {@link module:engine/model/schema~SchemaItemDefinition} format.
 * Later on, they are compiled to `SchemaCompiledItemDefinition` so when you use e.g.
 * the {@link module:engine/model/schema~Schema#getDefinition} method you get the compiled version.
 *
 * The compiled version contains only the following properties:
 *
 * * The `name` property,
 * * The `is*` properties,
 * * The `allowIn` array,
 * * The `allowAttributes` array.
 *
 * @typedef {Object} module:engine/model/schema~SchemaCompiledItemDefinition
 */

/**
 * A schema context &mdash; a list of ancestors of a given position in the document.
 *
 * Considering such position:
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
	 * The number of items.
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
	 * Returns a new schema context instance with an additional item.
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
	 * **Note** {@link module:engine/model/node~Node} that is already in the model tree will be added as the only item
	 * (without ancestors).
	 *
	 * @param {String|module:engine/model/node~Node|Array<String|module:engine/model/node~Node>} item An item that will be added
	 * to the current context.
	 * @returns {module:engine/model/schema~SchemaContext} A new schema context instance with an additional item.
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

	/**
	 * Checks whether the context starts with the given nodes.
	 *
	 *		const ctx = new SchemaContext( [ rootElement, paragraphElement, textNode ] );
	 *
	 *		ctx.endsWith( '$root' ); // -> true
	 *		ctx.endsWith( '$root paragraph' ); // -> true
	 *		ctx.endsWith( '$text' ); // -> false
	 *		ctx.endsWith( 'paragraph' ); // -> false
	 *
	 * @param {String} query
	 * @returns {Boolean}
	 */
	startsWith( query ) {
		return Array.from( this.getNames() ).join( ' ' ).startsWith( query );
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
 *		schema.checkChild( model.createPositionAt( paragraphElement, 0 ), 'foo' );
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
 * in which case you can create a context by missing an array of elements with a `'$text'` string:
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

/**
 * A structure containing additional metadata describing the attribute.
 *
 * See {@link module:engine/model/schema~Schema#setAttributeProperties `Schema#setAttributeProperties()`} for usage examples.
 *
 * @typedef {Object} module:engine/model/schema~AttributeProperties
 * @property {Boolean} [isFormatting] Indicates that the attribute should be considered as a visual formatting, like `bold`, `italic` or
 * `fontSize` rather than semantic attribute (such as `src`, `listType`, etc.). For example, it is used by the "Remove format" feature.
 * @property {Boolean} [copyOnEnter] Indicates that given text attribute should be copied to the next block when enter is pressed.
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

// Takes an array of non-intersecting ranges. For each of them gets minimal flat ranges covering that range and returns
// all those minimal flat ranges.
//
// @param {Array.<module:engine/model/range~Range>} ranges Ranges to process.
// @returns {Iterable.<module:engine/model/range~Range>} Minimal flat ranges of given `ranges`.
function* convertToMinimalFlatRanges( ranges ) {
	for ( const range of ranges ) {
		yield* range.getMinimalFlatRanges();
	}
}

function removeDisallowedAttributeFromNode( schema, node, writer ) {
	for ( const attribute of node.getAttributeKeys() ) {
		if ( !schema.checkAttribute( node, attribute ) ) {
			writer.removeAttribute( attribute, node );
		}
	}
}
