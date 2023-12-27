import React, { useEffect, useMemo, useState } from "react";
import { User } from "@/types/models/User";
import AuthService from "@/services/AuthService";
import { useRouter } from "next/router";
import { useToast, ToastType } from "@/components/Toast/ToastContext";
import LoadingOverlay from "@/components/Loading/LoadingOverlay";
import { FormStructure } from "@/types/models/FormBuilder";
import FormBuilder from "@/components/FormBuilder/FormBuilder";

const UserSettings: React.FC = () => {
  const [user, setUser] = useState<User | undefined>();
  const [formFields, setFormFields] = useState<FormStructure | undefined>();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    AuthService.getUserFull().then((r) => {
        setUser(r);
        setFormFields(createFormStructure(r));
    }).catch(() => {})
  }, []);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      AuthService.deleteUser()
        .then(() => {
          AuthService.logout();
          showToast("Account deleted successfully", ToastType.Success);
          router.push("/");
        })
        .catch(() => {});
    }
  };

  const createFormStructure = (user: User): FormStructure => {
    return {
        attrs: [
            {
                key: "firstName",
                question: "First Name",
                type: "text",
                required: true,
                defaultValue: user?.firstName,
            }, 
            {
                key: "lastName",
                question: "Last Name",
                type: "text",
                required: true,
                defaultValue: user?.lastName,
            },
            {
                key: "email",
                question: "Email",
                type: "text",
                additionalValidation: {
                    isEmail: {
                        isEmail: true,
                    }
                },
                required: true,
                defaultValue: user?.email,
            },
            {
                key: "schoolEmail",
                question: "School Email",
                type: "text",
                additionalValidation: {
                    isEmail: {
                        isEmail: true,
                        allowTLDs: ["edu"],
                        allowSubdomains: true
                    }
                },
                required: false,
                defaultValue: user?.schoolEmail,
            },
            {
                key: "birthday",
                question: "Birthday",
                type: "date",
                required: true,
                defaultValue: user?.birthday,
            }
        ]
     }
    }

  const handleFormSubmission = (formData: Record<string, any>) => {
    // Handle form data submission logic here
    console.log(formData);
  };

  if (!user || !formFields) {
    return <LoadingOverlay />
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold">User Settings</h2>
      <FormBuilder 
        formStructure={formFields} 
        submissionFunction={handleFormSubmission} 
      />

      <button className="btn btn-error mt-4" onClick={handleDeleteAccount}>
        Delete Account
      </button>
    </div>
  );
};

export default UserSettings;
