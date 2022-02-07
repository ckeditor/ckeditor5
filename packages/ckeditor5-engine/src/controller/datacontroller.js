/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/controller/datacontroller
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import Mapper from '../conversion/mapper';

import DowncastDispatcher from '../conversion/downcastdispatcher';
import { insertText } from '../conversion/downcasthelpers';

import UpcastDispatcher from '../conversion/upcastdispatcher';
import { convertText, convertToModelFragment } from '../conversion/upcasthelpers';

import ViewDocumentFragment from '../view/documentfragment';
import ViewDocument from '../view/document';
import ViewDowncastWriter from '../view/downcastwriter';

import ModelRange from '../model/range';
import { autoParagraphEmptyRoots } from '../model/utils/autoparagraphing';
import HtmlDataProcessor from '../dataprocessor/htmldataprocessor';

/**
 * Controller for the data pipeline. The data pipeline controls how data is retrieved from the document
 * and set inside it. Hence, the controller features two methods which allow to {@link ~DataController#get get}
 * and {@link ~DataController#set set} data of the {@link ~DataController#model model}
 * using given:
 *
 * * {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor},
 * * downcast converters,
 * * upcast converters.
 *
 * An instance of the data controller is always available in the {@link module:core/editor/editor~Editor#data `editor.data`}
 * property:
 *
 *		editor.data.get( { rootName: 'customRoot' } ); // -> '<p>Hello!</p>'
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class DataController {
	/**
	 * Creates a data controller instance.
	 *
	 * @param {module:engine/model/model~Model} model Data model.
	 * @param {module:engine/view/stylesmap~StylesProcessor} stylesProcessor The styles processor instance.
	 */
	constructor( model, stylesProcessor ) {
		/**
		 * Data model.
		 *
		 * @readonly
		 * @member {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * Mapper used for the conversion. It has no permanent bindings, because they are created when getting data and
		 * cleared directly after the data are converted. However, the mapper is defined as a class property, because
		 * it needs to be passed to the `DowncastDispatcher` as a conversion API.
		 *
		 * @readonly
		 * @member {module:engine/conversion/mapper~Mapper}
		 */
		this.mapper = new Mapper();

		/**
		 * Downcast dispatcher used by the {@link #get get method}. Downcast converters should be attached to it.
		 *
		 * @readonly
		 * @member {module:engine/conversion/downcastdispatcher~DowncastDispatcher}
		 */
		this.downcastDispatcher = new DowncastDispatcher( {
			mapper: this.mapper,
			schema: model.schema
		} );
		this.downcastDispatcher.on( 'insert:$text', insertText(), { priority: 'lowest' } );

		/**
		 * Upcast dispatcher used by the {@link #set set method}. Upcast converters should be attached to it.
		 *
		 * @readonly
		 * @member {module:engine/conversion/upcastdispatcher~UpcastDispatcher}
		 */
		this.upcastDispatcher = new UpcastDispatcher( {
			schema: model.schema
		} );

		/**
		 * The view document used by the data controller.
		 *
		 * @readonly
		 * @member {module:engine/view/document~Document}
		 */
		this.viewDocument = new ViewDocument( stylesProcessor );

		/**
		 * Styles processor used during the conversion.
		 *
		 * @readonly
		 * @member {module:engine/view/stylesmap~StylesProcessor}
		 */
		this.stylesProcessor = stylesProcessor;

		/**
		 * Data processor used specifically for HTML conversion.
		 *
		 * @readonly
		 * @member {module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor} #htmlProcessor
		 */
		this.htmlProcessor = new HtmlDataProcessor( this.viewDocument );

		/**
		 * Data processor used during the conversion.
		 * Same instance as {@link #htmlProcessor} by default. Can be replaced at run time to handle different format, e.g. XML or Markdown.
		 *
		 * @member {module:engine/dataprocessor/dataprocessor~DataProcessor} #processor
		 */
		this.processor = this.htmlProcessor;

		/**
		 * The view downcast writer just for data conversion purposes, i.e. to modify
		 * the {@link #viewDocument}.
		 *
		 * @private
		 * @readonly
		 * @member {module:engine/view/downcastwriter~DowncastWriter}
		 */
		this._viewWriter = new ViewDowncastWriter( this.viewDocument );

		// Define default converters for text and elements.
		//
		// Note that if there is no default converter for the element it will be skipped, for instance `<b>foo</b>` will be
		// converted to nothing. We therefore add `convertToModelFragment` as a last converter so it converts children of that
		// element to the document fragment and so `<b>foo</b>` will be converted to `foo` if there is no converter for `<b>`.
		this.upcastDispatcher.on( 'text', convertText(), { priority: 'lowest' } );
		this.upcastDispatcher.on( 'element', convertToModelFragment(), { priority: 'lowest' } );
		this.upcastDispatcher.on( 'documentFragment', convertToModelFragment(), { priority: 'lowest' } );

		this.decorate( 'init' );
		this.decorate( 'set' );
		this.decorate( 'get' );

		// Fire the `ready` event when the initialization has completed. Such low-level listener gives possibility
		// to plug into the initialization pipeline without interrupting the initialization flow.
		this.on( 'init', () => {
			this.fire( 'ready' );
		}, { priority: 'lowest' } );

		// Fix empty roots after DataController is 'ready' (note that init method could be decorated and stopped).
		// We need to handle this event because initial data could be empty and post-fixer would not get triggered.
		this.on( 'ready', () => {
			this.model.enqueueChange( { isUndoable: false }, autoParagraphEmptyRoots );
		}, { priority: 'lowest' } );
	}

	/**
	 * Returns the model's data converted by downcast dispatchers attached to {@link #downcastDispatcher} and
	 * formatted by the {@link #processor data processor}.
	 *
	 * @fires get
	 * @param {Object} [options] Additional configuration for the retrieved data. `DataController` provides two optional
	 * properties: `rootName` and `trim`. Other properties of this object are specified by various editor features.
	 * @param {String} [options.rootName='main'] Root name.
	 * @param {String} [options.trim='empty'] Whether returned data should be trimmed. This option is set to `empty` by default,
	 * which means whenever editor content is considered empty, an empty string will be returned. To turn off trimming completely
	 * use `'none'`. In such cases exact content will be returned (for example `<p>&nbsp;</p>` for an empty editor).
	 * @returns {String} Output data.
	 */
	get( options = {} ) {
		const { rootName = 'main', trim = 'empty' } = options;

		if ( !this._checkIfRootsExists( [ rootName ] ) ) {
			/**
			 * Cannot get data from a non-existing root. This error is thrown when {@link #get DataController#get() method}
			 * is called with non-existent root name. For example, if there is an editor instance with only `main` root,
			 * calling {@link #get} like:
			 *
			 *		data.get( { rootName: 'root2' } );
			 *
			 * will throw this error.
			 *
			 * @error datacontroller-get-non-existent-root
			 */
			throw new CKEditorError( 'datacontroller-get-non-existent-root', this );
		}

		const root = this.model.document.getRoot( rootName );

		if ( trim === 'empty' && !this.model.hasContent( root, { ignoreWhitespaces: true } ) ) {
			return '';
		}

		return this.stringify( root, options );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model's element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the downcast converters
	 * attached to {@link #downcastDispatcher} and formatted by the {@link #processor data processor}.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} modelElementOrFragment
	 * Element whose content will be stringified.
	 * @param {Object} [options] Additional configuration passed to the conversion process.
	 * @returns {String} Output data.
	 */
	stringify( modelElementOrFragment, options = {} ) {
		// Model -> view.
		const viewDocumentFragment = this.toView( modelElementOrFragment, options );

		// View -> data.
		return this.processor.toData( viewDocumentFragment );
	}

	/**
	 * Returns the content of the given {@link module:engine/model/element~Element model element} or
	 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment} converted by the downcast
	 * converters attached to {@link #downcastDispatcher} to a
	 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} modelElementOrFragment
	 * Element or document fragment whose content will be converted.
	 * @param {Object} [options={}] Additional configuration that will be available through
	 * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi#options} during the conversion process.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} Output view DocumentFragment.
	 */
	toView( modelElementOrFragment, options = {} ) {
		const viewDocument = this.viewDocument;
		const viewWriter = this._viewWriter;

		// Clear bindings so the call to this method gives correct results.
		this.mapper.clearBindings();

		// First, convert elements.
		const modelRange = ModelRange._createIn( modelElementOrFragment );
		const viewDocumentFragment = new ViewDocumentFragment( viewDocument );

		this.mapper.bindElements( modelElementOrFragment, viewDocumentFragment );

		// Make additional options available during conversion process through `conversionApi`.
		this.downcastDispatcher.conversionApi.options = options;

		// We have no view controller and rendering to DOM in DataController so view.change() block is not used here.
		this.downcastDispatcher.convertInsert( modelRange, viewWriter );

		// Convert markers.
		// For document fragment, simply take the markers assigned to this document fragment.
		// For model root, all markers in that root will be taken.
		// For model element, we need to check which markers are intersecting with this element and relatively modify the markers' ranges.
		// Collapsed markers at element boundary, although considered as not intersecting with the element, will also be returned.
		const markers = modelElementOrFragment.is( 'documentFragment' ) ?
			Array.from( modelElementOrFragment.markers ) :
			_getMarkersRelativeToElement( modelElementOrFragment );

		for ( const [ name, range ] of markers ) {
			this.downcastDispatcher.convertMarkerAdd( name, range, viewWriter );
		}

		// Clean `conversionApi`.
		delete this.downcastDispatcher.conversionApi.options;

		return viewDocumentFragment;
	}

	/**
	 * Sets initial input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #upcastDispatcher view-to-model converters}.
	 * Initial data can be set only to document that {@link module:engine/model/document~Document#version} is equal 0.
	 *
	 * **Note** This method is {@link module:utils/observablemixin~ObservableMixin#decorate decorated} which is
	 * used by e.g. collaborative editing plugin that syncs remote data on init.
	 *
	 * When data is passed as a string it is initialized on a default `main` root:
	 *
	 *		dataController.init( '<p>Foo</p>' ); // Initializes data on the `main` root.
	 *
	 * To initialize data on a different root or multiple roots at once, object containing `rootName` - `data` pairs should be passed:
	 *
	 *		dataController.init( { main: '<p>Foo</p>', title: '<h1>Bar</h1>' } ); // Initializes data on the `main` and `title` roots.
	 *
	 * @fires init
	 * @param {String|Object.<String,String>} data Input data as a string or an object containing `rootName` - `data`
	 * pairs to initialize data on multiple roots at once.
	 * @returns {Promise} Promise that is resolved after the data is set on the editor.
	 */
	init( data ) {
		if ( this.model.document.version ) {
			/**
			 * Cannot set initial data to not empty {@link module:engine/model/document~Document}.
			 * Initial data should be set once, during {@link module:core/editor/editor~Editor} initialization,
			 * when the {@link module:engine/model/document~Document#version} is equal 0.
			 *
			 * @error datacontroller-init-document-not-empty
			 */
			throw new CKEditorError( 'datacontroller-init-document-not-empty', this );
		}

		let initialData = {};
		if ( typeof data === 'string' ) {
			initialData.main = data; // Default root is 'main'. To initiate data on a different root, object should be passed.
		} else {
			initialData = data;
		}

		if ( !this._checkIfRootsExists( Object.keys( initialData ) ) ) {
			/**
			 * Cannot init data on a non-existing root. This error is thrown when {@link #init DataController#init() method}
			 * is called with non-existent root name. For example, if there is an editor instance with only `main` root,
			 * calling {@link #init} like:
			 *
			 * 		data.init( { main: '<p>Foo</p>', root2: '<p>Bar</p>' } );
			 *
			 * will throw this error.
			 *
			 * @error datacontroller-init-non-existent-root
			 */
			throw new CKEditorError( 'datacontroller-init-non-existent-root', this );
		}

		this.model.enqueueChange( { isUndoable: false }, writer => {
			for ( const rootName of Object.keys( initialData ) ) {
				const modelRoot = this.model.document.getRoot( rootName );
				writer.insert( this.parse( initialData[ rootName ], modelRoot ), modelRoot, 0 );
			}
		} );

		return Promise.resolve();
	}

	/**
	 * Sets input data parsed by the {@link #processor data processor} and
	 * converted by the {@link #upcastDispatcher view-to-model converters}.
	 * This method can be used any time to replace existing editor data by the new one without clearing the
	 * {@link module:engine/model/document~Document#history document history}.
	 *
	 * This method also creates a batch with all the changes applied. If all you need is to parse data, use
	 * the {@link #parse} method.
	 *
	 * When data is passed as a string it is set on a default `main` root:
	 *
	 *		dataController.set( '<p>Foo</p>' ); // Sets data on the `main` root.
	 *
	 * To set data on a different root or multiple roots at once, object containing `rootName` - `data` pairs should be passed:
	 *
	 *		dataController.set( { main: '<p>Foo</p>', title: '<h1>Bar</h1>' } ); // Sets data on the `main` and `title` roots.
	 *
	 * To set the data with preserved undo stack and add the change to the undo stack, set `{ isUndoable: true }` as `batchType` option.
	 *
	 *		dataController.set( '<p>Foo</p>', { batchType: { isUndoable: true } } );
	 *
	 * @fires set
	 * @param {String|Object.<String,String>} data Input data as a string or an object containing `rootName` - `data`
	 * pairs to set data on multiple roots at once.
	 * @param {Object} [options={}] Options for setting data.
	 * @param {Object} [options.batchType] The batch type that will be used to create a batch for the changes applied by this method.
	 * By default, the batch will be set as {@link module:engine/model/batch~Batch#isUndoable not undoable} and the undo stack will be
	 * cleared after the new data is applied (all undo steps will be removed). If batch type `isUndoable` flag will be set to `true`,
	 * the undo stack will be preserved.
	 */
	set( data, options = {} ) {
		let newData = {};

		if ( typeof data === 'string' ) {
			newData.main = data; // Default root is 'main'. To set data on a different root, object should be passed.
		} else {
			newData = data;
		}

		if ( !this._checkIfRootsExists( Object.keys( newData ) ) ) {
			/**
			 * Cannot set data on a non-existing root. This error is thrown when {@link #set DataController#set() method}
			 * is called with non-existent root name. For example, if there is an editor instance with only `main` root,
			 * calling {@link #set} like:
			 *
			 * 		data.set( { main: '<p>Foo</p>', root2: '<p>Bar</p>' } );
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
				const modelRoot = this.model.document.getRoot( rootName );

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
	 * @param {String} data Data to parse.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context='$root'] Base context in which the view will
	 * be converted to the model. See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Parsed data.
	 */
	parse( data, context = '$root' ) {
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
	 * @param {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment} viewElementOrFragment
	 * Element or document fragment whose content will be converted.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context='$root'] Base context in which the view will
	 * be converted to the model. See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Output document fragment.
	 */
	toModel( viewElementOrFragment, context = '$root' ) {
		return this.model.change( writer => {
			return this.upcastDispatcher.convert( viewElementOrFragment, writer, context );
		} );
	}

	/**
	 * Adds a style processor normalization rules.
	 *
	 * You can implement your own rules as well as use one of the available processor rules:
	 *
	 * * background: {@link module:engine/view/styles/background~addBackgroundRules}
	 * * border: {@link module:engine/view/styles/border~addBorderRules}
	 * * margin: {@link module:engine/view/styles/margin~addMarginRules}
	 * * padding: {@link module:engine/view/styles/padding~addPaddingRules}
	 *
	 * @param {Function} callback
	 */
	addStyleProcessorRules( callback ) {
		callback( this.stylesProcessor );
	}

	/**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} on {@link #htmlProcessor htmlProcessor}
	 * and {@link #processor processor} for view elements whose content should be treated as a raw data
	 * and not processed during conversion from DOM to view elements.
	 *
	 * The raw data can be later accessed by {@link module:engine/view/element~Element#getCustomProperty view element custom property}
	 * `"$rawContent"`.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all view elements whose content should
	 * be treated as a raw data.
	 */
	registerRawContentMatcher( pattern ) {
		// No need to register the pattern if both `htmlProcessor` and `processor` are the same instances.
		if ( this.processor && this.processor !== this.htmlProcessor ) {
			this.processor.registerRawContentMatcher( pattern );
		}

		this.htmlProcessor.registerRawContentMatcher( pattern );
	}

	/**
	 * Removes all event listeners set by the DataController.
	 */
	destroy() {
		this.stopListening();
	}

	/**
	 * Checks if all provided root names are existing editor roots.
	 *
	 * @private
	 * @param {Array.<String>} rootNames Root names to check.
	 * @returns {Boolean} Whether all provided root names are existing editor roots.
	 */
	_checkIfRootsExists( rootNames ) {
		for ( const rootName of rootNames ) {
			if ( !this.model.document.getRootNames().includes( rootName ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Event fired once the data initialization has finished.
	 *
	 * @event ready
	 */

	/**
	 * Event fired after the {@link #init `init()` method} was run. It can be {@link #listenTo listened to} in order to adjust or modify
	 * the initialization flow. However, if the `init` event is stopped or prevented, the {@link #event:ready `ready` event}
	 * should be fired manually.
	 *
	 * The `init` event is fired by the decorated {@link #init} method.
	 * See {@link module:utils/observablemixin~ObservableMixin#decorate} for more information and samples.
	 *
	 * @event init
	 */

	/**
	 * Event fired after {@link #set set() method} has been run.
	 *
	 * The `set` event is fired by decorated {@link #set} method.
	 * See {@link module:utils/observablemixin~ObservableMixin#decorate} for more information and samples.
	 *
	 * @event set
	 */

	/**
	 * Event fired after the {@link #get get() method} has been run.
	 *
	 * The `get` event is fired by decorated {@link #get} method.
	 * See {@link module:utils/observablemixin~ObservableMixin#decorate} for more information and samples.
	 *
	 * @event get
	 */
}

mix( DataController, ObservableMixin );

// Helper function for downcast conversion.
//
// Takes a document element (element that is added to a model document) and checks which markers are inside it. If the marker is collapsed
// at element boundary, it is considered as contained inside the element and marker range is returned. Otherwise, if the marker is
// intersecting with the element, the intersection is returned.
function _getMarkersRelativeToElement( element ) {
	const result = [];
	const doc = element.root.document;

	if ( !doc ) {
		return [];
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
	return result.sort( ( [ n1, r1 ], [ n2, r2 ] ) => {
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
}
