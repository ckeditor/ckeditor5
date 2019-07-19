/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresizer
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MouseObserver from './view/mouseobserver';
import MouseMoveObserver from './view/mousemoveobserver';
import getAncestors from '@ckeditor/ckeditor5-utils/src/dom/getancestors';
import ResizeContext2 from './resizecontext';
import ResizerTopBound from './resizertopbound';

const HEIGHT_ATTRIBUTE_NAME = 'height';

/**
 * Interface describing a resizer. It allows to define available resizer set, specify resizing host etc.
 *
 * @interface ResizerOptions
 */

/**
 * List of available resizers like `"top-left"`, `"bottom-right"`, etc.
 *
 * @member {Array.<String>} module:widget/widgetresizer~ResizerOptions#resizers
 */

/**
 * The base class for widget features. This type provides a common API for reusable features of widgets.
 */
export default class WidgetResizer extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetResizer';
	}

	init() {
		this.set( 'resizerStrategy', null );

		this.on( 'change:resizerStrategy', ( event, name, value ) => {
			for ( const context of this.contexts ) {
				context.resizeStrategy = new ( value || ResizerTopBound )( context, context.options );
			}
		} );

		this.contexts = [];
		this.activeContext = null;

		this._registerSchema();
		this._registerConverters();

		const view = this.editor.editing.view;
		const viewDocument = view.document;

		this._observers = {
			mouseMove: view.addObserver( MouseMoveObserver ),
			mouseDownUp: view.addObserver( MouseObserver )
		};

		// It should start disabled, only upon clicking drag handler it interests us.
		// Currently broken due to https://github.com/ckeditor/ckeditor5-engine/blob/ce6422b/src/view/view.js#L364
		this._observers.mouseMove.disable();

		let isActive = false;

		// Mouse move observer is only needed when the mouse button is pressed.
		// this.listenTo( viewDocument, 'mousemove', () => console.log( 'move' ) );
		this.listenTo( viewDocument, 'mousemove', ( event, domEventData ) => {
			if ( this.activeContext ) {
				this.activeContext.updateSize( domEventData );
			}
		} );

		this.listenTo( viewDocument, 'mousedown', ( event, domEventData ) => {
			const target = domEventData.domTarget;

			const resizeHandler = isResizeHandler( target ) ? target : getAncestors( target ).filter( isResizeHandler )[ 0 ];

			if ( resizeHandler ) {
				isActive = true;
				this._observers.mouseMove.enable();

				this.activeContext = this._getContextByHandler( resizeHandler );

				if ( this.activeContext ) {
					this.activeContext.begin( resizeHandler );
				}
			}
		} );

		const finishResizing = () => {
			if ( isActive ) {
				isActive = false;
				this._observers.mouseMove.disable();

				if ( this.activeContext ) {
					this.activeContext.commit( this.editor );
				}

				this.activeContext = null;
			}
		};

		// @todo: it should listen on the entire window, as it should also catch events outside of the editable.
		this.listenTo( viewDocument, 'mouseup', finishResizing );

		function isResizeHandler( element ) {
			return element.classList && element.classList.contains( 'ck-widget__resizer' );
		}
	}

	/**
	 * @param {module:engine/view/containerelement~ContainerElement} widgetElement
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 * @param {module:widget/widgetresizer~ResizerOptions} [options] Resizer options.
	 * @memberof WidgetResizer
	 */
	apply( widgetElement, writer, options ) {
		const context = new ResizeContext2( options );
		context.attach( widgetElement, writer );

		this.editor.editing.view.once( 'render', () => context.redraw() );

		this.contexts.push( context );
	}

	/**
	 * Returns a resize context associated with given `domResizeWrapper`.
	 *
	 * @param {HTMLElement} domResizeWrapper
	 */
	_getContextByWrapper( domResizeWrapper ) {
		for ( const context of this.contexts ) {
			if ( domResizeWrapper.isSameNode( context.domResizeWrapper ) ) {
				return context;
			}
		}
	}

	_getContextByHandler( domResizeHandler ) {
		return this._getContextByWrapper( getAncestors( domResizeHandler )
			.filter( element => element.classList.contains( 'ck-widget__resizer-wrapper' ) )[ 0 ] );
	}

	_registerSchema() {
		const editor = this.editor;
		// Allow bold attribute on text nodes.
		editor.model.schema.extend( 'image', {
			allowAttributes: HEIGHT_ATTRIBUTE_NAME
		} );

		editor.model.schema.setAttributeProperties( HEIGHT_ATTRIBUTE_NAME, {
			isFormatting: true
		} );
	}

	_registerConverters() {
		const editor = this.editor;

		// Dedicated converter to propagate image's attribute to the img tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:height:image', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const img = conversionApi.mapper.toViewElement( data.item ).getChild( 0 );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( HEIGHT_ATTRIBUTE_NAME, data.attributeNewValue, img );
				} else {
					viewWriter.removeAttribute( HEIGHT_ATTRIBUTE_NAME, img );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'height'
				},
				model: 'height'
			} );
	}
}
