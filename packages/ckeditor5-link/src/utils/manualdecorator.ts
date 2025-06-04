/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/utils/manualdecorator
 */

import { ObservableMixin, type ArrayOrItem } from 'ckeditor5/src/utils.js';
import type { MatcherObjectPattern } from 'ckeditor5/src/engine.js';
import type { NormalizedLinkDecoratorManualDefinition } from '../utils.js';

/**
 * Helper class that stores manual decorators with observable {@link module:link/utils/manualdecorator~ManualDecorator#value}
 * to support integration with the UI state. An instance of this class is a model with the state of individual manual decorators.
 * These decorators are kept as collections in {@link module:link/linkcommand~LinkCommand#manualDecorators}.
 */
export default class ManualDecorator extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * An ID of a manual decorator which is the name of the attribute in the model, for example: 'linkManualDecorator0'.
	 */
	public id: string;

	/**
	 * The value of the current manual decorator. It reflects its state from the UI.
	 *
	 * @observable
	 */
	declare public value: boolean | undefined;

	/**
	 * The default value of manual decorator.
	 */
	public defaultValue?: boolean;

	/**
	 * The label used in the user interface to toggle the manual decorator.
	 */
	public label: string;

	/**
	 * A set of attributes added to downcasted data when the decorator is activated for a specific link.
	 * Attributes should be added in a form of attributes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
	 */
	public attributes?: Record<string, string>;

	/**
	 * A set of classes added to downcasted data when the decorator is activated for a specific link.
	 * Classes should be added in a form of classes defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
	 */
	public classes?: ArrayOrItem<string>;

	/**
	 * A set of styles added to downcasted data when the decorator is activated for a specific link.
	 * Styles should be added in a form of styles defined in {@link module:engine/view/elementdefinition~ElementDefinition}.
	 */
	public styles?: Record<string, string>;

	/**
	 * Creates a new instance of {@link module:link/utils/manualdecorator~ManualDecorator}.
	 *
	 * @param options The configuration object.
	 */
	constructor( { id, label, attributes, classes, styles, defaultValue }: NormalizedLinkDecoratorManualDefinition ) {
		super();

		this.id = id;
		this.set( 'value', undefined );
		this.defaultValue = defaultValue;
		this.label = label;
		this.attributes = attributes;
		this.classes = classes;
		this.styles = styles;
	}

	/**
	 * Returns {@link module:engine/view/matcher~MatcherPattern} with decorator attributes.
	 *
	 * @internal
	 */
	public _createPattern(): MatcherObjectPattern {
		return {
			attributes: this.attributes,
			classes: this.classes,
			styles: this.styles
		};
	}
}
