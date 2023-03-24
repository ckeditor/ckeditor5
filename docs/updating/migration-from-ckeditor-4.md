---
# Scope:
# Support migration from CKEditor 4 to CKEditor 5.

category: ckeditor4-migration
order: 10
modified_at: 2023-03-21
---

# Migration from CKEditor 4

When compared to its predecessor, CKEditor 5 should be considered **a totally new editor**. Every single aspect of it was redesigned &mdash; from installation, to integration, to features, to its data model, and finally to its API.

There is no automatic solution for migrating. This section summarizes the most important aspects you need to consider before you proceed with moving to CKEditor 5.
## Differences between CKEditor 4 and CKEditor 5

What differentiates CKEditor 5 from its predecessor the most is its core architecture. CKEditor 5 is a highly flexible and extensible editing framework with a powerful API. You can use it to create any WYSIWYG editor implementation, from a lightweight chat to a complex Google Docs-like solution. CKEditor 5 is also collaboration-ready and offers features such as real-time collaboration, comments, or track changes.

Here are the key differences between the two editor versions:

<figure class="table" style="width:100%;">
    <table>
        <tbody>
            <tr>
                <td>
                    &nbsp;
                </td>
                <td>
                    <strong>CKEditor 4</strong>
                </td>
                <td>
                    <strong>CKEditor 5</strong>
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Programming language</strong>
                </td>
                <td>
                    JavaScript
                </td>
                <td>
                    TypeScript
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Data model</strong>
                </td>
                <td>
                    HTML/DOM
                </td>
                <td>
                    Custom data model and virtual DOM implementation
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Architecture</strong>
                </td>
                <td>
                    Plugin-based
                </td>
                <td>
                    Plugin-based, MVC
                </td>
            </tr>
			<tr>
                <td>
                    <strong>Editor types</strong>
                </td>
                <td>
                    Classic, inline
                </td>
                <td>
                    Classic, inline, decoupled (document), balloon, balloon block, multi-root
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Collaboration-ready</strong>
                </td>
                <td>
                    ❌
                </td>
                <td>
                    ✅
                </td>
            </tr>
            <tr>
                <td>
                    <strong>File management and image upload</strong>
                </td>
                <td>
                    CKFinder, Easy Image
                </td>
                <td>
                    CKBox, CKFinder, Easy Image
                </td>
            </tr>
            <tr>
                <td>
                    <strong>UI</strong>
                </td>
                <td>
                    Toolbar, dialogs, features manipulated through right-click context menu
                </td>
                <td>
                    Toolbar, dropdowns, balloons, features manipulated through on-click feature toolbars
                </td>
            </tr>
            <tr>
                <td>
                    <strong>UI customization</strong>
                </td>
                <td>
                    Skins, UI color change
                </td>
                <td>
                    Themes, customization with CSS variables
                </td>
            </tr>
            <tr>
                <td>
                    <strong>License</strong>
                </td>
                <td>
                    GPL, MPL, LGPL, commercial license
                </td>
                <td>
                    GPL 2+ or commercial license
                </td>
            </tr>
        </tbody>
    </table>
</figure>

## Feature comparison of CKEditor 4 and CKEditor 5

Digital content editing paradigms have changed a lot between the times of CKEditor 4 and now. We designed and built CKEditor 5 from scratch, taking into account the possibilities of modern web apps, current web standards, and the needs of today's users.

This new approach affects the {@link features/index available feature set}, how features were implemented, and what configuration options are available for them. To make it easier to compare both editor versions, we have created the following compatibility tables:
* {@link updating/ckeditor4-plugin-compatibility CKEditor 4 plugin equivalents}
* {@link updating/ckeditor4-configuration-compatibility CKEditor 4 configuration options compatibility}

You can use them to check the CKEditor 5 equivalents of some features or configuration options from CKEditor 4. If there is no direct equivalent, the tables will point you to a solution recommended in CKEditor 5. We strongly advise you to treat the migration to CKEditor 5 as an opportunity to modernize your app and rethink your editing solutions.

## Before you migrate

CKEditor 4 and CKEditor 5 are two different products. Here are the most important aspects you need to consider before you migrate.

### Migrating existing data

<info-box warning>
	Because of the differences in features, the **data produced with CKEditor 4 may not be compatible with CKEditor 5 which may lead to data loss**. Any data that is not supported by features enabled in CKEditor 5 will be removed when loaded into the editor.
</info-box>

