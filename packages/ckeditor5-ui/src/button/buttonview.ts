/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/buttonview
 */

import View from '../view.js';
import IconView from '../icon/iconview.js';

import type { TemplateDefinition } from '../template.js';
import type ViewCollection from '../viewcollection.js';
import type { default as Button, ButtonExecuteEvent } from './button.js';
import type ButtonLabel from './buttonlabel.js';
import ButtonLabelView from './buttonlabelview.js';

import {
	env,
	getEnvKeystrokeText,
	uid,
	delay,
	type Locale,
	type DelayedFunc
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/button/button.css';

/**
 * The button view class.
 *
 * ```ts
 * const view = new ButtonView();
 *
 * view.set( {
 * 	label: 'A button',
 * 	keystroke: 'Ctrl+B',
 * 	tooltip: true,
 * 	withText: true
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 */
export default class ButtonView extends View<HTMLButtonElement> implements Button {
	/**
	 * Collection of the child views inside of the button {@link #element}.
	 */
	public readonly children: ViewCollection;

	/**
	 * Label of the button view. Its text is configurable using the {@link #label label attribute}.
	 *
	 * If not configured otherwise in the `constructor()`, by default the label is an instance
	 * of {@link module:ui/button/buttonlabelview~ButtonLabelView}.
	 */
	public readonly labelView: ButtonLabel;

	/**
	 * The icon view of the button. Will be added to {@link #children} when the
	 * {@link #icon icon attribute} is defined.
	 */
	public readonly iconView: IconView;

	/**
	 * A view displaying the keystroke of the button next to the {@link #labelView label}.
	 * Added to {@link #children} when the {@link #withKeystroke `withKeystroke` attribute}
	 * is defined.
	 */
	public readonly keystrokeView: View;

	/**
	 * @inheritDoc
	 */
	declare public class: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public labelStyle: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public icon: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public isEnabled: boolean;

	/**
	 * @inheritDoc
	 */
	declare public isOn: boolean;

	/**
	 * @inheritDoc
	 */
	declare public isVisible: boolean;

	/**
	 * @inheritDoc
	 */
	declare public isToggleable: boolean;

	/**
	 * @inheritDoc
	 */
	declare public keystroke: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public label: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public tabindex: number;

	/**
	 * @inheritDoc
	 */
	declare public tooltip: Button[ 'tooltip' ];

	/**
	 * @inheritDoc
	 */
	declare public tooltipPosition: Button[ 'tooltipPosition' ];

	/**
	 * @inheritDoc
	 */
	declare public type: Button[ 'type' ];

	/**
	 * @inheritDoc
	 */
	declare public withText: boolean;

	/**
	 * @inheritDoc
	 */
	declare public withKeystroke: boolean;

	/**
	 * @inheritDoc
	 */
	declare public role: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public ariaLabel?: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public ariaLabelledBy: string | undefined;

	/**
	 * Aria-pressed attribute of element. It is calculated based on {@link #isToggleable isToggleable} and {@link #role}.
	 * It's set to true if the button is on and the role is not checkable.
	 *
	 * @readonly
	 * @internal
	 */
	declare public _ariaPressed: string | false;

	/**
	 * Aria-checked attribute of element. It is calculated based on {@link #isToggleable isToggleable} and {@link #role}.
	 * It's set to true if the button is on and the role is checkable.
	 *
	 * @readonly
	 * @internal
	 */
	declare public _ariaChecked: string | false;

	/**
	 * Tooltip of the button bound to the template.
	 *
	 * @see #tooltip
	 * @see module:ui/button/buttonview~ButtonView#_getTooltipString
	 * @internal
	 * @observable
	 */
	declare public _tooltipString: string;

	/**
	 * Delayed focus function for focus handling in Safari.
	 */
	private _focusDelayed: DelayedFunc<() => void> | null = null;

	/**
	 * Creates an instance of the button view class.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param labelView The instance of the button's label. If not provided, an instance of
	 * {@link module:ui/button/buttonlabelview~ButtonLabelView} is used.
	 */
	constructor( locale?: Locale, labelView: ButtonLabel = new ButtonLabelView() ) {
		super( locale );

		const bind = this.bindTemplate;
		const ariaLabelUid = uid();

		// Implement the Button interface.
		this.set( '_ariaPressed', false );
		this.set( '_ariaChecked', false );
		this.set( 'ariaLabel', undefined );
		this.set( 'ariaLabelledBy', `ck-editor__aria-label_${ ariaLabelUid }` );
		this.set( 'class', undefined );
		this.set( 'labelStyle', undefined );
		this.set( 'icon', undefined );
		this.set( 'isEnabled', true );
		this.set( 'isOn', false );
		this.set( 'isVisible', true );
		this.set( 'isToggleable', false );
		this.set( 'keystroke', undefined );
		this.set( 'label', undefined );
		this.set( 'role', undefined );
		this.set( 'tabindex', -1 );
		this.set( 'tooltip', false );
		this.set( 'tooltipPosition', 's' );
		this.set( 'type', 'button' );
		this.set( 'withText', false );
		this.set( 'withKeystroke', false );

		this.children = this.createCollection();
		this.labelView = this._setupLabelView( labelView );

		this.iconView = new IconView();
		this.iconView.extendTemplate( {
			attributes: {
				class: 'ck-button__icon'
			}
		} );

		this.keystrokeView = this._createKeystrokeView();

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
				role: bind.to( 'role' ),
				type: bind.to( 'type', value => value ? value : 'button' ),
				tabindex: bind.to( 'tabindex' ),
				'aria-checked': bind.to( '_ariaChecked' ),
				'aria-pressed': bind.to( '_ariaPressed' ),
				'aria-label': bind.to( 'ariaLabel' ),
				'aria-labelledby': bind.to( 'ariaLabelledBy' ),
				'aria-disabled': bind.if( 'isEnabled', true, value => !value ),
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

		this.bind( '_ariaPressed' ).to(
			this, 'isOn', this, 'isToggleable', this, 'role',
			( isOn, isToggleable, role ) => {
				if ( !isToggleable || isCheckableRole( role ) ) {
					return false;
				}

				return String( !!isOn );
			}
		);

		this.bind( '_ariaChecked' ).to(
			this, 'isOn', this, 'isToggleable', this, 'role',
			( isOn, isToggleable, role ) => {
				if ( !isToggleable || !isCheckableRole( role ) ) {
					return false;
				}

				return String( !!isOn );
			}
		);

		// On Safari we have to force the focus on a button on click as it's the only browser
		// that doesn't do that automatically. See #12115.
		if ( env.isSafari ) {
			if ( !this._focusDelayed ) {
				this._focusDelayed = delay( () => this.focus(), 0 );
			}

			template.on.mousedown = bind.to( () => {
				this._focusDelayed!();
			} );

			template.on.mouseup = bind.to( () => {
				this._focusDelayed!.cancel();
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
	 * @inheritDoc
	 */
	public override destroy(): void {
		if ( this._focusDelayed ) {
			this._focusDelayed.cancel();
		}

		super.destroy();
	}

	/**
	 * Binds the label view instance it with button attributes.
	 */
	private _setupLabelView( labelView: ButtonLabelView ) {
		labelView.bind( 'text', 'style', 'id' ).to( this, 'label', 'labelStyle', 'ariaLabelledBy' );

		return labelView;
	}

	/**
	 * Creates a view that displays a keystroke next to a {@link #labelView label }
	 * and binds it with button attributes.
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
	 * @see #tooltip
	 * @see #_tooltipString
	 * @param tooltip Button tooltip.
	 * @param label Button label.
	 * @param keystroke Button keystroke.
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

/**
 * Checks if `aria-checkbox` can be used with specified role.
 */
function isCheckableRole( role: string | undefined ) {
	switch ( role ) {
		case 'radio':
		case 'checkbox':
		case 'option':
		case 'switch':
		case 'menuitemcheckbox':
		case 'menuitemradio':
			return true;

		default:
			return false;
	}
}
