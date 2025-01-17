/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/labeledfield/labeledfieldview
 */

import View from '../view.js';
import LabelView from '../label/labelview.js';

import type { FocusableView } from '../focuscycler.js';
import type ViewCollection from '../viewcollection.js';

import { uid, type Locale } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/labeledfield/labeledfieldview.css';

/**
 * The labeled field view class. It can be used to enhance any view with the following features:
 *
 * * a label,
 * * (optional) an error message,
 * * (optional) an info (status) text,
 *
 * all bound logically by proper DOM attributes for UX and accessibility.  It also provides an interface
 * (e.g. observable properties) that allows controlling those additional features.
 *
 * The constructor of this class requires a callback that returns a view to be labeled. The callback
 * is called with unique ids that allow binding of DOM properties:
 *
 * ```ts
 * const labeledInputView = new LabeledFieldView( locale, ( labeledFieldView, viewUid, statusUid ) => {
 * 	const inputView = new InputTextView( labeledFieldView.locale );
 *
 * 	inputView.set( {
 * 		id: viewUid,
 * 		ariaDescribedById: statusUid
 * 	} );
 *
 * 	inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
 * 	inputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );
 *
 * 	return inputView;
 * } );
 *
 * labeledInputView.label = 'User name';
 * labeledInputView.infoText = 'Full name like for instance, John Doe.';
 * labeledInputView.render();
 *
 * document.body.append( labeledInputView.element );
 * ```
 *
 * See {@link module:ui/labeledfield/utils} to discover ready–to–use labeled input helpers for common
 * UI components.
 */
export default class LabeledFieldView<TFieldView extends FocusableView = FocusableView> extends View {
	/**
	 * The field view that gets labeled.
	 */
	public readonly fieldView: TFieldView;

	/**
	 * The label view instance that describes the entire view.
	 */
	public readonly labelView: LabelView;

	/**
	 * The status view for the {@link #fieldView}. It displays {@link #errorText} and
	 * {@link #infoText}.
	 */
	public readonly statusView: View;

	/**
	 * A collection of children of the internal wrapper element. Allows inserting additional DOM elements (views) next to
	 * the {@link #fieldView} for easy styling (e.g. positioning).
	 *
	 * By default, the collection contains {@link #fieldView} and {@link #labelView}.
	 */
	public readonly fieldWrapperChildren: ViewCollection;

	/**
	 * The text of the label.
	 *
	 * @observable
	 */
	declare public label: string | undefined;

	/**
	 * Controls whether the component is in read-only mode.
	 *
	 * @observable
	 */
	declare public isEnabled: boolean;

	/**
	 * An observable flag set to `true` when {@link #fieldView} is empty (`false` otherwise).
	 *
	 * @readonly
	 * @observable
	 * @default true
	 */
	declare public isEmpty: boolean;

	/**
	 * An observable flag set to `true` when {@link #fieldView} is currently focused by
	 * the user (`false` otherwise).
	 *
	 * @readonly
	 * @observable
	 * @default false
	 */
	declare public isFocused: boolean;

	/**
	 * The validation error text. When set, it will be displayed
	 * next to the {@link #fieldView} as a typical validation error message.
	 * Set it to `null` to hide the message.
	 *
	 * **Note:** Setting this property to anything but `null` will automatically
	 * make the `hasError` of the {@link #fieldView} `true`.
	 *
	 * @observable
	 */
	declare public errorText: string | null;

	/**
	 * The additional information text displayed next to the {@link #fieldView} which can
	 * be used to inform the user about its purpose, provide help or hints.
	 *
	 * Set it to `null` to hide the message.
	 *
	 * **Note:** This text will be displayed in the same place as {@link #errorText} but the
	 * latter always takes precedence: if the {@link #errorText} is set, it replaces
	 * {@link #infoText}.
	 *
	 * @observable
	 * @default null
	 */
	declare public infoText: string | null;

	/**
	 * (Optional) The additional CSS class set on the dropdown {@link #element}.
	 *
	 * @observable
	 */
	declare public class: string | undefined;

