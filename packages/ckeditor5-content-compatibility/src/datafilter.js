/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/datafilter
 */

import { Matcher, enablePlaceholder } from 'ckeditor5/src/engine';
import { priorities, CKEditorError } from 'ckeditor5/src/utils';
import { toWidget } from 'ckeditor5/src/widget';
import { Template } from 'ckeditor5/src/ui';
import { cloneDeep, capitalize } from 'lodash-es';

import '../theme/datafilter.css';

/**
 * Allows to validate elements and element attributes registered by {@link module:content-compatibility/dataschema~DataSchema}.
 *
 * To enable registered element in the editor, use {@link module:content-compatibility/datafilter~DataFilter#allowElement} method:
 *
 *		dataFilter.allowElement( {
 *			name: 'section'
 *		} );
 *
 * You can also allow or disallow specific element attributes:
 *
 *		// Allow `data-foo` attribute on `section` element.
 *		dataFilter.allowedAttributes( {
 *			name: 'section',
 *			attributes: {
 *				'data-foo': true
 *			}
 *		} );
 *
 *		// Disallow `color` style attribute on 'section' element.
 *		dataFilter.disallowedAttributes( {
 *			name: 'section',
 *			styles: {
 *				color: /[\s\S]+/
 *			}
 *		} );
 */
export default class DataFilter {
	constructor( editor, dataSchema ) {
		this.editor = editor;

		/**
		 * An instance of the {@link module:content-compatibility/dataschema~DataSchema}.
		 *
		 * @readonly
		 * @private
		 * @member {module:content-compatibility/dataschema~DataSchema} #_dataSchema
		 */
		this._dataSchema = dataSchema;

		/**
		 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
		 * content attributes should be allowed.
		 *
		 * @readonly
		 * @private
		 * @member {module:engine/view/matcher~Matcher} #_allowedAttributes
		 */
		this._allowedAttributes = new Matcher();

		/**
		 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
		 * content attributes should be disallowed.
		 *
		 * @readonly
		 * @private
		 * @member {module:engine/view/matcher~Matcher} #_disallowedAttributes
		 */
		this._disallowedAttributes = new Matcher();

		/**
		 * Allowed element definitions by {@link module:content-compatibility/datafilter~DataFilter#allowElement} method.
		 *
		 * @readonly
		 * @private
		 * @member {Set.<module:content-compatibility/dataschema~DataSchemaDefinition>} #_allowedElements
		*/
		this._allowedElements = new Set();

		/**
		 * Indicates if {@link module:core/editor~Editor#data editor's data controller} data has been already initialized.
		 *
		 * @private
		 * @member {Boolean} [#_dataInitialized=false]
		*/
		this._dataInitialized = false;

		this._registerElementsAfterInit();
	}

	/**
	 * Allow the given element in the editor context.
	 *
	 * This method will only allow elements described by the {@link module:content-compatibility/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all view elements which should be allowed.
	 */
	allowElement( config ) {
		for ( const definition of this._dataSchema.getDefinitionsForView( config.name, true ) ) {
			if ( this._allowedElements.has( definition ) ) {
				continue;
			}

			this._allowedElements.add( definition );

			// We need to wait for all features to be initialized before we can register
			// element, so we can access existing features model schemas.
			// If the data has not been initialized yet, _registerElementsAfterInit() method will take care of
			// registering elements.
			if ( this._dataInitialized ) {
				this._registerElement( definition );
			}
		}

		this.allowAttributes( config );
	}

	/**
	 * Allow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be allowed.
	 */
	allowAttributes( config ) {
		this._allowedAttributes.add( config );
	}

	/**
	 * Disallow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be disallowed.
	 */
	disallowAttributes( config ) {
		this._disallowedAttributes.add( config );
	}

	/**
	 * Registers elements allowed by {@link module:content-compatibility/datafilter~DataFilter#allowElement} method
	 * once {@link module:core/editor~Editor#data editor's data controller} is initialized.
	 *
	 * @private
	*/
	_registerElementsAfterInit() {
		this.editor.data.on( 'init', () => {
			this._dataInitialized = true;

			for ( const definition of this._allowedElements ) {
				this._registerElement( definition );
			}
		}, {
			// With high priority listener we are able to register elements right before
			// running data conversion. Make also sure that priority is higher than the one
			// used by `RealTimeCollaborationClient`, as RTC is stopping event propagation.
			priority: priorities.get( 'high' ) + 1
		} );
	}

