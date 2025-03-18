const Input = (props) => {
  const {
    inputClassName,
    parentClassName,
    errorMessage,
    isError,
    leftIcon,
    rightIcon,
    readOnly,
    disabled,
    htmlFor,
    label,
    leftIconClassName,
    onLeftIconCLick,
    rightIconClassName,
    onRightIconCLick,
    inputBorder,
    ...rest
  } = props;

  return (
    <>
      <div className="w-full font-nunito body-text-sm-medium">
        {label && (
          <label className="block mb-1" htmlFor={htmlFor}>
            <span className="block font-medium ">{label}</span>
          </label>
        )}
        <div
          className={`outline outline-1 focus-within:outline-1 ${inputBorder}  ${
            !isError ? "outline-gray-300" : "outline-red-500"
          } rounded-[8px] focus-within:outline-primary-500  flex items-center  `}
        >
          {leftIcon && (
            <div
              className={`pl-[16px] ${leftIconClassName}`}
              onClick={onLeftIconCLick}
            >
              {leftIcon}
            </div>
          )}
          <input
            className={`w-full rounded-[8px] p-2 focus:outline-none ${inputClassName} ${
              readOnly || disabled
                ? "bg-neutral-50 text-neutral-500 pointer-events-none"
                : ""
            }`}
            readOnly={readOnly}
            disabled={disabled}
            {...rest}
          />
          {rightIcon && (
            <div
              className={`pr-[16px] ${rightIconClassName}`}
              onClick={onRightIconCLick}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {isError && errorMessage && (
          <div className="h-6 ">
            <span className="text-sm text-red-400 ">{errorMessage}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Input;
