import React, { useEffect, useState } from 'react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import Text from './Text';
import { FieldValue, FormField } from '@/types/models/FormBuilder';
import { Address } from '@/types/models/Event';

type AddressProps = {
    field: FormField;
    onChange: (key: string, value: FieldValue) => void;
    defaultValue?: Address;
};

const Address: React.FC<AddressProps> = ({ field, onChange, defaultValue }) => {
  const [country, setCountry] = useState(defaultValue?.country || '');
  const [region, setRegion] = useState(defaultValue?.region || '');
  const [streetAddress, setStreetAddress] = useState(defaultValue?.streetAddress || '');
  const [city, setCity] = useState(defaultValue?.city || '');
  const [zipCode, setZipCode] = useState(defaultValue?.zipCode || '');

  var formAddress = (): Address => {
    var address: Address = {
      country,
      region,
      streetAddress,
      city,
      zipCode,
    };
    return address;
  }

  useEffect(() => {
    onChange(field.key, formAddress());
  }, [defaultValue])

  const selectCountry = (val: string) => {
    setCountry(val);
    onChange(field.key, formAddress());
  };

  const selectRegion = (val: string) => {
    setRegion(val);
    onChange(field.key, formAddress());
  };

  const handleInputChange = (key: string, value: FieldValue) => {
    switch (key) {
      case 'streetAddress':
        setStreetAddress(value as string);
        break;
      case 'city':
        setCity(value as string);
        break;
      case 'zipCode':
        setZipCode(value as string);
        break;
      default:
        break;
    }
    onChange(field.key, formAddress());
  };

  return (
    <div className="space-y-4">
      <Text
        field={{ question: 'Street Address', key: 'streetAddress', type: 'text', required: field.required }}
        defaultValue={streetAddress}
        onChange={handleInputChange}
      />
      <Text
        field={{ question: 'City', key: 'city', type: 'text', required: field.required }}
        defaultValue={city}
        onChange={handleInputChange}
      />
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Country</span>
        </label>
        <CountryDropdown
          value={country}
          onChange={selectCountry}
          priorityOptions={["US", "CA", "GB"]}
          classes="select select-bordered w-full"
          // @ts-ignore
          required={field.required}
        />
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Region</span>
        </label>
        <RegionDropdown
          country={country}
          value={region}
          onChange={selectRegion}
          classes="select select-bordered w-full"
          disableWhenEmpty={true}
          // @ts-ignore
          required={field.required}
        />
      </div>
      <Text
        field={{ question: 'Zip Code', key: 'zipCode', type: 'text', required: field.required }}
        defaultValue={zipCode}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Address;
