/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ButtonView from '../../src/button/buttonview';
import IconView from '../../src/icon/iconview';
import TooltipView from '../../src/tooltip/tooltipview';

testUtils.createSinonSandbox();

describe( 'ButtonView', () => {
	let locale, view;

	beforeEach( () => {
		locale = { t() {} };

		return ( view = new ButtonView( locale ) ).init();
	} );

	describe( '<button> bindings', () => {
		describe( 'class', () => {
			it( 'is set initially', () => {
				expect( view.element.classList ).to.have.length( 3 );
				expect( view.element.classList.contains( 'ck-button' ) ).to.true;
				expect( view.element.classList.contains( 'ck-enabled' ) ).to.true;
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

			it( 'reacts on view#type', () => {
				// Default value.
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'button' );

				view.type = 'submit';
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'submit' );

				// Default value.
				view.type = null;
				expect( view.element.getAttribute( 'type' ) ).to.equal( 'button' );
			} );
		} );

		describe( 'tooltip', () => {
			beforeEach( () => {
				view = new ButtonView( locale );
			} );

			it( 'is initially set', () => {
				expect( view.tooltipView ).to.be.instanceof( TooltipView );
				expect( Array.from( view.template.children ) ).to.include( view.tooltipView );
			} );

			it( 'it reacts to #tooltipPosition attribute', () => {
				view.tooltip = 'foo';
				view.icon = 'bar';
				view.init();

				expect( view.tooltipPosition ).to.equal( 's' );
				expect( view.tooltipView.position ).to.equal( 's' );

				view.tooltipPosition = 'n';
				expect( view.tooltipView.position ).to.equal( 'n' );
			} );

			describe( 'defined as a Boolean', () => {
				it( 'renders tooltip text out of #label and #keystroke', () => {
					view.tooltip = true;
					view.label = 'bar';
					view.keystroke = 'A';
					view.init();

					expect( view.tooltipView.text ).to.equal( 'bar (A)' );
				} );

				it( 'not render tooltip text when #tooltip value is false', () => {
					view.tooltip = false;
					view.label = 'bar';
					view.keystroke = 'A';
					view.init();

					expect( view.tooltipView.text ).to.equal( '' );
				} );

				it( 'reacts to changes in #label and #keystroke', () => {
					view.tooltip = true;
					view.label = 'foo';
					view.keystroke = 'B';
					view.init();

					expect( view.tooltipView.text ).to.equal( 'foo (B)' );

					view.label = 'baz';
					view.keystroke = false;

					expect( view.tooltipView.text ).to.equal( 'baz' );
				} );
			} );

			describe( 'defined as a String', () => {
				it( 'renders as a plain text', () => {
					view.tooltip = 'bar';
					view.label = 'foo';
					view.keystroke = 'A';
					view.init();

					expect( view.tooltipView.text ).to.equal( 'bar' );
				} );

				it( 'reacts to changes of #tooltip', () => {
					view.tooltip = 'bar';
					view.init();

					expect( view.tooltipView.text ).to.equal( 'bar' );

					view.tooltip = 'foo';
					expect( view.tooltipView.text ).to.equal( 'foo' );
				} );
			} );

			describe( 'defined as a Function', () => {
				it( 'generates a tooltip text when passed #label and #keystroke', () => {
					view.tooltip = ( l, k ) => `${ l } - ${ k }`;
					view.label = 'foo';
					view.keystroke = 'A';
					view.init();

					expect( view.tooltipView.text ).to.equal( 'foo - A' );
				} );

				it( 'reacts to changes of #label and #keystroke', () => {
					view.tooltip = ( l, k ) => `${ l } - ${ k }`;
					view.label = 'foo';
					view.keystroke = 'A';
					view.init();

					expect( view.tooltipView.text ).to.equal( 'foo - A' );

					view.label = 'bar';
					view.keystroke = 'B';

					expect( view.tooltipView.text ).to.equal( 'bar - B' );
				} );
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

		describe( 'mousedown event', () => {
			it( 'should be prevented', () => {
				const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

				expect( ret ).to.false;
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

	describe( 'icon', () => {
		it( 'is not initially set', () => {
			expect( view.element.childNodes ).to.have.length( 2 );
			expect( view.iconView ).to.be.undefined;
		} );

		it( 'is set when view#icon is defined', () => {
			view = new ButtonView( locale );
			view.icon = 'foo';

			view.init();
			expect( view.element.childNodes ).to.have.length( 3 );
			expect( view.element.childNodes[ 0 ] ).to.equal( view.iconView.element );

			expect( view.iconView ).to.instanceOf( IconView );
			expect( view.iconView.content ).to.equal( 'foo' );

			view.icon = 'bar';
			expect( view.iconView.content ).to.equal( 'bar' );
		} );

		it( 'is destroyed with the view', () => {
			view = new ButtonView( locale );
			view.icon = 'foo';

			view.init();

			const spy = sinon.spy( view.iconView, 'destroy' );

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
