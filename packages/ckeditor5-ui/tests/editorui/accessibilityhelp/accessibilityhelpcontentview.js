/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale, env } from '@ckeditor/ckeditor5-utils';
import AccessibilityHelpContentView from '../../../src/editorui/accessibilityhelp/accessibilityhelpcontentview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'AccessibilityHelpContentView', () => {
	const defaultKeystrokes = new Map( [
		[
			'testCat',
			{
				id: 'testCat',
				label: 'Test cat',
				groups: new Map( [
					[
						'testGroup',
						{
							id: 'testGroup',
							label: 'Test group',
							keystrokes: []
						}
					]
				] )
			}
		]
	] );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		let view;

		beforeEach( () => {
			view = getView( defaultKeystrokes );
			view.render();
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should have label', () => {
			expect( view.element.lastChild.classList.contains( 'ck-label' ) ).to.be.true;
			expect( view.element.lastChild.id ).to.equal( view.element.getAttribute( 'aria-labelledby' ) );
		} );

		it( 'should have CSS class', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-accessibility-help-dialog__content' ) ).to.be.true;
		} );

		it( 'should have the role attribute', () => {
			expect( view.element.getAttribute( 'role' ) ).to.equal( 'document' );
		} );

		it( 'should have tabindex', () => {
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should render an intro paragraph', () => {
			expect( view.element.firstChild.outerHTML ).to.match( /^<p>Below, .+<\/p>$/ );
		} );
	} );

	describe( 'lists of keystrokes', () => {
		let view;

		beforeEach( () => {
			testUtils.sinon.stub( env, 'isMac' ).value( false );
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should render for multiple categories, groups, and keystrokes', () => {
			view = getView( new Map( [
				[
					'catA',
					{
						id: 'catA',
						label: 'Cat A',
						groups: new Map( [
							[
								'groupAA',
								{
									id: 'groupAA',
									label: 'Group AA',
									keystrokes: [
										{
											keystroke: 'Ctrl+A',
											label: 'Foo'
										},
										{
											keystroke: 'Ctrl+B',
											label: 'Bar'
										}
									]
								}
							],
							[
								'groupAB',
								{
									id: 'groupAB',
									label: 'Group AB',
									keystrokes: [
										{
											keystroke: 'Ctrl+C',
											label: 'Baz'
										}
									]
								}
							]
						] )
					}
				],
				[
					'catB',
					{
						id: 'catB',
						label: 'Cat B',
						description: 'Cat B description',
						groups: new Map( [
							[
								'groupBA',
								{
									id: 'groupBA',
									label: 'Group BA',
									keystrokes: [
										{
											keystroke: 'Ctrl+D',
											label: 'Qux'
										}
									]
								}
							]
						] )
					}
				]
			] ) );

			view.render();

			expect( view.element.childNodes[ 1 ].outerHTML ).to.deep.equal(
				'<section>' +
					'<h3>Cat A</h3>' +
					'<h4>Group AA</h4>' +
					'<dl>' +
						'<dt>Bar</dt><dd><kbd>Ctrl</kbd>+<kbd>B</kbd></dd>' +
						'<dt>Foo</dt><dd><kbd>Ctrl</kbd>+<kbd>A</kbd></dd>' +
					'</dl>' +
					'<h4>Group AB</h4>' +
					'<dl>' +
						'<dt>Baz</dt><dd><kbd>Ctrl</kbd>+<kbd>C</kbd></dd>' +
					'</dl>' +
				'</section>'
			);

			expect( view.element.childNodes[ 2 ].outerHTML ).to.deep.equal(
				'<section>' +
					'<h3>Cat B</h3>' +
					'<p>Cat B description</p>' +
					'<h4>Group BA</h4>' +
					'<dl>' +
						'<dt>Qux</dt><dd><kbd>Ctrl</kbd>+<kbd>D</kbd></dd>' +
					'</dl>' +
				'</section>'
			);
		} );

		it( 'should sort keystrokes alphabetically', () => {
			view = getView( new Map( [
				[
					'catA',
					{
						id: 'catA',
						label: 'Cat A',
						groups: new Map( [
							[
								'groupAA',
								{
									id: 'groupAA',
									label: 'Group AA',
									keystrokes: [
										{
											keystroke: 'Ctrl+C',
											label: 'C'
										},
										{
											keystroke: 'Ctrl+A',
											label: 'A'
										},
										{
											keystroke: 'Ctrl+B',
											label: 'B'
										}
									]
								}
							]
						] )
					}
				]

			] ) );

			view.render();

			expect( view.element.childNodes[ 1 ].outerHTML ).to.deep.equal(
				'<section>' +
					'<h3>Cat A</h3>' +
					'<h4>Group AA</h4>' +
					'<dl>' +
						'<dt>A</dt><dd><kbd>Ctrl</kbd>+<kbd>A</kbd></dd>' +
						'<dt>B</dt><dd><kbd>Ctrl</kbd>+<kbd>B</kbd></dd>' +
						'<dt>C</dt><dd><kbd>Ctrl</kbd>+<kbd>C</kbd></dd>' +
					'</dl>' +
				'</section>'
			);
		} );

		it( 'should use env-specific keystroke rendering', () => {
			testUtils.sinon.stub( env, 'isMac' ).value( true );

			view = getView( new Map( [
				[
					'catA',
					{
						id: 'catA',
						label: 'Cat A',
						groups: new Map( [
							[
								'groupAA',
								{
									id: 'groupAA',
									label: 'Group AA',
									keystrokes: [
										{
											keystroke: 'Ctrl+C',
											label: 'C'
										},
										{
											keystroke: 'Alt+A',
											label: 'A'
										},
										{
											keystroke: 'Shift+B',
											label: 'B'
										}
									]
								}
							]
						] )
					}
				]

			] ) );

			view.render();

			expect( view.element.childNodes[ 1 ].outerHTML ).to.deep.equal(
				'<section>' +
					'<h3>Cat A</h3>' +
					'<h4>Group AA</h4>' +
					'<dl>' +
						'<dt>A</dt><dd><kbd>⌥A</kbd></dd>' +
						'<dt>B</dt><dd><kbd>⇧B</kbd></dd>' +
						'<dt>C</dt><dd><kbd>⌘C</kbd></dd>' +
					'</dl>' +
				'</section>'
			);
		} );

		it( 'should support the "mayRequireFn" flag in keystroke definition', () => {
			testUtils.sinon.stub( env, 'isMac' ).value( true );

			view = getView( new Map( [
				[
					'catA',
					{
						id: 'catA',
						label: 'Cat A',
						groups: new Map( [
							[
								'groupAA',
								{
									id: 'groupAA',
									label: 'Group AA',
									keystrokes: [
										{
											keystroke: 'Alt+A',
											label: 'A',
											mayRequireFn: true
										}
									]
								}
							]
						] )
					}
				]

			] ) );

			view.render();

			expect( view.element.childNodes[ 1 ].outerHTML ).to.deep.equal(
				'<section>' +
					'<h3>Cat A</h3>' +
					'<h4>Group AA</h4>' +
					'<dl>' +
						'<dt>A</dt><dd><kbd>⌥A</kbd> (may require <kbd>Fn</kbd>)</dd>' +
					'</dl>' +
				'</section>'
			);
		} );

		it( 'should support keystroke sequences', () => {
			view = getView( new Map( [
				[
					'catA',
					{
						id: 'catA',
						label: 'Cat A',
						groups: new Map( [
							[
								'groupAA',
								{
									id: 'groupAA',
									label: 'Group AA',
									keystrokes: [
										{
											keystroke: [ 'Alt+A', 'Alt+B' ],
											label: 'A'
										}
									]
								}
							]
						] )
					}
				]

			] ) );

			view.render();

			expect( view.element.childNodes[ 1 ].outerHTML ).to.deep.equal(
				'<section>' +
					'<h3>Cat A</h3>' +
					'<h4>Group AA</h4>' +
					'<dl>' +
						'<dt>A</dt>' +
						'<dd>' +
							'<kbd>Alt</kbd>+<kbd>A</kbd>' +
							'<kbd>Alt</kbd>+<kbd>B</kbd>' +
						'</dd>' +
					'</dl>' +
				'</section>'
			);
		} );

		it( 'should support keystroke alternatives', () => {
			view = getView( new Map( [
				[
					'catA',
					{
						id: 'catA',
						label: 'Cat A',
						groups: new Map( [
							[
								'groupAA',
								{
									id: 'groupAA',
									label: 'Group AA',
									keystrokes: [
										{
											keystroke: [ [ 'Alt+A', 'Alt+B' ], [ 'Alt+C', 'Alt+D' ] ],
											label: 'A'
										}
									]
								}
							]
						] )
					}
				]

			] ) );

			view.render();

			expect( view.element.childNodes[ 1 ].outerHTML ).to.deep.equal(
				'<section>' +
					'<h3>Cat A</h3>' +
					'<h4>Group AA</h4>' +
					'<dl>' +
						'<dt>A</dt>' +
						'<dd>' +
							'<kbd>Alt</kbd>+<kbd>A</kbd><kbd>Alt</kbd>+<kbd>B</kbd>, ' +
							'<kbd>Alt</kbd>+<kbd>C</kbd><kbd>Alt</kbd>+<kbd>D</kbd>' +
						'</dd>' +
					'</dl>' +
				'</section>'
			);
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the view', () => {
			const view = getView( defaultKeystrokes );
			view.render();
			const focusSpy = sinon.spy( view.element, 'focus' );

			document.body.appendChild( view.element );

			view.focus();

			sinon.assert.calledOnce( focusSpy );

			view.element.remove();
		} );
	} );

	function getView( keystrokes ) {
		return new AccessibilityHelpContentView( new Locale(), keystrokes );
	}
} );