	/**
	 * Registers element and attribute converters for the given data schema definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	_registerElement( definition ) {
		if ( definition.isInline ) {
			this._registerInlineElement( definition );
		} else if ( definition.isBlock ) {
			this._registerBlockElement( definition );
		} else if ( definition.isObject ) {
			this._registerObjectElement( definition );
		} else {
			/**
			 * Only a definition marked as inline or block can be allowed.
			 *
			 * @error data-filter-invalid-definition-type
			 */
			throw new CKEditorError(
				'data-filter-invalid-definition-type',
				null,
				definition
			);
		}
	}

	/**
	 * Registers object element and attribute converters for the given data schema definition.
	 *
	 * If the element model schema is already registered, this method will do nothing.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaObjectElementDefinition} definition
	 */
	_registerObjectElement( definition ) {
		const schema = this.editor.model.schema;

		schema.register( definition.model, definition.modelSchema );

		this._addObjectElementToElementConversion( definition );
		this._addDisallowedAttributeConversion( definition );
		this._addAllowedAttributeConversion( definition );
	}

	/**
	 * Registers block element and attribute converters for the given data schema definition.
	 *
	 * If the element model schema is already registered, this method will do nothing.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_registerBlockElement( definition ) {
		const schema = this.editor.model.schema;

		if ( !schema.isRegistered( definition.model ) ) {
			this.editor.model.schema.register( definition.model, definition.modelSchema );
			this._addBlockElementToElementConversion( definition );
		}

		this._addDisallowedAttributeConversion( definition );
		this._addAllowedAttributeConversion( definition );
	}

	/**
	 * Registers inline element and attribute converters for the given data schema definition.
	 *
	 * Extends `$text` model schema to allow the given definition model attribute and its properties.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	_registerInlineElement( definition ) {
		const schema = this.editor.model.schema;

		schema.extend( '$text', {
			allowAttributes: definition.model
		} );

		if ( definition.attributeProperties ) {
			schema.setAttributeProperties( definition.model, definition.attributeProperties );
		}

		this._addDisallowedAttributeConversion( definition );
		this._addInlineElementConversion( definition );
	}

	/**
	 * Adds element to element converters for the given block element definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaBlockElementDefinition} definition
	 */
	_addBlockElementToElementConversion( { model: modelName, view: viewName } ) {
		const conversion = this.editor.conversion;

		if ( !viewName ) {
			return;
		}

		conversion.for( 'upcast' ).elementToElement( {
			model: modelName,
			view: viewName,
			// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
			// this listener is called before it. If not, some elements will be transformed into a paragraph.
			converterPriority: priorities.get( 'low' ) + 1
		} );

		conversion.for( 'downcast' ).elementToElement( {
			model: modelName,
			view: viewName
		} );
	}

	/**
	 * Adds attribute converters for the given element definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	_addAllowedAttributeConversion( { model: modelName, view: viewName } ) {
		const conversion = this.editor.conversion;

		if ( !viewName ) {
			return;
		}

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
				if ( !data.modelRange ) {
					return;
				}

				const viewAttributes = this._matchAndConsumeAllowedAttributes( data.viewItem, conversionApi );

				if ( viewAttributes ) {
					conversionApi.writer.setAttribute( 'htmlAttributes', viewAttributes, data.modelRange );
				}
			}, { priority: 'low' } );
		} );

		conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( `attribute:htmlAttributes:${ modelName }`, ( evt, data, conversionApi ) => {
				const viewAttributes = data.attributeNewValue;

				if ( !viewAttributes ) {
					return;
				}

				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewElement = conversionApi.mapper.toViewElement( data.item );

				setViewElementAttributes( viewWriter, viewAttributes, viewElement );
			} );
		} );
	}

	/**
	 * Adds converters for the given inline element definition.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	_addInlineElementConversion( definition ) {
		const conversion = this.editor.conversion;
		const viewName = definition.view;
		const attributeKey = definition.model;

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
				const viewAttributes = this._matchAndConsumeAllowedAttributes( data.viewItem, conversionApi );

				// Since we are converting to attribute we need a range on which we will set the attribute.
				// If the range is not created yet, we will create it.
				if ( !data.modelRange ) {
					data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
				}

				// Set attribute on each item in range according to the schema.
				for ( const node of data.modelRange.getItems() ) {
					if ( conversionApi.schema.checkAttribute( node, attributeKey ) ) {
						// Node's children are converted recursively, so node can already include model attribute.
						// We want to extend it, not replace.
						const nodeAttributes = node.getAttribute( attributeKey );
						const attributesToAdd = mergeViewElementAttributes( viewAttributes || {}, nodeAttributes || {} );

						conversionApi.writer.setAttribute( attributeKey, attributesToAdd, node );
					}
				}
			}, { priority: 'low' } );
		} );

		conversion.for( 'downcast' ).attributeToElement( {
			model: attributeKey,
			view: ( attributeValue, conversionApi ) => {
				if ( !attributeValue ) {
					return;
				}

				const { writer } = conversionApi;
				const viewElement = writer.createAttributeElement( viewName, null, { priority: definition.priority } );

				setViewElementAttributes( writer, attributeValue, viewElement );

				return viewElement;
			}
		} );
	}

	/**
	 * Adds converters responsible for consuming disallowed view attributes.
	 *
	 * @private
	 * @param {module:content-compatibility/dataschema~DataSchemaInlineElementDefinition} definition
	 */
	_addDisallowedAttributeConversion( { view: viewName } ) {
		const conversion = this.editor.conversion;

		if ( !viewName ) {
			return;
		}

		// Consumes disallowed element attributes to prevent them of being processed by other converters.
		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( `element:${ viewName }`, ( evt, data, conversionApi ) => {
				consumeAttributeMatches( data.viewItem, conversionApi, this._disallowedAttributes );
			}, { priority: 'high' } );
		} );
	}

	_addObjectElementToElementConversion( definition ) {
		const conversion = this.editor.conversion;
		const { view: viewName, model: modelName } = definition;

		conversion.for( 'upcast' ).elementToElement( {
			model: modelName,
			view: viewName
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: modelName,
			view: ( modelElement, { writer } ) => {
				const widgetWrapper = this._createObjectElementView( modelName, writer );
				const title = createHtmlObjectTitle( viewName );

				enablePlaceholder( {
					view: this.editor.editing.view,
					element: widgetWrapper,
					text: title
				} );

				const widgetLabel = createObjectElementWidgetUILabel( title, writer );

				writer.insert( writer.createPositionAt( widgetWrapper, 'end' ), widgetLabel );

				return toWidget( widgetWrapper, writer );
			}

		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: modelName,
			view: ( modelItem, { writer } ) => {
				return writer.createContainerElement( viewName, null, {
					isAllowedInsideAttributeElement: this.editor.model.schema.isInline( modelName )
				} );
			}
		} );
	}

	/**
	 * TODO
	*/
	_createObjectElementView( modelName, writer ) {
		if ( this.editor.model.schema.isInline( modelName ) ) {
			return writer.createContainerElement( 'span', {
				class: 'ck-widget__compatibility ck-widget__compatibility-inline'
			}, {
				isAllowedInsideAttributeElement: true
			} );
		}

		return writer.createContainerElement( 'div', {
			class: 'ck-widget__compatibility ck-widget__compatibility-block'
		} );
	}

	/**
	 * Matches and consumes allowed view attributes.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
	 * @returns {Object} [result]
	 * @returns {Object} result.attributes Set with matched attribute names.
	 * @returns {Object} result.styles Set with matched style names.
	 * @returns {Array.<String>} result.classes Set with matched class names.
	 */
	_matchAndConsumeAllowedAttributes( viewElement, conversionApi ) {
		const matches = consumeAttributeMatches( viewElement, conversionApi, this._allowedAttributes );
		const { attributes, styles, classes } = mergeMatchResults( matches );
		const viewAttributes = {};

		if ( attributes.size ) {
			viewAttributes.attributes = iterableToObject( attributes, key => viewElement.getAttribute( key ) );
		}

		if ( styles.size ) {
			viewAttributes.styles = iterableToObject( styles, key => viewElement.getStyle( key ) );
		}

		if ( classes.size ) {
			viewAttributes.classes = Array.from( classes );
		}

		if ( !Object.keys( viewAttributes ).length ) {
			return null;
		}

		return viewAttributes;
	}
}

