import { Plugin } from 'ckeditor5/src/core';
import EmbeddedIFrameEditing from './embeddediframeediting';
import EmbeddedIFrameToolbar from './embeddediframetoolbar';
import ResizeEmbeddedIFrameUI from './resizeembeddediframeui';
import './styles.css';

export default class EmbeddedIFrame extends Plugin {
	static get requires() {
		return [ EmbeddedIFrameEditing, EmbeddedIFrameToolbar, ResizeEmbeddedIFrameUI ];
	}
}
