import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import AuthService from "@/services/AuthService";
import { User } from "@/types/models/User";
import { eventEmitter } from "@/events/EventEmitter";
import { useRouter } from "next/router";
import FormBuilder from "@/components/FormBuilder/FormBuilder";
import { FormStructure } from "@/types/models/FormBuilder";

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
        question: "First Name",
        type: "text",
        key: "firstName",
        required: true,
      },
      {
        question: "Last Name",
        type: "text",
        key: "lastName",
        required: true,
      },
      {
        question: "Email",
        type: "text",
        key: "email",
        additionalValidation: { isEmail: true },
        required: true,
      },
      {
        question: "School Email (Optional)",
        type: "text",
        key: "schoolEmail",
        additionalValidation: { isEduEmail: true },
      },
      {
        question: "Birthday",
        type: "date",
        key: "birthday",
        required: true,
      },
      {
        question: "Password",
        type: "text",
        key: "password",
        additionalValidation: { isPassword: true },
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
    const utcMonth = date.getUTCMonth() + 1;
    const utcDay = date.getUTCDate();
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
