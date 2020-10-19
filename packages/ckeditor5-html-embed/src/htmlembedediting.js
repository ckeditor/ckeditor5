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
	 * Set-ups converters for the feature.
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
					class: 'raw-html__source'
				};

				// The editing raw HTML field.
				const sourceElement = writer.createUIElement( 'textarea', textareaAttributes, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					writer.setCustomProperty( 'domElement', root, sourceElement );
					root.value = modelElement.getAttribute( 'value' ) || '';

					root.addEventListener( 'input', () => {
						editor.execute( 'htmlEmbedUpdate', root.value );
					} );

					return root;
				} );

				// The switch button between preview and editing HTML.
				const toggleButton = writer.createUIElement( 'div', { class: 'raw-html__switch-mode' }, function( domDocument ) {
					const root = this.toDomElement( domDocument );

					root.innerHTML = htmlEmbedModeIcon;
					writer.setCustomProperty( 'domElement', root, toggleButton );

					root.addEventListener( 'click', evt => {
						view.change( writer => {
							const isEditingSourceActive = rawHtmlContainer.getCustomProperty( 'isEditingSourceActive' );

							if ( htmlEmbedConfig.previewsInData ) {
								if ( !isEditingSourceActive ) {
									writer.removeClass( 'raw-html--display-preview', widgetView );
								} else {
									writer.addClass( 'raw-html--display-preview', widgetView );
								}
							}

							const textarea = sourceElement.getCustomProperty( 'domElement' );
							textarea.disabled = !textarea.disabled;

							writer.setCustomProperty( 'isEditingSourceActive', !isEditingSourceActive, rawHtmlContainer );
						} );

						evt.preventDefault();
					} );

					return root;
				} );

				writer.insert( writer.createPositionAt( widgetView, 0 ), rawHtmlContainer );
				writer.insert( writer.createPositionAt( rawHtmlContainer, 0 ), toggleButton );
				writer.insert( writer.createPositionAt( rawHtmlContainer, 1 ), sourceElement );

				// The container that renders the HTML should be created only when `htmlEmbed.previewsInData=true` in the config.
				if ( htmlEmbedConfig.previewsInData ) {
					writer.addClass( 'raw-html--preview-enabled', widgetView );
					writer.addClass( 'raw-html--display-preview', widgetView );

					const previewContainer = writer.createRawElement( 'div', { class: 'raw-html__preview' }, function( domElement ) {
						writer.setCustomProperty( 'domElement', domElement, previewContainer );

						if ( htmlEmbedConfig.previewsInData ) {
							const sanitizeOutput = htmlEmbedConfig.sanitizeHtml( modelElement.getAttribute( 'value' ) || '' );

							domElement.innerHTML = sanitizeOutput.html;
						}
					} );

					writer.insert( writer.createPositionAt( rawHtmlContainer, 2 ), previewContainer );
				}

				return toRawHtmlWidget( widgetView, writer, widgetLabel );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).add( downcastRawHtmlValueAttribute( htmlEmbedConfig ) );
	}
}

// Returns a converter that handles the `value` attribute of the `rawHtml` element.
//
// It updates the source (`textarea`) value and passes an HTML to the preview element in `htmlEmbed.previewsInData=true` mode.
//
// @params {module:html-embed/htmlembed~MediaEmbedConfig} htmlEmbedConfig
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

			if ( htmlEmbedConfig.previewsInData ) {
				const previewDomElement = rawHtmlContainer.getChild( 2 ).getCustomProperty( 'domElement' );

				if ( previewDomElement ) {
					const sanitizeOutput = htmlEmbedConfig.sanitizeHtml( data.item.getAttribute( 'value' ) );
					previewDomElement.innerHTML = sanitizeOutput.html;
				}
			}
		} );
	};
}
