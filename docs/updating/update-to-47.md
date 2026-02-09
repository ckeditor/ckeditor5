---
category: update-guides
meta-title: Update to version 47.x | CKEditor 5 Documentation
menu-title: Update to v47.x
order: 77
modified_at: 2026-02-06
---

# Update to CKEditor&nbsp;5 v47.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	You may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For optimal results, ensure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v47.5.0

Released on 11 February, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.5.0))

### AI Translate

The {@link features/ckeditor-ai-translate AI Translate feature} of CKEditor AI allows users to translate entire documents on the go. It provides a user interface similar to AI Review, but with translation-specific actions to streamline the process. The translation view displays the final translated document, with original snippets shown on the side for review and comparison.

### Visual changes to the AI Chat feed

The DOM structure of the {@link features/ckeditor-ai-chat CKEditor&nbsp;AI Chat} suggestions in conversation has changed, which may affect integrations that customized the UI and rely on specific CSS selectors.

Please make sure to update your integrations to use the new DOM structure.

Notable changes:
* "Apply all" and "Suggest all" buttons are now separate buttons instead of a dropdown.
* The toolbar with bulk "Apply" and "Suggest" ("Apply all" and "Suggest all") buttons belongs to the `.ck-ai-suggestion__body` element (previously in `.ck-ai-chat__feed__item`).
* The `.ck-ai-suggestion__body__content-part__content` has been replaced by `.ck-content.ck-ai-suggestion-streamable-content`.

**Old DOM structure**

```
div.ck-ai-chat__feed__item.ck-ai-chat__feed__ai-suggestion
├── div.ck-ai-suggestion__container.ck-rounded-corners
│   ├── div.ck-ai-suggestion__header
│   │   ├── span ("Change N" label)
│   │   └── button.ck-button.ck-ai-suggestion__header__show-changes-toggle
│   └── div.ck-ai-suggestion__body
│       └── div.ck-ai-suggestion__body__content-parts
│           ├── div.ck-ai-suggestion__body__content-part.ck-ai-suggestion__body__content-part_pending
│           │   ├── div.ck-ai-suggestion__body__content-part__title
│           │   │   ├── span.ck-ai-suggestion__body__content-part__title__label
│           │   │   └── div.ck-toolbar
│           │   │       └── div.ck-toolbar__items (Toolbar with "Preview", "Insert as suggestion", "Reject" buttons)
│           │   │           ├── button.ck-button
│           │   │           └── ...
│           │   └── div.ck-content.ck-ai-suggestion__body__content-part__content
│           │       └── (Content of the suggestion part)
│           └── ... Other changes suggested by the AI ...
└── div.ck-ai-chat__feed__ai-suggestion__actions
    └── div.ck-splitbutton.ck-ai-chat__feed__ai-suggestion__actions (Dropdown with "Apply all", bulk "Suggest", and "Preview" buttons)
        ├── button.ck-button.ck-splitbutton__action
        └── button.ck-button.ck-splitbutton__arrow
```

**New DOM structure**

```
div.ck-ai-chat__feed__item.ck-ai-chat__feed__ai-suggestion
└── div.ck-ai-suggestion__container.ck-rounded-corners
    ├── div.ck-ai-suggestion__header
    │   ├── span ("Suggestion N" label)
    │   └── button.ck-button.ck-ai-suggestion__header__show-changes-toggle
    └── div.ck-ai-suggestion__body
        ├── div.ck-ai-suggestion__body__content-parts
        │   ├── div.ck-ai-suggestion__body__content-part.ck-ai-suggestion__body__content-part_pending
        │   │   ├── div.ck-ai-suggestion__body__content-part__title
        │   │   │   ├── span.ck-ai-suggestion__body__content-part__title__label
        │   │   │   └── div.ck-toolbar.ck-ai-suggestion-content-part-toolbar
        │   │   │       └── div.ck-toolbar__items (Toolbar with "Apply change", "Add as suggestion", and "Reject change" buttons)
        │   │   │           ├── button.ck-button
        │   │   │           └── ...
        │   │   └── div.ck-content.ck-ai-suggestion-streamable-content
        │   │       └── (Content of the suggestion part)
        │   └── ... Other changes suggested by the AI ...
        └── div.ck-ai-chat__feed__ai-suggestion__actions (Separate buttons for bulk "Apply" and "Suggest")
            ├── button.ck-button.ck-ai-button-primary
            └── button.ck-button.ck-ai-button-secondary
```

