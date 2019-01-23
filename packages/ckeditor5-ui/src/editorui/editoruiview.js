/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/editorui/editoruiview
 */

/* globals document */

import View from '../view';
import Template from '../template';

import '../../theme/components/editorui/editorui.css';

/**
 * The editor UI view class. Base class for the editor main views.
 *
 * @extends module:ui/view~View
 */
export default class EditorUIView extends View {
	/**
	 * Creates an instance of the editor UI view class.
	 *
	 * @param {module:utils/locale~Locale} [locale] The locale instance.
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * Collection of the child views, detached from the DOM
		 * structure of the editor, like panels, icons etc.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection} #body
		 */
		this.body = this.createCollection();

		/**
		 * The element holding elements of the 'body' region.
		 *
		 * @private
		 * @member {HTMLElement} #_bodyCollectionContainer
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this._renderBodyCollection();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._bodyCollectionContainer.remove();

		return super.destroy();
	}

	/**
	 * Creates and appends to `<body>` the {@link #body} collection container.
	 *
	 * @private
	 */
	_renderBodyCollection() {
		const bodyElement = this._bodyCollectionContainer = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-reset_all',
					'ck-body',
					'ck-rounded-corners'
				]
			},
			children: this.body
		} ).render();

		document.body.appendChild( bodyElement );
	}
}
