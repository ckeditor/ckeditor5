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
import InsertHtmlEmbedCommand from './inserthtmlembedcommand';
import UpdateHtmlEmbedCommand from './updatehtmlembedcommand';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import '../theme/htmlembed.css';

const DISPLAY_PREVIEW_CLASS = 'raw-html-embed_preview_visible';
const IGNORE_EVENTS_ATTRIBUTE = 'data-cke-ignore-events';

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
					hasChanged: false
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

		editor.commands.add( 'updateHtmlEmbed', new UpdateHtmlEmbedCommand( editor ) );
		editor.commands.add( 'insertHtmlEmbed', new InsertHtmlEmbedCommand( editor ) );

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
				const placeholder = t( 'Paste raw HTML here...' );

				const viewContainer = writer.createContainerElement( 'div', {
					class: 'raw-html-embed'
				} );

				const viewRawHtmlContainer = writer.createContainerElement( 'div', {
					class: 'raw-html-embed__content-wrapper'
				} );

				const viewTextarea = writer.createUIElement(
					'textarea',
					{
						placeholder,
						disabled: true,
						class: 'ck ck-reset ck-input ck-input-text raw-html-embed__source'
					},
					domDocument => {
						return createDomTextarea( { editor, writer, viewTextarea, modelElement, domDocument } );
					}
				);

				// The switch button between preview and editing HTML.
				const viewButtonsWrapper = writer.createUIElement(
					'div',
					{
						class: 'raw-html-embed__buttons-wrapper'
					},
					function( domDocument ) {
						return createDomButtonsWrapper( {
							editor, domDocument, viewButtonsWrapper, htmlEmbedConfig,
							writer, viewContainer, viewRawHtmlContainer, viewTextarea
						} );
					}
				);

				writer.insert( writer.createPositionAt( viewContainer, 0 ), viewRawHtmlContainer );
				writer.insert( writer.createPositionAt( viewRawHtmlContainer, 0 ), viewButtonsWrapper );
				writer.insert( writer.createPositionAt( viewRawHtmlContainer, 1 ), viewTextarea );

				// The container that renders the HTML should be created only when `htmlEmbed.showPreviews=true` in the config.
				if ( htmlEmbedConfig.showPreviews ) {
					writer.addClass( [ 'raw-html-embed_preview_enabled', DISPLAY_PREVIEW_CLASS ], viewContainer );

					const viewPreviewContainer = writer.createRawElement(
						'div',
						{ class: 'raw-html-embed__preview' },
						function( domElement ) {
							writer.setCustomProperty( 'domElement', domElement, viewPreviewContainer );

							const sanitizedOutput = htmlEmbedConfig.sanitizeHtml( modelElement.getAttribute( 'value' ) || '' );
							domElement.innerHTML = sanitizedOutput.html;
						}
					);

					writer.insert( writer.createPositionAt( viewRawHtmlContainer, 2 ), viewPreviewContainer );
				}

				return toRawHtmlWidget( viewContainer, writer, widgetLabel );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).add( downcastRawHtmlValueAttribute( htmlEmbedConfig ) );
	}
}

function createDomTextarea( { editor, writer, viewTextarea, modelElement, domDocument } ) {
	const domTextarea = viewTextarea.toDomElement( domDocument );

	writer.setCustomProperty( 'domElement', domTextarea, viewTextarea );

	domTextarea.value = modelElement.getAttribute( 'value' ) || '';

	// When focusing the "edit source" element, the model selection must be updated.
	// If we do not do it, the `updateHtmlEmbed` command will fail because it
	// searches the `rawHtml` element based on selection.
	domTextarea.addEventListener( 'focus', () => {
		editor.model.change( writer => {
			writer.setSelection( modelElement, 'on' );
		} );
	} );

	domTextarea.addEventListener( 'input', () => {
		editor.execute( 'updateHtmlEmbed', domTextarea.value );
	} );

	return domTextarea;
}

function createDomButtonsWrapper( {
	editor, domDocument, viewButtonsWrapper, htmlEmbedConfig,
	writer, viewContainer, viewRawHtmlContainer, viewTextarea
} ) {
	const domButtonsWrapper = viewButtonsWrapper.toDomElement( domDocument );

	const domEditButton = createDomButton( editor.locale, 'edit' );
	const domSaveButton = createDomButton( editor.locale, 'save' );
	const domCancelButton = createDomButton( editor.locale, 'cancel' );

	domButtonsWrapper.appendChild( domEditButton.cloneNode( true ) );

	writer.setCustomProperty( 'domElement', domButtonsWrapper, viewButtonsWrapper );

	domButtonsWrapper.addEventListener( 'click', evt => {
		editor.editing.view.change( writer => {
			if ( htmlEmbedConfig.showPreviews ) {
				if ( viewContainer.hasClass( DISPLAY_PREVIEW_CLASS ) ) {
					writer.setAttribute( IGNORE_EVENTS_ATTRIBUTE, 'true', viewRawHtmlContainer );
					writer.removeClass( DISPLAY_PREVIEW_CLASS, viewContainer );
				} else {
					writer.addClass( DISPLAY_PREVIEW_CLASS, viewContainer );
					writer.removeAttribute( IGNORE_EVENTS_ATTRIBUTE, viewRawHtmlContainer );
				}
			}

			const textarea = viewTextarea.getCustomProperty( 'domElement' );
			textarea.disabled = !textarea.disabled;

			while ( domButtonsWrapper.firstChild ) {
				domButtonsWrapper.firstChild.remove();
			}

			if ( textarea.disabled ) {
				domButtonsWrapper.appendChild( domEditButton.cloneNode( true ) );
			} else {
				domButtonsWrapper.appendChild( domSaveButton.cloneNode( true ) );
				domButtonsWrapper.appendChild( domCancelButton.cloneNode( true ) );
			}
		} );

		evt.preventDefault();
	} );

	return domButtonsWrapper;
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
			const viewRawHtmlContainer = widgetView.getChild( 1 );
			const textareaDomElement = viewRawHtmlContainer.getChild( 1 ).getCustomProperty( 'domElement' );

			if ( textareaDomElement ) {
				textareaDomElement.value = data.item.getAttribute( 'value' );
			}

			if ( htmlEmbedConfig.showPreviews ) {
				const previewDomElement = viewRawHtmlContainer.getChild( 2 ).getCustomProperty( 'domElement' );

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

	return toWidget( viewElement, writer, {
		label,
		hasSelectionHandle: true
	} );
}

// Returns a toggle mode button DOM element that can be cloned and used in conversion.
//
//  @param {module:utils/locale~Locale} locale Editor locale.
//  @param {'edit'|'save'|'cancel'} type Type of button to create.
//  @returns {HTMLElement}
function createDomButton( locale, type ) {
	const t = locale.t;
	const buttonView = new ButtonView( locale );

	buttonView.set( {
		tooltipPosition: 'sw',
		icon: pencilIcon,
		tooltip: true
	} );

	buttonView.render();

	if ( type === 'edit' ) {
		buttonView.set( {
			icon: pencilIcon,
			label: t( 'Edit source' ),
			class: 'raw-html-embed__edit-button'
		} );
	} else if ( type === 'save' ) {
		buttonView.set( {
			icon: checkIcon,
			label: t( 'Save changes' ),
			class: 'raw-html-embed__save-button'
		} );
	} else {
		buttonView.set( {
			icon: cancelIcon,
			label: t( 'Cancel' ),
			class: 'raw-html-embed__cancel-button'
		} );
	}

	buttonView.destroy();

	return buttonView.element.cloneNode( true );
}
