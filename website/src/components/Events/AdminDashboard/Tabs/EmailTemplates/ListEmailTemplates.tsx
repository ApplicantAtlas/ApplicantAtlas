import { EmailTemplate } from "@/types/models/EmailTemplate";
import moment from "moment";

interface ListEmailTemplatesProps {
  templates: EmailTemplate[];
  selectTemplate: (template: EmailTemplate) => void;
}

const ListEmailTemplates = ({ templates, selectTemplate }: ListEmailTemplatesProps) => {
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
                  selectTemplate(template);
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
