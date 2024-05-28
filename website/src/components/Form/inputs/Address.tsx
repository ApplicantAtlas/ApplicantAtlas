import React, { useEffect, useState } from 'react';
import CountryRegionData from '@../../../node_modules/country-region-data/data.json';
import dynamic from 'next/dynamic';

import { FieldValue, FormField } from '@/types/models/Form';
import { Address } from '@/types/models/Event';

import Text from './Text';

const SelectDynamic = dynamic(() => import('./Select'), {
  ssr: false,
});

type AddressProps = {
  field: FormField;
  onChange: (key: string, value: FieldValue) => void;
  defaultValue?: Address;
};

const Address: React.FC<AddressProps> = ({ field, onChange, defaultValue }) => {
  const [country, setCountry] = useState(defaultValue?.country || '');
  const [region, setRegion] = useState(defaultValue?.region || '');
  const [streetAddress, setStreetAddress] = useState(
    defaultValue?.streetAddress || '',
  );
  const [city, setCity] = useState(defaultValue?.city || '');
  const [zipCode, setZipCode] = useState(defaultValue?.zipCode || '');

  const formAddress = (): Address => {
    const address: Address = {
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
      case field.key + '_streetAddress':
        setStreetAddress(value as string);
        break;
      case field.key + '_city':
        setCity(value as string);
        break;
      case field.key + '_zipCode':
        setZipCode(value as string);
        break;
      case field.key + '_country':
        setCountry(value as string);
        break;
      case field.key + '_region':
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
          question: 'Street Address',
          key: field.key + '_streetAddress',
          type: 'text',
          required: field.required,
          defaultValue: streetAddress,
        }}
        defaultValue={streetAddress}
        onChange={handleInputChange}
      />
      <Text
        field={{
          key: field.key + '_city',
          question: 'City',
          type: 'text',
          required: field.required,
          defaultValue: city,
        }}
        defaultValue={city}
        onChange={handleInputChange}
      />
      <div className="form-control w-full">
        <SelectDynamic
          field={{
            key: field.key + '_country',
            question: 'Country',
            type: 'select',
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
            key: field.key + '_region',
            question: 'Region',
            type: 'select',
            required: field.required,
            options: CountryRegionData.find(
              (country_i) => country_i.countryName === country,
            )?.regions.map((region) => region.name),
            defaultOptions: [region],
          }}
          defaultOptions={[region]}
          onChange={handleInputChange}
        />
      </div>
      <Text
        field={{
          key: field.key + '_zipCode',
          question: 'Zip Code',
          type: 'text',
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
