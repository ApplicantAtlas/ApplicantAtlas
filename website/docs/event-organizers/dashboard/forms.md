# Forms

This is where the real power of ApplicantAtlas comes in. In a similar way to other form builders you can create a new form and use the edit tab at the top to select what fields and questions you want to ask in the form.

You can preview how this looks to the applicant by clicking the preview button at the top of the page.

In the settings tab there's a few options all of which have icons describing what they do. The most important is the visibility option which allows you to make the form public and accessible to applicants.

Furthermore you can also restrict the form to a list of email accounts, to do this check "Restrict this form" and then below enter a list of emails one per line. Like

```
test@example.com
hello@world.com
```

If you want to attach an expiration time for these emails you can do so as follows:

```
test@example.com,expiresAt:2024-04-01T18:46:13Z
```

This feature specifically was the whole functionality that inspired the creation of ApplicantAtlas as I was doing expiration logic manually for an event and it was annoying. This part is also an action that you can use in [pipelines](./pipelines.md) to accomplish complex workflows with allowing access to forms.

## Internal Fields

This is a feature that allows you to mark certain fields as internal. This means that they will not be shown to the applicant when they are filling out the form. This is useful for fields that you want to be filled out by admins or other internal users, these are also useful for triggering [pipelines](./pipelines.md) as fields can be used as triggers.
