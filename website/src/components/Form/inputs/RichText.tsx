import { FieldValue, FormField } from "@/types/models/Form";
import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import InformationIcon from "@/components/Icons/InformationIcon";
import TextArea from "./TextArea";

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
  const [defContent, setDefContent] = useState<string>(defaultValue);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    setContent(defaultValue);
  }, [defaultValue]);

  const flipHTMLMode = () => {
    setDefContent(content);
    setIsHtmlMode(!isHtmlMode);
  };

  const handleContentChange = (content: string) => {
    setContent(content);
    onChange(field.key, content);
  };

  const handleTextAreaChange = (_: string, value: FieldValue) => {
    handleContentChange(value as string);
  };

  return (
    <div className="form-control">
      {isHtmlMode ? (
        <TextArea
          field={field}
          onChange={handleTextAreaChange}
          defaultValue={defContent}
        />
      ) : (
        <>
          {field.question !== "" && (
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
          )}
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            className="bg-white"
          />
        </>
      )}
      <div className="mt-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            flipHTMLMode();
          }}
          className="btn btn-xs"
        >
          Switch to {isHtmlMode ? "Rich Text" : "HTML"} Mode
        </button>
      </div>
    </div>
  );
};

export default RichText;
