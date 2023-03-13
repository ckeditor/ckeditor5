/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/controller/datacontroller
 */

import {
	CKEditorError,
	EmitterMixin,
	ObservableMixin
} from '@ckeditor/ckeditor5-utils';

import Mapper from '../conversion/mapper';

import DowncastDispatcher, { type DowncastInsertEvent } from '../conversion/downcastdispatcher';
import { insertAttributesAndChildren, insertText } from '../conversion/downcasthelpers';

import UpcastDispatcher, {
	type UpcastDocumentFragmentEvent,
	type UpcastElementEvent,
	type UpcastTextEvent
} from '../conversion/upcastdispatcher';
import { convertText, convertToModelFragment } from '../conversion/upcasthelpers';

import ViewDocumentFragment from '../view/documentfragment';
import ViewDocument from '../view/document';
import ViewDowncastWriter from '../view/downcastwriter';
import type ViewElement from '../view/element';
import type { StylesProcessor } from '../view/stylesmap';
import type { MatcherPattern } from '../view/matcher';

import ModelRange from '../model/range';
import type Model from '../model/model';
import type ModelText from '../model/text';
import type ModelElement from '../model/element';
import type ModelTextProxy from '../model/textproxy';
import type ModelDocumentFragment from '../model/documentfragment';
import type { SchemaContextDefinition } from '../model/schema';
import type { BatchType } from '../model/batch';
import { autoParagraphEmptyRoots } from '../model/utils/autoparagraphing';

import HtmlDataProcessor from '../dataprocessor/htmldataprocessor';
import type DataProcessor from '../dataprocessor/dataprocessor';

/**
 * Controller for the data pipeline. The data pipeline controls how data is retrieved from the document
 * and set inside it. Hence, the controller features two methods which allow to {@link ~DataController#get get}
 * and {@link ~DataController#set set} data of the {@link ~DataController#model model}
 * using the given:
 *
 * * {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor},
 * * downcast converters,
 * * upcast converters.
 *
 * An instance of the data controller is always available in the {@link module:core/editor/editor~Editor#data `editor.data`}
 * property:
 *
 * ```ts
 * editor.data.get( { rootName: 'customRoot' } ); // -> '<p>Hello!</p>'
 * ```
 */
export default class DataController extends EmitterMixin() {
	/**
	 * Data model.
	 */
	public readonly model: Model;

	/**
	 * Mapper used for the conversion. It has no permanent bindings, because these are created while getting data and
	 * ae cleared directly after the data are converted. However, the mapper is defined as a class property, because
	 * it needs to be passed to the `DowncastDispatcher` as a conversion API.
	 */
	public readonly mapper: Mapper;

	/**
	 * Downcast dispatcher used by the {@link #get get method}. Downcast converters should be attached to it.
	 */
	public readonly downcastDispatcher: DowncastDispatcher;

	/**
	 * Upcast dispatcher used by the {@link #set set method}. Upcast converters should be attached to it.
	 */
	public readonly upcastDispatcher: UpcastDispatcher;

	/**
	 * The view document used by the data controller.
	 */
	public readonly viewDocument: ViewDocument;

	/**
	 * Styles processor used during the conversion.
	 */
	public readonly stylesProcessor: StylesProcessor;

	/**
	 * Data processor used specifically for HTML conversion.
	 */
	public readonly htmlProcessor: HtmlDataProcessor;

	/**
	 * Data processor used during the conversion.
	 * Same instance as {@link #htmlProcessor} by default. Can be replaced at run time to handle different format, e.g. XML or Markdown.
	 */
	public processor: DataProcessor;

	/**
	 * The view downcast writer just for data conversion purposes, i.e. to modify
	 * the {@link #viewDocument}.
	 */
	private readonly _viewWriter: ViewDowncastWriter;

