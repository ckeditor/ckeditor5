---
# Scope:
# * Introduction to the migration problem.
# * Underline that migrating is a complex and important task.
# * List and clarify the things that need attention when migrating.

category: installation
order: 40
modified_at: 2022-04-15
---

# Migration from CKEditor 4

<info-box hint>
**Quick recap**

In the other tutorials from this section you could learn about installing, configuring and extending your CKEditor 5. This guide assumes that you know a bit about this editor, so if you are completely new to it, check the previous articles first!

Before starting, be sure that migrating is your best choice.
</info-box>

When compared to its predecessor, CKEditor 5 should be considered **a totally new editor**. 

The very first aspect that changed with CKEditor 5 is its installation procedure. It became much more modern with the introduction of modular patterns, UMD, npm, etc. Refer to {@link installation/getting-started/quick-start-other Installation} for more details.

The API for integrating CKEditor with your pages also changed. It is worth checking {@link installation/getting-started/editor-lifecycle Editor Lifecycle} and {@link installation/getting-started/getting-and-setting-data Getting and setting data} for an introduction.

When it comes to {@link features/index features}, there are two aspects that need to be taken into consideration. CKEditor 5 may still not have all the same features available as CKEditor 4 yet and some existing features may behave differently. Therefore, it is worth spending some time analyzing the features you need in your implementation.

To proceed with the upgrade, please refer to the {@link updating/migration-from-ckeditor-4 Migration from CKEditor 4} guide for further details and features comparison.
