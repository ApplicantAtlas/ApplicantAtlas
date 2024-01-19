import { FieldValue, FormField } from "@/types/models/Form";
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import InformationIcon from "@/components/Icons/InformationIcon";

interface RichTextProps {
  field: FormField;
  defaultValue: string;
  onChange: (
    key: string,
    value: FieldValue,
    errorString?: string | undefined
  ) => void;
}

const RichText: React.FC<RichTextProps> = ({
  field,
  defaultValue,
  onChange,
}) => {
  const [content, setContent] = useState<string>(defaultValue);

  useEffect(() => {
    setContent(defaultValue);
  }, [defaultValue]);

  const handleContentChange = (content: string) => {
    setContent(content);
    onChange(field.key, content);
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {field.question}{" "}
          {field.required && <span className="text-error">*</span>}
          {field.description && (
            <div className="tooltip" data-tip={field.description}>
              <InformationIcon className="h-4 w-4" />
            </div>
          )}
        </span>
      </label>
      <div className="flex flex-col space-y-2">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleContentChange}
          className="bg-white"
        />
      </div>
    </div>
  );
};

export default RichText;
