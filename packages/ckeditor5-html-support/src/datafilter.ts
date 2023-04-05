/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/datafilter
 */

/* globals document */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import {
	Matcher,
	type MatcherPattern,
	type UpcastConversionApi,
	type ViewElement,
	type MatchResult,
	type ViewConsumable
} from 'ckeditor5/src/engine';
import { priorities, CKEditorError } from 'ckeditor5/src/utils';
import { Widget } from 'ckeditor5/src/widget';
import {
	viewToModelObjectConverter,
	toObjectWidgetConverter,
	createObjectView,

	viewToAttributeInlineConverter,
	attributeToViewInlineConverter,

	viewToModelBlockAttributeConverter,
	modelToViewBlockAttributeConverter
} from './converters';
import {
	default as DataSchema,
	type DataSchemaBlockElementDefinition,
	type DataSchemaDefinition,
	type DataSchemaInlineElementDefinition
} from './dataschema';
import type { GHSViewAttributes } from './conversionutils';

import { isPlainObject, pull as removeItemFromArray } from 'lodash-es';

import '../theme/datafilter.css';

type MatcherPatternWithName = MatcherPattern & { name?: string };

/**
 * Allows to validate elements and element attributes registered by {@link module:html-support/dataschema~DataSchema}.
 *
 * To enable registered element in the editor, use {@link module:html-support/datafilter~DataFilter#allowElement} method:
 *
 * ```ts
 * dataFilter.allowElement( 'section' );
 * ```
 *
 * You can also allow or disallow specific element attributes:
 *
 * ```ts
 * // Allow `data-foo` attribute on `section` element.
 * dataFilter.allowAttributes( {
 * 	name: 'section',
 * 	attributes: {
 * 		'data-foo': true
 * 	}
 * } );
 *
 * // Disallow `color` style attribute on 'section' element.
 * dataFilter.disallowAttributes( {
 * 	name: 'section',
 * 	styles: {
 * 		color: /[\s\S]+/
 * 	}
 * } );
 * ```
 *
 * To apply the information about allowed and disallowed attributes in custom integration plugin,
 * use the {@link module:html-support/datafilter~DataFilter#processViewAttributes `processViewAttributes()`} method.
 */
export default class DataFilter extends Plugin {
	/**
	 * An instance of the {@link module:html-support/dataschema~DataSchema}.
	 */
	private readonly _dataSchema: DataSchema;

	/**
	 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
	 * content attributes should be allowed.
	 */
	private readonly _allowedAttributes: Matcher;

	/**
	 * {@link module:engine/view/matcher~Matcher Matcher} instance describing rules upon which
	 * content attributes should be disallowed.
	 */
	private readonly _disallowedAttributes: Matcher;

	/**
	 * Allowed element definitions by {@link module:html-support/datafilter~DataFilter#allowElement} method.
	*/
	private readonly _allowedElements: Set<DataSchemaDefinition & { coupledAttribute?: string }>;

	/**
	 * Disallowed element names by {@link module:html-support/datafilter~DataFilter#disallowElement} method.
	 */
	private readonly _disallowedElements: Set<string>;

	/**
	 * Indicates if {@link module:engine/controller/datacontroller~DataController editor's data controller}
	 * data has been already initialized.
	*/
	private _dataInitialized: boolean;

	/**
	 * Cached map of coupled attributes. Keys are the feature attributes names
	 * and values are arrays with coupled GHS attributes names.
	 */
	private _coupledAttributes: Map<string, Array<string>> | null;

