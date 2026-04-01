import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PropTypes from 'prop-types';

function CustomEditor({ value, onChange }) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value || ''}
      config={{
        toolbar: [
          'heading',
          '|',
          'bold',
          'italic',
          'link',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'blockQuote',
          'insertTable',
          '|',
          'undo',
          'redo',
        ],
      }}
      onChange={(_, editor) => {
        onChange?.(editor.getData());
      }}
    />
  );
}

CustomEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default CustomEditor;
