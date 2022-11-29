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

In previous tutorials you have learned about installing, configuring and extending your editor. This guide assumes that you know a bit about CKEditor 5, so if you are completely new to CKEditor 5, check the previous articles!

Before starting, be sure that migrating is your best choice.
</info-box>

When compared to its predecessor, CKEditor 5 should be considered **a totally new editor**. 

The very first aspect that changed with CKEditor 5 is its installation procedure. It became much more modern with the introduction of modular patterns, UMD, npm, etc. Refer to {@link installation/getting-started/quick-start-other Installation} for more details.

The API for integrating CKEditor with your pages also changed. It is worth checking {@link installation/getting-started/basic-api Basic API} for an introduction.

When it comes to {@link features/index features}, there are two aspects that need to be taken into consideration. CKEditor 5 may still not have the same features available as CKEditor 4 and some existing features may behave differently. Therefore, it is worth spending some time analyzing required features.

To proceed with the upgrade, please refer to the {@link updating/migration-from-ckeditor-4 Migration from CKEditor 4} guide for further details and features comparison.
