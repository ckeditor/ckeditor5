/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { expect } from 'vitest';
import { toEqualMarkup } from '@ckeditor/ckeditor5-dev-tests';

globalThis.CKEDITOR_GLOBAL_LICENSE_KEY = 'GPL';

expect.extend( { toEqualMarkup } );
