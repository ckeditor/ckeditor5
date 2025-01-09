/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/input/inputbase
 */

import View from '../view.js';

import {
	FocusTracker,
	type Locale,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

/**
 * The base input view class.
 */
export default abstract class InputBase<TElement extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> extends View<TElement> {
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
	 * The `placeholder` attribute of the input.
	 *
	 * @observable
	 */
	declare public placeholder: string | undefined;

	/**
	 * The `tabindex` attribute of the input.
	 *
	 * @observable
	 */
	declare public tabIndex: number | undefined;

	/**
	 * The `aria-label` attribute of the input.
	 *
	 * @observable
	 */
	declare public ariaLabel: string | undefined;

	/**
	 * Controls whether the input view is in read-only mode.
	 *
	 * @observable
	 */
	declare public isReadOnly: boolean;

	/**
	 * Set to `true` when the field has some error. Usually controlled via
	 * {@link module:ui/labeledinput/labeledinputview~LabeledInputView#errorText}.
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
		this.set( 'placeholder', undefined );
		this.set( 'tabIndex', undefined );
		this.set( 'isReadOnly', false );
		this.set( 'hasError', false );
		this.set( 'ariaDescribedById', undefined );
		this.set( 'ariaLabel', undefined );

		this.focusTracker = new FocusTracker();

		this.bind( 'isFocused' ).to( this.focusTracker );
		this.set( 'isEmpty', true );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'input',
			attributes: {
				class: [
					'ck',
					'ck-input',
					bind.if( 'isFocused', 'ck-input_focused' ),
					bind.if( 'isEmpty', 'ck-input-text_empty' ),
					bind.if( 'hasError', 'ck-error' )
				],
				id: bind.to( 'id' ),
				placeholder: bind.to( 'placeholder' ),
				tabindex: bind.to( 'tabIndex' ),
				readonly: bind.to( 'isReadOnly' ),
				'aria-invalid': bind.if( 'hasError', true ),
				'aria-describedby': bind.to( 'ariaDescribedById' ),
				'aria-label': bind.to( 'ariaLabel' )
			},
			on: {
				input: bind.to( ( ...args ) => {
					this.fire( 'input', ...args );
					this._updateIsEmpty();
				} ),
				change: bind.to( this._updateIsEmpty.bind( this ) )
			}
		} );
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
	 * Resets the value of the input
	 */
	public reset(): void {
		this.value = this.element!.value = '';
		this._updateIsEmpty();
	}

	/**
	 * Updates the {@link #isEmpty} property value on demand.
	 */
	protected _updateIsEmpty(): void {
		this.isEmpty = isInputElementEmpty( this.element! );
	}

	/**
	 * Sets the `value` property of the {@link #element DOM element} on demand.
	 */
	private _setDomElementValue( value: any ) {
		this.element!.value = ( !value && value !== 0 ) ? '' : value;
	}
}

function isInputElementEmpty( domElement: HTMLInputElement | HTMLTextAreaElement ) {
	return !domElement.value;
}
