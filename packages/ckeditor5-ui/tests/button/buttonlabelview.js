/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ButtonLabelView } from '../../src/index.js';

describe( 'ButtonLabelView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new ButtonLabelView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets default properties', () => {
			expect( view.style ).to.be.undefined;
			expect( view.text ).to.be.undefined;
			expect( view.id ).to.be.undefined;
		} );

		it( 'creates an element with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-button__label' ) ).to.true;
		} );

		it( 'creates a DOM binding for style', () => {
			view.style = 'color: red';

			expect( view.element.style.color ).to.equal( 'red' );
		} );

		it( 'creates a DOM binding for #text', () => {
			view.text = 'foobar';

			expect( view.element.innerHTML ).to.equal( 'foobar' );
		} );

		it( 'creates a DOM binding for #id', () => {
			view.id = 'foobar';

			expect( view.id ).to.equal( 'foobar' );
		} );
	} );
} );
