/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView, createLabeledInputText, IconView } from '@ckeditor/ckeditor5-ui';
import SearchTextQueryView from '../../../src/search/text/searchtextqueryview.js';
import { IconCancel, IconLoupe } from '@ckeditor/ckeditor5-icons';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'SearchTextQueryView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();

		view = new SearchTextQueryView( locale, {
			creator: createLabeledInputText,
			label: 'Test'
		} );

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should have a label', () => {
			expect( view.label ).to.equal( 'Test' );
		} );

		describe( 'reset value button', () => {
			it( 'should be created by default', () => {
				const resetButtonView = view.fieldWrapperChildren.last;

				expect( resetButtonView ).to.equal( view.resetButtonView );
				expect( resetButtonView ).to.be.instanceOf( ButtonView );
				expect( resetButtonView.isVisible ).to.be.false;
				expect( resetButtonView.tooltip ).to.be.true;
				expect( resetButtonView.class ).to.equal( 'ck-search__reset' );
				expect( resetButtonView.label ).to.equal( 'Clear' );
				expect( resetButtonView.icon ).to.equal( IconCancel );
			} );

			it( 'should reset the search field value upon #execute', () => {
				const resetSpy = testUtils.sinon.spy( view, 'reset' );

				view.resetButtonView.fire( 'execute' );

				sinon.assert.calledOnce( resetSpy );
			} );

			it( 'should focus the field view upon #execute', () => {
				const focusSpy = testUtils.sinon.spy( view, 'focus' );

				view.resetButtonView.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should get hidden upon #execute', () => {
				view.resetButtonView.isVisible = true;

				view.resetButtonView.fire( 'execute' );

				expect( view.resetButtonView.isVisible ).to.be.false;
			} );

			it( 'should fire the #reset event upon #execute', () => {
				const spy = sinon.spy();

				view.on( 'reset', spy );

				view.resetButtonView.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should be possible to hide using view\'s configuration', () => {
				const view = new SearchTextQueryView( locale, {
					creator: createLabeledInputText,
					label: 'Test',
					showResetButton: false
				} );

				expect( view.resetButtonView ).to.be.undefined;
				expect( view.fieldWrapperChildren.last ).to.equal( view.labelView );

				view.destroy();
			} );
		} );

		describe( 'icon', () => {
			it( 'should be added to the view by default', () => {
				const iconView = view.fieldWrapperChildren.first;

				expect( view.iconView ).to.equal( iconView );
				expect( iconView ).to.equal( view.iconView );
				expect( iconView ).to.be.instanceOf( IconView );
				expect( iconView.content ).to.equal( IconLoupe );
			} );

			it( 'should be possible to hide using view\'s configuration', () => {
				const view = new SearchTextQueryView( locale, {
					creator: createLabeledInputText,
					label: 'Test',
					showIcon: false
				} );

				expect( view.iconView ).to.be.undefined;
				expect( view.fieldWrapperChildren.first ).to.equal( view.fieldView );

				view.destroy();
			} );
		} );

		describe( '#input event', () => {
			it( 'should toggle visibility of the clear value button', () => {
				view.fieldView.value = 'foo';
				view.fieldView.fire( 'input' );

				expect( view.resetButtonView.isVisible ).to.be.true;

				view.fieldView.value = '';
				view.fieldView.fire( 'input' );

				expect( view.resetButtonView.isVisible ).to.be.false;
			} );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should not fire the #reset event', () => {
			const spy = sinon.spy();

			view.on( 'reset', spy );

			view.reset();

			sinon.assert.notCalled( spy );
		} );

		it( 'should clear the field view value in DOM', () => {
			view.fieldView.element.value = 'foo';

			view.reset();

			expect( view.fieldView.element.value ).to.equal( '' );
		} );

		it( 'should clear the field view value in InputView', () => {
			view.fieldView.value = 'foo';

			view.reset();

			expect( view.fieldView.value ).to.equal( '' );
		} );
	} );
} );
