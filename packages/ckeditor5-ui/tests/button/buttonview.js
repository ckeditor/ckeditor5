/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ButtonView from '../../src/button/buttonview.js';
import IconView from '../../src/icon/iconview.js';
import View from '../../src/view.js';
import ViewCollection from '../../src/viewcollection.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import { ButtonLabelView } from '../../src/index.js';

describe( 'ButtonView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = { t() {} };

		view = new ButtonView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates view#children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates #labelView', () => {
			expect( view.labelView ).to.be.instanceOf( View );
			expect( view.labelView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.labelView.element.classList.contains( 'ck-button__label' ) ).to.be.true;
		} );

		it( 'creates #keystrokeView', () => {
			expect( view.keystrokeView ).to.be.instanceOf( View );
		} );

		it( 'creates #iconView', () => {
			expect( view.iconView ).to.be.instanceOf( IconView );
		} );

		describe( 'label', () => {
			it( 'uses ButtonLabelView by default', () => {
				expect( view.labelView ).to.be.instanceOf( ButtonLabelView );

				view.set( {
					labelStyle: 'color: red',
					label: 'bar'
				} );

				expect( view.labelView.id ).to.equal( view.element.getAttribute( 'aria-labelledby' ) );
				expect( view.labelView.element.getAttribute( 'style' ) ).to.equal( 'color: red' );
				expect( view.labelView.element.textContent ).to.equal( 'bar' );
			} );

			it( 'accepts a custom label instance that implements the same button label interface', () => {
				class CustomLabel extends View {
					constructor() {
						super();

						const bind = this.bindTemplate;

						this.set( {
							text: undefined,
							style: undefined,
							id: undefined
						} );

						this.setTemplate( {
							tag: 'span',
							attributes: {
								id: bind.to( 'id' ),
								style: bind.to( 'style' )
							},
							children: [
								{ text: bind.to( 'text' ) }
							]
						} );
					}
				}

				const view = new ButtonView( locale, new CustomLabel() );

				view.set( {
					labelStyle: 'color: red',
					label: 'bar'
				} );

				view.render();

				expect( view.labelView ).to.be.instanceOf( CustomLabel );
				expect( view.labelView.element.id ).to.equal( view.element.getAttribute( 'aria-labelledby' ) );
				expect( view.labelView.element.getAttribute( 'style' ) ).to.equal( 'color: red' );
				expect( view.labelView.element.textContent ).to.equal( 'bar' );

				view.destroy();
			} );
		} );
	} );

	describe( '<button> bindings', () => {
		describe( 'class', () => {
			it( 'is set initially', () => {
				expect( view.element.classList ).to.have.length( 3 );
				expect( view.element.classList.contains( 'ck' ) ).to.true;
				expect( view.element.classList.contains( 'ck-button' ) ).to.true;
				expect( view.element.classList.contains( 'ck-disabled' ) ).to.false;
				expect( view.element.classList.contains( 'ck-off' ) ).to.true;
			} );

			it( 'reacts on view#isEnabled', () => {
				view.isEnabled = true;
				expect( view.element.classList.contains( 'ck-disabled' ) ).to.false;

				view.isEnabled = false;
				expect( view.element.classList.contains( 'ck-disabled' ) ).to.true;
			} );

			it( 'reacts on view#isOn', () => {
				view.isOn = true;
				expect( view.element.classList.contains( 'ck-on' ) ).to.true;

				view.isOn = false;
				expect( view.element.classList.contains( 'ck-on' ) ).to.false;
			} );

			it( 'reacts on view#isVisible', () => {
				view.isVisible = true;
				expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;

				view.isVisible = false;
				expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			it( 'reacts on view#withText', () => {
				view.withText = true;
				expect( view.element.classList.contains( 'ck-button_with-text' ) ).to.true;

				view.withText = false;
				expect( view.element.classList.contains( 'ck-button_with-text' ) ).to.false;
			} );

			it( 'reacts on view#withKeystroke', () => {
				view.withKeystroke = true;
				expect( view.element.classList.contains( 'ck-button_with-keystroke' ) ).to.true;

				view.withKeystroke = false;
				expect( view.element.classList.contains( 'ck-button_with-keystroke' ) ).to.false;
			} );

			it( 'reacts on view#type', () => {
				// Default value.
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'button' );

				view.type = 'submit';
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'submit' );

				// Default value.
				view.type = null;
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'button' );
			} );

			it( 'reacts on view#class', () => {
				view.set( 'class', 'foo' );

				expect( view.element.classList.contains( 'foo' ) ).to.be.true;
			} );
		} );

		describe( 'labelView', () => {
			it( 'reacts on view#labelStyle', () => {
				expect( view.labelView.element.attributes.getNamedItem( 'style' ) ).to.be.null;

				view.labelStyle = 'color: red';

				expect( view.labelView.element.attributes.getNamedItem( 'style' ).value ).to.equal( 'color: red' );
			} );
		} );

		describe( 'tooltip', () => {
			it( 'is initially set', () => {
				expect( view.element.dataset.ckeTooltipText ).to.be.undefined;
				expect( view.element.dataset.ckeTooltipPosition ).to.equal( 's' );
			} );

			it( 'it reacts to #tooltipPosition attribute', () => {
				view.tooltip = 'foo';
				view.icon = '<svg></svg>';

				expect( view.tooltipPosition ).to.equal( 's' );
				expect( view.element.dataset.ckeTooltipPosition ).to.equal( 's' );

				view.tooltipPosition = 'n';
				expect( view.element.dataset.ckeTooltipPosition ).to.equal( 'n' );
			} );

			describe( 'defined as a Boolean', () => {
				it( 'renders tooltip text out of #label and #keystroke', () => {
					view.tooltip = true;
					view.label = 'bar';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'bar (A)' );
				} );

				it( 'not render tooltip text when #tooltip value is false', () => {
					view.tooltip = false;
					view.label = 'bar';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).to.be.undefined;
				} );

				it( 'reacts to changes in #label and #keystroke', () => {
					view.tooltip = true;
					view.label = 'foo';
					view.keystroke = 'B';

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'foo (B)' );

					view.label = 'baz';
					view.keystroke = false;

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'baz' );
				} );
			} );

			describe( 'defined as a String', () => {
				it( 'renders as a plain text', () => {
					view.tooltip = 'bar';
					view.label = 'foo';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'bar' );
				} );

				it( 'reacts to changes of #tooltip', () => {
					view.tooltip = 'bar';

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'bar' );

					view.tooltip = 'foo';
					expect( view.element.dataset.ckeTooltipText ).to.equal( 'foo' );
				} );
			} );

			describe( 'defined as a Function', () => {
				it( 'generates a tooltip text when passed #label and #keystroke', () => {
					view.tooltip = ( l, k ) => `${ l } - ${ k }`;
					view.label = 'foo';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'foo - A' );
				} );

				it( 'reacts to changes of #label and #keystroke', () => {
					view.tooltip = ( l, k ) => `${ l } - ${ k }`;
					view.label = 'foo';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'foo - A' );

					view.label = 'bar';
					view.keystroke = 'B';

					expect( view.element.dataset.ckeTooltipText ).to.equal( 'bar - B' );
				} );
			} );
		} );

		describe( 'role', () => {
			it( 'is not initially set ', () => {
				expect( view.element.attributes.role ).to.equal( undefined );
			} );

			it( 'reacts on view#role', () => {
				view.role = 'foo';

				expect( view.element.attributes.role.value ).to.equal( 'foo' );
			} );
		} );

		describe( 'text', () => {
			it( 'is not initially set ', () => {
				expect( view.element.textContent ).to.equal( '' );
			} );

			it( 'reacts on view#label', () => {
				view.label = 'bar';

				expect( view.element.textContent ).to.equal( 'bar' );
			} );
		} );

		describe( 'tabindex', () => {
			it( 'is initially set ', () => {
				expect( view.element.attributes.tabindex.value ).to.equal( '-1' );
			} );

			it( 'reacts on view#tabindex', () => {
				view.tabindex = 3;

				expect( view.element.attributes.tabindex.value ).to.equal( '3' );
			} );
		} );

		describe( 'aria', () => {
			it( '-labelledby is set', () => {
				expect( view.element.attributes[ 'aria-labelledby' ].value )
					.to.equal( view.element.lastChild.id )
					.to.match( /^ck-editor__aria-label_\w+$/ );
			} );

			it( '-labelledby reacts to #ariaLabelledBy', () => {
				view.ariaLabelledBy = 'foo';
				expect( view.element.attributes[ 'aria-labelledby' ].value )
					.to.equal( 'foo' );
			} );

			it( '-disabled reacts to #isEnabled', () => {
				view.isEnabled = true;
				expect( view.element.attributes[ 'aria-disabled' ] ).to.be.undefined;

				view.isEnabled = false;
				expect( view.element.attributes[ 'aria-disabled' ].value ).to.equal( 'true' );
			} );

			it( '-pressed has correct default value for toggleable button', () => {
				view.isToggleable = true;
				view.isOn = undefined;
				expect( view.element.attributes[ 'aria-pressed' ].value ).to.equal( 'false' );
			} );

			it( '-pressed reacts to #isOn', () => {
				view.isToggleable = true;
				view.isOn = true;

				expect( view.element.attributes[ 'aria-pressed' ].value ).to.equal( 'true' );
				expect( view.element.hasAttribute( 'aria-checked' ) ).to.be.false;

				view.isOn = false;

				expect( view.element.attributes[ 'aria-pressed' ].value ).to.equal( 'false' );
				expect( view.element.hasAttribute( 'aria-checked' ) ).to.be.false;
			} );

			it( '-pressed is not present for non–toggleable button', () => {
				view.isOn = true;

				expect( view.element.hasAttribute( 'aria-pressed' ) ).to.be.false;
				expect( view.element.hasAttribute( 'aria-checked' ) ).to.be.false;

				view.isOn = false;

				expect( view.element.hasAttribute( 'aria-pressed' ) ).to.be.false;
				expect( view.element.hasAttribute( 'aria-checked' ) ).to.be.false;
			} );

			for ( const role of [ 'radio', 'checkbox', 'option', 'switch', 'menuitemcheckbox', 'menuitemradio' ] ) {
				it( `-checked reacts to #isOn and "${ role }" button role`, () => {
					view.role = role;
					view.isToggleable = true;
					view.isOn = true;

					expect( view.element.attributes[ 'aria-checked' ].value ).to.equal( 'true' );
					expect( view.element.hasAttribute( 'aria-pressed' ) ).to.be.false;

					view.isOn = false;

					expect( view.element.attributes[ 'aria-checked' ].value ).to.equal( 'false' );
					expect( view.element.hasAttribute( 'aria-pressed' ) ).to.be.false;
				} );
			}

			it( '-label reacts on #ariaLabel', () => {
				view.ariaLabel = undefined;
				expect( view.element.hasAttribute( 'aria-label' ) ).to.be.false;

				view.ariaLabel = 'Foo';
				expect( view.element.attributes[ 'aria-label' ].value ).to.equal( 'Foo' );
			} );

			it( '-checked is not present', () => {
				view.isOn = true;
				expect( view.element.hasAttribute( 'aria-checked' ) ).to.be.false;
			} );
		} );

		describe( 'mousedown event', () => {
			it( 'should not be prevented', () => {
				const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

				expect( ret ).to.true;
			} );

			describe( 'in Safari', () => {
				let view, stub, clock;

				beforeEach( () => {
					stub = testUtils.sinon.stub( env, 'isSafari' ).value( true );
					clock = testUtils.sinon.useFakeTimers();
					view = new ButtonView( locale );
					view.render();
				} );

				afterEach( () => {
					stub.resetBehavior();
					clock.restore();
					view.destroy();
				} );

				it( 'the button is focused', () => {
					const spy = sinon.spy( view.element, 'focus' );
					view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );
					clock.tick( 0 );

					expect( spy.callCount ).to.equal( 1 );
				} );

				it( 'does not steal focus from other element if the focus already moved', () => {
					const spy = sinon.spy( view.element, 'focus' );
					view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );
					view.element.dispatchEvent( new Event( 'mouseup', { cancelable: true } ) );

					document.body.focus();
					clock.tick( 0 );

					expect( spy.callCount ).to.equal( 0 );
				} );

				it( 'the event is not prevented', () => {
					const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

					expect( ret ).to.true;
				} );
			} );
		} );

		describe( 'execute event', () => {
			it( 'triggers view#execute event if button is not disabled', () => {
				const spy = sinon.spy();

				view.on( 'execute', spy );
				view.set( 'isEnabled', true );

				view.element.dispatchEvent( new Event( 'click' ) );
				sinon.assert.callCount( spy, 1 );

				view.isEnabled = false;

				view.element.dispatchEvent( new Event( 'click' ) );
				sinon.assert.callCount( spy, 1 );
			} );
		} );
	} );

	describe( '#iconView', () => {
		it( 'is omited in #children when view#icon is not defined', () => {
			view = new ButtonView( locale );
			view.render();

			expect( view.element.childNodes ).to.have.length( 1 );
			expect( view.iconView.element ).to.be.null;
		} );

		it( 'is added to the #children when view#icon is defined', () => {
			view = new ButtonView( locale );
			view.icon = '<svg></svg>';
			view.render();

			expect( view.element.childNodes ).to.have.length( 2 );
			expect( view.element.childNodes[ 0 ] ).to.equal( view.iconView.element );

			expect( view.iconView ).to.instanceOf( IconView );
			expect( view.iconView.content ).to.equal( '<svg></svg>' );
			expect( view.iconView.element.classList.contains( 'ck-button__icon' ) ).to.be.true;

			view.icon = '<svg>bar</svg>';
			expect( view.iconView.content ).to.equal( '<svg>bar</svg>' );
		} );

		it( 'is added to the #children when view#icon is defined after render', () => {
			view = new ButtonView( locale );
			view.render();

			view.icon = '<svg></svg>';
			expect( view.element.childNodes ).to.have.length( 2 );
			expect( view.element.childNodes[ 0 ] ).to.equal( view.iconView.element );

			expect( view.iconView ).to.instanceOf( IconView );
			expect( view.iconView.content ).to.equal( '<svg></svg>' );
			expect( view.iconView.element.classList.contains( 'ck-button__icon' ) ).to.be.true;

			view.icon = '<svg>bar</svg>';
			expect( view.iconView.content ).to.equal( '<svg>bar</svg>' );
		} );

		it( 'is removed from the #children when view#icon is removed', () => {
			view = new ButtonView( locale );
			view.icon = '<svg></svg>';
			view.render();

			expect( view.element.childNodes ).to.have.length( 2 );
			expect( view.element.childNodes[ 0 ] ).to.equal( view.iconView.element );
			expect( view.element.childNodes[ 1 ] ).to.equal( view.labelView.element );

			view.icon = undefined;
			expect( view.element.childNodes ).to.have.length( 1 );
			expect( view.element.childNodes[ 0 ] ).to.equal( view.labelView.element );
		} );

		it( 'is destroyed with the view', () => {
			view = new ButtonView( locale );
			view.icon = '<svg></svg>';
			view.render();

			const spy = sinon.spy( view.iconView, 'destroy' );

			view.destroy();
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( '#keystrokeView', () => {
		it( 'is omitted in #children when view#withKeystroke is not set', () => {
			view = new ButtonView( locale );
			view.render();

			expect( view.element.childNodes ).to.have.length( 1 );
			expect( view.keystrokeView.element ).to.be.null;
		} );

		it( 'is added to the #children when view#withKeystroke is true', () => {
			testUtils.sinon.stub( env, 'isMac' ).value( false );

			view = new ButtonView( locale );
			view.keystroke = 'Ctrl+A';
			view.withKeystroke = true;
			view.render();

			expect( view.element.childNodes ).to.have.length( 2 );
			expect( view.element.childNodes[ 1 ] ).to.equal( view.keystrokeView.element );

			expect( view.keystrokeView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.keystrokeView.element.classList.contains( 'ck-button__keystroke' ) ).to.be.true;

			expect( view.keystrokeView ).to.instanceOf( View );
			expect( view.keystrokeView.element.textContent ).to.equal( 'Ctrl+A' );
		} );

		it( 'is omitted in #children when view#keystroke is not defined', () => {
			// (#9412)
			view = new ButtonView( locale );
			view.withKeystroke = true;
			view.render();

			expect( view.element.childNodes ).to.have.length( 1 );
			expect( view.keystrokeView.element ).to.be.null;
		} );

		it( 'usese fancy keystroke preview on Mac', () => {
			testUtils.sinon.stub( env, 'isMac' ).value( true );

			view = new ButtonView( locale );
			view.keystroke = 'Ctrl+A';
			view.withKeystroke = true;
			view.render();

			expect( view.keystrokeView.element.textContent ).to.equal( '⌘A' );
		} );

		it( 'is destroyed with the view', () => {
			view = new ButtonView( locale );
			view.keystroke = 'Ctrl+A';
			view.withKeystroke = true;
			view.render();

			const spy = sinon.spy( view.keystrokeView, 'destroy' );

			view.destroy();
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the button in DOM', () => {
			const spy = sinon.spy( view.element, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
