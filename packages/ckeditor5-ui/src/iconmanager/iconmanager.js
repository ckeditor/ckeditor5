/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Controller from '../controller.js';

/**
 * The icon manager controller class. It provides SVG icons, which then can
 * be used by {@link ui.icon.Icon} component and similar.
 *
 *		const model = new Model( {
 *			icons: [ 'bold', 'italic', ... ],
 *			sprite: '...' // SVG sprite
 *		} );
 *
 *		// An instance of IconManager.
 *		new IconManager( model, new IconManagerView() );
 *
 * See {@link ui.iconManager.IconManagerView}.
 *
 * @memberOf ui.iconManager
 * @extends ui.Controller
 */
export default class IconManager extends Controller {
	/**
	 * Creates an instance of {@link ui.iconManager.IconManager} class.
	 *
	 * @param {ui.iconManager.IconManagerModel} model Model of this IconManager.
	 * @param {ui.View} view View of this IconManager.
	 */
	constructor( model, view ) {
		super( model, view );

		view.model.bind( 'sprite' ).to( model );
	}
}

/**
 * The icon manager component {@link ui.Model} interface.
 *
 * @interface ui.iconManager.IconManagerModel
 */

/**
 * An array of icon names which are brought by the {@link ui.iconManager.IconManagerModel#sprite}.
 *
 * @observable
 * @member {Array.<String>} ui.iconManager.IconManagerModel#icons
 */

/**
 * The actual SVG (HTML) of the icons to be injected in DOM.
 *
 * @observable
 * @member {String} ui.iconManager.IconManagerModel#sprite
 */
