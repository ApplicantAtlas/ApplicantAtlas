import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import AuthService from "@/services/AuthService";
import { User } from "@/types/models/User";
import { eventEmitter } from "@/events/EventEmitter";
import { useRouter } from "next/router";
import FormBuilder from "@/components/Form/FormBuilder";
import { FormStructure } from "@/types/models/Form";

const RegistrationPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (AuthService.isAuth()) {
      router.push("/user/dashboard");
    }
  }, [router]);

  const registrationFormStructure: FormStructure = {
    attrs: [
      {
        id: "",
        question: "First Name",
        type: "text",
        key: "firstName",
        required: true,
      },
      {
        id: "",
        question: "Last Name",
        type: "text",
        key: "lastName",
        required: true,
      },
      {
        id: "",
        question: "Email",
        type: "text",
        key: "email",
        additionalValidation: {
          isEmail: {
            isEmail: true,
          },
        },
        required: true,
      },
      {
        id: "",
        question: "School Email (Optional)",
        type: "text",
        key: "schoolEmail",
        additionalValidation: {
          isEmail: {
            isEmail: true,
            allowSubdomains: true,
            allowTLDs: ["edu"],
          }
        },
      },
      {
        id: "",
        question: "Birthday",
        type: "date",
        key: "birthday",
        required: true,
      },
      {
        id: "",
        question: "Password",
        type: "text",
        key: "password",
        additionalOptions: {
          isPassword: true,
        },
        required: true,
      },
    ],
  };

  const handleSubmit = (formData: Record<string, any>) => {
    const formattedData = {
      ...formData,
      birthday: formData.birthday ? formatDate(formData.birthday) : "",
    };

    AuthService.register(formattedData as User)
      .then(() => {
        eventEmitter.emit("success", "Successfully registered, please log in!");
        router.push("/login");
      })
      .catch((err) => {
        if (err.response) {
          eventEmitter.emit("apiError", err.response.data.error);
        }
      });
  };

  const formatDate = (dateString: string): string => {
    // Get the UTC month day year from the date string, it's passed in as a Date() string
    const date = new Date(dateString);
    const utcMonth = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const utcDay = date.getUTCDate().toString().padStart(2, "0");
    const utcYear = date.getUTCFullYear();
    return `${utcMonth}/${utcDay}/${utcYear}`;
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Head>
        <title>Register</title>
      </Head>

      <div className="w-full max-w-md">
        <FormBuilder
          formStructure={registrationFormStructure}
          submissionFunction={handleSubmit}
          buttonText="Register"
        />
        <Link href="/login">
          <div className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cursor-pointer">
            Already have an account? Sign In
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RegistrationPage;
