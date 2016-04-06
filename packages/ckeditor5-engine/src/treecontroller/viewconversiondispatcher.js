/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ViewConsumable from './viewconsumable.js';
import ViewElement from '../treeview/element.js';
import ViewText from '../treeview/text.js';
import EmitterMixin from '../../utils/emittermixin.js';
import utils from '../../utils/utils.js';
import extend from '../../utils/lib/lodash/extend.js';

/**
 * `ViewConversionDispatcher` is a central point of {@link engine.treeView view} conversion, which is a process of
 * converting given {@link engine.treeView.DocumentFragment view document fragment} or {@link engine.treeView.Element}
 * into another structure. In default application, {@link engine.treeView view} is converted to {@link engine.treeModel}.
 *
 * During conversion process, for all {@link engine.treeView.Node view nodes} from the converted view document fragment,
 * `ViewConversionDispatcher` fires corresponding events. Special callbacks called "converters" should listen to
 * `ViewConversionDispatcher` for those events.
 *
 * Each callback, as a first argument, is passed a special object `data` that has `input` and `output` properties.
 * `input` property contains {@link engine.treeView.Node view node} or {@link engine.treeView.DocumentFragment view document fragment}
 * that is converted at the moment and might be handled by the callback. `output` property should be used to save the result
 * of conversion. Keep in mind that the `data` parameter is customizable and may contain other values - see
 * {@link engine.treeController.ViewConversionDispatcher#convert}. It is also shared by reference by all callbacks
 * listening to given event. **Note**: in view to model conversion - `data` contains `context` property that is an array
 * of {@link engine.treeModel.Element model elements}. These are model elements that will be the parent of currently
 * converted view item. `context` property is used in examples below.
 *
 * The second parameter passed to a callback is an instance of {@link engine.treeController.ViewConsumable}. It stores
 * information about what parts of processed view item are still waiting to be handled. After a piece of view item
 * was converted, appropriate consumable value should be {@link engine.treeController.ViewConsumable#consume consumed}.
 *
 * The third parameter passed to a callback is an instance of {@link engine.treeController.ViewConversionDispatcher}
 * which provides additional tools for converters.
 *
 * Examples of providing callbacks for `ViewConversionDispatcher`:
 *
 *		// Converter for paragraphs (<p>).
 *		viewDispatcher.on( 'element:p', ( data, consumable, conversionApi ) => {
 *			const paragraph = new ModelElement( 'paragraph' );
 *			const schemaQuery = {
 *				name: 'paragraph',
 *				inside: data.context
 *			};
 *
 *			if ( conversionApi.schema.checkQuery( schemaQuery ) ) {
 *				if ( !consumable.consume( data.input, { name: true } ) ) {
 *					// Before converting this paragraph's children we have to update their context by this paragraph.
 *					const context = data.context.concat( paragraph );
 *					const children = conversionApi.convertChildren( data.input, consumable, { context } );
 *					paragraph.appendChildren( children );
 *					data.output = paragraph;
 *				}
 *			}
 *		} );
 *
 *		// Converter for links (<a>).
 *		viewDispatcher.on( 'element:a', ( data, consumable, conversionApi ) => {
 *			if ( consumable.consume( data.input, { name: true, attributes: [ 'href' ] } ) ) {
 *				// <a> element is inline and is represented by an attribute in the model.
 *				// This is why we are not updating `context` property.
 *				data.output = conversionApi.convertChildren( data.input, consumable, { context: data.context } );
 *
 *				for ( let item of Range.createFrom( data.output ) ) {
 *					const schemaQuery = {
 *						name: item.name || '$text',
 *						attribute: 'link',
 *						inside: data.context
 *					};
 *
 *					if ( conversionApi.schema.checkQuery( schemaQuery ) ) {
 *						item.setAttribute( 'link', data.input.getAttribute( 'href' ) );
 *					}
 *				}
 *			}
 *		} );
 *
 *		// Fire conversion.
 *		// At the beginning, the context is empty because given `viewDocumentFragment` has no parent.
 *		viewDispatcher.convert( viewDocumentFragment, { context: [] } );
 *
 * Before each conversion process, `ViewConversionDispatcher` fires {@link engine.treeController.ViewConversionDispatcher.viewCleanup}
 * event which can be used to prepare tree view for conversion.
 *
 * @mixes utils.EmitterMixin
 * @fires engine.treeController.ViewConversionDispatcher.viewCleanup
 * @fires engine.treeController.ViewConversionDispatcher.element
 * @fires engine.treeController.ViewConversionDispatcher.text
 * @fires engine.treeController.ViewConversionDispatcher.documentFragment
 *
 * @memberOf engine.treeController
 */