	constructor( editor: Editor ) {
		super( editor );

		this._dataSchema = editor.plugins.get( 'DataSchema' );

		this._allowedAttributes = new Matcher();

		this._disallowedAttributes = new Matcher();

		this._allowedElements = new Set();

		this._disallowedElements = new Set();

		this._dataInitialized = false;

		this._coupledAttributes = null;

		this._registerElementsAfterInit();
		this._registerElementHandlers();
		this._registerModelPostFixer();
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DataFilter' {
		return 'DataFilter';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataSchema, Widget ] as const;
	}

	/**
	 * Load a configuration of one or many elements, where their attributes should be allowed.
	 *
	 * **Note**: Rules will be applied just before next data pipeline data init or set.
	 *
	 * @param config Configuration of elements that should have their attributes accepted in the editor.
	 */
	public loadAllowedConfig( config: Array<MatcherPattern> ): void {
		for ( const pattern of config as Array<MatcherPatternWithName> ) {
			// MatcherPattern allows omitting `name` to widen the search of elements.
			// Let's keep it consistent and match every element if a `name` has not been provided.
			const elementName = pattern.name || /[\s\S]+/;
			const rules = splitRules( pattern );

			this.allowElement( elementName );

			rules.forEach( pattern => this.allowAttributes( pattern ) );
		}
	}

	/**
	 * Load a configuration of one or many elements, where their attributes should be disallowed.
	 *
	 * **Note**: Rules will be applied just before next data pipeline data init or set.
	 *
	 * @param config Configuration of elements that should have their attributes rejected from the editor.
	 */
	public loadDisallowedConfig( config: Array<MatcherPattern> ): void {
		for ( const pattern of config as Array<MatcherPatternWithName> ) {
			// MatcherPattern allows omitting `name` to widen the search of elements.
			// Let's keep it consistent and match every element if a `name` has not been provided.
			const elementName = pattern.name || /[\s\S]+/;
			const rules = splitRules( pattern );

			// Disallow element itself if there is no other rules.
			if ( rules.length == 0 ) {
				this.disallowElement( elementName );
			} else {
				rules.forEach( pattern => this.disallowAttributes( pattern ) );
			}
		}
	}

	/**
	 * Allow the given element in the editor context.
	 *
	 * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * **Note**: Rules will be applied just before next data pipeline data init or set.
	 *
	 * @param viewName String or regular expression matching view name.
	 */
	public allowElement( viewName: string | RegExp ): void {
		for ( const definition of this._dataSchema.getDefinitionsForView( viewName, true ) ) {
			if ( this._allowedElements.has( definition ) ) {
				continue;
			}

			this._allowedElements.add( definition );

			// We need to wait for all features to be initialized before we can register
			// element, so we can access existing features model schemas.
			// If the data has not been initialized yet, _registerElementsAfterInit() method will take care of
			// registering elements.
			if ( this._dataInitialized ) {
				// Defer registration to the next data pipeline data set so any disallow rules could be applied
				// even if added after allow rule (disallowElement).
				this.editor.data.once( 'set', () => {
					this._fireRegisterEvent( definition );
				}, {
					// With the highest priority listener we are able to register elements right before
					// running data conversion.
					priority: priorities.get( 'highest' ) + 1
				} );
			}

			// Reset cached map to recalculate it on the next usage.
			this._coupledAttributes = null;
		}
	}

	/**
	 * Disallow the given element in the editor context.
	 *
	 * This method will only disallow elements described by the {@link module:html-support/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * @param viewName String or regular expression matching view name.
	 */
	public disallowElement( viewName: string | RegExp ): void {
		for ( const definition of this._dataSchema.getDefinitionsForView( viewName, false ) ) {
			this._disallowedElements.add( definition.view! );
		}
	}

	/**
	 * Allow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param config Pattern matching all attributes which should be allowed.
	 */
	public allowAttributes( config: MatcherPattern ): void {
		this._allowedAttributes.add( config );
	}

	/**
	 * Disallow the given attributes for view element allowed by {@link #allowElement} method.
	 *
	 * @param config Pattern matching all attributes which should be disallowed.
	 */
	public disallowAttributes( config: MatcherPattern ): void {
		this._disallowedAttributes.add( config );
	}

	/**
	 * Processes all allowed and disallowed attributes on the view element by consuming them and returning the allowed ones.
	 *
	 * This method applies the configuration set up by {@link #allowAttributes `allowAttributes()`}
	 * and {@link #disallowAttributes `disallowAttributes()`} over the given view element by consuming relevant attributes.
	 * It returns the allowed attributes that were found on the given view element for further processing by integration code.
	 *
	 * ```ts
	 * dispatcher.on( 'element:myElement', ( evt, data, conversionApi ) => {
	 * 	// Get rid of disallowed and extract all allowed attributes from a viewElement.
	 * 	const viewAttributes = dataFilter.processViewAttributes( data.viewItem, conversionApi );
	 * 	// Do something with them, i.e. store inside a model as a dictionary.
	 * 	if ( viewAttributes ) {
	 * 		conversionApi.writer.setAttribute( 'htmlAttributesOfMyElement', viewAttributes, data.modelRange );
	 * 	}
	 * } );
	 * ```
	 *
	 * @see module:engine/conversion/viewconsumable~ViewConsumable#consume
	 *
	 * @returns Object with following properties:
	 * - attributes Set with matched attribute names.
	 * - styles Set with matched style names.
	 * - classes Set with matched class names.
	 */
	public processViewAttributes( viewElement: ViewElement, conversionApi: UpcastConversionApi ): GHSViewAttributes | null {
		// Make sure that the disabled attributes are handled before the allowed attributes are called.
		// For example, for block images the <figure> converter triggers conversion for <img> first and then for other elements, i.e. <a>.
		consumeAttributes( viewElement, conversionApi, this._disallowedAttributes );

		return consumeAttributes( viewElement, conversionApi, this._allowedAttributes );
	}

	/**
	 * Registers elements allowed by {@link module:html-support/datafilter~DataFilter#allowElement} method
	 * once {@link module:engine/controller/datacontroller~DataController editor's data controller} is initialized.
	*/
	private _registerElementsAfterInit() {
		this.editor.data.on( 'init', () => {
			this._dataInitialized = true;

			for ( const definition of this._allowedElements ) {
				this._fireRegisterEvent( definition );
			}
		}, {
			// With highest priority listener we are able to register elements right before
			// running data conversion. Also:
			// * Make sure that priority is higher than the one used by `RealTimeCollaborationClient`,
			// as RTC is stopping event propagation.
			// * Make sure no other features hook into this event before GHS because otherwise the
			// downcast conversion (for these features) could run before GHS registered its converters
			// (https://github.com/ckeditor/ckeditor5/issues/11356).
			priority: priorities.get( 'highest' ) + 1
		} );
	}

	/**
	 * Registers default element handlers.
	 */
	private _registerElementHandlers() {
		this.on<DataFilterRegisterEvent>( 'register', ( evt, definition ) => {
			const schema = this.editor.model.schema;

			// Object element should be only registered for new features.
			// If the model schema is already registered, it should be handled by
			// #_registerBlockElement() or #_registerObjectElement() attribute handlers.
			if ( definition.isObject && !schema.isRegistered( definition.model ) ) {
				this._registerObjectElement( definition );
			} else if ( definition.isBlock ) {
				this._registerBlockElement( definition as DataSchemaBlockElementDefinition );
			} else if ( definition.isInline ) {
				this._registerInlineElement( definition as DataSchemaInlineElementDefinition );
			} else {
				/**
				 * The definition cannot be handled by the data filter.
				 *
				 * Make sure that the registered definition is correct.
				 *
				 * @error data-filter-invalid-definition
				 */
				throw new CKEditorError(
					'data-filter-invalid-definition',
					null,
					definition
				);
			}

			evt.stop();
		}, { priority: 'lowest' } );
	}

	/**
	 * Registers a model post-fixer that is removing coupled GHS attributes of inline elements. Those attributes
	 * are removed if a coupled feature attribute is removed.
	 *
	 * For example, consider following HTML:
	 *
	 * ```html
	 * <a href="foo.html" id="myId">bar</a>
	 * ```
	 *
	 * Which would be upcasted to following text node in the model:
	 *
	 * ```html
	 * <$text linkHref="foo.html" htmlA="{ attributes: { id: 'myId' } }">bar</$text>
	 * ```
	 *
	 * When the user removes the link from that text (using UI), only `linkHref` attribute would be removed:
	 *
	 * ```html
	 * <$text htmlA="{ attributes: { id: 'myId' } }">bar</$text>
	 * ```
	 *
	 * The `htmlA` attribute would stay in the model and would cause GHS to generate an `<a>` element.
	 * This is incorrect from UX point of view, as the user wanted to remove the whole link (not only `href`).
	 */
	private _registerModelPostFixer() {
		const model = this.editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			let changed = false;

			const coupledAttributes = this._getCoupledAttributesMap();

			for ( const change of changes ) {
				// Handle only attribute removals.
				if ( change.type != 'attribute' || change.attributeNewValue !== null ) {
					continue;
				}

				// Find a list of coupled GHS attributes.
				const attributeKeys = coupledAttributes.get( change.attributeKey );

				if ( !attributeKeys ) {
					continue;
				}

				// Remove the coupled GHS attributes on the same range as the feature attribute was removed.
				for ( const { item } of change.range.getWalker( { shallow: true } ) ) {
					for ( const attributeKey of attributeKeys ) {
						if ( item.hasAttribute( attributeKey ) ) {
							writer.removeAttribute( attributeKey, item );
							changed = true;
						}
					}
				}
			}

			return changed;
		} );
	}

	/**
	 * Collects the map of coupled attributes. The returned map is keyed by the feature attribute name
	 * and coupled GHS attribute names are stored in the value array.
	 */
	private _getCoupledAttributesMap(): Map<string, Array<string>> {
		if ( this._coupledAttributes ) {
			return this._coupledAttributes;
		}

		this._coupledAttributes = new Map<string, Array<string>>();

		for ( const definition of this._allowedElements ) {
			if ( definition.coupledAttribute && definition.model ) {
				const attributeNames = this._coupledAttributes.get( definition.coupledAttribute );

				if ( attributeNames ) {
					attributeNames.push( definition.model );
				} else {
					this._coupledAttributes.set( definition.coupledAttribute, [ definition.model ] );
				}
			}
		}

		return this._coupledAttributes;
	}

	/**
	 * Fires `register` event for the given element definition.
	 */
	private _fireRegisterEvent( definition: DataSchemaDefinition ) {
		if ( definition.view && this._disallowedElements.has( definition.view ) ) {
			return;
		}

		this.fire<DataFilterRegisterEvent>( definition.view ? `register:${ definition.view }` : 'register', definition );
	}

	/**
	 * Registers object element and attribute converters for the given data schema definition.
	 */
	private _registerObjectElement( definition: DataSchemaDefinition ) {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const { view: viewName, model: modelName } = definition;

		schema.register( modelName, definition.modelSchema );

		/* istanbul ignore next: paranoid check */
		if ( !viewName ) {
			return;
		}

		schema.extend( definition.model, {
			allowAttributes: [ 'htmlAttributes', 'htmlContent' ]
		} );

		// Store element content in special `$rawContent` custom property to
		// avoid editor's data filtering mechanism.
		editor.data.registerRawContentMatcher( {
			name: viewName
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: viewName,
			model: viewToModelObjectConverter( definition ),
			// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
			// this listener is called before it. If not, some elements will be transformed into a paragraph.
			converterPriority: priorities.get( 'low' ) + 1
		} );
		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition as DataSchemaBlockElementDefinition, this ) );

		conversion.for( 'editingDowncast' ).elementToStructure( {
			model: {
				name: modelName,
				attributes: [
					'htmlAttributes'
				]
			},
			view: toObjectWidgetConverter( editor, definition as DataSchemaInlineElementDefinition )
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: modelName,
			view: ( modelElement, { writer } ) => {
				return createObjectView( viewName, modelElement, writer );
			}
		} );
		conversion.for( 'dataDowncast' ).add( modelToViewBlockAttributeConverter( definition as DataSchemaBlockElementDefinition ) );
	}

	/**
	 * Registers block element and attribute converters for the given data schema definition.
	 */
	private _registerBlockElement( definition: DataSchemaBlockElementDefinition ) {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const { view: viewName, model: modelName } = definition;

		if ( !schema.isRegistered( definition.model ) ) {
			schema.register( definition.model, definition.modelSchema );

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

		if ( !viewName ) {
			return;
		}

		schema.extend( definition.model, {
			allowAttributes: 'htmlAttributes'
		} );

		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition, this ) );
		conversion.for( 'downcast' ).add( modelToViewBlockAttributeConverter( definition ) );
	}

	/**
	 * Registers inline element and attribute converters for the given data schema definition.
	 *
	 * Extends `$text` model schema to allow the given definition model attribute and its properties.
	 */
	private _registerInlineElement( definition: DataSchemaInlineElementDefinition ) {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const attributeKey = definition.model;

		schema.extend( '$text', {
			allowAttributes: attributeKey
		} );

		if ( definition.attributeProperties ) {
			schema.setAttributeProperties( attributeKey, definition.attributeProperties );
		}

		conversion.for( 'upcast' ).add( viewToAttributeInlineConverter( definition, this ) );

		conversion.for( 'downcast' ).attributeToElement( {
			model: attributeKey,
			view: attributeToViewInlineConverter( definition )
		} );
	}
}