// Consumes matched attributes.
//
// Returns sucessfully consumed attribute matches.
//
// @private
// @param {module:engine/view/element~Element} viewElement
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
// @param {module:engine/view/matcher~Matcher Matcher} matcher
// @returns {Array.<Object>} Array with match information about found attributes.
function consumeAttributeMatches( viewElement, { consumable }, matcher ) {
	const matches = matcher.matchAll( viewElement ) || [];
	const consumedMatches = [];

	for ( const match of matches ) {
		// We only want to consume attributes, so element can be still processed by other converters.
		delete match.match.name;

		if ( consumable.consume( viewElement, match.match ) ) {
			consumedMatches.push( match );
		}
	}

	return consumedMatches;
}

// Helper function for downcast converter. Sets attributes on the given view element.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {Object} viewAttributes
// @param {module:engine/view/element~Element} viewElement
function setViewElementAttributes( writer, viewAttributes, viewElement ) {
	if ( viewAttributes.attributes ) {
		for ( const [ key, value ] of Object.entries( viewAttributes.attributes ) ) {
			writer.setAttribute( key, value, viewElement );
		}
	}

	if ( viewAttributes.styles ) {
		writer.setStyle( viewAttributes.styles, viewElement );
	}

	if ( viewAttributes.classes ) {
		writer.addClass( viewAttributes.classes, viewElement );
	}
}

