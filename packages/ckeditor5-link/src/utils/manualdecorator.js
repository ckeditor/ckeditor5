/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/utils
 */

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Class which stores manual decorators with observable {@link module:link/utils~ManualDecorator#value}
 * to handle integration with ui state.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class ManualDecorator {
	/**
	 * Creates new instance of {@link module:link/utils~ManualDecorator}.
	 *
	 * @param {Object} config
	 * @param {String} config.id Manual decorator id, which is a name of attribute in model, for example 'linkManualDecorator0'.
	 * @param {String} config.label The label used in user interface to switch manual decorator.
	 * @param {Object} config.attributes Set of attributes added to downcasted data, when decorator is activated for specific link.
	 * Attributes should be added in a form of attributes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
	 */
	constructor( { id, label, attributes } ) {
		/**
		 * Manual decorator id, which is a name of attribute in model, for example 'linkManualDecorator0'.
		 *
		 * @type {String}
		 */
		this.id = id;

		/**
		 * Value of current manual decorator. It reflects its state from UI.
		 *
		 * @observable
		 * @member {Boolean} module:link/utils~ManualDecorator#value
		 */
		this.set( 'value' );

		/**
		 * The label used in user interface to switch manual decorator.
		 *
		 * @type {String}
		 */
		this.label = label;

		/**
		 * Set of attributes added to downcasted data, when decorator is activated for specific link.
		 * Attributes should be added in a form of attributes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
		 *
		 * @type {Object}
		 */
		this.attributes = attributes;
	}
}

mix( ManualDecorator, ObservableMixin );
