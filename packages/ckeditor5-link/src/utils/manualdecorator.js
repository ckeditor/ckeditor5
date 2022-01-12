/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/utils
 */

import { ObservableMixin, mix } from 'ckeditor5/src/utils';

/**
 * Helper class that stores manual decorators with observable {@link module:link/utils~ManualDecorator#value}
 * to support integration with the UI state. An instance of this class is a model with the state of individual manual decorators.
 * These decorators are kept as collections in {@link module:link/linkcommand~LinkCommand#manualDecorators}.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class ManualDecorator {
	/**
	 * Creates a new instance of {@link module:link/utils~ManualDecorator}.
	 *
	 * @param {Object} config
	 * @param {String} config.id The name of the attribute used in the model that represents a given manual decorator.
	 * For example: `'linkIsExternal'`.
	 * @param {String} config.label The label used in the user interface to toggle the manual decorator.
	 * @param {Object} config.attributes A set of attributes added to output data when the decorator is active for a specific link.
	 * Attributes should keep the format of attributes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
	 * @param {Boolean} [config.defaultValue] Controls whether the decorator is "on" by default.
	 */
	constructor( { id, label, attributes, classes, styles, defaultValue } ) {
		/**
		 * An ID of a manual decorator which is the name of the attribute in the model, for example: 'linkManualDecorator0'.
		 *
		 * @type {String}
		 */
		this.id = id;

		/**
		 * The value of the current manual decorator. It reflects its state from the UI.
		 *
		 * @observable
		 * @member {Boolean} module:link/utils~ManualDecorator#value
		 */
		this.set( 'value' );

		/**
		 * The default value of manual decorator.
		 *
		 * @type {Boolean}
		 */
		this.defaultValue = defaultValue;

		/**
		 * The label used in the user interface to toggle the manual decorator.
		 *
		 * @type {String}
		 */
		this.label = label;

		/**
		 * A set of attributes added to downcasted data when the decorator is activated for a specific link.
		 * Attributes should be added in a form of attributes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
		 *
		 * @type {Object}
		 */
		this.attributes = attributes;

		/**
		 * A set of classes added to downcasted data when the decorator is activated for a specific link.
		 * Classes should be added in a form of classes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
		 *
		 * @type {Object}
		 */
		this.classes = classes;

		/**
		 * A set of styles added to downcasted data when the decorator is activated for a specific link.
		 * Styles should be added in a form of styles defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
		 *
		 * @type {Object}
		 */
		this.styles = styles;
	}

	/**
	 * Returns {@link module:engine/view/matcher~MatcherPattern} with decorator attributes.
	 *
	 * @protected
	 * @returns {module:engine/view/matcher~MatcherPattern}
	 */
	_createPattern() {
		return {
			attributes: this.attributes,
			classes: this.classes,
			styles: this.styles
		};
	}
}

mix( ManualDecorator, ObservableMixin );
