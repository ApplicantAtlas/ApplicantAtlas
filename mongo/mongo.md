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