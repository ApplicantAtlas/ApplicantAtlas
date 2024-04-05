import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import {
  DownloadResponses,
  GetResponses,
  UpdateResponse,
} from "@/services/ResponsesService";
import { FieldValue, FormField, FormStructure } from "@/types/models/Form";
import { useEffect, useRef, useState } from "react";
import ArrowDownTray from "@/components/Icons/ArrowDownTray";
import { RenderFormField } from "@/components/Form/FormBuilder";
import EditIcon from "@/components/Icons/EditIcon";
import { ToastType, useToast } from "@/components/Toast/ToastContext";
import debounce from "lodash/debounce";

interface ResponsesProps {
  form: FormStructure;
}

const Responses = ({ form }: ResponsesProps) => {
  const [responses, setResponses] = useState<Record<string, any>[]>([]);
  const [columnOrder, setColumnOrder] = useState<
    Record<string, FormField | undefined>[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  const debouncersRef = useRef(new Map());
  const defaultFormColumns = ["Response ID", "Submitted At", "User ID"];

  const getDebouncedOnSubmissionFieldChange = (key: string) => {
    if (!debouncersRef.current.has(key)) {
      debouncersRef.current.set(
        key,
        debounce((value, errorStr) => {
          let keyMap = JSON.parse(key);
          let submissionId = keyMap.submission_id;
          let question = keyMap.question;
          let attrKey = keyMap.attr_key;
          let fullKey = `${question}_attr_key:${attrKey}`;

          if (errorStr !== undefined) {
            showToast(
              `Error updating response: ${errorStr}
        Response ID: ${submissionId}`,
              ToastType.Error
            );
            return;
          }

          // Go through responses to find the correct response and update it
          const updatedResponses = responses.map((response) => {
            if (response["Response ID"] === submissionId) {
              const oldValue = response[fullKey];
              const newValue = value;
              response[fullKey] = value;

              // Deep copy response to avoid mutating original form structure
              let newResponse = JSON.parse(JSON.stringify(response));

              // Drop the defaultFormColumns from the new response
              defaultFormColumns.forEach((column) => {
                delete newResponse[column];
              });

              // For each key remove the _attr_key: and replace with the actual key which follows it
              var shouldUpdate = false;
              Object.keys(newResponse).forEach((key) => {
                let [_, id_val] = key.split("_attr_key:");

                if (oldValue !== newValue) {
                  shouldUpdate = true;
                }

                newResponse[id_val] = newResponse[key];
                delete newResponse[key];
              });

              if (shouldUpdate) {
                UpdateResponse(form.id || "", submissionId, newResponse)
                  .then(() => {
                    showToast(
                      "Successfully updated reponse",
                      ToastType.Success
                    );
                  })
                  .catch(() => {});
              }
            }

            return response;
          });

          //setResponses(updatedResponses);
        }, 500)
      );
    }
    return debouncersRef.current.get(key);
  };

  const onSubmissionFieldChange = (
    key: string,
    value: FieldValue,
    errorStr: string | undefined
  ) => {
    const debouncedOnChange = getDebouncedOnSubmissionFieldChange(key);
    debouncedOnChange(value, errorStr);
  };

  useEffect(() => {
    return () => {
      debouncersRef.current.forEach((debouncer) => debouncer.cancel());
    };
  }, []);

  useEffect(() => {
    GetResponses(form.id || "")
      .then((r) => {
        const cleanedResponses = r.data.responses.map(
          (response: Record<string, any>) => {
            const cleanedResponse: Record<string, any> = {};

            Object.entries(response).forEach(([key, value]) => {
              cleanedResponse[key] = value;
            });

            return cleanedResponse;
          }
        );

        setResponses(cleanedResponses);

        // Iterate over column order and match against form fields
        let columnOrder: Record<string, FormField | undefined>[] = [];
        if (r.data.columnOrder) {
          columnOrder = r.data.columnOrder.map((key: string) => {
            let [_, id_val] = key.split("_attr_key:");
            const field = form.attrs.find((f) => {
              return f.key === id_val;
            });

            return { [key]: field };
          });

          setColumnOrder(columnOrder);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [form.id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (responses.length === 0) {
    return <p>No responses yet.</p>;
  }

  const handleExportCSV = () => {
    DownloadResponses(form.id || "")
      .then((r) => {
        const blob = new Blob([r.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const currentISO = new Date().toISOString();
        link.download = `${form.name}-${currentISO}-${form.id}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {});
  };

  return (
    <div>
      <div className="text-right mb-3 mt-[-3rem]">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-primary mr-2"
        >
          <EditIcon className="w-6 h-6" />
          {isEditing ? "Stop Editing" : "Edit Fields"}
        </button>

        <button onClick={handleExportCSV} className="btn btn-primary">
          <ArrowDownTray className="w-6 h-6" /> Export as CSV
        </button>
      </div>
      <div className="overflow-x-auto" style={{ height: "70vh" }}>
        <table className="table table-sm table-pin-rows bg-white">
          <thead>
            <tr>
              {columnOrder.map((header) => (
                <th key={Object.keys(header)[0]}>
                  {Object.keys(header)[0].split("_attr_key:")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => {
              if (index === 0) return null;

              return (
                <tr key={response["Response ID"] || index} className="hover">
                  {columnOrder.map((columnHeaderAttrMap) => {
                    let header = Object.keys(columnHeaderAttrMap)[0];
                    const value = response[header];
                    let displayValue;

                    if (value !== null && typeof value === "object") {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = value;
                    }

                    let field = columnHeaderAttrMap[header];
                    if (!isEditing || !field) {
                      return <td key={`${header}-${index}`}>{displayValue}</td>;
                    }

                    // Deep copy field to avoid mutating original form structure
                    let newField = JSON.parse(JSON.stringify(field));
                    newField.defaultValue = value;
                    newField.question = "";
                    newField.key = JSON.stringify({
                      submission_id: response["Response ID"],
                      attr_key: field.key,
                      question: field.question,
                    });

                    return (
                      <td key={`${header}-${index}`}>
                        {RenderFormField(newField, {}, onSubmissionFieldChange)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Responses;
