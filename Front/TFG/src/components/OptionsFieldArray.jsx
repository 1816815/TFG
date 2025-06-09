import { useFieldArray, Controller } from 'react-hook-form';


/**
 * Component that renders a list of text inputs to add options to a question.
 * Each option is rendered as a text input with a delete button.
 * The component also renders an "Add option" button to add a new option.
 *
 * @param {Object} control - The control object from react-hook-form's useForm.
 * @param {number} nestIndex - The index of the question in the form.
 * @return {JSX.Element} The rendered component.
 */

const OptionsFieldArray = ({ control, nestIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${nestIndex}.options`
  });

  return (
    <div>
      <h6>Opciones</h6>
      {fields.map((option, idx) => (
        <div key={option.id} className="d-flex mb-2">
          <Controller name={`questions.${nestIndex}.options.${idx}.content`} control={control} render={({ field }) => <input {...field} className="form-control me-2" />} />
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(idx)}>X</button>
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => append({ content: '' })}>Agregar opción</button>
    </div>
  );
};

export default OptionsFieldArray;