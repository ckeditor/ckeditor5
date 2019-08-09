/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresizer
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import getAncestors from '@ckeditor/ckeditor5-utils/src/dom/getancestors';
import ResizeContext2 from './resizecontext';
import ResizerTopBound from './resizertopbound';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

const WIDTH_ATTRIBUTE_NAME = 'width';

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
 * Widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresizer~WidgetResizer#apply} method to create resizer for a provided widget.
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

		const mouseObserverHost = global.window.document;

		this._observers = {
			mouseMove: Object.create( DomEmitterMixin ),
			mouseDownUp: Object.create( DomEmitterMixin ),
		};

		let isActive = false;

		const mouseMoveListener = ( event, domEventData ) => {
			if ( this.activeContext ) {
				this.activeContext.updateSize( domEventData );
			}
		};

		this.editor.editing.view.document.on( 'layoutChanged', () => {
			// This works around the issue with undo.
			for ( const context of this.contexts ) {
				// This check is needed, as there were cases when widget was not yet initialized but layoutChanged happened.
				if ( context.domResizeWrapper && context.domResizeWrapper.parentElement ) {
					context.resizeStrategy.redrawShadow();
				}
			}
		} );

		this._observers.mouseDownUp.listenTo( mouseObserverHost, 'mousedown', ( event, domEventData ) => {
			const target = domEventData.target;

			const resizeHandler = isResizeHandler( target ) ? target : getAncestors( target ).filter( isResizeHandler )[ 0 ];

			if ( resizeHandler ) {
				isActive = true;
				// this._observers.mouseMove.enable();
				this._observers.mouseMove.listenTo( mouseObserverHost, 'mousemove', mouseMoveListener );

				this.activeContext = this._getContextByHandler( resizeHandler );

				if ( this.activeContext ) {
					this.activeContext.begin( resizeHandler );
				}
			}
		} );

		const finishResizing = () => {
			if ( isActive ) {
				isActive = false;
				// this._observers.mouseMove.disable();
				this._observers.mouseMove.stopListening( mouseObserverHost, 'mousemove', mouseMoveListener );

				if ( this.activeContext ) {
					this.activeContext.commit( this.editor );
				}

				this.activeContext = null;
			}
		};

		// @todo: it should listen on the entire window, as it should also catch events outside of the editable.
		this._observers.mouseDownUp.listenTo( mouseObserverHost, 'mouseup', finishResizing );

		function isResizeHandler( element ) {
			return element.classList && element.classList.contains( 'ck-widget__resizer' );
		}
	}

	/**
	 * Method that applies a resizer to a given `widgetElement`.
	 *
	 * ```js
	 * conversion.for( 'editingDowncast' ).elementToElement( {
	 *		model: 'image',
	 *		view: ( modelElement, viewWriter ) => {
	 *			const widget = toImageWidget( createImageViewElement( viewWriter ), viewWriter, t( 'image widget' ) );
	 *
	 *			editor.plugins.get( 'WidgetResizer' ).apply( widget, viewWriter );
	 *
	 *			return widget;
	 *		}
	 *	} );
	 * ```
	 *
	 * You can use the `options` parameter to customize the behavior of the resizer:
	 *
	 * ```js
	 * conversion.for( 'editingDowncast' ).elementToElement( {
	 *			model: 'image',
	 *			view: ( modelElement, viewWriter ) => {
	 *				const widget = toImageWidget( createImageViewElement( viewWriter ), viewWriter, t( 'image widget' ) );
	 *
	 *				editor.plugins.get( 'WidgetResizer' ).apply( widget, viewWriter, {
	 *					getResizeHost( wrapper ) {
	 *						return wrapper.querySelector( 'img' );
	 *					},
	 *					getAspectRatio( resizeHost ) {
	 *						return resizeHost.naturalWidth / resizeHost.naturalHeight;
	 *					},
	 *					isCentered( context ) {
	 *						const imageStyle = context._getModel( editor, context.widgetWrapperElement ).getAttribute( 'imageStyle' );
	 *
	 *						return !imageStyle || imageStyle == 'full';
	 *					}
	 *				} );
	 *
	 *				return widget;
	 *			}
	 *		} );
	 * ```
	 *
	 * @param {module:engine/view/containerelement~ContainerElement} widgetElement
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 * @param {module:widget/widgetresizer~ResizerOptions} [options] Resizer options.
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

		editor.model.schema.extend( 'image', {
			allowAttributes: WIDTH_ATTRIBUTE_NAME
		} );

		editor.model.schema.setAttributeProperties( WIDTH_ATTRIBUTE_NAME, {
			isFormatting: true
		} );
	}

	_registerConverters() {
		const editor = this.editor;

		// Dedicated converter to propagate image's attribute to the img tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:width:image', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const img = conversionApi.mapper.toViewElement( data.item ).getChild( 0 );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( WIDTH_ATTRIBUTE_NAME, data.attributeNewValue + 'px', img );
				} else {
					viewWriter.removeStyle( WIDTH_ATTRIBUTE_NAME, img );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					styles: {
						'width': /[\d.]+(px)?/
					}
				},
				model: {
					key: WIDTH_ATTRIBUTE_NAME,
					value: viewElement => viewElement.getStyle( 'width' ).replace( 'px', '' )
				}
			} );
	}
}
