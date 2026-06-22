/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { chai } from 'vitest';
import equalMarkupAssertion from '@ckeditor/ckeditor5-dev-tests/lib/utils/automated-tests/assertions/equal-markup.js';
import attributeAssertion from '@ckeditor/ckeditor5-dev-tests/lib/utils/automated-tests/assertions/attribute.js';

globalThis.CKEDITOR_GLOBAL_LICENSE_KEY = 'GPL';

equalMarkupAssertion( chai );
attributeAssertion( chai );
