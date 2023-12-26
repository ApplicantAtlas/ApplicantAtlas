import React, { useState } from "react";
import { ChromePicker } from "react-color";
import { FormField, FieldValue } from "@/types/models/FormBuilder";

type ColorPickerProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: string;
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  field,
  onChange,
  defaultValue,
}) => {
  const [color, setColor] = useState<string>(defaultValue || "#ffffff");
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (e.target.validity.patternMismatch) {
      e.target.setCustomValidity(
        "Please enter a valid hex color (e.g., #123ABC)"
      );
    } else {
      e.target.setCustomValidity("");
    }
    handleColorChange(newValue);
  };

  const handleColorChange = (color: string) => {
    setColor(color);
    onChange(field.key, color);
  };

  const handleColorPickerChange = (color: any) => {
    handleColorChange(color.hex);
  };

  return (
    <div className="form-control relative">
      <label className="label">
        <span className="label-text">{field.question}</span>
      </label>
      <div className="flex items-center">
        <div
          className="w-8 h-8 rounded-full mr-2 cursor-pointer border border-gray-300"
          style={{ backgroundColor: color }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={color}
          onChange={handleInputChange}
          placeholder={field.description || "Enter hex color"}
          className="input input-bordered w-full"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          title="Enter a valid hex color code (e.g., #123ABC)"
        />
      </div>
      {showPicker && (
        <div className="fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-black opacity-10"
            onClick={() => setShowPicker(false)}
          ></div>
          <div className="absolute z-30 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ChromePicker color={color} onChange={handleColorPickerChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