export default class ViewConversionDispatcher {
	/**
	 * Creates a `ViewConversionDispatcher` that operates using passed API.
	 *
	 * @see engine.treeController.ViewConversionApi
	 * @param {Object} conversionApi Additional properties for interface that will be passed to events fired
	 * by `ViewConversionDispatcher`.
	 */
	constructor( conversionApi = {} ) {
		/**
		 * Interface passed by dispatcher to the events callbacks.
		 *
		 * @member {engine.treeController.ViewConversionApi} engine.treeController.ViewConversionDispatcher#conversionApi
		 */
		this.conversionApi = extend( {}, conversionApi );

		// `convertItem` and `convertChildren` are bound to this `ViewConversionDispatcher` instance and
		// set on `conversionApi`. This way only a part of `ViewConversionDispatcher` API is exposed.
		this.conversionApi.convertItem = this._convertItem.bind( this );
		this.conversionApi.convertChildren = this._convertChildren.bind( this );
	}

	/**
	 * Starts the conversion process. The entry point for the conversion.
	 *
	 * @fires engine.treeController.ViewConversionDispatcher.element
	 * @fires engine.treeController.ViewConversionDispatcher.text
	 * @fires engine.treeController.ViewConversionDispatcher.documentFragment
	 * @param {engine.treeView.DocumentFragment|engine.treeView.Element} viewItem Part of the view to be converted.
	 * @param {Object} [additionalData] Additional data to be passed in `data` argument when firing `ViewConversionDispatcher`
	 * events. See also {@link engine.treeController.ViewConversionDispatcher.element element event}.
	 * @returns {engine.treeModel.DocumentFragment} Model document fragment that is a result of the conversion process.
	 */
	convert( viewItem, additionalData = {} ) {
		this.fire( 'viewCleanup', viewItem );

		const consumable = ViewConsumable.createFrom( viewItem );

		return this._convertItem( viewItem, consumable, additionalData );
	}

	/**
	 * @private
	 * @see engine.treeController.ViewConversionApi#convertItem
	 */
	_convertItem( input, consumable, additionalData = {} ) {
		const data = extend( additionalData, {
			input: input,
			output: null
		} );

		if ( input instanceof ViewElement ) {
			this.fire( 'element:' + input.name, data, consumable, this.conversionApi );
		} else if ( input instanceof ViewText ) {
			this.fire( 'text', data, consumable, this.conversionApi );
		} else {
			this.fire( 'documentFragment', data, consumable, this.conversionApi );
		}

		return data.output;
	}

	/**
	 * @private
	 * @see engine.treeController.ViewConversionApi#convertChildren
	 */
	_convertChildren( input, consumable, additionalData = {} ) {
		const viewChildren = Array.from( input.getChildren() );
		const convertedChildren = viewChildren.map( ( viewChild ) => this._convertItem( viewChild, consumable, additionalData ) );

		// Flatten.
		return convertedChildren.reduce( ( a, b ) => a.concat( b ) );
	}

	/**
	 * Fired before the first conversion event, at the beginning of view to model conversion process.
	 *
	 * @event engine.treeController.ViewConversionDispatcher.viewCleanup
	 * @param {engine.treeView.DocumentFragment|engine.treeView.Element} viewItem Part of the view to be converted.
	 */

