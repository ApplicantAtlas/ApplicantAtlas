import React, { useEffect, useState } from "react";
import CountryRegionData from "@../../../node_modules/country-region-data/data.json";
import Text from "./Text";
import { FieldValue, FormField } from "@/types/models/FormBuilder";
import { Address } from "@/types/models/Event";
import dynamic from "next/dynamic";

const SelectDynamic = dynamic(() => import("./Select"), {
  ssr: false,
});

type AddressProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: Address;
};

const Address: React.FC<AddressProps> = ({ field, onChange, defaultValue }) => {
  const [country, setCountry] = useState(defaultValue?.country || "");
  const [region, setRegion] = useState(defaultValue?.region || "");
  const [streetAddress, setStreetAddress] = useState(
    defaultValue?.streetAddress || ""
  );
  const [city, setCity] = useState(defaultValue?.city || "");
  const [zipCode, setZipCode] = useState(defaultValue?.zipCode || "");

  var formAddress = (): Address => {
    var address: Address = {
      country,
      region,
      streetAddress,
      city,
      zipCode,
    };
    return address;
  };

  useEffect(() => {
    onChange(field.key, formAddress());
  }, [defaultValue]);

  const handleInputChange = (key: string, value: FieldValue) => {
    switch (key) {
      case "streetAddress":
        setStreetAddress(value as string);
        break;
      case "city":
        setCity(value as string);
        break;
      case "zipCode":
        setZipCode(value as string);
        break;
      case "country":
        setCountry(value as string);
        break;
      case "region":
        setRegion(value as string);
        break;
      default:
        break;
    }
    onChange(field.key, formAddress());
  };

  return (
    <div className="space-y-4">
      <Text
        field={{
          question: "Street Address",
          key: "streetAddress",
          type: "text",
          required: field.required,
          defaultValue: streetAddress,
        }}
        defaultValue={streetAddress}
        onChange={handleInputChange}
      />
      <Text
        field={{
          question: "City",
          key: "city",
          type: "text",
          required: field.required,
          defaultValue: city,
        }}
        defaultValue={city}
        onChange={handleInputChange}
      />
      <div className="form-control w-full">
        <SelectDynamic
          field={{
            question: "Country",
            key: "country",
            type: "select",
            required: field.required,
            options: CountryRegionData.map((country) => country.countryName),
            defaultOptions: [country],
          }}
          defaultOptions={[country]}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-control w-full">
        <SelectDynamic
          key={country} // force re-render when country changes
          field={{
            question: "Region",
            key: "region",
            type: "select",
            required: field.required,
            options: CountryRegionData.find(
              (country_i) => country_i.countryName === country
            )?.regions.map((region) => region.name),
            defaultOptions: [region],
          }}
          defaultOptions={[region]}
          onChange={handleInputChange}
        />
      </div>
      <Text
        field={{
          question: "Zip Code",
          key: "zipCode",
          type: "text",
          required: field.required,
          defaultValue: zipCode,
        }}
        defaultValue={zipCode}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Address;
