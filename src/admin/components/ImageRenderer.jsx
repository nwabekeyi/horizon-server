// src/admin/components/ImageRenderer.jsx
import React, { useState } from 'react';

const ImageRenderer = (props) => {
  const { record, property } = props;
  const imageUrl = record.params[property.name];
  const [error, setError] = useState(null);

  const handleError = () => {
    setError('Failed to load image. It may be blocked by security policies or invalid.');
  };

  if (!imageUrl) {
    return <span>No image available</span>;
  }

  return (
    <div>
      {error ? (
        <span style={{ color: 'red' }}>{error}</span>
      ) : (
        <img
          src={imageUrl}
          alt="Proof"
          style={{ maxWidth: '200px' }}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ImageRenderer;