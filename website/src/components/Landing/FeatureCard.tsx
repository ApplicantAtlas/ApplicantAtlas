import React from 'react';

type FeatureCardProps = {
  title: string;
  description: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => {
  return (
    <div className="card shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-300">
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
