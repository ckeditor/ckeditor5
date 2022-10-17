/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/buttonview
 */

import View from '../view';
import IconView from '../icon/iconview';

import uid from '@ckeditor/ckeditor5-utils/src/uid';
import { getEnvKeystrokeText } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';

import '../../theme/components/button/button.css';

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { TemplateDefinition } from '../template';
import type ViewCollection from '../viewcollection';
import type { default as Button, ButtonExecuteEvent } from './button';

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
 * @implements module:ui/button/button~Button
 */
export default class ButtonView extends View implements Button {
	public readonly children: ViewCollection;
	public readonly labelView: View;
	public readonly iconView: IconView;
	public readonly keystrokeView: View;

	declare public class: string | undefined;
	declare public labelStyle: string | undefined;
	declare public icon: string | undefined;
	declare public isEnabled: boolean;
	declare public isOn: boolean;
	declare public isVisible: boolean;
	declare public isToggleable: boolean;
	declare public keystroke: string | undefined;
	declare public label: string | undefined;
	declare public tabindex: number;
	declare public tooltip: Button[ 'tooltip' ];
	declare public tooltipPosition: Button[ 'tooltipPosition' ];
	declare public type: Button[ 'type' ];
	declare public withText: boolean;
	declare public withKeystroke: boolean;
	declare public _tooltipString: string;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;
		const ariaLabelUid = uid();

		// Implement the Button interface.
		this.set( 'class', undefined );
		this.set( 'labelStyle', undefined );
		this.set( 'icon', undefined );
		this.set( 'isEnabled', true );
		this.set( 'isOn', false );
		this.set( 'isVisible', true );
		this.set( 'isToggleable', false );
		this.set( 'keystroke', undefined );
		this.set( 'label', undefined );
		this.set( 'tabindex', -1 );
		this.set( 'tooltip', false );
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
				class: 'ck-button__icon'
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
		 * @member {String|undefined} #_tooltipString
		 */
		this.bind( '_tooltipString' ).to(
			this, 'tooltip',
			this, 'label',
			this, 'keystroke',
			this._getTooltipString.bind( this )
		);

		const template: TemplateDefinition & { on: object } = {
			tag: 'button',

			attributes: {
				class: [
					'ck',
					'ck-button',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value ),
					bind.if( 'isVisible', 'ck-hidden', value => !value ),
					bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' ),
					bind.if( 'withText', 'ck-button_with-text' ),
					bind.if( 'withKeystroke', 'ck-button_with-keystroke' )
				],
				type: bind.to( 'type', value => value ? value : 'button' ),
				tabindex: bind.to( 'tabindex' ),
				'aria-labelledby': `ck-editor__aria-label_${ ariaLabelUid }`,
				'aria-disabled': bind.if( 'isEnabled', true, value => !value ),
				'aria-pressed': bind.to( 'isOn', value => this.isToggleable ? String( !!value ) : false ),
				'data-cke-tooltip-text': bind.to( '_tooltipString' ),
				'data-cke-tooltip-position': bind.to( 'tooltipPosition' )
			},

			children: this.children,

			on: {
				click: bind.to( evt => {
					// We can't make the button disabled using the disabled attribute, because it won't be focusable.
					// Though, shouldn't this condition be moved to the button controller?
					if ( this.isEnabled ) {
						this.fire<ButtonExecuteEvent>( 'execute' );
					} else {
						// Prevent the default when button is disabled, to block e.g.
						// automatic form submitting. See ckeditor/ckeditor5-link#74.
						evt.preventDefault();
					}
				} )
			}
		};

		// On Safari we have to force the focus on a button on click as it's the only browser
		// that doesn't do that automatically. See #12115.
		if ( env.isSafari ) {
			template.on.mousedown = bind.to( evt => {
				this.focus();
				evt.preventDefault();
			} );
		}

		this.setTemplate( template );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		if ( this.icon ) {
			this.iconView.bind( 'content' ).to( this, 'icon' );
			this.children.add( this.iconView );
		}

		this.children.add( this.labelView );

		if ( this.withKeystroke && this.keystroke ) {
			this.children.add( this.keystrokeView );
		}
	}

	/**
	 * Focuses the {@link #element} of the button.
	 */
	public focus(): void {
		this.element!.focus();
	}

	/**
	 * Creates a label view instance and binds it with button attributes.
	 *
	 * @private
	 * @param {String} ariaLabelUid The aria label UID.
	 * @returns {module:ui/view~View}
	 */
	private _createLabelView( ariaLabelUid: string ) {
		const labelView = new View();
		const bind = this.bindTemplate;

		labelView.setTemplate( {
			tag: 'span',

			attributes: {
				class: [
					'ck',
					'ck-button__label'
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
	private _createKeystrokeView() {
		const keystrokeView = new View();

		keystrokeView.setTemplate( {
			tag: 'span',

			attributes: {
				class: [
					'ck',
					'ck-button__keystroke'
				]
			},

			children: [
				{
					text: this.bindTemplate.to( 'keystroke', text => getEnvKeystrokeText( text! ) )
				}
			]
		} );

		return keystrokeView;
	}

	/**
	 * Gets the text for the tooltip from the combination of
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
	private _getTooltipString(
		tooltip: Button[ 'tooltip' ],
		label: string | undefined,
		keystroke: string | undefined
	): string {
		if ( tooltip ) {
			if ( typeof tooltip == 'string' ) {
				return tooltip;
			} else {
				if ( keystroke ) {
					keystroke = getEnvKeystrokeText( keystroke );
				}

				if ( tooltip instanceof Function ) {
					return tooltip( label!, keystroke );
				} else {
					return `${ label }${ keystroke ? ` (${ keystroke })` : '' }`;
				}
			}
		}

		return '';
	}
}
