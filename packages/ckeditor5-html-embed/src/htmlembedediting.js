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
import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import HtmlEmbedInsertCommand from './htmlembedinsertcommand';
import HtmlEmbedUpdateCommand from './htmlembedupdatecommand';

import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import eyeIcon from '../theme/icons/eye.svg';

import '../theme/htmlembed.css';

const DISPLAY_PREVIEW_CLASS = 'raw-html--display-preview';

/**
 * The HTML embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HtmlEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HtmlEmbedEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'htmlEmbed', {
			showPreviews: false,
			sanitizeHtml: rawHtml => {
				/**
				 * When using the HTML embed feature with `htmlEmbed.showPreviews=true` option, it is strongly recommended to
				 * define a sanitize function that will clean up an input HTML in order to avoid XSS vulnerability.
				 *
				 * For a detailed overview, check the {@glink features/html-embed HTML embed feature} documentation.
				 *
				 * @error html-embed-provide-sanitize-function
				 */
				logWarning( 'html-embed-provide-sanitize-function' );

				return {
					html: rawHtml,
					hasModified: false
				};
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.register( 'rawHtml', {
			isObject: true,
			allowWhere: '$block',
			allowAttributes: [ 'value' ]
		} );

		editor.commands.add( 'htmlEmbedUpdate', new HtmlEmbedUpdateCommand( editor ) );
		editor.commands.add( 'htmlEmbedInsert', new HtmlEmbedInsertCommand( editor ) );

		this._setupConversion();
	}

	/**
	 * Prepares converters for the feature.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const t = editor.t;
		const view = editor.editing.view;

		const htmlEmbedConfig = editor.config.get( 'htmlEmbed' );
		const upcastWriter = new UpcastWriter( view.document );
		const htmlProcessor = new HtmlDataProcessor( view.document );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div',
				classes: 'raw-html-embed'
			},
			model: ( viewElement, { writer } ) => {
				// Note: The below line has a side-effect – the children are *moved* to the DF so
				// viewElement becomes empty. It's fine here.
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

				const widgetView = writer.createContainerElement( 'div', {
					class: 'raw-html'
				} );

				const rawHtmlContainer = writer.createContainerElement( 'div', {
					'data-cke-ignore-events': true
				} );

				// Whether to show a preview mode or editing area.
				writer.setCustomProperty( 'isEditingSourceActive', false, rawHtmlContainer );

				const textareaAttributes = {
					placeholder,
					disabled: true,
					class: 'ck ck-input ck-input-text raw-html__source'
				};

				// The editing raw HTML field.
				const sourceElement = writer.createUIElement( 'textarea', textareaAttributes, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					writer.setCustomProperty( 'domElement', root, sourceElement );
					root.value = modelElement.getAttribute( 'value' ) || '';
					root.readOnly = editor.isReadOnly;

					root.addEventListener( 'input', () => {
						editor.execute( 'htmlEmbedUpdate', root.value );
					} );

					return root;
				} );

				const buttonAttributes = {
					class: 'ck ck-button ck-on raw-html__switch-mode'
				};

				// The switch button between preview and editing HTML.
				const toggleButton = writer.createUIElement( 'button', buttonAttributes, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					root.innerHTML = pencilIcon;
					root.firstChild.classList.add( 'ck', 'ck-icon', 'ck-button__icon' );

					writer.setCustomProperty( 'domElement', root, toggleButton );

					root.addEventListener( 'click', evt => {
						view.change( writer => {
							if ( htmlEmbedConfig.showPreviews ) {
								if ( widgetView.hasClass( DISPLAY_PREVIEW_CLASS ) ) {
									writer.removeClass( DISPLAY_PREVIEW_CLASS, widgetView );
								} else {
									writer.addClass( DISPLAY_PREVIEW_CLASS, widgetView );
								}
							}

							const textarea = sourceElement.getCustomProperty( 'domElement' );
							textarea.disabled = !textarea.disabled;

							root.innerHTML = textarea.disabled ? pencilIcon : eyeIcon;
							root.firstChild.classList.add( 'ck', 'ck-icon', 'ck-button__icon' );
						} );

						evt.preventDefault();
					} );

					return root;
				} );

				writer.insert( writer.createPositionAt( widgetView, 0 ), rawHtmlContainer );
				writer.insert( writer.createPositionAt( rawHtmlContainer, 0 ), toggleButton );
				writer.insert( writer.createPositionAt( rawHtmlContainer, 1 ), sourceElement );

				// The container that renders the HTML should be created only when `htmlEmbed.showPreviews=true` in the config.
				if ( htmlEmbedConfig.showPreviews ) {
					writer.addClass( [ 'raw-html--preview-enabled', DISPLAY_PREVIEW_CLASS ], widgetView );

					const previewContainer = writer.createRawElement( 'div', { class: 'raw-html__preview' }, function( domElement ) {
						writer.setCustomProperty( 'domElement', domElement, previewContainer );

						const sanitizeOutput = htmlEmbedConfig.sanitizeHtml( modelElement.getAttribute( 'value' ) || '' );
						domElement.innerHTML = sanitizeOutput.html;
					} );

					writer.insert( writer.createPositionAt( rawHtmlContainer, 2 ), previewContainer );
				}

				// Listen to read-only changes.
				this.listenTo( editor, 'change:isReadOnly', ( evt, name, value ) => {
					sourceElement.getCustomProperty( 'domElement' ).readOnly = value;
				} );

				return toRawHtmlWidget( widgetView, writer, widgetLabel );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).add( downcastRawHtmlValueAttribute( htmlEmbedConfig ) );
	}
}

// Returns a converter that handles the `value` attribute of the `rawHtml` element.
//
// It updates the source (`textarea`) value and passes an HTML to the preview element if `htmlEmbed.showPreviews=true`.
//
// @params {module:html-embed/htmlembed~HtmlEmbedConfig} htmlEmbedConfig
// @returns {Function}
function downcastRawHtmlValueAttribute( htmlEmbedConfig ) {
	return dispatcher => {
		dispatcher.on( 'attribute:value:rawHtml', ( evt, data, conversionApi ) => {
			const widgetView = conversionApi.mapper.toViewElement( data.item );
			const rawHtmlContainer = widgetView.getChild( 0 );

			const textareaDomElement = rawHtmlContainer.getChild( 1 ).getCustomProperty( 'domElement' );

			if ( textareaDomElement ) {
				textareaDomElement.value = data.item.getAttribute( 'value' );
			}

			if ( htmlEmbedConfig.showPreviews ) {
				const previewDomElement = rawHtmlContainer.getChild( 2 ).getCustomProperty( 'domElement' );

				if ( previewDomElement ) {
					const sanitizeOutput = htmlEmbedConfig.sanitizeHtml( data.item.getAttribute( 'value' ) || '' );
					previewDomElement.innerHTML = sanitizeOutput.html;
				}
			}
		} );
	};
}

// Converts a given {@link module:engine/view/element~Element} to a raw html widget:
// * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the raw html widget element.
// * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
//
//  @param {module:engine/view/element~Element} viewElement
//  @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
//  @param {String} label The element's label.
//  @returns {module:engine/view/element~Element}
function toRawHtmlWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'rawHtml', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}