// Merges the result of {@link module:engine/view/matcher~Matcher#matchAll} method.
//
// @private
// @param {Array.<Object>} matches
// @returns {Object} result
// @returns {Set.<Object>} result.attributes Set with matched attribute names.
// @returns {Set.<Object>} result.styles Set with matched style names.
// @returns {Set.<String>} result.classes Set with matched class names.
function mergeMatchResults( matches ) {
	const matchResult = {
		attributes: new Set(),
		classes: new Set(),
		styles: new Set()
	};

	for ( const match of matches ) {
		for ( const key in matchResult ) {
			const values = match.match[ key ] || [];

			values.forEach( value => matchResult[ key ].add( value ) );
		}
	}

	return matchResult;
}

// Converts the given iterable object into an object.
//
// @private
// @param {Iterable.<String>} iterable
// @param {Function} getValue Should result with value for the given object key.
// @returns {Object}
function iterableToObject( iterable, getValue ) {
	const attributesObject = {};

	for ( const prop of iterable ) {
		attributesObject[ prop ] = getValue( prop );
	}

	return attributesObject;
}

// Merges view element attribute objects.
//
// @private
// @param {Object} oldValue
// @param {Object} newValue
// @returns {Object}
function mergeViewElementAttributes( oldValue, newValue ) {
	const result = cloneDeep( oldValue );

	for ( const key in newValue ) {
		// Merge classes.
		if ( Array.isArray( newValue[ key ] ) ) {
			result[ key ] = Array.from( new Set( [ ...oldValue[ key ], ...newValue[ key ] ] ) );
		}

		// Merge attributes or styles.
		else {
			result[ key ] = { ...oldValue[ key ], ...newValue[ key ] };
		}
	}

	return result;
}

// TODO
function createHtmlObjectTitle( viewName ) {
	return 'HTML ' + capitalize( viewName );
}

// TODO
function createObjectElementWidgetUILabel( title, writer ) {
	return writer.createUIElement( 'div', {
		class: 'ck ck-reset_all ck-widget__compatibility-type'
	}, function( domDocument ) {
		const wrapperDomElement = this.toDomElement( domDocument );

		const labelTemplate = new Template( {
			attributes: {
				class: [
					'ck',
					'ck-widget__compatibility-type__label'
				]
			},
			text: title
		} );
		wrapperDomElement.appendChild( labelTemplate.render() );

		return wrapperDomElement;
	} );
}