Extensive analysis, data verification, and tests should be performed on existing data. If necessary, you will need to develop conversion procedures to avoid data loss. You can use the {@link features/general-html-support General HTML Support} feature to introduce HTML markup that is present in the legacy content but is not yet fully covered by CKEditor 5 features.

The {@link installation/plugins/features-html-output-overview Plugins and HTML output} article lists all official CKEditor 5 plugins and the HTML output they produce. You can use it to check the compatibility of legacy data with what is supported in CKEditor 5.

A relatively simple yet efficient strategy of adopting CKEditor 5 into existing systems might be using CKEditor 5 for creating new content and the old editor for editing legacy content.

### Installation and integration

The very first aspect that changed with CKEditor 5 is its installation procedure. It became much more modern with the introduction of modular patterns, UMD, npm, etc. Refer to the {@link installation/index Getting started} section to explore all available installation and integration options.

The API for integrating CKEditor with your pages changed, too. It is worth checking the {@link installation/getting-started/editor-lifecycle Editor lifecycle} and {@link installation/getting-started/getting-and-setting-data Getting and setting data} articles for an introduction to this topic.

### Custom plugins

Any custom plugins you have developed for CKEditor 4 will not be compatible with CKEditor 5. Although their concept may stay the same, their implementation will certainly be different and will require rewriting them from scratch.

The same may apply to third-party plugins which may not have been ported to CKEditor 5 yet.

Check the {@link installation/plugins/plugins#creating-plugins Creating plugins} section for more information on the development of plugins.

### Custom themes (skins)

In CKEditor 5, the previous concept of "skins" was reviewed and is now called "themes".

If you have custom skins for CKEditor 4, they need to be recreated for CKEditor 5. Fortunately, custom theming in CKEditor 5 is much more powerful and simpler than before.

What's new: CKEditor 5 can also be used as a {@link framework/external-ui headless editor integrated with an external UI}, for example, built in React. Many projects use the powerful editing engine of CKEditor 5 coupled with their own UI for seamless integration with their application.

For more information, check how to {@link framework/theme-customization customize the themes} in the CKEditor 5 Framework documentation.

### Image upload

CKEditor 5 supports several different image upload strategies. Check out the {@link features/image-upload comprehensive "Image upload" guide} to find out the best option for your project.

### License

CKEditor 4 was licensed under GPL, LGPL, and MPL Open Source licenses.

CKEditor 5 is licensed under GPL2+ Open Source license only. If you are running an Open Source project under an OSI-approved license incompatible with GPL, we will be happy to [support you with a no-cost license](https://ckeditor.com/contact/). If your project is a commercial one, you will need to [obtain a commercial license](https://ckeditor.com/contact/).
## Recommended migration strategy

You can approach moving from CKEditor 4 to CKEditor 5 as follows:

1. **Back up all your data.**
2. Learn about CKEditor 5. Check the [demos](https://ckeditor.com/ckeditor-5/demo/), read about its {@link framework/architecture/intro architecture}, and review the {@link features/index available features} and {@link installation/index integration methods}.
3. Create a custom build containing all the plugins you need {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder using online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source}.
4. Test loading pre-existing content created in CKEditor 4 into CKEditor 5. Adjust the editor configuration and plugin set. If needed, enable the missing elements, classes, or attributes via the {@link features/general-html-support General HTML Support} feature.
5. When you are sure no data loss will occur, you can focus on customizing your CKEditor 5 build even more by changing the integration method, creating custom plugins, adjusting the theme, and enabling new features.

CKEditor 5 is a great, modern editing framework so migrating is a fantastic opportunity to level your content editing experience up. {@link features/collaboration Collaboration} with real-time collaborative editing, comments and track changes, {@link features/revision-history revision history}, {@link features/autoformat autoformatting}, {@link features/import-word import from Word}, export to {@link features/export-pdf PDF} and {@link features/export-word Word}, {@link features/word-count word and character count}, and {@link features/ckbox CKBox} file manager are just a few examples of new features that were not available in CKEditor 4. Try them out!

## Support

If you are missing any particular features or settings, feel free to {@link support/reporting-issues#reporting-issues-2 report an issue}. Search the [issues section in the repository](https://github.com/ckeditor/ckeditor5/issues) first, as the feature you are after may have already been reported &mdash; you can support it by upvoting the issue with &nbsp;👍. Please be as precise as possible, explaining the exact use case, the context where the editor is used, and the expected behavior.

The {@link updating/ckeditor4-troubleshooting Troubleshooting migration from CKEditor 4} article answers some frequently asked questions about the migration.
