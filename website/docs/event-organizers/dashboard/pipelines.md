# Pipelines

Pipelines are what really make your life much easier as an event organizer. They allow you to automate a lot of the manual work that you would have to do otherwise.

The first step is to create a pipeline. You can do this by clicking the `Create Pipeline` button on the pipelines page.

## Pipeline Triggers

Pipeline triggers are what cause the pipeline to run. Currently there are two types of triggers:

- `FormSubmission` - This trigger is fired when a specified form is submitted.
- `FieldChange` - This triggered is fired when an admin changes a form's reponse for the given field.

## Pipeline Events

Pipeline events are what the pipeline does when it is triggered. Currently there are three types of events:

- `SendEmail` - This event sends an email template to a field in the form's specified email.
- `AllowFormAccess` - This event allows a form to be accessed by a specified email, with an optional expiration date.
- `Webhook` - This event can send an HTTP request to a specified URL. This can be used to integrate with other services. This will attach the form's response as a JSON object in the body of the request if POST is selected.

## Example Complex Pipeline

The main relatively complex workflow that ApplicantAtlas was built for is the following:

- An participant fills out an event application form.
- The admin reviews the application and marks an internal field as accepted.
- The pipeline is triggered by the `FieldChange` event.
  - The pipeline sends an email to the participant with a link to an RSVP form.
  - The pipeline allows the participant to access the RSVP form with an expiration date of 72 hours after the email was sent.
- The participant fills out the RSVP form.
  - The pipeline sends out a confirmation email to the participant with the event details.

This is a very common workflow for especially Hackathon-like events and ApplicantAtlas makes it very easy to set up.

If you're interested in new pipeline triggers/events please let me know by email or creating a GitHub issue!

## Pipeline Runs

This tab is where you can see the history of your pipelines and see if they were successful or not. This is useful for debugging and seeing if your pipelines are working as expected.
