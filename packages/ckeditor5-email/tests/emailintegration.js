/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { EmailIntegration } from '../src/emailintegration.js';

import { HighlightEmailIntegration } from '../src/integrations/highlight.js';
import { ImageEmailIntegration } from '../src/integrations/image.js';
import { MathTypeEmailIntegration } from '../src/integrations/mathtype.js';
import { ExportInlineStylesIntegration } from '../src/integrations/exportinlinestyles.js';
import { ListEmailIntegration } from '../src/integrations/list.js';
import { TableEmailIntegration } from '../src/integrations/table.js';
import { EmptyBlockIntegration } from '../src/integrations/emptyblock.js';
import { FontIntegration } from '../src/integrations/font.js';
import { SourceEditingIntegration } from '../src/integrations/sourceediting.js';

describe( 'EmailIntegration', () => {
	it( 'should be named', () => {
		expect( EmailIntegration.pluginName ).to.equal( 'EmailIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmailIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmailIntegration.isPremiumPlugin ).to.be.false;
	} );

	it( 'should have proper `requires`', () => {
		expect( EmailIntegration.requires ).to.deep.equal( [
			HighlightEmailIntegration,
			ImageEmailIntegration,
			MathTypeEmailIntegration,
			ExportInlineStylesIntegration,
			ListEmailIntegration,
			TableEmailIntegration,
			EmptyBlockIntegration,
			FontIntegration,
			SourceEditingIntegration
		] );
	} );
} );
