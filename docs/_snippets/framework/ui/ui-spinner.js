/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { SpinnerView } from 'ckeditor5';

const spinner = new SpinnerView();

spinner.set( { isVisible: true } );
spinner.render();

document.querySelector( '.ui-spinner' ).append( spinner.element );
