import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { GetResponses } from "@/services/ResponsesService";
import { FormStructure } from "@/types/models/Form";
import { FormResponse } from "@/types/models/Response";
import { useEffect, useState } from "react";
import moment from "moment";

interface ResponsesProps {
  form: FormStructure;
}

const Responses = ({ form }: ResponsesProps) => {
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [formStructure, setFormStructure] = useState<FormStructure | null>(form);
    const [isLoading, setIsLoading] = useState(true);

    const formatDate = (date: Date | undefined) => {
        if (!date) return "";
        return date ? moment(date).format("MMMM Do, YYYY") : "";
      };

    useEffect(() => {
        GetResponses(form.id || "").then((r) => {
            // The data is returned a little bit weirdly, so we need to do some processing to match up the response ids with the questions

            // Make a map of question ids to question field names
            const questionMap = new Map<string, string>();
            r.data.form.attrs.forEach((attr) => {
                questionMap.set(attr.key, attr.question);
            })

            // Map the responses to the question ids
            var validatedResponses: FormResponse[] = []
            r.data.responses.forEach((response) => {
                var validatedResponse: FormResponse = {
                    id: response.id,
                    createdAt: response.createdAt,
                    formID: response.formID,
                    data: {},
                    userID: response.userID,
                }

                for (const key in response.data) {
                    if (response.data.hasOwnProperty(key)) {
                        const value = response.data[key];
                        validatedResponse.data[questionMap.get(key) || ""] = value;
                    }
                }

                validatedResponses.push(validatedResponse);
            })

            setResponses(validatedResponses);
            setFormStructure(r.data.form);
            setIsLoading(false);
        }).catch((err) => {})
    }, []);

    if (isLoading) {
        return (
            <LoadingSpinner />
        )
    }

    if (responses.length === 0) {
        return (
            <p>No responses yet.</p>
        )
    }

    return (
        <div className="overflow-x-auto">
          <table className="table table-pin-rows table-pin-cols bg-white">
            <thead>
              <tr>
                <td>Response ID</td>
                <td>User ID</td>
                <td>Submitted At</td>
                {formStructure?.attrs.map((attr) => {
                    return (
                        <td>{attr.question}</td>
                    )
                })}
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => {
                return (
                  <tr
                    key={response.id}
                    className="hover"
                  >
                    <td>{response.id}</td>
                    <td>{response.userID}</td>
                    <td>{formatDate(response.createdAt)}</td>
                    {formStructure?.attrs.map((attr) => {
                        return (
                            <td>{response.data[attr.question]}</td>
                        )
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
}

export default Responses;