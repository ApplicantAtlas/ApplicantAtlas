These components are passed in the field.defaultValue since that is an attribute on field.

But due to a re-rendering issue we specify the defaultValue as a prop on the component itself.

This is a temporary fix that causes confusion since the defaultValue is specified multiple times, but if a user is using FormBuilder it handles this for them.

If a user is using the component directly they will need to specify the defaultValue prop themselves.