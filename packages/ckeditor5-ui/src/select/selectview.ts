/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/select/selectview
 */

import View from '../view';

import type ViewCollection from './../viewcollection';

import {
	FocusTracker,
	type Locale,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/input/input.css';

/**
 * A view for select dropdown.
 */
export default class SelectView extends View<HTMLInputElement> {
	/**
	 * Stores information about the editor UI focus and propagates it so various plugins and components
	 * are unified as a focus group.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * The value of the input.
	 *
	 * @observable
	 */
	declare public value: string | undefined;

	/**
	 * The `id` attribute of the input (i.e. to pair with a `<label>` element).
	 *
	 * @observable
	 */
	declare public id: string | undefined;

	/**
	 * A collection of child views in the form.
	 */
	public readonly children: ViewCollection;

	/**
	 * Controls whether the input view is in read-only mode.
	 *
	 * @observable
	 */
	declare public isReadOnly: boolean;

	/**
	 * Set to `true` when the field has some error. Usually controlled via
	 * {@link module:ui/labeledinput/labeledinputview~LabeledSelectView#errorText}.
	 *
	 * @observable
	 */
	declare public hasError: boolean;

	/**
	 * The `id` of the element describing this field, e.g. when it has
	 * some error; it helps screen readers read the error text.
	 *
	 * @observable
	 */
	declare public ariaDescribedById: string | undefined;

	/**
	 * An observable flag set to `true` when the input is currently focused by the user.
	 * Set to `false` otherwise.
	 *
	 * @readonly
	 * @observable
	 * @default false
	 */
	declare public isFocused: boolean;

	/**
	 * An observable flag set to `true` when the input contains no text, i.e.
	 * when {@link #value} is `''`, `null`, or `false`.
	 *
	 * @readonly
	 * @observable
	 * @default true
	 */
	declare public isEmpty: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.set( 'value', undefined );
		this.set( 'id', undefined );
		this.set( 'isReadOnly', false );
		this.set( 'hasError', false );
		this.set( 'ariaDescribedById', undefined );

		this.focusTracker = new FocusTracker();

		this.bind( 'isFocused' ).to( this.focusTracker );
		this.set( 'isEmpty', true );

		const bind = this.bindTemplate;

		this.children = this.createCollection();

		const option1 = new OptionView( locale );
		option1.label = 'Option 1 (label)';
		option1.value = 'Option 1 (value)';
		const option2 = new OptionView( locale );
		option2.label = 'Option 2 (label)';
		option2.value = 'Option 2 (value)';

		this.children.add( option1 );
		this.children.add( option2 );

		this.setTemplate( {
			tag: 'select',
			attributes: {
				class: [
					'ck',
					'ck-select',
					bind.if( 'isFocused', 'ck-select_focused' ),
					bind.if( 'isEmpty', 'ck-select-text_empty' ),
					bind.if( 'hasError', 'ck-error' )
				],
				id: bind.to( 'id' ),
				readonly: bind.to( 'isReadOnly' ),
				'aria-invalid': bind.if( 'hasError', true ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},
			on: {
				input: bind.to( ( ...args ) => {
					this.fire( 'input', ...args );
					this._updateIsEmpty();
				} ),
				change: bind.to( this._updateIsEmpty.bind( this ) )
			},
			children: this.children
		} );
	}

	public setWorkaroundValue( value: string ): void {
		// @TODO: this is really ugly workaround to be fixed.
		this.render();

		if ( this.element ) {
			this.element.value = value;
		}
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.focusTracker.add( this.element! );

		this._setDomElementValue( this.value );
		this._updateIsEmpty();

		// Bind `this.value` to the DOM element's value.
		// We cannot use `value` DOM attribute because removing it on Edge does not clear the DOM element's value property.
		this.on<ObservableChangeEvent>( 'change:value', ( evt, name, value ) => {
			this._setDomElementValue( value );
			this._updateIsEmpty();
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
	}

	/**
	 * Moves the focus to the input and selects the value.
	 */
	public select(): void {
		this.element!.select();
	}

	/**
	 * Focuses the input.
	 */
	public focus(): void {
		this.element!.focus();
	}

	/**
	 * Updates the {@link #isEmpty} property value on demand.
	 */
	private _updateIsEmpty() {
		this.isEmpty = isInputElementEmpty( this.element! );
	}

	/**
	 * Sets the `value` property of the {@link #element DOM element} on demand.
	 */
	private _setDomElementValue( value: any ) {
		this.element!.value = ( !value && value !== 0 ) ? '' : value;
	}
}

function isInputElementEmpty( domElement: HTMLInputElement ) {
	return !domElement.value;
}

/**
 * Fired when the user types in the input. Corresponds to the native
 * DOM `input` event.
 *
 * @eventName ~SelectView#input
 */
export type SelectViewInputEvent = {
	name: 'input';
	args: [ InputEvent ];
};

export class OptionView extends View<HTMLInputElement> {
	declare public value: string | undefined;

	declare public label: string | undefined;

	declare public selected: boolean;

	/**
	 * Creates a new instance of the iframe view.
	 *
	 * @param locale The locale instance.
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.set( 'value', undefined );
		this.set( 'label', undefined );
		this.set( 'selected', false );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'option',
			attributes: {
				class: [
					'ck',
					'ck-reset_all'
				],
				selected: bind.if( 'selected', 'selected' ),
				value: bind.to( 'value' )
			},
			children: [
				{
					text: bind.to( 'label' )
				}
			]
		} );
	}
}