	/**
	 * The content of the `placeholder` attribute of the {@link #fieldView}.
	 *
	 * @observable
	 */
	declare public placeholder: string | undefined;

	/**
	 * The combined status text made of {@link #errorText} and {@link #infoText}.
	 * Note that when present, {@link #errorText} always takes precedence in the
	 * status.
	 *
	 * @see #errorText
	 * @see #infoText
	 * @see #statusView
	 * @private
	 * @observable
	 */
	declare public _statusText: string | null;

	/**
	 * Creates an instance of the labeled field view class using a provided creator function
	 * that provides the view to be labeled.
	 *
	 * @param locale The locale instance.
	 * @param viewCreator A function that returns a {@link module:ui/view~View}
	 * that will be labeled. The following arguments are passed to the creator function:
	 *
	 * * an instance of the `LabeledFieldView` to allow binding observable properties,
	 * * an UID string that connects the {@link #labelView label} and the labeled field view in DOM,
	 * * an UID string that connects the {@link #statusView status} and the labeled field view in DOM.
	 */
	constructor(
		locale: Locale | undefined,
		viewCreator: LabeledFieldViewCreator<TFieldView>
	) {
		super( locale );

		const viewUid = `ck-labeled-field-view-${ uid() }`;
		const statusUid = `ck-labeled-field-view-status-${ uid() }`;

		this.fieldView = viewCreator( this, viewUid, statusUid );

		this.set( 'label', undefined );
		this.set( 'isEnabled', true );
		this.set( 'isEmpty', true );
		this.set( 'isFocused', false );
		this.set( 'errorText', null );
		this.set( 'infoText', null );
		this.set( 'class', undefined );
		this.set( 'placeholder', undefined );

		this.labelView = this._createLabelView( viewUid );
		this.statusView = this._createStatusView( statusUid );
		this.fieldWrapperChildren = this.createCollection( [ this.fieldView, this.labelView ] );

		this.bind( '_statusText' ).to(
			this, 'errorText',
			this, 'infoText',
			( errorText, infoText ) => errorText || infoText
		);

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-labeled-field-view',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value ),
					bind.if( 'isEmpty', 'ck-labeled-field-view_empty' ),
					bind.if( 'isFocused', 'ck-labeled-field-view_focused' ),
					bind.if( 'placeholder', 'ck-labeled-field-view_placeholder' ),
					bind.if( 'errorText', 'ck-error' )
				]
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-labeled-field-view__input-wrapper'
						]
					},
					children: this.fieldWrapperChildren
				},
				this.statusView
			]
		} );
	}

	/**
	 * Creates label view class instance and bind with view.
	 *
	 * @param id Unique id to set as labelView#for attribute.
	 */
	private _createLabelView( id: string ): LabelView {
		const labelView = new LabelView( this.locale );

		labelView.for = id;
		labelView.bind( 'text' ).to( this, 'label' );

		return labelView;
	}

	/**
	 * Creates the status view instance. It displays {@link #errorText} and {@link #infoText}
	 * next to the {@link #fieldView}. See {@link #_statusText}.
	 *
	 * @param statusUid Unique id of the status, shared with the {@link #fieldView view's}
	 * `aria-describedby` attribute.
	 */
	private _createStatusView( statusUid: string ): View {
		const statusView = new View( this.locale );
		const bind = this.bindTemplate;

		statusView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-labeled-field-view__status',
					bind.if( 'errorText', 'ck-labeled-field-view__status_error' ),
					bind.if( '_statusText', 'ck-hidden', value => !value )
				],
				id: statusUid,
				role: bind.if( 'errorText', 'alert' )
			},
			children: [
				{
					text: bind.to( '_statusText' )
				}
			]
		} );

		return statusView;
	}

	/**
	 * Focuses the {@link #fieldView}.
	 */
	public focus( direction?: 1 | -1 ): void {
		this.fieldView.focus( direction );
	}
}

/**
 * A creator function that returns a focusable view to be labeled by a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView}
 * instance.
 */
export type LabeledFieldViewCreator<TFieldView extends FocusableView> =
	( labeledFieldView: LabeledFieldView, viewUid: string, statusUid: string ) => TFieldView;
