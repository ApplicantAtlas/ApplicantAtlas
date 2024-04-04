import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { DownloadResponses, GetResponses } from "@/services/ResponsesService";
import { FieldValue, FormField, FormStructure } from "@/types/models/Form";
import { useEffect, useState } from "react";
import moment from "moment";
import { split } from "lodash";
import ArrowDownTray from "@/components/Icons/ArrowDownTray";
import { RenderFormField } from "@/components/Form/FormBuilder";
import EditIcon from "@/components/Icons/EditIcon";

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

  useEffect(() => {
    GetResponses(form.id || "")
      .then((r) => {
        const cleanedResponses = r.data.responses.map(
          (response: Record<string, any>) => {
            const cleanedResponse: Record<string, any> = {};

            Object.entries(response).forEach(([key, value]) => {
              const splitKey = key.includes("_attr_key:")
                ? split(key, "_attr_key:")[0]
                : key;
              cleanedResponse[splitKey] = value;
            });

            return cleanedResponse;
          }
        );

        setResponses(cleanedResponses);

        // Iterate over column order and match against form fields
        let columnOrder: Record<string, FormField | undefined>[] = [];
        if (r.data.columnOrder) {
          columnOrder = r.data.columnOrder.map((key: string) => {
            let [displayKey, id_val] = key.split("_attr_key:");
            const field = form.attrs.find((f) => {
              return f.key === id_val;
            });
            console.log(displayKey, field);

            return { [displayKey]: field };
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
          {isEditing ? "Stop Editing & Save" : "Edit Fields"}
        </button>

        <button onClick={handleExportCSV} className="btn btn-primary">
          <ArrowDownTray className="w-6 h-6" /> Export as CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm table-pin-rows table-pin-cols bg-white">
          <thead className="bg-white">
            <tr>
              {columnOrder.map((header) => (
                <th key={Object.keys(header)[0]}>{Object.keys(header)[0]}</th>
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

                    return (
                      <td key={`${header}-${index}`}>
                        {RenderFormField(
                          newField,
                          {},
                          (
                            key: string,
                            value: FieldValue,
                            errorStr: string | undefined
                          ) => {
                            console.log(key, value, errorStr);
                          }
                        )}
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
