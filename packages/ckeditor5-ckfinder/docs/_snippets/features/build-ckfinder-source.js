/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

ClassicEditor.builtinPlugins.push(
	CKFinder,
	LinkImageEditing,
	PictureEditing,
	ImageResize,
	ImageInsert,
	AutoImage,
	LinkImage,
	Alignment );

window.ClassicEditor = ClassicEditor;
