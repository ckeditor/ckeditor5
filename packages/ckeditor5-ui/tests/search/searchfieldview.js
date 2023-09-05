/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView, createLabeledInputText, IconView } from '@ckeditor/ckeditor5-ui';
import SearchFieldView from '../../src/search/searchfieldview';
import { icons } from '@ckeditor/ckeditor5-core';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'SearchFieldView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();

		view = new SearchFieldView( locale, createLabeledInputText, 'Test' );
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

		describe( 'clear value button', () => {
			it( 'should be created', () => {
				const clearButtonView = view.fieldWrapperChildren.last;

				expect( clearButtonView ).to.equal( view.clearButtonView );
				expect( clearButtonView ).to.be.instanceOf( ButtonView );
				expect( clearButtonView.isVisible ).to.be.false;
				expect( clearButtonView.tooltip ).to.be.true;
				expect( clearButtonView.class ).to.equal( 'ck-search__clear-search' );
				expect( clearButtonView.label ).to.equal( 'Clear' );
				expect( clearButtonView.icon ).to.equal( icons.cancel );
			} );

			it( 'should reset the search field value upon #execute', () => {
				const resetSpy = testUtils.sinon.spy( view, 'reset' );

				view.clearButtonView.fire( 'execute' );

				sinon.assert.calledOnce( resetSpy );
			} );

			it( 'should focus the field view upon #execute', () => {
				const focusSpy = testUtils.sinon.spy( view, 'focus' );

				view.clearButtonView.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should get hidden upon #execute', () => {
				view.clearButtonView.isVisible = true;

				view.clearButtonView.fire( 'execute' );

				expect( view.clearButtonView.isVisible ).to.be.false;
			} );

			it( 'should fire the #reset event upon #execute', () => {
				const spy = sinon.spy();

				view.on( 'reset', spy );

				view.clearButtonView.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'should have the loupe icon', () => {
			const loupeIconView = view.fieldWrapperChildren.first;

			expect( loupeIconView ).to.equal( view.loupeIconView );
			expect( loupeIconView ).to.be.instanceOf( IconView );
			expect( loupeIconView.content ).to.equal( icons.loupe );
		} );

		describe( '#input event', () => {
			it( 'should toggle visibility of the clear value button', () => {
				view.fieldView.value = 'foo';
				view.fieldView.fire( 'input' );

				expect( view.clearButtonView.isVisible ).to.be.true;

				view.fieldView.value = '';
				view.fieldView.fire( 'input' );

				expect( view.clearButtonView.isVisible ).to.be.false;
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
