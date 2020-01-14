/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/labeledview/labeledview
 */

import View from '../view';
import uid from '@ckeditor/ckeditor5-utils/src/uid';
import LabelView from '../label/labelview';
import '../../theme/components/labeledview/labeledview.css';

/**
 * The labeled view class.
 *
 * @extends module:ui/view~View
 */
export default class LabeledView extends View {
	/**
	 * Creates an instance of the labeled view class.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance.
	 * @param {Function} viewCreator TODO
	 */
	constructor( locale, viewCreator ) {
		super( locale );

		const viewUid = `ck-labeled-view-${ uid() }`;
		const statusUid = `ck-labeled-view-status-${ uid() }`;

		/**
		 * The view that gets labeled.
		 *
		 * @member {module:ui/view~View} #view
		 */
		this.view = viewCreator( this, viewUid, statusUid );

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
		 * The validation error text. When set, it will be displayed
		 * next to the {@link #field} as a typical validation error message.
		 * Set it to `null` to hide the message.
		 *
		 * **Note:** Setting this property to anything but `null` will automatically
		 * make the `hasError` of the {@link #view} `true`.
		 *
		 * **Note:** Typing in the {@link #field} which fires the
		 * {@link module:ui/inputtext/inputtextview~InputTextView#event:input `input` event}
		 * resets this property back to `null`, indicating that the input field can be re–validated.
		 *
		 * @observable
		 * @member {String|null} #errorText
		 */
		this.set( 'errorText', null );

		/**
		 * The additional information text displayed next to the {@link #field} which can
		 * be used to inform the user about the purpose of the input, provide help or hints.
		 *
		 * Set it to `null` to hide the message.
		 *
		 * **Note:** This text will be displayed in the same place as {@link #errorText} but the
		 * latter always takes precedence: if the {@link #errorText} is set, it replaces
		 * {@link #errorText} for as long as the value of the input is invalid.
		 *
		 * @observable
		 * @member {String|null} #infoText
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
		 * The label view.
		 *
		 * @member {module:ui/label/labelview~LabelView} #labelView
		 */
		this.labelView = this._createLabelView( viewUid );

		/**
		 * The status view for the {@link #view}. It displays {@link #errorText} and
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
					'ck-labeled-view',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value )
				]
			},
			children: [
				this.labelView,
				this.view,
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
	 * next to the {@link #view}. See {@link #_statusText}.
	 *
	 * @private
	 * @param {String} statusUid Unique id of the status, shared with the input's `aria-describedby` attribute.
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
					'ck-labeled-view__status',
					bind.if( 'errorText', 'ck-labeled-view__status_error' ),
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
	 * Focuses the input.
	 */
	focus() {
		this.view.focus();
	}
}