### Visual changes to the AI Chat suggestion preview dialog window

The DOM structure of the {@link features/ckeditor-ai-chat CKEditor&nbsp;AI Chat} suggestion {@link features/ckeditor-ai-chat#previewing-changes preview dialog window} has changed, which may affect integrations that customized the UI and/or rely on specific CSS selectors.

Please make sure to update your integrations to use the new DOM structure.

**Old DOM structure**

```
div.ck-dialog.ai-balloon.ai-balloon-rotator
├── div.ck-form__header
│   ├── button.ck-button.ck-off (Previous suggestion button)
│   ├── h2.ck-form__header__label (Suggestion title)
│   ├── button.ck-button.ck-off (Next suggestion button)
│   └── button.ck-button.ck-off (Close button)
└── div.ck-dialog__content
    └── div.ai-balloon-content
        ├── div.ck-ai-suggestion__container.ck-rounded-corners
        │   └── div.ck-ai-suggestion__body
        │       ├── div.ck-ai-suggestion__body__content-parts
        │       │   └── div.ck-ai-suggestion__body__content-part.ck-ai-suggestion__body__content-part_pending.ck-ai-suggestion__body__content-part_active
        │       │       └── div.ck-content.ck-ai-suggestion__body__content-part__content
        │       │           └── (Content of the suggestion)
        │       └── div.ck-toolbar.ck-ai-mini-toolbar
        │           └── div.ck-toolbar__items
        │               └── button.ck-button (Show changes button)
        ├── div.ck-ai-balloon__disclaimer
        │   └── p.ck-ai-balloon__disclaimer-content
        └── div.ck-toolbar.ck-ai-balloon__toolbar
            └── div.ck-toolbar__items
                ├── button.ck-button.ck-ai-button-primary ("Apply" button)
                └── button.ck-button.ck-ai-button-secondary ("Suggest" button)
```

**New DOM structure**

```
div.ck-dialog.ck-ai-balloon.ck-ai-chat-balloon
├── div.ck-form__header
│   ├── button.ck-button.ck-off (Previous suggestion button)
│   ├── button.ck-button.ck-off (Next suggestion button)
│   ├── h2.ck-form__header__label (Suggestion title)
│   └── button.ck-button.ck-off (Close button)
└── div.ck-dialog__content
    └── div.ck-ai-chat-balloon-main.ck-ai-chat-balloon-main_state_pending
        ├── div.ck-content.ck-ai-suggestion-streamable-content
        │   └── (Content of the suggestion)
        └── div.ck-ai-chat-balloon__toolbar-container
            ├── div.ck-toolbar.ck-ai-suggestion-content-part-toolbar
            │   └── div.ck-toolbar__items
            │       ├── button.ck-button ("Apply change" button)
            │       ├── button.ck-button ("Add as suggestion" button)
            │       └── button.ck-button ("Reject change" button)
            ├── div.ck-ai-suggestion__content-part-state.ck-ai-suggestion__content-part-state_pending.ck-hidden
            │   └── span.ck-ai-suggestion__content-part-state__label
            └── div.ck-toolbar.ck-ai-mini-toolbar
                └── div.ck-toolbar__items
                    └── button.ck-button ("Show changes" button)
```

### Multiple Changes revamp and other AI improvements

We improved how multiple changes proposed by the {@link features/ckeditor-ai-chat AI Chat} feature are presented. Suggested changes now appear as cards that can be previewed in the content and applied consistently in both single-change and multi-change scenarios. This release also includes several under-the-hood improvements.

### Export to PDF v2

The {@link features/export-pdf export to PDF} feature now supports version 2 of the HTML to PDF converter API, bringing several {@link features/export-pdf#new-features-in-v2 powerful enhancements} to document generation.

Advanced header and footer configurations allow for different content on first, odd, and even pages, with support for images. Page sizes can now be set using predefined formats or custom width and height values. The new converter API also enables editing of PDF metadata fields such as title, subject, and author.

Security capabilities have been expanded with owner password protection for controlling permissions and digital signature support using PKCS#12 certificates for authenticity verification. Additional improvements include compression control for specific use cases and more precise rendering options.

### Incoming old installation methods sunset reminder

Please note that the old installation methods will no longer be available with CKEditor&nbsp;5 v48.0.0, which is planned for release at the beginning of Q2 2026. For more timeline details, refer to the [dedicated GitHub issue](https://github.com/ckeditor/ckeditor5/issues/17779).

In CKEditor&nbsp;5 v42.0.0 in June 2024, we [introduced new installation methods](https://ckeditor.com/blog/ckeditor-5-new-era-installation-simplicity/) designed to improve and simplify the developer workflow. Soon, they will be the only available paths to install and use CKEditor&nbsp;5.

If your project still relies on old installation methods, now is a good time to plan your next steps. We recommend choosing between these two options:

1. {@link updating/nim-migration/migration-to-new-installation-methods Migrate to the new installation methods}, which are the recommended path for most users. The new installation methods provide a cleaner setup, easier upgrades, and better alignment with future CKEditor&nbsp;5 releases.
2. Consider [CKEditor&nbsp;5 Long-Term Support (LTS)](https://ckeditor.com/ckeditor-5-lts/). If migrating in the near term is not feasible, you can extend support for legacy installation methods.

Please refer to the {@link updating/update-to-42 update guide} to learn more about these changes.

## Update to CKEditor&nbsp;5 v47.4.0

Released on 14 January, 2026. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.4.0))

This is a minor update focused on improving content editing workflows and data compatibility. We are introducing better visualization for table borders, enhanced image alignment handling, and several improvements to AI and email features.

### Experimental table cell type support

We are introducing an experimental {@link module:table/tablecellproperties/commands/tablecelltypecommand~TableCellType `tableCellTypeSupport`} flag that enables changing table cell types between data and header cells (`th`). This feature provides more flexibility when working with complex table structures. To enable this functionality, you need to set `experimentalFlags.tableCellTypeSupport` to `true`. You can then use `TableCellPropertiesEditing` and `TableCellPropertiesUIExperimental` to manage the feature.

```js-diff
 ClassicEditor
 	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Paragraph,
			Table,
-			TableProperties,
-			TableCellProperties
+			TablePropertiesEditing,
+			TablePropertiesUIExperimental,
+			TableCellPropertiesEditing,
+			TableCellPropertiesUIExperimental
		],
		experimentalFlags: {
			// ... other experimental flags ...
+			tableCellTypeSupport: true
		}
 	} )
 	.then( /* ... */ )
 	.catch( /* ... */ );
```

The fully functional editor UI for cell type support will be available with the next major CKEditor&nbsp;5 version.

### Hidden table borders visualization

We are introducing a new {@link features/tables-styling#helper-lines-when-border-style-is-set-to-none `config.table.showHiddenBorders`} configuration option (enabled by default) that helps editors work with tables that have hidden borders. When the editor detects inline `border:none` or `border-style:none` declarations on table and cell elements, it renders dashed helper borders in the editing view. This makes it easier to see the table structure while editing without affecting the output data. This visualization can be disabled for strict WYSIWYG scenarios where you want the editing view to match the output exactly.

### Email compatibility improvements

We improved the [email styles transformation](https://ckeditor.com/docs/ckeditor5/latest/features/email-editing/email.html#email-specific-style-transformations) with better appearance of resized inline images in classic Outlook clients. Additionally, the new optional `useFigureToTableFallback` flag in the email styles transformers can replace `figure` (block images) with tables to improve alignment and width handling in older email clients with limited CSS support.

### Updated the Emoji plugin dataset

The Emoji plugin can now utilize the Emoji v17.0 dataset, available on the CKEditor CDN. This update does not change the default emoji version used by CKEditor&nbsp;5.

To use the new dataset, download the [Emoji `json` database from the CKEditor&nbsp;5 CDN](https://cdn.ckeditor.com/ckeditor5/data/emoji/17/en.json). Place the downloaded file in your application’s assets folder, for example `public/emoji/en.json` (The specific location may vary depending on your framework and setup). Update the configuration option `definitionsUrl` to point to the URL of your assets, for example:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		emoji: {
			definitionsUrl: 'https://example.com/emoji-definitions.json'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Other improvements and fixes

* Fixed multiple issues in the AI features, including improved tooltips for web search sources in AI Chat, proper handling of Quick Actions when opening the AI Chat panel, resolved loading state issues in the AI Review sidebar, and others.
* The editor now recognizes CSS `float` style on images (e.g., `style="float: left"` or `style="float: right"`) and automatically maps it to left/right image alignment. This works for both inline and block images, improving compatibility when pasting content from external sources or loading legacy content. If custom image styles are configured, they take precedence over the float style.

### Incoming old installation methods sunset reminder

Please note that the old installation methods will only remain available up to CKEditor&nbsp;5 v48.0.0, which is planned for release at the beginning of Q2 2026. For more timeline details, refer to the [dedicated GitHub issue](https://github.com/ckeditor/ckeditor5/issues/17779).

In CKEditor&nbsp;5 v42.0.0 in June 2024, we [introduced new installation methods](https://ckeditor.com/blog/ckeditor-5-new-era-installation-simplicity/) designed to improve and simplify the developer workflow. Soon, they will be the only available paths to install and use CKEditor&nbsp;5.

If your project still relies on old installation methods, now is a good time to plan your next steps. We recommend choosing between these two options:

1. {@link updating/nim-migration/migration-to-new-installation-methods Migrate to the new installation methods}, which are the recommended path for most users. The new installation methods provide a cleaner setup, easier upgrades, and better alignment with future CKEditor&nbsp;5 releases.
2. Consider [CKEditor&nbsp;5 Long Term Support (LTS)](https://ckeditor.com/ckeditor-5-lts/). If migrating in the near term is not feasible, you can extend support for legacy installation methods.

## Update to CKEditor&nbsp;5 v47.3.0

Released on 3 December, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.3.0))

### CKEditor AI improvements and bug fixes

Finding a specific AI Quick Action in a long list with multiple groups can be difficult. To improve this, we are adding a filter input that lets users search for quick actions directly within the dropdown.

Visibility of the input can be easily configured using the `config.ai.quickActions.isSearchEnabled` configuration option.

This release also brings several minor but significant enhancements and fixes:

* Track Changes markers not related to AI suggestions are now displayed in gray in the AI balloon text preview, consistent with the behavior of AI chat.
* When retrying a specific AI Review, we are now ensuring the latest version of the document is used.
* We also improved error handling across CKEditor AI, making it easier to debug backend-related issues by including more detailed error messages.

### New experimental options

We keep our [LTS version](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html#compatibility-matrix) promise: no breaking changes until the Active LTS moves to Maintenance LTS phase (April 2026). It also means that introducing larger features can be challenging if someone is waiting for specific improvements.

To address this, we are introducing **experimental flags** and **experimental plugins**. These options allow you to preview and test upcoming changes.

* **New table alignment options**

	Enable `config.experimentalFlags.useExtendedTableBlockAlignment` and load the experimental UI plugins `TablePropertiesUIExperimental` and `TableCellPropertiesUIExperimental` for upcoming improvements to table block alignment.

	The `TableProperties` and `TableCellProperties` plugins already include their standard UI counterparts (`TablePropertiesUI` and `TableCellPropertiesUI`). To avoid conflicts, when using experimental UI plugins, you must load the editing plugins (`TablePropertiesEditing`, `TableCellPropertiesEditing`) and the experimental UI plugins separately, instead of using the "glue" plugins.

	New options allow setting left and right table block alignment without text wrapping and resolve issues such as [#3225](https://github.com/ckeditor/ckeditor5/issues/3225). We also improved table properties and cell properties balloon interfaces. This change will be the default in version 48.0.0.

* **Improved table border normalization**

	Setting `config.experimentalFlags.upcastTableBorderZeroAttributes` enables support for the normalization of HTML tables that use `border="0"`. This change will be the default in version 48.0.0.

* **Better deep schema validation**

	After enabling the `config.experimentalFlags.modelInsertContentDeepSchemaVerification` flag, the editor performs deep schema verification during `model.insertContent()` operations. This ensures that the inserted content fully follows the editor’s schema, even in complex or nested structures. This change will be the default in version 48.0.0.

* **Configuration**

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Table,
			TablePropertiesEditing,
			TableCellPropertiesEditing,
			TablePropertiesUIExperimental,
			TableCellPropertiesUIExperimental,
			// Other plugins.
			// ...
		],
		experimentalFlags: {
			useExtendedTableBlockAlignment: true,
			upcastTableBorderZeroAttributes: true,
			modelInsertContentDeepSchemaVerification: true
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Update to CKEditor&nbsp;5 v47.2.0

Released on 5 November, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.2.0))

This release introduces expanded CKEditor AI feature, new Footnotes features and several improvements.

### CKEditor AI

We are introducing {@link features/ckeditor-ai-overview CKEditor AI}, a powerful writing assistant that brings AI-powered content creation directly into CKEditor&nbsp;5. It helps users create, review, and refine content without switching between tools, making the editing experience faster and more productive.

CKEditor AI includes three core capabilities:

* **Chat**: a conversational AI assistant for multi-turn interactions that supports context setting and model selection. All conversations are tracked in a persistent chat history, and suggestions are reviewable before being applied.
* **Quick actions**: one-click transformations for selected text, including rewriting, simplifying, expanding, summarizing, or adjusting tone. Changes appear inline with preview capabilities.
* **Review**: automatic quality assurance that checks grammar, tone, clarity, and style across the document. Suggested changes are presented in a visual review interface where users can accept or reject individual edits or apply all approved suggestions in bulk.

Power users can select their preferred model during sessions (GPT-5, Claude 3.5, Gemini 2.5, and more), while integrators maintain control over access rules and usage tiers.

Built as a plugin for CKEditor&nbsp;5, it integrates quickly into existing applications with minimal configuration, and all AI interactions are fully observable via audit logs and optional APIs.

CKEditor AI is available as a premium add-on to all paid CKEditor&nbsp;5 plans with a transparent subscription-plus-usage pricing model. A 14-day trial is available with access to all premium features.

### Footnotes (⭐)

A brand-new {@link features/footnotes Footnotes} feature is here! It lets users insert and manage footnotes directly in their content, keeping references organized and readable. Footnotes stay linked to their source text and update automatically when edited, ideal for academic, legal, or technical writing. You can also **customize the numbering**, including the starting number and numbering style, to match your document’s formatting needs.

### Restricted editing for blocks (⭐)

{@link features/restricted-editing Restricted editing} now supports **block-level restrictions**, not just inline ones. This makes it easier to protect the entire content while still allowing controlled edits where required. A common use case is unlocking for editing template sections like paragraphs, tables, or structured document parts, and protecting the rest of the content.
to do

#### Legacy toolbar button for restricted editing

The version introduces new toolbar items for the {@link features/restricted-editing restricted editing} feature. The new available toolbar ites are `restrictedEditingException:dropdown` (for both inline and block types of editing fields), `restrictedEditingException:inline`, and `restrictedEditingException:block`.

To retain full backwards compatibility, we have provided an alias toolbar item: `restrictedEditingException`. It is the old toolbar button call and it defaults to inline restricted editing field button. There is no need to change your configuration if you only want to use inline fields type. If you want to use both the block and inline type fields, please {@link features/restricted-editing#configuring-the-toolbar update your toolbar configuration}.

### Old installation methods sunset timelines

We are extending the sunset period for old installation methods ([#17779](https://github.com/ckeditor/ckeditor5/issues/17779)) to the **end of Q1 2026**. It is a good moment to consider switching to the {@link getting-started/setup/using-lts-edition LTS edition} for long-term stability and an additional 3 years of support for the old installation methods.

### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **View engine stability:** Fixed a bug where placeholders could remain visible after view changes, such as moving or replacing elements.
* **Downcast reliability:** The [`elementToStructure`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcasthelpers-DowncastHelpers.html#function-elementToStructure) helper now handles nested structures and list elements more consistently, ensuring correct reconversion and structure maintenance.

## Update to CKEditor&nbsp;5 v47.1.0

Released on 16 October, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.1.0))

This release introduces a minor stability update, featuring focused fixes and UX improvements.

### Minor breaking changes in this release

<info-box note>
Breaking changes in CKEditor AI are permitted during the Active phase of an LTS release. {@link getting-started/setup/using-lts-edition#features-excluded-from-the-no-breaking-changes-guarantee-v47x Learn more}.
</info-box>

* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: Simplified CSS for the CKEditor AI integration in a sidebar mode (`config.ai.container.type: 'sidebar'`) by removing default layout constraints:

	* Removed the default `min-height` from `.ck-ai-chat`,
	* Removed the default `height` from `.ck-tabs`,
	* Removed the default `width` from `.ck-ai-tabs`.

	Also, the `--ck-tabs-panels-container-width` custom property has been removed from the codebase.

## Update to CKEditor&nbsp;5 v47.0.0

Released on 1 October, 2025. ([See full release notes](https://github.com/ckeditor/ckeditor5/releases/tag/v47.0.0))

### CKEditor AI (early access)

We are introducing {@link features/ckeditor-ai-overview **CKEditor AI**}, a set of versatile AI-powered features that integrate directly into CKEditor&nbsp;5. It brings generation, summarization, correction, contextual chat help, reviews, and many other capabilities, right into the editor. With **CKEditor AI**, users will no longer need to switch between the editor and AI tools.

Three features are available in this early access phase:

* **Chat:** a conversational AI for dynamic, multi-turn interactions that support various context sources, model selection, which can perform changes directly on the document.
* **Quick actions:** one-click transformations and instant insights for selected text.
* **Review:** automatic checks for grammar, tone, correctness, style, and more, with UX optimized for performing full-document review.

Each feature is powered by our state-of-the-art AI service, available in the Cloud today and coming soon for on-premises deployments. This makes CKEditor AI a true plug-and-play solution that works out of the box, eliminating the need for months of custom development.

CKEditor AI is available as part of our **free trial** in early access.

### Long-term Support (⭐)

We are introducing the **CKEditor&nbsp;5 LTS (Long-term Support) Edition**, giving teams up to 3 years of stability with guaranteed updates.

The first LTS release is **v47.0.0** (October 2025). It will receive **6 months of active development** with new features and fixes, then **2.5 years of maintenance** with security and critical compatibility updates.

For **v47.x**, the Maintenance phase starts in **April 2026**. From then the next versions in the v47.x line will be available only under a **commercial LTS Edition license**. Therefore, starting in April, integrators without an LTS license should migrate to v48.x (the next regular release).

If you need long-term stability, [contact sales](https://ckeditor.com/contact-sales/) or read more about the {@link getting-started/setup/using-lts-edition CKEditor&nbsp;5 LTS Edition}.

### Updated content navigation with <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>

Starting with {@link updating/update-to-41#updated-keyboard-navigation version 41.3.0}, we have disabled the default browser <kbd>tab</kbd> behavior for cycling nested editable elements inside the editor. We decided back then that the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) keystroke should navigate to the next focusable field or element outside the editor so the users can quickly navigate fields or links on the page.

There was one exception to this <kbd>Tab</kbd> behavior, however. When a user selected a widget, the <kbd>Tab</kbd> key would move the selection to the first nested editable, such as the caption of an image. Pressing the <kbd>Esc</kbd> key while inside a nested editable will move the selection to the closest ancestor widget, for example, moving from an image caption to selecting the whole image widget.

The above exception was limited as it supported only the first nested editable in a widget (the table widget was an exception that had custom <kbd>Tab</kbd> support implemented).

The current release extends the <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handling to include all nested editable areas in the editor content. It also includes the content between block widgets as a separate editable area. Thanks to this, the original behavior of jumping away from the editor while pressing <kbd>Tab</kbd> inside an image caption is now tuned to jump just after that image. This way, the flow of <kbd>Tab</kbd> behavior is more linear and predictable to the user. Also, the custom widgets with multiple nested editable elements are now handled out of the box and require no custom code for <kbd>Tab</kbd> handling.

Please make sure that if you had a custom <kbd>Tab</kbd> handling implementation in your editor, it does not collide with the default one. Note that generic <kbd>Tab</kbd> (and <kbd>Shift</kbd>+<kbd>Tab</kbd>) handlers are registered on the `low` priority bubbling event in the `context` of widgets and editable elements. For more details on bubbling events and contexts, please see the {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} guide.

### Bubbling events priorities fix

The {@link framework/deep-dive/event-system#listening-to-bubbling-events bubbling events} now trigger all event handlers according to the registered priorities, even if multiple custom callback contexts are provided. Previously, not all custom callback contexts were evaluated for a given element. The custom callback contexts were also triggered after the view element name handlers. Now those are all triggered according to the registered priority, regardless of context: element name-based or callback-based.

### Other improvements and fixes

This release also brings several smaller but important enhancements and fixes:

* **UI:** dialogs in custom features can now be positioned programmatically with more flexible options (`Dialog#show()`).
* **Comments:** confirmation views for deleting comments and threads now use simplified CSS selectors (`.ck-confirm-view`). You may need to adjust custom styles accordingly.

### Major breaking changes in this release

With the release of {@link features/ckeditor-ai-overview **CKEditor AI**}, the `ai.*` configuration structure has changed. Until now, the configuration object was used for the former `AIAssistant` feature.

Now, this configuration space is used for all AI related features. Configuration for the `AIAssistant` was moved. The changes are:
	* `ai.aiAssistant` -> `ai.assistant`,
	* `ai.useTheme` -> `ai.assistant.useTheme`,
	* `ai.aws` -> `ai.assistant.adapter.aws`,
	* `ai.openAI` -> `ai.assistant.adapter.openAI`.

### Minor breaking changes in this release

* **[table](https://www.npmjs.com/package/@ckeditor/ckeditor5-table), [widget](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)**: The Widget feature implements the default handling for `Tab`/`Shift+Tab` to navigate nested editable elements in the editor content. Closes [#19083](https://github.com/ckeditor/ckeditor5/issues/19083). The listeners are registered on the `low` priority bubbling event in the context of widgets and editable elements.
	Please verify if your custom `Tab`/`Shift+Tab` handling does not collide with the default one.
* **[ai](https://www.npmjs.com/package/@ckeditor/ckeditor5-ai)**: The internal structure of the package has changed. Importing `AIAssistant` from the source should be done via `@ckeditor/ckeditor5-ai/src/aiassistant/aiassistant.js` path instead of the previous `@ckeditor/ckeditor5-ai/src/aiassistant.js`.
* **[comments](https://www.npmjs.com/package/@ckeditor/ckeditor5-comments)**: Changed the CSS selectors used to style the confirmation view displayed when attempting to remove a comment or an entire comment thread. For now, CSS classes will be more generic, for example: `.ck-confirm-view` instead of `.ck-thread__remove-confirm`. If you override styles for these components, you will need to update the selectors.
* **[undo](https://www.npmjs.com/package/@ckeditor/ckeditor5-undo)**: The `UndoCommandRevertEvent` type was renamed to `UndoRedoBaseCommandRevertEvent` and moved to the `basecommand.ts` file. Adjust your code if you have used this type in your custom integration. See [#19168](https://github.com/ckeditor/ckeditor5/issues/19168).
* Updated to TypeScript 5.3.
