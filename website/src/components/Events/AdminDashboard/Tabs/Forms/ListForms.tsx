import { FormStructure } from "@/types/models/Form";
import moment from "moment";

interface ListFormsProps {
  forms: FormStructure[];
  selectForm: (form: FormStructure, action?: "responses" | "edit") => void;
}

const ListForms = ({ forms, selectForm }: ListFormsProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date ? moment(date).format("MMMM Do, YYYY") : "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-pin-rows table-pin-cols bg-white">
        <thead>
          <tr>
            <td>Name</td>
            <td>Status</td>
            <td>Last Updated At</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => {
            return (
              <tr
                key={form.id}
                className="hover cursor-pointer"
                onClick={() => {
                  selectForm(form);
                }}
              >
                <td>{form.name}</td>
                <td>{form.status}</td>
                <td>{formatDate(form.updatedAt)}</td>
                <td>
                  <button
                    className="btn btn-outline btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectForm(form, "edit");
                    }}
                  >
                    edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListForms;
