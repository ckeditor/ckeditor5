/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import { foo } from 'CKEditor/foo';
import { bar } from 'CKEditor/bar';
import { uid } from 'CKEditor/utils';

foo();
bar();
console.log( uid() );
