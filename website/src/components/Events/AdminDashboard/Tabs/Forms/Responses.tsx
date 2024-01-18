import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { DownloadResponses, GetResponses } from "@/services/ResponsesService";
import { FormStructure } from "@/types/models/Form";
import { useEffect, useState } from "react";
import moment from "moment";
import { split } from "lodash";
import ArrowDownTray from "@/components/Icons/ArrowDownTray";

interface ResponsesProps {
  form: FormStructure;
}

const Responses = ({ form }: ResponsesProps) => {
  const [responses, setResponses] = useState<Record<string, any>[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>();
  const [isLoading, setIsLoading] = useState(true);

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
        setColumnOrder(r.data.columnOrder);
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

  const headers = columnOrder
    ? columnOrder.map((key) => split(key, "_attr_key:")[0])
    : [];

  return (
    <div>
      <div className="text-right mb-3 mt-[-3rem]">
        <button onClick={handleExportCSV} className="btn btn-primary">
          <ArrowDownTray className="w-6 h-6" /> Export as CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-pin-rows table-pin-cols bg-white">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => {
              if (index === 0) return null;

              return (
                <tr key={response["Response ID"] || index} className="hover">
                  {headers.map((header) => {
                    const value = response[header];
                    let displayValue;

                    if (value !== null && typeof value === "object") {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = value;
                    }

                    return <td key={`${header}-${index}`}>{displayValue}</td>;
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