	/**
	 * Fired when {@link engine.treeView.Element} is converted.
	 *
	 * `element` is a namespace event for a class of events. Names of actually called events follow this pattern:
	 * `element:<elementName>` where `elementName` is the name of converted element. This way listeners may listen to
	 * all elements conversion or to conversion of specific elements.
	 *
	 * @event engine.treeController.ViewConversionDispatcher.element
	 * @param {Object} data Object containing conversion input and a placeholder for conversion output and possibly other
	 * values (see {@link engine.treeController.ViewConversionDispatcher#convert}). Keep in mind that this object is shared
	 * by reference between all callbacks that will be called. This means that callbacks can add their own values if needed,
	 * and those values will be available in other callbacks.
	 * @param {engine.treeView.Element} data.input Converted element.
	 * @param {*} data.output The current state of conversion result. Every change to converted element should
	 * be reflected by setting or modifying this property.
	 * @param {engine.treeController.ViewConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ViewConversionDispatcher` constructor.
	 * Besides of properties passed in constructor, it also has `convertItem` and `convertChildren` methods which are references
	 * to {@link engine.treeController.ViewConversionDispatcher#_convertItem} and
	 * {@link engine.treeController.ViewConversionDispatcher#_convertChildren}. Those methods are needed to convert
	 * the whole view-tree they were exposed in `conversionApi` for callbacks.
	 */

	/**
	 * Fired when {@link engine.treeView.Text} is converted.
	 *
	 * @event engine.treeController.ViewConversionDispatcher.text
	 * @see engine.treeController.ViewConversionDispatcher.element
	 */

	/**
	 * Fired when {@link engine.treeView.DocumentFragment} is converted.
	 *
	 * @event engine.treeController.ViewConversionDispatcher.documentFragment
	 * @see engine.treeController.ViewConversionDispatcher.element
	 */
}

utils.mix( ViewConversionDispatcher, EmitterMixin );

/**
 * Conversion interface that is registered for given {@link engine.treeController.ViewConversionDispatcher} and is
 * passed as one of parameters when {@link engine.treeController.ViewConversionDispatcher dispatcher} fires it's events.
 *
 * `ViewConversionApi` object is built by {@link engine.treeController.ViewConversionDispatcher} constructor. The exact
 * list of properties of this object is determined by the object passed to the constructor.
 *
 * @interface engine.treeController.ViewConversionApi
 */

/**
 * Starts conversion of given item by firing an appropriate event.
 *
 * Every fired event is passed (as first parameter) an object with `output` property. Every event may set and/or
 * modify that property. When all callbacks are done, the final value of `output` property is returned by this method.
 *
 * @memberOf engine.treeController.ViewConversionApi
 * @function covertItem
 * @fires engine.treeController.ViewConversionDispatcher.element
 * @fires engine.treeController.ViewConversionDispatcher.text
 * @fires engine.treeController.ViewConversionDispatcher.documentFragment
 * @param {engine.treeView.DocumentFragment|engine.treeView.Element|engine.treeView.Text} input Item to convert.
 * @param {engine.treeController.ViewConsumable} consumable Values to consume.
 * @param {Object} [additionalData] Additional data to be passed in `data` argument when firing `ViewConversionDispatcher`
 * events. See also {@link engine.treeController.ViewConversionDispatcher.element element event}.
 * @returns {*} The result of item conversion, created and modified by callbacks attached to fired event.
 */

/**
 * Starts conversion of all children of given item by firing appropriate events for all those children.
 *
 * @memberOf engine.treeController.ViewConversionApi
 * @function convertChildren
 * @fires engine.treeController.ViewConversionDispatcher.element
 * @fires engine.treeController.ViewConversionDispatcher.text
 * @fires engine.treeController.ViewConversionDispatcher.documentFragment
 * @param {engine.treeView.DocumentFragment|engine.treeView.Element} input Item which children will be converted.
 * @param {engine.treeController.ViewConsumable} consumable Values to consume.
 * @param {Object} [additionalData] Additional data to be passed in `data` argument when firing `ViewConversionDispatcher`
 * events. See also {@link engine.treeController.ViewConversionDispatcher.element element event}.
 * @returns {Array.<*>} Array containing results of conversion of all children of given item.
 */
