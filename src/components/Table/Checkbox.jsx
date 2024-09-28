import { useEffect, forwardRef, useRef } from 'react';

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="checkbox" readOnly ref={resolvedRef} {...rest} />;
});

export default IndeterminateCheckbox;
