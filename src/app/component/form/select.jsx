const Select = (props) => {
  const {
    options,
    selectClassName,
    parentClassName,
    errorMessage,
    isError,
    readOnly,
    disabled,
    htmlFor,
    label,
    slug,
    outlet,
    placeholder,
    ...rest
  } = props;

  return (
    <div
      className={`w-full font-nunito body-text-sm-medium ${parentClassName}`}
    >
      {label && (
        <label className="block" htmlFor={htmlFor}>
          <span className="block font-medium">{label}</span>
        </label>
      )}
      <div
        className={`outline outline-1 focus-within:outline-1 ${
          !isError ? "outline-gray-300" : "outline-red-500"
        } rounded-[8px] focus-within:outline-primary-500 flex items-center`}
      >
        <select
          className={`w-full rounded-[8px] p-2 focus:outline-none ${selectClassName} ${
            (readOnly || disabled) && "bg-neutral-50 text-neutral-500"
          }`}
          disabled={disabled}
          {...rest}
        >
          <option value="" className="bg-primary50" disabled>
            {placeholder}
          </option>
          {options}
        </select>
      </div>

      {isError && errorMessage && (
        <div className="h-6">
          <span className="text-sm text-red-400">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Select;
