/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/datafilter
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

import {
	Matcher,
	StylesMap,
	type MatcherPattern,
	type UpcastConversionApi,
	type ViewElement,
	type ViewConsumable,
	type MatcherObjectPattern,
	type DocumentSelectionChangeAttributeEvent,
	type Element,
	type Item
} from 'ckeditor5/src/engine.js';

import {
	CKEditorError,
	priorities,
	isValidAttributeName
} from 'ckeditor5/src/utils.js';

import { Widget } from 'ckeditor5/src/widget.js';

import {
	viewToModelObjectConverter,
	toObjectWidgetConverter,
	createObjectView,

	viewToAttributeInlineConverter,
	attributeToViewInlineConverter,
	emptyInlineModelElementToViewConverter,

	viewToModelBlockAttributeConverter,
	modelToViewBlockAttributeConverter
} from './converters.js';

import {
	default as DataSchema,
	type DataSchemaBlockElementDefinition,
	type DataSchemaDefinition,
	type DataSchemaInlineElementDefinition
} from './dataschema.js';

import {
	getHtmlAttributeName,
	type GHSViewAttributes
} from './utils.js';

import { isPlainObject } from 'es-toolkit/compat';

import '../theme/datafilter.css';

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
		this._registerCoupledAttributesPostFixer();
		this._registerAssociatedHtmlAttributesPostFixer();
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'DataFilter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
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
	public loadAllowedConfig( config: Array<MatcherObjectPattern> ): void {
		for ( const pattern of config ) {
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
	public loadDisallowedConfig( config: Array<MatcherObjectPattern> ): void {
		for ( const pattern of config ) {
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
	 * Load a configuration of one or many elements, where when empty should be allowed.
	 *
	 * **Note**: It modifies DataSchema so must be loaded before registering filtering rules.
	 *
	 * @param config Configuration of elements that should be preserved even if empty.
	 */
	public loadAllowedEmptyElementsConfig( config: Array<string> ): void {
		for ( const elementName of config ) {
			this.allowEmptyElement( elementName );
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
			this._addAllowedElement( definition );

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
	 * Allow the given empty element in the editor context.
	 *
	 * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
	 * to create data filter.
	 *
	 * **Note**: It modifies DataSchema so must be called before registering filtering rules.
	 *
	 * @param viewName String or regular expression matching view name.
	 */
	public allowEmptyElement( viewName: string ): void {
		for ( const definition of this._dataSchema.getDefinitionsForView( viewName, true ) ) {
			if ( definition.isInline ) {
				this._dataSchema.extendInlineElement( { ...definition, allowEmpty: true } );
			}
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
		const { consumable } = conversionApi;

		// Make sure that the disabled attributes are handled before the allowed attributes are called.
		// For example, for block images the <figure> converter triggers conversion for <img> first and then for other elements, i.e. <a>.
		matchAndConsumeAttributes( viewElement, this._disallowedAttributes, consumable );

		return prepareGHSAttribute( viewElement, matchAndConsumeAttributes( viewElement, this._allowedAttributes, consumable ) );
	}

	/**
	 * Adds allowed element definition and fires registration event.
	 */
	private _addAllowedElement( definition: DataSchemaDefinition ): void {
		if ( this._allowedElements.has( definition ) ) {
			return;
		}

		this._allowedElements.add( definition );

		// For attribute based integrations (table figure, document lists, etc.) register related element definitions.
		if ( 'appliesToBlock' in definition && typeof definition.appliesToBlock == 'string' ) {
			for ( const relatedDefinition of this._dataSchema.getDefinitionsForModel( definition.appliesToBlock ) ) {
				if ( relatedDefinition.isBlock ) {
					this._addAllowedElement( relatedDefinition );
				}
			}
		}

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
				priority: priorities.highest + 1
			} );
		}
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
			priority: priorities.highest + 1
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
	private _registerCoupledAttributesPostFixer() {
		const model = this.editor.model;
		const selection = model.document.selection;

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
				for ( const { item } of change.range.getWalker() ) {
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

		this.listenTo<DocumentSelectionChangeAttributeEvent>( selection, 'change:attribute', ( evt, { attributeKeys } ) => {
			const removeAttributes = new Set<string>();
			const coupledAttributes = this._getCoupledAttributesMap();

			for ( const attributeKey of attributeKeys ) {
				// Handle only attribute removals.
				if ( selection.hasAttribute( attributeKey ) ) {
					continue;
				}

				// Find a list of coupled GHS attributes.
				const coupledAttributeKeys = coupledAttributes.get( attributeKey );

				if ( !coupledAttributeKeys ) {
					continue;
				}

				for ( const coupledAttributeKey of coupledAttributeKeys ) {
					if ( selection.hasAttribute( coupledAttributeKey ) ) {
						removeAttributes.add( coupledAttributeKey );
					}
				}
			}

			if ( removeAttributes.size == 0 ) {
				return;
			}

			model.change( writer => {
				for ( const attributeKey of removeAttributes ) {
					writer.removeSelectionAttribute( attributeKey );
				}
			} );
		} );
	}

	/**
	 * Removes `html*Attributes` attributes from incompatible elements.
	 *
	 * For example, consider the following HTML:
	 *
	 * ```html
	 * <heading2 htmlH2Attributes="...">foobar[]</heading2>
	 * ```
	 *
	 * Pressing `enter` creates a new `paragraph` element that inherits
	 * the `htmlH2Attributes` attribute from `heading2`.
	 *
	 * ```html
	 * <heading2 htmlH2Attributes="...">foobar</heading2>
	 * <paragraph htmlH2Attributes="...">[]</paragraph>
	 * ```
	 *
	 * This postfixer ensures that this doesn't happen, and that elements can
	 * only have `html*Attributes` associated with them,
	 * e.g.: `htmlPAttributes` for `<p>`, `htmlDivAttributes` for `<div>`, etc.
	 *
	 * With it enabled, pressing `enter` at the end of `<heading2>` will create
	 * a new paragraph without the `htmlH2Attributes` attribute.
	 *
	 * ```html
	 * <heading2 htmlH2Attributes="...">foobar</heading2>
	 * <paragraph>[]</paragraph>
	 * ```
	 */
	private _registerAssociatedHtmlAttributesPostFixer() {
		const model = this.editor.model;

		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			let changed = false;

			for ( const change of changes ) {
				if ( change.type !== 'insert' || change.name === '$text' ) {
					continue;
				}

				for ( const attr of change.attributes.keys() ) {
					if ( !attr.startsWith( 'html' ) || !attr.endsWith( 'Attributes' ) ) {
						continue;
					}

					if ( !model.schema.checkAttribute( change.name, attr ) ) {
						writer.removeAttribute( attr, change.position.nodeAfter! );
						changed = true;
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

		/* istanbul ignore next: paranoid check -- @preserve */
		if ( !viewName ) {
			return;
		}

		schema.extend( definition.model, {
			allowAttributes: [ getHtmlAttributeName( viewName ), 'htmlContent' ]
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
			// `+ 2` is used to take priority over `_addDefaultH1Conversion` in the Heading plugin.
			converterPriority: priorities.low + 2
		} );
		conversion.for( 'upcast' ).add( viewToModelBlockAttributeConverter( definition as DataSchemaBlockElementDefinition, this ) );

		conversion.for( 'editingDowncast' ).elementToStructure( {
			model: {
				name: modelName,
				attributes: [ getHtmlAttributeName( viewName ) ]
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
			// Do not register converters and empty schema for editor existing feature
			// as empty schema won't allow element anywhere in the model.
			if ( !definition.modelSchema ) {
				return;
			}

			schema.register( definition.model, definition.modelSchema );

			if ( !viewName ) {
				return;
			}

			conversion.for( 'upcast' ).elementToElement( {
				model: modelName,
				view: viewName,
				// With a `low` priority, `paragraph` plugin auto-paragraphing mechanism is executed. Make sure
				// this listener is called before it. If not, some elements will be transformed into a paragraph.
				// `+ 2` is used to take priority over `_addDefaultH1Conversion` in the Heading plugin.
				converterPriority: priorities.low + 2
			} );

			conversion.for( 'downcast' ).elementToElement( {
				model: modelName,
				view: ( modelElement, { writer } ) => definition.isEmpty ?
					writer.createEmptyElement( viewName ) :
					writer.createContainerElement( viewName )
			} );
		}

		if ( !viewName ) {
			return;
		}

		schema.extend( definition.model, {
			allowAttributes: getHtmlAttributeName( viewName )
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

		// This element is stored in the model as an attribute on a block element, for example Lists.
		if ( definition.appliesToBlock ) {
			return;
		}

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

		if ( !definition.allowEmpty ) {
			return;
		}

		schema.setAttributeProperties( attributeKey, { copyFromObject: false } );

		if ( !schema.isRegistered( 'htmlEmptyElement' ) ) {
			schema.register( 'htmlEmptyElement', {
				inheritAllFrom: '$inlineObject'
			} );

			// Helper function to check if an element has any HTML attributes.
			const hasHtmlAttributes = ( element: Element | Item ): boolean =>
				Array
					.from( element.getAttributeKeys() )
					.some( key => key.startsWith( 'html' ) );

			// Register a post-fixer that removes htmlEmptyElement when its htmlXX attribute is removed.
			// See: https://github.com/ckeditor/ckeditor5/issues/18089
			editor.model.document.registerPostFixer( writer => {
				const changes = editor.model.document.differ.getChanges();
				const elementsToRemove = new Set<Element>();

				for ( const change of changes ) {
					if ( change.type === 'remove' ) {
						continue;
					}

					// Look for removal of html* attributes.
					if ( change.type === 'attribute' && change.attributeNewValue === null ) {
						// Find htmlEmptyElement instances in the range that lost their html attribute.
						for ( const { item } of change.range ) {
							if ( item.is( 'element', 'htmlEmptyElement' ) && !hasHtmlAttributes( item ) ) {
								elementsToRemove.add( item );
							}
						}
					}

					// Look for insertion of htmlEmptyElement.
					if ( change.type === 'insert' && change.position.nodeAfter ) {
						const insertedElement = change.position.nodeAfter;

						for ( const { item } of writer.createRangeOn( insertedElement ) ) {
							if ( item.is( 'element', 'htmlEmptyElement' ) && !hasHtmlAttributes( item ) ) {
								elementsToRemove.add( item );
							}
						}
					}
				}

				for ( const element of elementsToRemove ) {
					writer.remove( element );
				}

				return elementsToRemove.size > 0;
			} );
		}

		editor.data.htmlProcessor.domConverter.registerInlineObjectMatcher( element => {
			// Element must be empty and have any attribute.
			if (
				element.name == definition.view &&
				element.isEmpty &&
				Array.from( element.getAttributeKeys() ).length
			) {
				return {
					name: true
				};
			}

			return null;
		} );

		conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'htmlEmptyElement',
				view: emptyInlineModelElementToViewConverter( definition, true )
			} );

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'htmlEmptyElement',
				view: emptyInlineModelElementToViewConverter( definition )
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
 * Matches and consumes matched attributes.
 *
 * @returns Object with following properties:
 * - attributes Array with matched attribute names.
 * - classes Array with matched class names.
 * - styles Array with matched style names.
 */
function matchAndConsumeAttributes(
	viewElement: ViewElement,
	matcher: Matcher,
	consumable: ViewConsumable
): {
		attributes: Array<string>;
		classes: Array<string>;
		styles: Array<string>;
	} {
	const matches = matcher.matchAll( viewElement ) || [];
	const stylesProcessor = viewElement.document.stylesProcessor;

	return matches.reduce( ( result, { match } ) => {
		for ( const [ key, token ] of match.attributes || [] ) {
			// Verify and consume styles.
			if ( key == 'style' ) {
				const style = token!;

				// Check longer forms of the same style as those could be matched
				// but not present in the element directly.
				// Consider only longhand (or longer than current notation) so that
				// we do not include all sides of the box if only one side is allowed.
				const sortedRelatedStyles = stylesProcessor.getRelatedStyles( style )
					.filter( relatedStyle => relatedStyle.split( '-' ).length > style.split( '-' ).length )
					.sort( ( a, b ) => b.split( '-' ).length - a.split( '-' ).length );

				for ( const relatedStyle of sortedRelatedStyles ) {
					if ( consumable.consume( viewElement, { styles: [ relatedStyle ] } ) ) {
						result.styles.push( relatedStyle );
					}
				}

				// Verify and consume style as specified in the matcher.
				if ( consumable.consume( viewElement, { styles: [ style ] } ) ) {
					result.styles.push( style );
				}
			}
			// Verify and consume class names.
			else if ( key == 'class' ) {
				const className = token!;

				if ( consumable.consume( viewElement, { classes: [ className ] } ) ) {
					result.classes.push( className );
				}
			}
			else {
				// Verify and consume other attributes.
				if ( consumable.consume( viewElement, { attributes: [ key ] } ) ) {
					result.attributes.push( key );
				}
			}
		}

		return result;
	}, {
		attributes: [] as Array<string>,
		classes: [] as Array<string>,
		styles: [] as Array<string>
	} );
}

/**
 * Prepares the GHS attribute value as an object with element attributes' values.
 */
function prepareGHSAttribute(
	viewElement: ViewElement,
	{ attributes, classes, styles }: {
		attributes: Array<string>;
		classes: Array<string>;
		styles: Array<string>;
	}
): GHSViewAttributes | null {
	if ( !attributes.length && !classes.length && !styles.length ) {
		return null;
	}

	return {
		...( attributes.length && {
			attributes: getAttributes( viewElement, attributes )
		} ),

		...( styles.length && {
			styles: getReducedStyles( viewElement, styles )
		} ),

		...( classes.length && {
			classes
		} )
	};
}

/**
 * Returns attributes as an object with names and values.
 */
function getAttributes( viewElement: ViewElement, attributes: Iterable<string> ): Record<string, string> {
	const attributesObject: Record<string, string> = {};

	for ( const key of attributes ) {
		const value = viewElement.getAttribute( key );

		if ( value !== undefined && isValidAttributeName( key ) ) {
			attributesObject[ key ] = value;
		}
	}

	return attributesObject;
}

/**
 * Returns styles as an object reduced to shorthand notation without redundant entries.
 */
function getReducedStyles( viewElement: ViewElement, styles: Iterable<string> ): Record<string, string> {
	// Use StyleMap to reduce style value to the minimal form (without shorthand and long-hand notation and duplication).
	const stylesMap = new StylesMap( viewElement.document.stylesProcessor );

	for ( const key of styles ) {
		const styleValue = viewElement.getStyle( key );

		if ( styleValue !== undefined ) {
			stylesMap.set( key, styleValue );
		}
	}

	return Object.fromEntries( stylesMap.getStylesEntries() );
}

/**
 * Matcher by default has to match **all** patterns to count it as an actual match. Splitting the pattern
 * into separate patterns means that any matched pattern will be count as a match.
 *
 * @param pattern Pattern to split.
 * @param attributeName Name of the attribute to split (e.g. 'attributes', 'classes', 'styles').
 */
function splitPattern( pattern: MatcherObjectPattern, attributeName: 'attributes' | 'classes' | 'styles' ): Array<MatcherObjectPattern> {
	const { name } = pattern;
	const attributeValue = pattern[ attributeName ];

	if ( isPlainObject( attributeValue ) ) {
		return Object.entries( attributeValue as Record<string, unknown> )
			.map( ( [ key, value ] ) => ( {
				name,
				[ attributeName ]: {
					[ key ]: value
				}
			} ) );
	}

	if ( Array.isArray( attributeValue ) ) {
		return attributeValue
			.map( value => ( {
				name,
				[ attributeName ]: [ value ]
			} ) );
	}

	return [ pattern ];
}

/**
 * Rules are matched in conjunction (AND operation), but we want to have a match if *any* of the rules is matched (OR operation).
 * By splitting the rules we force the latter effect.
 */
function splitRules( rules: MatcherObjectPattern ): Array<MatcherObjectPattern> {
	const { name, attributes, classes, styles } = rules;
	const splitRules = [];

	if ( attributes ) {
		splitRules.push( ...splitPattern( { name, attributes }, 'attributes' ) );
	}

	if ( classes ) {
		splitRules.push( ...splitPattern( { name, classes }, 'classes' ) );
	}

	if ( styles ) {
		splitRules.push( ...splitPattern( { name, styles }, 'styles' ) );
	}

	return splitRules;
}
