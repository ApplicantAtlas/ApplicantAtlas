export const humanFormTypes: string[] = [
  "text",
  "number",
  "date",
  "timestamp",
  "select",
  "email",
  "telephone",
  "textarea",
  "radio",
  "url",
  "colorpicker"
];

export const fieldDescriptions: { [key: string]: string } = {
  text: "A basic text input, suitable for short, single-line text such as names or titles.",
  textarea: "A larger text input area ideal for longer, multi-line text such as descriptions or messages.",
  number: "An input for numerical values, allowing only number input.",
  date: "A date picker to allow users to select a date.",
  timestamp: "A date and time picker to allow users to select a date and time.",
  select: "A dropdown list of options, allowing the user to select one option from a predefined list.",
  multiselect: "Similar to select, but allows multiple selections from the list of options.",
  checkbox: "A binary choice input, typically used for options that can be either enabled or disabled.",
  radio: "A set of options where only one choice is allowed, making it perfect for mutually exclusive options.",
  email: "A text input specifically for email addresses, which can validate the entered email format.",
  telephone: "An input for phone numbers. Can be formatted to accept numbers in specific telephone formats.",
  colorpicker: "A tool that allows users to select a color, either by using a visual color picker interface or by entering a color value.",
  url: "An input designed for web addresses, ensuring the entered text is a valid URL.",
  range: "A slider input allowing users to select a value from within a specified range."
};
