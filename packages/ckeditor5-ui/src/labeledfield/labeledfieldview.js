/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/labeledfield/labeledfieldview
 */

import View from '../view';
import uid from '@ckeditor/ckeditor5-utils/src/uid';
import LabelView from '../label/labelview';
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
 *		const labeledInputView = new LabeledFieldView( locale, ( labeledFieldView, viewUid, statusUid ) => {
 *			const inputView = new InputTextView( labeledFieldView.locale );
 *
 *			inputView.set( {
 *				id: viewUid,
 *				ariaDescribedById: statusUid
 *			} );
 *
 *			inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
 *			inputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );
 *
 *			return inputView;
 *		} );
 *
 *		labeledInputView.label = 'User name';
 *		labeledInputView.infoText = 'Full name like for instance, John Doe.';
 *		labeledInputView.render();
 *
 *		document.body.append( labeledInputView.element );
 *
 * See {@link module:ui/labeledfield/utils} to discover ready–to–use labeled input helpers for common
 * UI components.
 *
 * @extends module:ui/view~View
 */
export default class LabeledFieldView extends View {
	/**
	 * Creates an instance of the labeled field view class using a provided creator function
	 * that provides the view to be labeled.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance.
	 * @param {Function} viewCreator A function that returns a {@link module:ui/view~View}
	 * that will be labeled. The following arguments are passed to the creator function:
	 *
	 * * an instance of the `LabeledFieldView` to allow binding observable properties,
	 * * an UID string that connects the {@link #labelView label} and the labeled field view in DOM,
	 * * an UID string that connects the {@link #statusView status} and the labeled field view in DOM.
	 */
	constructor( locale, viewCreator ) {
		super( locale );

		const viewUid = `ck-labeled-field-view-${ uid() }`;
		const statusUid = `ck-labeled-field-view-status-${ uid() }`;

		/**
		 * The field view that gets labeled.
		 *
		 * @member {module:ui/view~View} #fieldView
		 */
		this.fieldView = viewCreator( this, viewUid, statusUid );

		/**
		 * The text of the label.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.set( 'label' );

		/**
		 * Controls whether the component is in read-only mode.
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * An observable flag set to `true` when {@link #fieldView} is empty (`false` otherwise).
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isEmpty
		 * @default true
		 */
		this.set( 'isEmpty', true );

		/**
		 * An observable flag set to `true` when {@link #fieldView} is currently focused by
		 * the user (`false` otherwise).
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isFocused
		 * @default false
		 */
		this.set( 'isFocused', false );

		/**
		 * The validation error text. When set, it will be displayed
		 * next to the {@link #fieldView} as a typical validation error message.
		 * Set it to `null` to hide the message.
		 *
		 * **Note:** Setting this property to anything but `null` will automatically
		 * make the `hasError` of the {@link #fieldView} `true`.
		 *
		 * @observable
		 * @member {String|null} #errorText
		 */
		this.set( 'errorText', null );

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
		 * @member {String|null} #infoText
		 * @default null
		 */
		this.set( 'infoText', null );

		/**
		 * (Optional) The additional CSS class set on the dropdown {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class' );

		/**
		 * The content of the `placeholder` attribute of the {@link #fieldView}.
		 *
		 * @observable
		 * @member {String} #placeholder
		 */
		this.set( 'placeholder' );

		/**
		 * The label view instance that describes the entire view.
		 *
		 * @member {module:ui/label/labelview~LabelView} #labelView
		 */
		this.labelView = this._createLabelView( viewUid );

		/**
		 * The status view for the {@link #fieldView}. It displays {@link #errorText} and
		 * {@link #infoText}.
		 *
		 * @member {module:ui/view~View} #statusView
		 */
		this.statusView = this._createStatusView( statusUid );

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
		 * @member {String|null} #_statusText
		 */
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
					children: [
						this.fieldView,
						this.labelView
					]
				},
				this.statusView
			]
		} );
	}

	/**
	 * Creates label view class instance and bind with view.
	 *
	 * @private
	 * @param {String} id Unique id to set as labelView#for attribute.
	 * @returns {module:ui/label/labelview~LabelView}
	 */
	_createLabelView( id ) {
		const labelView = new LabelView( this.locale );

		labelView.for = id;
		labelView.bind( 'text' ).to( this, 'label' );

		return labelView;
	}

	/**
	 * Creates the status view instance. It displays {@link #errorText} and {@link #infoText}
	 * next to the {@link #fieldView}. See {@link #_statusText}.
	 *
	 * @private
	 * @param {String} statusUid Unique id of the status, shared with the {@link #fieldView view's}
	 * `aria-describedby` attribute.
	 * @returns {module:ui/view~View}
	 */
	_createStatusView( statusUid ) {
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
	focus() {
		this.fieldView.focus();
	}
}
