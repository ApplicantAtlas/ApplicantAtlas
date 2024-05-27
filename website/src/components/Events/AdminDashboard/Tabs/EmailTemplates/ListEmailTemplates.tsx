import { AppDispatch, RootState } from "@/store";
import { setEmailTemplateState } from "@/store/slices/emailTemplateSlice";
import { EmailTemplate } from "@/types/models/EmailTemplate";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

interface ListEmailTemplatesProps {
  templates: EmailTemplate[];
}

const ListEmailTemplates = ({ templates }: ListEmailTemplatesProps) => {
  const dispatch: AppDispatch = useDispatch();

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
            <td>Description</td>
            <td>Last Updated At</td>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => {
            return (
              <tr
                key={template.id}
                className="hover cursor-pointer"
                onClick={() => {
                  dispatch(setEmailTemplateState(template));
                }}
              >
                <td>{template.name}</td>
                <td>{template.description}</td>
                <td>{formatDate(template.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListEmailTemplates;
