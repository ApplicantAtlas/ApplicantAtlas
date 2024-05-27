import { FormStructure } from "@/types/models/Form";
import moment from "moment";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { setFormDetails } from "@/store/slices/formSlice";

interface ListFormsProps {
  forms: FormStructure[];
}

const ListForms: React.FC<ListFormsProps> = ({ forms }) => {
  const dispatch: AppDispatch = useDispatch();
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date ? moment(date).format("MMMM Do, YYYY") : "";
  };

  const handleSelectForm = (form: FormStructure) => {
    dispatch(setFormDetails(form));
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
                onClick={() => handleSelectForm(form)}
              >
                <td>{form.name}</td>
                <td>{form.status}</td>
                <td>{formatDate(form.updatedAt)}</td>
                <td>
                  <button
                    className="btn btn-outline btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectForm(form);
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