/**
 * Fired when {@link module:html-support/datafilter~DataFilter} is registering element and attribute
 * converters for the {@link module:html-support/dataschema~DataSchemaDefinition element definition}.
 *
 * The event also accepts {@link module:html-support/dataschema~DataSchemaDefinition#view} value
 * as an event namespace, e.g. `register:span`.
 *
 * ```ts
 * dataFilter.on( 'register', ( evt, definition ) => {
 * 	editor.model.schema.register( definition.model, definition.modelSchema );
 * 	editor.conversion.elementToElement( { model: definition.model, view: definition.view } );
 *
 * 	evt.stop();
 * } );
 *
 * dataFilter.on( 'register:span', ( evt, definition ) => {
 * 	editor.model.schema.extend( '$text', { allowAttributes: 'htmlSpan' } );
 *
 * 	editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'span', model: 'htmlSpan' } );
 * 	editor.conversion.for( 'downcast' ).attributeToElement( { view: 'span', model: 'htmlSpan' } );
 *
 * 	evt.stop();
 * }, { priority: 'high' } )
 * ```
 *
 * @eventName ~DataFilter#register
 */
export interface DataFilterRegisterEvent {
	name: 'register' | `register:${ string }`;
	args: [ data: DataSchemaDefinition ];
}

/**
 * Matches and consumes the given view attributes.
 */
