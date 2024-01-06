# MongoDB Schema Overview

## Collections

### `users`

This collection contains all the users in the system. It is used for authentication and authorization.

### `events`

This collection contains all the events in the system. It is used to store all the events that are created by users.

Each event has multiple organizerIDs which are the `users` ids that are organizing the event.

### `forms`

This collection contains all the forms in the system. It is used to store all the forms that are created by users.

todo: each field should have a unique id, maybe use this as the key in the form builder. This will also help with potential race conditions and other issues.

### `responses`

This collection contains all the responses in the system. It is used to store all the responses that are created by users to forms.

todo: each response should have like a time stamp or something to indicate when it was created.

### `email_templates`

This collection contains all the email templates in the system. It is used to store all the email templates that are created by users.

These should allow for some sort of templating language to be used to allow for dynamic content of the form `{{field_name}}`, we need to internally use the field id to reference the field, but we should allow for the user to use the field name when creating the template.

### `email_logs`

This collection contains all the email logs in the system. It is used to store all the email logs that are created by sending emails to users, through their smtp solution.

TODO: I need to figure out the best way to do this, because this is sort of set up for lambda functions for the rest of the api, so we might need some sort of queue system to handle this. Ideally like how firebase does it where we can listen for changes to the collection and then send the email. Preferably can trigger events based on changes to the collection, which then hit a lambda function that sends the email and then updates the collection with the email log.