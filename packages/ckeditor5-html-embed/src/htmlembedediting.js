/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-embed/htmlembedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import HTMLEmbedInsertCommand from './htmlembedinsertcommand';
import HTMLEmbedUpdateCommand from './htmlembedupdatecommand';
import { toRawHtmlWidget } from './utils';
import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import htmlEmbedModeIcon from '../theme/icons/htmlembedmode.svg';
import '../theme/htmlembed.css';

/**
 * The HTML embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HTMLEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HTMLEmbedEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'htmlEmbed', {
			previewsInData: false,
			sanitizeHtml: rawHtml => {
				/**
				 * When using the HTML embed feature with `htmlEmbed.previewsInData=true` option, it's strongly recommended to
				 * define a sanitize function that will clean an input HTML in order to avoid XSS vulnerability.
				 * TODO: Add a link to the feature documentation.
				 *
				 * @error html-embed-provide-sanitize-function
				 * @param {String} name The name of the component.
				 */
				logWarning( 'html-embed-provide-sanitize-function' );

				return {
					html: rawHtml,
					hasModified: false
				};
			}
		} );

		/**
		 * A collection that contains all events that must be attached directly to the DOM elements.
		 *
		 * @private
		 * @type {Set.<Object>}
		 */
		this._domListeners = new Set();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		const htmlEmbedInsertCommand = new HTMLEmbedInsertCommand( editor );
		const htmlEmbedUpdateCommand = new HTMLEmbedUpdateCommand( editor );

		schema.register( 'rawHtml', {
			isObject: true,
			allowWhere: '$block',
			allowAttributes: [ 'value' ]
		} );

		editor.commands.add( 'htmlEmbedUpdate', htmlEmbedUpdateCommand );
		editor.commands.add( 'htmlEmbedInsert', htmlEmbedInsertCommand );

		this._setupConversion();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		for ( const item of this._domListeners ) {
			item.element.removeEventListener( item.event, item.listener );
		}

		this._domListeners.clear();

		return super.destroy();
	}

	/**
	 * Set-ups converters for the feature.
	 *
	 * @private
	 */
	_setupConversion() {
		// TODO: Typing around the widget does not work after adding the 'data-cke-ignore-events` attribute.
		// TODO: Wrapping the inner views in another container with the attribute resolved WTA issue but events
		// TODO: inside the views are not triggered.
		const editor = this.editor;
		const t = editor.t;
		const view = editor.editing.view;

		const htmlEmbedConfig = editor.config.get( 'htmlEmbed' );
		const domListeners = this._domListeners;

		const upcastWriter = new UpcastWriter( view.document );
		const htmlProcessor = new HtmlDataProcessor( view.document );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div',
				classes: 'raw-html-embed'
			},
			model: ( viewElement, { writer } ) => {
				const fragment = upcastWriter.createDocumentFragment( viewElement.getChildren() );
				const innerHtml = htmlProcessor.toData( fragment );

				return writer.createElement( 'rawHtml', {
					value: innerHtml
				} );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, { writer } ) => {
				return writer.createRawElement( 'div', { class: 'raw-html-embed' }, function( domElement ) {
					domElement.innerHTML = modelElement.getAttribute( 'value' ) || '';
				} );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'rawHtml',
			view: ( modelElement, { writer } ) => {
				const widgetLabel = t( 'HTML snippet' );
				const placeholder = t( 'Paste the raw code here.' );

				const viewWrapper = writer.createContainerElement( 'div', {
					class: 'raw-html',
					'data-cke-ignore-events': true
				} );

				// Whether to show a preview mode or editing area.
				writer.setCustomProperty( 'isEditingSourceActive', false, viewWrapper );

				// The editing raw HTML field.
				const textarea = writer.createUIElement( 'textarea', { placeholder }, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					writer.setCustomProperty( 'DOMElement', root, textarea );

					root.value = modelElement.getAttribute( 'value' ) || '';

					attachDomListener( root, 'input', () => {
						editor.execute( 'htmlEmbedUpdate', root.value );
					} );

					return root;
				} );

				// The switch button between preview and editing HTML.
				const toggleButton = writer.createUIElement( 'div', { class: 'raw-html__switch-mode' }, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					writer.setCustomProperty( 'DOMElement', root, toggleButton );

					attachDomListener( root, 'click', evt => {
						view.change( writer => {
							const isEditingSourceActive = viewWrapper.getCustomProperty( 'isEditingSourceActive' );

							if ( isEditingSourceActive ) {
								writer.removeClass( 'raw-html--edit-source', viewWrapper );
							} else {
								writer.addClass( 'raw-html--edit-source', viewWrapper );
							}

							writer.setCustomProperty( 'isEditingSourceActive', !isEditingSourceActive, viewWrapper );
							evt.preventDefault();
						} );
					} );

					root.innerHTML = htmlEmbedModeIcon;

					return root;
				} );

				// The container that renders the HTML.
				const previewContainer = writer.createRawElement( 'div', { class: 'raw-html__preview' }, function( domElement ) {
					writer.setCustomProperty( 'DOMElement', domElement, previewContainer );

					if ( htmlEmbedConfig.previewsInData ) {
						const sanitizeOutput = htmlEmbedConfig.sanitizeHtml( modelElement.getAttribute( 'value' ) || '' );

						domElement.innerHTML = sanitizeOutput.html;
					} else {
						domElement.innerHTML = '<div class="raw-html__preview-placeholder">Raw HTML snippet.</div>';
					}
				} );

				writer.insert( writer.createPositionAt( viewWrapper, 0 ), toggleButton );
				writer.insert( writer.createPositionAt( viewWrapper, 1 ), textarea );
				writer.insert( writer.createPositionAt( viewWrapper, 2 ), previewContainer );

				return toRawHtmlWidget( viewWrapper, writer, widgetLabel );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).add( downcastRawHtmlValueAttribute( htmlEmbedConfig ) );

		// Attaches an event listener to the specified element.
		//
		// @params {HTMLElement} element An element that the event will be attached.
		// @params {String} event A name of the event.
		// @params {Function} listener A listener that will be executed.
		function attachDomListener( element, event, listener ) {
			element.addEventListener( event, listener );
			domListeners.add( { element, event, listener } );
		}
	}
}

// Returns a converter that handles the `value` attribute of the `rawHtml` element.
//
// It updates the source (`textarea`) value and passes an HTML to the preview element.
//
// @params {module:html-embed/htmlembed~MediaEmbedConfig} htmlEmbedConfig
// @returns {Function}
function downcastRawHtmlValueAttribute( htmlEmbedConfig ) {
	return dispatcher => {
		dispatcher.on( 'attribute:value:rawHtml', ( evt, data, conversionApi ) => {
			const viewWrapper = conversionApi.mapper.toViewElement( data.item );

			const sourceDOMElement = viewWrapper.getChild( 1 ).getCustomProperty( 'DOMElement' );
			const previewDOMElement = viewWrapper.getChild( 2 ).getCustomProperty( 'DOMElement' );

			if ( sourceDOMElement ) {
				sourceDOMElement.value = data.item.getAttribute( 'value' );
			}

			if ( htmlEmbedConfig.previewsInData && previewDOMElement ) {
				const sanitizeOutput = htmlEmbedConfig.sanitizeHtml( data.item.getAttribute( 'value' ) );

				previewDOMElement.innerHTML = sanitizeOutput.html;
			}
		} );
	};
}
