import FormCreator from "@/components/Form/Creator/FormCreator";
import FormBuilder from "@/components/Form/FormBuilder";
import { eventEmitter } from "@/events/EventEmitter";
import { updateForm } from "@/services/FormService";
import { FormStructure } from "@/types/models/Form";
import { useState } from "react";
import FormSettings from "./FormSettings";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import LinkIcon from "@/components/Icons/LinkIcon";
import Responses from "./Responses";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { updateFormDetails } from "@/store/slices/formSlice";

interface SelectFormProps {
  action: "responses" | "edit";
  onDelete: () => void;
}

const SelectForm: React.FC<SelectFormProps> = ({ action, onDelete }) => {
  const dispatch: AppDispatch = useDispatch();
  const formStructure = useSelector((state: RootState) => state.form.formDetails);
  const [pageSelected, setPageSelected] = useState<
    "edit" | "responses" | "preview" | "settings"
  >(action);
  const { showToast } = useToast();

  const onFormStructureChange = (newFormStructure: FormStructure) => {
    updateForm(newFormStructure.id || "", newFormStructure)
      .then(() => {
        eventEmitter.emit("success", "Successfully updated form!");
        dispatch(updateFormDetails(newFormStructure));
      })
      .catch((err) => {});
  };

  const isActive = (page: string) => (page === pageSelected ? "btn-active" : "");

  const onShareClick = () => {
    if (!formStructure?.eventID || !formStructure?.id) {
      showToast("Could not share form.", ToastType.Error);
      return;
    }

    if (formStructure.status !== "published") {
      showToast("This form is not published, please publish it in form settings before sharing.", ToastType.Warning);
      return;
    }

    const formURL = `${window.location.origin}/events/${formStructure.eventID}/participant/form/${formStructure.id}`;
    navigator.clipboard
      .writeText(formURL)
      .then(() => {
        showToast("Copied form URL to clipboard.", ToastType.Success);
      })
      .catch((err) => {
        showToast("Could not copy form link.", ToastType.Error);
      });
  };

  return (
    <>
      <div className="flex space-x-2 bg-gray-100 p-2 rounded">
        <button
          className={`btn ${isActive("responses")}`}
          onClick={() => setPageSelected("responses")}
        >
          Responses
        </button>
        <button
          className={`btn ${isActive("edit")}`}
          onClick={() => setPageSelected("edit")}
        >
          Edit
        </button>
        <button
          className={`btn ${isActive("preview")}`}
          onClick={() => setPageSelected("preview")}
        >
          Preview
        </button>
        <button
          className={`btn ${isActive("settings")}`}
          onClick={() => setPageSelected("settings")}
        >
          Settings
        </button>
        <button className="btn" onClick={onShareClick}>
          <LinkIcon /> Share
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">
        {formStructure?.name}
      </h2>

      {pageSelected === "edit" && formStructure && (
        <FormCreator
          submissionFunction={onFormStructureChange}
          defaultFormStructure={formStructure}
          submissionButtonText="Save Form"
        />
      )}

      {pageSelected === "responses" && formStructure && (
        <Responses />
      )}

      {pageSelected === "preview" && formStructure && (
        <FormBuilder
          formStructure={formStructure}
          submissionFunction={(formData) => {
            console.log(formData);
          }}
          buttonText="Submit"
        />
      )}

      {pageSelected === "settings" && formStructure && (
        <FormSettings onDelete={onDelete} />
      )}

      {pageSelected !== "edit" &&
        pageSelected !== "responses" &&
        pageSelected !== "preview" &&
        pageSelected !== "settings" && <p>Could not find selected page.</p>}
    </>
  );
};

export default SelectForm;
