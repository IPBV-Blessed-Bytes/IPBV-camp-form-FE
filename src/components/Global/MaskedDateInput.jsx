import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';
import { InputMask } from '@react-input/mask';

import { DATE_MASK } from '@/utils/masks';

const MaskedDateInput = forwardRef(function MaskedDateInput(props, ref) {
  return <InputMask component={Form.Control} {...DATE_MASK} showMask {...props} ref={ref} />;
});

export default MaskedDateInput;
