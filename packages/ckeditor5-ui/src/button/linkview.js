import View from '../view';
import IconView from '../icon/iconview';
import TooltipView from '../tooltip/tooltipview';

import uid from '@ckeditor/ckeditor5-utils/src/uid';
import { getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils/src/keyboard';

export default class LinkView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;
		const ariaLabelUid = uid();

		// Implement the Button interface.
		this.set( 'class' );
		this.set( 'labelStyle' );
		this.set( 'icon' );
		this.set( 'isEnabled', true );
		this.set( 'isOn', false );
		this.set( 'isVisible', true );
		this.set( 'isToggleable', false );
		this.set( 'keystroke' );
		this.set( 'label' );
		this.set( 'tabindex', -1 );
		this.set( 'tooltip' );
		this.set( 'tooltipPosition', 's' );
		this.set( 'type', 'button' );
		this.set( 'withText', false );
		this.set( 'withKeystroke', false );

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
		this.labelView = this._createLabelView( ariaLabelUid );

		/**
		 * The icon view of the button. Will be added to {@link #children} when the
		 * {@link #icon icon attribute} is defined.
		 *
		 * @readonly
		 * @member {module:ui/icon/iconview~IconView} #iconView
		 */
		this.iconView = new IconView();

		this.iconView.extendTemplate( {
			attributes: {
				class: 'ck-link__icon'
			}
		} );

		/**
		 * A view displaying the keystroke of the button next to the {@link #labelView label}.
		 * Added to {@link #children} when the {@link #withKeystroke `withKeystroke` attribute}
		 * is defined.
		 *
		 * @readonly
		 * @member {module:ui/view/view~View} #keystrokeView
		 */
		this.keystrokeView = this._createKeystrokeView();

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

		this.setTemplate( {
			tag: 'a',

			attributes: {
				class: [
					'ck',
					'ck-link',
					bind.to( 'class' ),
					bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' ),
					bind.if( 'withText', 'ck-link_with-text' ),
					bind.if( 'withKeystroke', 'ck-link_with-keystroke' )
				],
				href: bind.to( 'href' ),
				target: '_blank',
				rel: 'noopener noreferrer'
			},

			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		if ( this.icon ) {
			this.iconView.bind( 'content' ).to( this, 'icon' );
			this.children.add( this.iconView );
		}

		this.children.add( this.tooltipView );
		this.children.add( this.labelView );

		if ( this.withKeystroke ) {
			this.children.add( this.keystrokeView );
		}
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
	 * @param {String} ariaLabelUid The aria label UID.
	 * @returns {module:ui/view~View}
	 */
	_createLabelView( ariaLabelUid ) {
		const labelView = new View();
		const bind = this.bindTemplate;

		labelView.setTemplate( {
			tag: 'span',

			attributes: {
				class: [
					'ck',
					'ck-link__label'
				],
				style: bind.to( 'labelStyle' ),
				id: `ck-editor__aria-label_${ ariaLabelUid }`
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
	 * Creates a view that displays a keystroke next to a {@link #labelView label }
	 * and binds it with button attributes.
	 *
	 * @private
	 * @returns {module:ui/view~View}
	 */
	_createKeystrokeView() {
		const keystrokeView = new View();

		keystrokeView.setTemplate( {
			tag: 'span',

			attributes: {
				class: [
					'ck',
					'ck-link__keystroke'
				]
			},

			children: [
				{
					text: this.bindTemplate.to( 'keystroke', text => getEnvKeystrokeText( text ) )
				}
			]
		} );

		return keystrokeView;
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
