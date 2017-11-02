/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/button/buttonview
 */

import View from '../view';
import IconView from '../icon/iconview';
import TooltipView from '../tooltip/tooltipview';

import { getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * The button view class.
 *
 *		const view = new ButtonView();
 *
 *		view.set( {
 *			label: 'A button',
 *			keystroke: 'Ctrl+B',
 *			tooltip: true,
 *			withText: true
 *		} );
 *
 *		view.render();
 *
 *		document.body.append( view.element );
 *
 * @extends module:ui/view~View
 */
export default class ButtonView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The label of the button view visible to the user when {@link #withText} is `true`.
		 * It can also be used to create a {@link #tooltip}.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.set( 'label' );

		/**
		 * (Optional) The keystroke associated with the button, i.e. <kbd>CTRL+B</kbd>,
		 * in the string format compatible with {@link module:utils/keyboard}.
		 *
		 * @observable
		 * @member {Boolean} #keystroke
		 */
		this.set( 'keystroke' );

		/**
		 * (Optional) Tooltip of the button, i.e. displayed when hovering the button with the mouse cursor.
		 *
		 * * If defined as a `Boolean` (e.g. `true`), then combination of `label` and `keystroke` will be set as a tooltip.
		 * * If defined as a `String`, tooltip will equal the exact text of that `String`.
		 * * If defined as a `Function`, `label` and `keystroke` will be passed to that function, which is to return
		 * a string with the tooltip text.
		 *
		 *		const view = new ButtonView( locale );
		 *		view.tooltip = ( label, keystroke ) => `A tooltip for ${ label } and ${ keystroke }.`
		 *
		 * @observable
		 * @default false
		 * @member {Boolean|String|Function} #tooltip
		 */
		this.set( 'tooltip' );

		/**
		 * (Optional) The position of the tooltip. See {@link module:ui/tooltip/tooltipview~TooltipView#position}
		 * to learn more about the available position values.
		 *
		 * **Note:** It makes sense only when the {@link #tooltip `tooltip` attribute} is defined.
		 *
		 * @observable
		 * @default 's'
		 * @member {'s'|'n'} #position
		 */
		this.set( 'tooltipPosition', 's' );

		/**
		 * The HTML type of the button. Default `button`.
		 *
		 * @observable
		 * @member {'button'|'submit'|'reset'|'menu'} #type
		 */
		this.set( 'type', 'button' );

		/**
		 * Controls whether the button view is "on". It makes sense when a feature it represents
		 * is currently active, e.g. a bold button is "on" when the selection is in the bold text.
		 *
		 * To disable the button, use {@link #isEnabled} instead.
		 *
		 * @observable
		 * @member {Boolean} #isOn
		 */
		this.set( 'isOn', false );

		/**
		 * Controls whether the button view is enabled, i.e. it can be clicked and execute an action.
		 *
		 * To change the "on" state of the button, use {@link #isOn} instead.
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * Controls whether the button view is visible. Visible by default, buttons are hidden
		 * using a CSS class.
		 *
		 * @observable
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', true );

		/**
		 * (Optional) Controls whether the label of the button is hidden (e.g. an icon–only button).
		 *
		 * @observable
		 * @member {Boolean} #withText
		 */
		this.set( 'withText', false );

		/**
		 * (Optional) An XML {@link module:ui/icon/iconview~IconView#content content} of the icon.
		 * When defined, an {@link #iconView} will be added to the button.
		 *
		 * @observable
		 * @member {String} #icon
		 */
		this.set( 'icon' );

		/**
		 * (Optional) Controls the `tabindex` HTML attribute of the button. By default, the button is focusable
		 * but does not included in the <kbd>Tab</kbd> order.
		 *
		 * @observable
		 * @default -1
		 * @member {String} #tabindex
		 */
		this.set( 'tabindex', -1 );

		/**
		 * Collection of the child views inside of the button {@link #element}.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * Tooltip of the button view. It is configurable using the {@link #tooltip tooltip attribute}.
		 *
		 * @readonly
		 * @member {module:ui/tooltip/tooltipview~TooltipView} #tooltipView
		 */
		this.tooltipView = this._createTooltipView();

		/**
		 * Label of the button view. It is configurable using the {@link #label label attribute}.
		 *
		 * @readonly
		 * @member {module:ui/view~View} #labelView
		 */
		this.labelView = this._createLabelView();

		/**
		 * Tooltip of the button bound to the template.
		 *
		 * @see #tooltip
		 * @see #_getTooltipString
		 * @private
		 * @observable
		 * @member {Boolean} #_tooltipString
		 */
		this.bind( '_tooltipString' ).to(
			this, 'tooltip',
			this, 'label',
			this, 'keystroke',
			this._getTooltipString.bind( this )
		);

		/**
		 * (Optional) The icon view of the button. Only present when the {@link #icon icon attribute} is defined.
		 *
		 * @readonly
		 * @member {module:ui/icon/iconview~IconView} #iconView
		 */

		this.setTemplate( {
			tag: 'button',

			attributes: {
				class: [
					'ck-button',
					bind.to( 'isEnabled', value => value ? 'ck-enabled' : 'ck-disabled' ),
					bind.if( 'isVisible', 'ck-hidden', value => !value ),
					bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' ),
					bind.if( 'withText', 'ck-button_with-text' )
				],
				type: bind.to( 'type', value => value ? value : 'button' ),
				tabindex: bind.to( 'tabindex' )
			},

			children: this.children,

			on: {
				mousedown: bind.to( evt => {
					evt.preventDefault();
				} ),

				click: bind.to( evt => {
					// We can't make the button disabled using the disabled attribute, because it won't be focusable.
					// Though, shouldn't this condition be moved to the button controller?
					if ( this.isEnabled ) {
						this.fire( 'execute' );
					} else {
						// Prevent the default when button is disabled, to block e.g.
						// automatic form submitting. See ckeditor/ckeditor5-link#74.
						evt.preventDefault();
					}
				} )
			}
		} );

		/**
		 * Fired when the button view is clicked. It won't be fired when the button {@link #isEnabled}
		 * is `false`.
		 *
		 * @event execute
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		if ( this.icon ) {
			const iconView = this.iconView = new IconView();

			iconView.bind( 'content' ).to( this, 'icon' );

			this.children.add( iconView );
		}

		this.children.add( this.tooltipView );
		this.children.add( this.labelView );
	}

	/**
	 * Focuses the {@link #element} of the button.
	 */
	focus() {
		this.element.focus();
	}

	/**
	 * Creates a {@link module:ui/tooltip/tooltipview~TooltipView} instance and binds it with button
	 * attributes.
	 *
	 * @private
	 * @returns {module:ui/tooltip/tooltipview~TooltipView}
	 */
	_createTooltipView() {
		const tooltipView = new TooltipView();

		tooltipView.bind( 'text' ).to( this, '_tooltipString' );
		tooltipView.bind( 'position' ).to( this, 'tooltipPosition' );

		return tooltipView;
	}

	/**
	 * Creates a label view instance and binds it with button attributes.
	 *
	 * @private
	 * @returns {module:ui/view~View}
	 */
	_createLabelView() {
		const labelView = new View();

		labelView.setTemplate( {
			tag: 'span',

			attributes: {
				class: [ 'ck-button__label' ]
			},

			children: [
				{
					text: this.bindTemplate.to( 'label' )
				}
			]
		} );

		return labelView;
	}

	/**
	 * Gets the text for the {@link #tooltipView} from the combination of
	 * {@link #tooltip}, {@link #label} and {@link #keystroke} attributes.
	 *
	 * @private
	 * @see #tooltip
	 * @see #_tooltipString
	 * @param {Boolean|String|Function} tooltip Button tooltip.
	 * @param {String} label Button label.
	 * @param {String} keystroke Button keystroke.
	 * @returns {String}
	 */
	_getTooltipString( tooltip, label, keystroke ) {
		if ( tooltip ) {
			if ( typeof tooltip == 'string' ) {
				return tooltip;
			} else {
				if ( keystroke ) {
					keystroke = getEnvKeystrokeText( keystroke );
				}

				if ( tooltip instanceof Function ) {
					return tooltip( label, keystroke );
				} else {
					return `${ label }${ keystroke ? ` (${ keystroke })` : '' }`;
				}
			}
		}

		return '';
	}
}
