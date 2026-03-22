import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
      onChange={(editor) => {
        onChange?.(editor.getData());
      }}
    />
  );
}

export default CustomEditor;
