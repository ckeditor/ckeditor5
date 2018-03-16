---
category: examples-builds
order: 30
---

# Document editor

The editor in this example is a feature–rich build focused on rich text editing experience similar to the native word processors. It works best for creating documents which are usually later printed or exported to PDF files.

See the {@link framework/guides/document-editor tutorial} to learn how to create this kind of an editor (and similar) with a custom UI layout on top of {@link module:editor-decoupled/decouplededitor~DecoupledEditor}.

{@snippet examples/document-editor}

<style>
	/* https://github.com/ckeditor/ckeditor5/issues/913 */
	@media only screen and (min-width: 1600px) {
		.main .main__content-inner {
			width: 900px;
		}
	}

	/* https://github.com/ckeditor/ckeditor5/issues/913 */
	@media only screen and (min-width: 1360px) {
		.main .main__content {
			padding-right: 0;
		}

		.main .main__content-inner {
			max-width: 900px;
		}

		.document-editor__editable .ck-editor__editable {
			width: 21cm;
		}
	}
</style>
