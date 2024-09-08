import React, { memo } from 'react';

const AnnotationStatus = memo(({ isAnnotated }: { isAnnotated: boolean }) => (
  <p className={`status ${isAnnotated ? 'annotated' : 'not-annotated'}`}>
    Status: {isAnnotated ? 'Annotated' : 'Not annotated / Not applicable'}
  </p>
));

export default AnnotationStatus;