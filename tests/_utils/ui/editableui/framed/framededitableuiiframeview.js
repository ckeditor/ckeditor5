/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import IframeView from '/ckeditor5/ui/iframe/iframeview.js';
import FramedEditableUIView from './framededitableuiview.js';

/**
 * The basic implementation of an {@link ui.iframe.IframeView IframeView}-based
 * {@link ui.editableUI.EditableUIView}.
 *
 * @memberOf ui.editableUI.iframe
 * @extends ui.iframe.IframeView
 */
export default class FramedEditableUIIframeView extends IframeView {
	/**
	 * Creates a new instance of the {@link ui.iframe.IframeView IframeView}–based
	 * {@link ui.editableUI.EditableUIView EditableUIView}.
	 *
	 * @param {utils.Observable} [model] (View)Model of this View.
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 */
	constructor( model, locale ) {
		super( model, locale );

		this.template.attributes.class.push( 'ck-framededitable' );

		this.on( 'loaded', this._iframeLoaded, this );

		/**
		 * A view which represents the editable `<body>` element within the iframe.
		 *
		 * @private
		 * @member {FramedEditableUIView} ui.editableUI.iframe#_innerView
		 */
	}

	/**
	 * This getter exposes the {@link ui.editable.EditableUIView#editableElement}. It points to the
	 * `<body>` inside the `<iframe>` document, which is provided by `FramedEditableUIView`.
	 */
	get editableElement() {
		return this._innerView.editableElement;
	}

	/**
	 * Destroys the View instance and child {@link _innerView}.
	 */
	destroy() {
		super.destroy();

		return this._innerView.destroy();
	}

	/**
	 * When the iframe is loaded, it creates a child view out of <body> element
	 * and initializes it. Element of this view is exposed through {@link editableElement}.
	 *
	 * @protected
	 */
	_iframeLoaded() {
		this._innerView = new FramedEditableUIView(
			this.model,
			this.locale,
			this.element.contentDocument.body
		);

		this._innerView.init();

		this._iframeDeferred.resolve();
	}
}