	/**
	 * Creates a data controller instance.
	 *
	 * @param model Data model.
	 * @param stylesProcessor The styles processor instance.
	 */
	constructor( model: Model, stylesProcessor: StylesProcessor ) {
		super();

		this.model = model;
		this.mapper = new Mapper();

		this.downcastDispatcher = new DowncastDispatcher( {
			mapper: this.mapper,
			schema: model.schema
		} );
		this.downcastDispatcher.on<DowncastInsertEvent<ModelText | ModelTextProxy>>( 'insert:$text', insertText(), { priority: 'lowest' } );
		this.downcastDispatcher.on<DowncastInsertEvent>( 'insert', insertAttributesAndChildren(), { priority: 'lowest' } );

		this.upcastDispatcher = new UpcastDispatcher( {
			schema: model.schema
		} );

		this.viewDocument = new ViewDocument( stylesProcessor );
		this.stylesProcessor = stylesProcessor;
		this.htmlProcessor = new HtmlDataProcessor( this.viewDocument );
		this.processor = this.htmlProcessor;
		this._viewWriter = new ViewDowncastWriter( this.viewDocument );

		// Define default converters for text and elements.
		//
		// Note that if there is no default converter for the element it will be skipped, for instance `<b>foo</b>` will be
		// converted to nothing. We therefore add `convertToModelFragment` as a last converter so it converts children of that
		// element to the document fragment so `<b>foo</b>` will still be converted to `foo` even if there is no converter for `<b>`.
		this.upcastDispatcher.on<UpcastTextEvent>( 'text', convertText(), { priority: 'lowest' } );
		this.upcastDispatcher.on<UpcastElementEvent>( 'element', convertToModelFragment(), { priority: 'lowest' } );
		this.upcastDispatcher.on<UpcastDocumentFragmentEvent>( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

		ObservableMixin().prototype.decorate.call( this, 'init' as any );
		ObservableMixin().prototype.decorate.call( this, 'set' as any );
		ObservableMixin().prototype.decorate.call( this, 'get' as any );
		ObservableMixin().prototype.decorate.call( this, 'toView' as any );
		ObservableMixin().prototype.decorate.call( this, 'toModel' as any );

		// Fire the `ready` event when the initialization has completed. Such low-level listener offers the possibility
		// to plug into the initialization pipeline without interrupting the initialization flow.
		this.on<DataControllerInitEvent>( 'init', () => {
			this.fire<DataControllerReadyEvent>( 'ready' );
		}, { priority: 'lowest' } );

		// Fix empty roots after DataController is 'ready' (note that the init method could be decorated and stopped).
		// We need to handle this event because initial data could be empty and the post-fixer would not get triggered.
		this.on<DataControllerReadyEvent>( 'ready', () => {
			this.model.enqueueChange( { isUndoable: false }, autoParagraphEmptyRoots );
		}, { priority: 'lowest' } );
	}

	/**
	 * Returns the model's data converted by downcast dispatchers attached to {@link #downcastDispatcher} and
	 * formatted by the {@link #processor data processor}.
	 *
	 * @fires get
	 * @param options Additional configuration for the retrieved data. `DataController` provides two optional
	 * properties: `rootName` and `trim`. Other properties of this object are specified by various editor features.
	 * @param options.rootName Root name. Default 'main'.
	 * @param options.trim Whether returned data should be trimmed. This option is set to `empty` by default,
	 * which means whenever editor content is considered empty, an empty string will be returned. To turn off trimming completely
	 * use `'none'`. In such cases the exact content will be returned (for example a `<p>&nbsp;</p>` for an empty editor).
	 * @returns Output data.
	 */
	public get(
		options: {
			rootName?: string;
			trim?: 'empty' | 'none';
			[ key: string ]: unknown;
		} = {}
	): string {
		const { rootName = 'main', trim = 'empty' } = options;

		if ( !this._checkIfRootsExists( [ rootName ] ) ) {
			/**
			 * Cannot get data from a non-existing root. This error is thrown when
			 * {@link module:engine/controller/datacontroller~DataController#get `DataController#get()` method}
			 * is called with a non-existent root name. For example, if there is an editor instance with only `main` root,
			 * calling {@link module:engine/controller/datacontroller~DataController#get} like:
			 *
			 * ```ts
			 * data.get( { rootName: 'root2' } );
			 * ```
			 *
			 * will throw this error.
			 *
			 * @error datacontroller-get-non-existent-root
			 */
			throw new CKEditorError( 'datacontroller-get-non-existent-root', this );
		}

		const root = this.model.document.getRoot( rootName )!;

		if ( trim === 'empty' && !this.model.hasContent( root, { ignoreWhitespaces: true } ) ) {
			return '';
		}

		return this.stringify( root, options );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model's element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the downcast converters
	 * attached to the {@link #downcastDispatcher} and formatted by the {@link #processor data processor}.
	 *
	 * @param modelElementOrFragment The element whose content will be stringified.
	 * @param options Additional configuration passed to the conversion process.
	 * @returns Output data.
	 */
	public stringify(
		modelElementOrFragment: ModelElement | ModelDocumentFragment,
		options: Record<string, unknown> = {}
	): string {
		// Model -> view.
		const viewDocumentFragment = this.toView( modelElementOrFragment, options );

		// View -> data.
		return this.processor.toData( viewDocumentFragment );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the downcast
	 * converters attached to {@link #downcastDispatcher} into a
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
	 *
	 * @fires toView
	 * @param modelElementOrFragment Element or document fragment whose content will be converted.
	 * @param options Additional configuration that will be available through the
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi#options} during the conversion process.
	 * @returns Output view DocumentFragment.
	 */
	public toView(
		modelElementOrFragment: ModelElement | ModelDocumentFragment,
		options: Record<string, unknown> = {}
	): ViewDocumentFragment {
		const viewDocument = this.viewDocument;
		const viewWriter = this._viewWriter;

		// Clear bindings so the call to this method returns correct results.
		this.mapper.clearBindings();

		// First, convert elements.
		const modelRange = ModelRange._createIn( modelElementOrFragment );
		const viewDocumentFragment = new ViewDocumentFragment( viewDocument );

		this.mapper.bindElements( modelElementOrFragment, viewDocumentFragment );

		// Prepare list of markers.
		// For document fragment, simply take the markers assigned to this document fragment.
		// For model root, all markers in that root will be taken.
		// For model element, we need to check which markers are intersecting with this element and relatively modify the markers' ranges.
		// Collapsed markers at element boundary, although considered as not intersecting with the element, will also be returned.
		const markers = modelElementOrFragment.is( 'documentFragment' ) ?
			modelElementOrFragment.markers :
			_getMarkersRelativeToElement( modelElementOrFragment );

		this.downcastDispatcher.convert( modelRange, markers, viewWriter, options );

		return viewDocumentFragment;
	}

	/**
	 * Sets the initial input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #upcastDispatcher view-to-model converters}.
	 * Initial data can be only set to a document whose {@link module:engine/model/document~Document#version} is equal 0.
	 *
	 * **Note** This method is {@link module:utils/observablemixin~Observable#decorate decorated} which is
	 * used by e.g. collaborative editing plugin that syncs remote data on init.
	 *
	 * When data is passed as a string, it is initialized on the default `main` root:
	 *
	 * ```ts
	 * dataController.init( '<p>Foo</p>' ); // Initializes data on the `main` root only, as no other is specified.
	 * ```
	 *
	 * To initialize data on a different root or multiple roots at once, an object containing `rootName` - `data` pairs should be passed:
	 *
	 * ```ts
	 * dataController.init( { main: '<p>Foo</p>', title: '<h1>Bar</h1>' } ); // Initializes data on both the `main` and `title` roots.
	 * ```
	 *
	 * @fires init
	 * @param data Input data as a string or an object containing the `rootName` - `data`
	 * pairs to initialize data on multiple roots at once.
	 * @returns Promise that is resolved after the data is set on the editor.
	 */
	public init( data: string | Record<string, string> ): Promise<void> {
		if ( this.model.document.version ) {
			/**
			 * Cannot set initial data to a non-empty {@link module:engine/model/document~Document}.
			 * Initial data should be set once, during the {@link module:core/editor/editor~Editor} initialization,
			 * when the {@link module:engine/model/document~Document#version} is equal 0.
			 *
			 * @error datacontroller-init-document-not-empty
			 */
			throw new CKEditorError( 'datacontroller-init-document-not-empty', this );
		}

		let initialData: Record<string, string> = {};

		if ( typeof data === 'string' ) {
			initialData.main = data; // Default root is 'main'. To initiate data on a different root, object should be passed.
		} else {
			initialData = data;
		}

		if ( !this._checkIfRootsExists( Object.keys( initialData ) ) ) {
			/**
			 * Cannot init data on a non-existent root. This error is thrown when
			 * {@link module:engine/controller/datacontroller~DataController#init DataController#init() method}
			 * is called with non-existent root name. For example, if there is an editor instance with only `main` root,
			 * calling {@link module:engine/controller/datacontroller~DataController#init} like:
			 *
			 * ```ts
			 * data.init( { main: '<p>Foo</p>', root2: '<p>Bar</p>' } );
			 * ```
			 *
			 * will throw this error.
			 *
			 * @error datacontroller-init-non-existent-root
			 */
			throw new CKEditorError( 'datacontroller-init-non-existent-root', this );
		}

		this.model.enqueueChange( { isUndoable: false }, writer => {
			for ( const rootName of Object.keys( initialData ) ) {
				const modelRoot = this.model.document.getRoot( rootName )!;

				writer.insert( this.parse( initialData[ rootName ], modelRoot ), modelRoot, 0 );
			}
		} );

		return Promise.resolve();
	}

	/**
	 * Sets the input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #upcastDispatcher view-to-model converters}.
	 * This method can be used any time to replace existing editor data with the new one without clearing the
	 * {@link module:engine/model/document~Document#history document history}.
	 *
	 * This method also creates a batch with all the changes applied. If all you need is to parse data, use
	 * the {@link #parse} method.
	 *
	 * When data is passed as a string it is set on the default `main` root:
	 *
	 * ```ts
	 * dataController.set( '<p>Foo</p>' ); // Sets data on the `main` root, as no other is specified.
	 * ```
	 *
	 * To set data on a different root or multiple roots at once, an object containing `rootName` - `data` pairs should be passed:
	 *
	 * ```ts
	 * dataController.set( { main: '<p>Foo</p>', title: '<h1>Bar</h1>' } ); // Sets data on the `main` and `title` roots as specified.
	 * ```
	 *
	 * To set the data with a preserved undo stack and add the change to the undo stack, set `{ isUndoable: true }` as a `batchType` option.
	 *
	 * ```ts
	 * dataController.set( '<p>Foo</p>', { batchType: { isUndoable: true } } );
	 * ```
	 *
	 * @fires set
	 * @param data Input data as a string or an object containing the `rootName` - `data`
	 * pairs to set data on multiple roots at once.
	 * @param options Options for setting data.
	 * @param options.batchType The batch type that will be used to create a batch for the changes applied by this method.
	 * By default, the batch will be set as {@link module:engine/model/batch~Batch#isUndoable not undoable} and the undo stack will be
	 * cleared after the new data is applied (all undo steps will be removed). If the batch type `isUndoable` flag is be set to `true`,
	 * the undo stack will be preserved instead and not cleared when new data is applied.
	 */
	public set( data: string | Record<string, string>, options: { batchType?: BatchType } = {} ): void {
		let newData: Record<string, string> = {};

		if ( typeof data === 'string' ) {
			newData.main = data; // The default root is 'main'. To set data on a different root, an object should be passed.
		} else {
			newData = data;
		}

		if ( !this._checkIfRootsExists( Object.keys( newData ) ) ) {
			/**
			 * Cannot set data on a non-existent root. This error is thrown when the
			 * {@link module:engine/controller/datacontroller~DataController#set DataController#set() method}
			 * is called with non-existent root name. For example, if there is an editor instance with only the default `main` root,
			 * calling {@link module:engine/controller/datacontroller~DataController#set} like:
			 *
			 * ```ts
			 * data.set( { main: '<p>Foo</p>', root2: '<p>Bar</p>' } );
			 * ```
			 *
			 * will throw this error.
			 *
			 * @error datacontroller-set-non-existent-root
			 */
			throw new CKEditorError( 'datacontroller-set-non-existent-root', this );
		}

		this.model.enqueueChange( options.batchType || {}, writer => {
			writer.setSelection( null );
			writer.removeSelectionAttribute( this.model.document.selection.getAttributeKeys() );

			for ( const rootName of Object.keys( newData ) ) {
				// Save to model.
				const modelRoot = this.model.document.getRoot( rootName )!;

				writer.remove( writer.createRangeIn( modelRoot ) );
				writer.insert( this.parse( newData[ rootName ], modelRoot ), modelRoot, 0 );
			}
		} );
	}

	/**
	 * Returns the data parsed by the {@link #processor data processor} and then converted by upcast converters
	 * attached to the {@link #upcastDispatcher}.
	 *
	 * @see #set
	 * @param data Data to parse.
	 * @param context Base context in which the view will be converted to the model.
	 * See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
	 * @returns Parsed data.
	 */
	public parse( data: string, context: SchemaContextDefinition = '$root' ): ModelDocumentFragment {
		// data -> view
		const viewDocumentFragment = this.processor.toView( data );

		// view -> model
		return this.toModel( viewDocumentFragment, context );
	}

	/**
	 * Returns the result of the given {@link module:engine/view/element~Element view element} or
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment} converted by the
	 * {@link #upcastDispatcher view-to-model converters}, wrapped by {@link module:engine/model/documentfragment~DocumentFragment}.
	 *
	 * When marker elements were converted during the conversion process, it will be set as a document fragment's
	 * {@link module:engine/model/documentfragment~DocumentFragment#markers static markers map}.
	 *
	 * @fires toModel
	 * @param viewElementOrFragment The element or document fragment whose content will be converted.
	 * @param context Base context in which the view will be converted to the model.
	 * See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
	 * @returns Output document fragment.
	 */
	public toModel(
		viewElementOrFragment: ViewElement | ViewDocumentFragment,
		context: SchemaContextDefinition = '$root'
	): ModelDocumentFragment {
		return this.model.change( writer => {
			return this.upcastDispatcher.convert( viewElementOrFragment, writer, context );
		} );
	}

	/**
	 * Adds the style processor normalization rules.
	 *
	 * You can implement your own rules as well as use one of the available processor rules:
	 *
	 * * background: {@link module:engine/view/styles/background~addBackgroundRules}
	 * * border: {@link module:engine/view/styles/border~addBorderRules}
	 * * margin: {@link module:engine/view/styles/margin~addMarginRules}
	 * * padding: {@link module:engine/view/styles/padding~addPaddingRules}
	 */
	public addStyleProcessorRules( callback: ( stylesProcessor: StylesProcessor ) => void ): void {
		callback( this.stylesProcessor );
	}

	/**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} on an {@link #htmlProcessor htmlProcessor}
	 * and a {@link #processor processor} for view elements whose content should be treated as raw data
	 * and not processed during the conversion from DOM to view elements.
	 *
	 * The raw data can be later accessed by the {@link module:engine/view/element~Element#getCustomProperty view element custom property}
	 * `"$rawContent"`.
	 *
	 * @param pattern Pattern matching all view elements whose content should be treated as a raw data.
	 */
	public registerRawContentMatcher( pattern: MatcherPattern ): void {
		// No need to register the pattern if both the `htmlProcessor` and `processor` are the same instances.
		if ( this.processor && this.processor !== this.htmlProcessor ) {
			this.processor.registerRawContentMatcher( pattern );
		}

		this.htmlProcessor.registerRawContentMatcher( pattern );
	}

	/**
	 * Removes all event listeners set by the DataController.
	 */
	public destroy(): void {
		this.stopListening();
	}

	/**
	 * Checks whether all provided root names are actually existing editor roots.
	 *
	 * @param rootNames Root names to check.
	 * @returns Whether all provided root names are existing editor roots.
	 */
	private _checkIfRootsExists( rootNames: Array<string> ): boolean {
		for ( const rootName of rootNames ) {
			if ( !this.model.document.getRootNames().includes( rootName ) ) {
				return false;
			}
		}

		return true;
	}
}

/**
 * Event fired once the data initialization has finished.
 *
 * @eventName ~DataController#ready
 */
export type DataControllerReadyEvent = {
	name: 'ready';
	args: [];
};

/**
 * An event fired after the {@link ~DataController#init `init()` method} was run. It can be {@link ~DataController#listenTo listened to} in
 * order to adjust or modify the initialization flow. However, if the `init` event is stopped or prevented,
 * the {@link ~DataController#event:ready `ready` event} should be fired manually.
 *
 * The `init` event is fired by the decorated {@link ~DataController#init} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#init
 */
export type DataControllerInitEvent = {
	name: 'init';
	args: [ Parameters<DataController[ 'init' ]> ];
	return: ReturnType<DataController[ 'init' ]>;
};

/**
 * An event fired after {@link ~DataController#set set() method} has been run.
 *
 * The `set` event is fired by the decorated {@link ~DataController#set} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#set
 */
export type DataControllerSetEvent = {
	name: 'set';
	args: [ Parameters<DataController[ 'set' ]> ];
	return: ReturnType<DataController[ 'set' ]>;
};

/**
 * Event fired after the {@link ~DataController#get get() method} has been run.
 *
 * The `get` event is fired by the decorated {@link ~DataController#get} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#get
 */
export type DataControllerGetEvent = {
	name: 'get';
	args: [ Parameters<DataController[ 'get' ]> ];
	return: ReturnType<DataController[ 'get' ]>;
};

/**
 * Event fired after the {@link ~DataController#toView toView() method} has been run.
 *
 * The `toView` event is fired by the decorated {@link ~DataController#toView} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#toView
 */
export type DataControllerToViewEvent = {
	name: 'toView';
	args: [ Parameters<DataController[ 'toView' ]> ];
	return: ReturnType<DataController[ 'toView' ]>;
};

/**
 * Event fired after the {@link ~DataController#toModel toModel() method} has been run.
 *
 * The `toModel` event is fired by the decorated {@link ~DataController#toModel} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#toModel
 */
export type DataControllerToModelEvent = {
	name: 'toModel';
	args: [ Parameters<DataController[ 'toModel' ]> ];
	return: ReturnType<DataController[ 'toModel' ]>;
};

/**
 * Helper function for downcast conversion.
 *
 * Takes a document element (element that is added to a model document) and checks which markers are inside it. If the marker is collapsed
 * at element boundary, it is considered as contained inside the element and marker range is returned. Otherwise, if the marker is
 * intersecting with the element, the intersection is returned.
 */
function _getMarkersRelativeToElement( element: ModelElement ): Map<string, ModelRange> {
	const result: Array<[ string, ModelRange ]> = [];
	const doc = element.root.document;

	if ( !doc ) {
		return new Map();
	}

	const elementRange = ModelRange._createIn( element );

	for ( const marker of doc.model.markers ) {
		const markerRange = marker.getRange();

		const isMarkerCollapsed = markerRange.isCollapsed;
		const isMarkerAtElementBoundary = markerRange.start.isEqual( elementRange.start ) || markerRange.end.isEqual( elementRange.end );

		if ( isMarkerCollapsed && isMarkerAtElementBoundary ) {
			result.push( [ marker.name, markerRange ] );
		} else {
			const updatedMarkerRange = elementRange.getIntersection( markerRange );

			if ( updatedMarkerRange ) {
				result.push( [ marker.name, updatedMarkerRange ] );
			}
		}
	}

	// Sort the markers in a stable fashion to ensure that the order in which they are
	// added to the model's marker collection does not affect how they are
	// downcast. One particular use case that we are targeting here, is one where
	// two markers are adjacent but not overlapping, such as an insertion/deletion
	// suggestion pair representing the replacement of a range of text. In this
	// case, putting the markers in DOM order causes the first marker's end to be
	// serialized right after the second marker's start, while putting the markers
	// in reverse DOM order causes it to be right before the second marker's
	// start. So, we sort these in a way that ensures non-intersecting ranges are in
	// reverse DOM order, and intersecting ranges are in something approximating
	// reverse DOM order (since reverse DOM order doesn't have a precise meaning
	// when working with intersecting ranges).
	result.sort( ( [ n1, r1 ], [ n2, r2 ] ) => {
		if ( r1.end.compareWith( r2.start ) !== 'after' ) {
			// m1.end <= m2.start -- m1 is entirely <= m2
			return 1;
		} else if ( r1.start.compareWith( r2.end ) !== 'before' ) {
			// m1.start >= m2.end -- m1 is entirely >= m2
			return -1;
		} else {
			// they overlap, so use their start positions as the primary sort key and
			// end positions as the secondary sort key
			switch ( r1.start.compareWith( r2.start ) ) {
				case 'before':
					return 1;
				case 'after':
					return -1;
				default:
					switch ( r1.end.compareWith( r2.end ) ) {
						case 'before':
							return 1;
						case 'after':
							return -1;
						default:
							return n2.localeCompare( n1 );
					}
			}
		}
	} );

	return new Map( result );
}
