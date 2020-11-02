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

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import '../theme/htmlembed.css';

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
				 * When using the HTML embed feature with the `htmlEmbed.showPreviews=true` option, it is strongly recommended to
				 * define a sanitize function that will clean up the input HTML in order to avoid XSS vulnerability.
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
			triggerBy: {
				attributes: [ 'value' ]
			},
			model: 'rawHtml',
			view: ( modelElement, { writer } ) => {
				let domContentWrapper, state, props;

				const viewContainer = writer.createContainerElement( 'div', {
					class: 'raw-html-embed',
					'data-html-embed-label': t( 'HTML snippet' )
				} );
				// Widget cannot be a raw element because the widget system would not be able
				// to add its UI to it. Thus, we need this wrapper.
				const viewContentWrapper = writer.createRawElement( 'div', {
					class: 'raw-html-embed__content-wrapper'
				}, function( domElement ) {
					domContentWrapper = domElement;

					renderContent( { domElement, editor, state, props } );
				} );

				// API exposed on each raw HTML embed widget so other features can control a particular widget.
				const rawHtmlApi = {
					makeEditable() {
						state = Object.assign( {}, state, {
							isEditable: true
						} );

						renderContent( { domElement: domContentWrapper, editor, state, props } );

						view.change( writer => {
							writer.setAttribute( 'data-cke-ignore-events', 'true', viewContentWrapper );
						} );

						// This could be potentially pulled to a separate method called focusTextarea().
						domContentWrapper.querySelector( 'textarea' ).focus();
					},
					save( newValue ) {
						// If the value didn't change, we just cancel. If it changed,
						// it's enough to update the model – the entire widget will be reconverted.
						if ( newValue !== state.getRawHtmlValue() ) {
							editor.execute( 'updateHtmlEmbed', newValue );
						} else {
							this.cancel();
						}
					},
					cancel() {
						state = Object.assign( {}, state, {
							isEditable: false
						} );

						renderContent( { domElement: domContentWrapper, editor, state, props } );

						view.change( writer => {
							writer.removeAttribute( 'data-cke-ignore-events', viewContentWrapper );
						} );
					}
				};

				state = {
					showPreviews: htmlEmbedConfig.showPreviews,
					isEditable: false,
					getRawHtmlValue: () => modelElement.getAttribute( 'value' ) || ''
				};

				props = {
					sanitizeHtml: htmlEmbedConfig.sanitizeHtml,
					textareaPlaceholder: t( 'Paste raw HTML here...' ),

					onEditClick() {
						rawHtmlApi.makeEditable();
					},
					onSaveClick( newValue ) {
						rawHtmlApi.save( newValue );
					},
					onCancelClick() {
						rawHtmlApi.cancel();
					}
				};

				writer.insert( writer.createPositionAt( viewContainer, 0 ), viewContentWrapper );

				writer.setCustomProperty( 'rawHtmlApi', rawHtmlApi, viewContainer );
				writer.setCustomProperty( 'rawHtml', true, viewContainer );

				return toWidget( viewContainer, writer, {
					widgetLabel: t( 'HTML snippet' ),
					hasSelectionHandle: true
				} );
			}
		} );

		function renderContent( { domElement, editor, state, props } ) {
			// Remove all children;
			domElement.textContent = '';

			const domDocument = domElement.ownerDocument;
			let domTextarea;

			if ( state.isEditable ) {
				const textareaProps = {
					isDisabled: false,
					placeholder: props.textareaPlaceholder
				};

				domTextarea = createDomTextarea( { domDocument, state, props: textareaProps } );

				domElement.append( domTextarea );
			} else if ( state.showPreviews ) {
				const previewContainerProps = {
					sanitizeHtml: props.sanitizeHtml
				};

				domElement.append( createPreviewContainer( { domDocument, state, props: previewContainerProps } ) );
			} else {
				const textareaProps = {
					isDisabled: true,
					placeholder: props.textareaPlaceholder
				};

				domElement.append( createDomTextarea( { domDocument, state, props: textareaProps } ) );
			}

			const buttonsWrapperProps = {
				onEditClick: props.onEditClick,
				onSaveClick: () => {
					props.onSaveClick( domTextarea.value );
				},
				onCancelClick: props.onCancelClick
			};
			domElement.prepend( createDomButtonsWrapper( { editor, domDocument, state, props: buttonsWrapperProps } ) );
		}

		function createDomButtonsWrapper( { editor, domDocument, state, props } ) {
			const domButtonsWrapper = createElement( domDocument, 'div', {
				class: 'raw-html-embed__buttons-wrapper'
			} );
			// TODO these should be cached and we should only clone here these cached nodes!
			const domEditButton = createDomButton( editor.locale, 'edit' );
			const domSaveButton = createDomButton( editor.locale, 'save' );
			const domCancelButton = createDomButton( editor.locale, 'cancel' );

			if ( state.isEditable ) {
				const clonedDomSaveButton = domSaveButton.cloneNode( true );
				const clonedDomCancelButton = domCancelButton.cloneNode( true );

				clonedDomSaveButton.addEventListener( 'click', evt => {
					evt.preventDefault();
					props.onSaveClick( );
				} );

				clonedDomCancelButton.addEventListener( 'click', evt => {
					evt.preventDefault();
					props.onCancelClick( );
				} );

				domButtonsWrapper.appendChild( clonedDomSaveButton );
				domButtonsWrapper.appendChild( clonedDomCancelButton );
			} else {
				const clonedDomEditButton = domEditButton.cloneNode( true );

				clonedDomEditButton.addEventListener( 'click', evt => {
					evt.preventDefault();
					props.onEditClick();
				} );

				domButtonsWrapper.appendChild( clonedDomEditButton );
			}

			return domButtonsWrapper;
		}

		function createDomTextarea( { domDocument, state, props } ) {
			const domTextarea = createElement( domDocument, 'textarea', {
				placeholder: props.placeholder,
				class: 'ck ck-reset ck-input ck-input-text raw-html-embed__source'
			} );

			domTextarea.disabled = props.isDisabled;
			domTextarea.value = state.getRawHtmlValue();

			return domTextarea;
		}

		function createPreviewContainer( { domDocument, state, props } ) {
			const domPreviewContainer = createElement( domDocument, 'div', {
				class: 'raw-html-embed__preview'
			} );

			const sanitizeOutput = props.sanitizeHtml( state.getRawHtmlValue() );
			domPreviewContainer.innerHTML = sanitizeOutput.html;

			return domPreviewContainer;
		}
	}
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