function consumeAttributes( viewElement: ViewElement, conversionApi: UpcastConversionApi, matcher: Matcher ) {
	const matches = consumeAttributeMatches( viewElement, conversionApi, matcher );
	const { attributes, styles, classes } = mergeMatchResults( matches );
	const viewAttributes: GHSViewAttributes = {};

	// Remove invalid DOM element attributes.
	if ( attributes.size ) {
		for ( const key of attributes ) {
			if ( !isValidAttributeName( key as string ) ) {
				attributes.delete( key );
			}
		}
	}

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

/**
 * Consumes matched attributes.
 *
 * @returns Array with match information about found attributes.
 */
function consumeAttributeMatches( viewElement: ViewElement, { consumable }: UpcastConversionApi, matcher: Matcher ): Array<MatchResult> {
	const matches = matcher.matchAll( viewElement ) || [];
	const consumedMatches = [];

	for ( const match of matches ) {
		removeConsumedAttributes( consumable, viewElement, match );

		// We only want to consume attributes, so element can be still processed by other converters.
		delete match.match.name;

		consumable.consume( viewElement, match.match );
		consumedMatches.push( match );
	}

	return consumedMatches;
}

/**
 * Removes attributes from the given match that were already consumed by other converters.
 */
function removeConsumedAttributes( consumable: ViewConsumable, viewElement: ViewElement, match: MatchResult ) {
	for ( const key of [ 'attributes', 'classes', 'styles' ] as const ) {
		const attributes = match.match[ key ];

		if ( !attributes ) {
			continue;
		}

		// Iterating over a copy of an array so removing items doesn't influence iteration.
		for ( const value of Array.from( attributes ) ) {
			if ( !consumable.test( viewElement, ( { [ key ]: [ value ] } ) ) ) {
				removeItemFromArray( attributes, value );
			}
		}
	}
}

/**
 * Merges the result of {@link module:engine/view/matcher~Matcher#matchAll} method.
 *
 * @param matches
 * @returns Object with following properties:
 * - attributes Set with matched attribute names.
 * - styles Set with matched style names.
 * - classes Set with matched class names.
 */
function mergeMatchResults( matches: Array<MatchResult> ):
{
	attributes: Set<string>;
	styles: Set<string>;
	classes: Set<string>;
} {
	const matchResult = {
		attributes: new Set<string>(),
		classes: new Set<string>(),
		styles: new Set<string>()
	};

	for ( const match of matches ) {
		for ( const key in matchResult ) {
			const values: Array<string> = match.match[ key as keyof typeof matchResult ] || [];

			values.forEach( value => ( matchResult[ key as keyof typeof matchResult ] ).add( value ) );
		}
	}

	return matchResult;
}

/**
 * Converts the given iterable object into an object.
 */
function iterableToObject( iterable: Set<string>, getValue: ( s: string ) => any ) {
	const attributesObject: Record<string, any> = {};

	for ( const prop of iterable ) {
		const value = getValue( prop );
		if ( value !== undefined ) {
			attributesObject[ prop ] = getValue( prop );
		}
	}

	return attributesObject;
}

/**
 * Matcher by default has to match **all** patterns to count it as an actual match. Splitting the pattern
 * into separate patterns means that any matched pattern will be count as a match.
 *
 * @param pattern Pattern to split.
 * @param attributeName Name of the attribute to split (e.g. 'attributes', 'classes', 'styles').
 */
function splitPattern( pattern: MatcherPatternWithName, attributeName: 'attributes' | 'classes' | 'styles' ): Array<MatcherPattern> {
	const { name } = pattern;
	const attributeValue = ( pattern as any )[ attributeName ];
	if ( isPlainObject( attributeValue ) ) {
		return Object.entries( attributeValue ).map(
			( [ key, value ] ) => ( {
				name,
				[ attributeName ]: {
					[ key ]: value
				}
			} ) );
	}

	if ( Array.isArray( attributeValue ) ) {
		return attributeValue.map(
			value => ( {
				name,
				[ attributeName ]: [ value ]
			} )
		);
	}

	return [ pattern ];
}

/**
 * Rules are matched in conjunction (AND operation), but we want to have a match if *any* of the rules is matched (OR operation).
 * By splitting the rules we force the latter effect.
 */
function splitRules( rules: MatcherPatternWithName ): Array<MatcherPattern> {
	const { name, attributes, classes, styles } = rules as any;
	const splittedRules = [];

	if ( attributes ) {
		splittedRules.push( ...splitPattern( { name, attributes }, 'attributes' ) );
	}
	if ( classes ) {
		splittedRules.push( ...splitPattern( { name, classes }, 'classes' ) );
	}
	if ( styles ) {
		splittedRules.push( ...splitPattern( { name, styles }, 'styles' ) );
	}

	return splittedRules;
}

/**
 * Returns true if name is valid for a DOM attribute name.
 */
function isValidAttributeName( name: string ): boolean {
	try {
		document.createAttribute( name );
	} catch ( error ) {
		return false;
	}

	return true;
}
