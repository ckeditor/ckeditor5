/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HorizontalRule from '../src/horizontalrule';
import HorizontalRuleEditing from '../src/horizontalruleediting';
import HorizontalRuleUI from '../src/horizontalruleui';

describe( 'HorizontalRule', () => {
	it( 'should require HorizontalRuleEditing and HorizontalRuleUI', () => {
		expect( HorizontalRule.requires ).to.deep.equal( [ HorizontalRuleEditing, HorizontalRuleUI ] );
	} );

	it( 'should be named', () => {
		expect( HorizontalRule.pluginName ).to.equal( 'HorizontalRule' );
	} );
} );
