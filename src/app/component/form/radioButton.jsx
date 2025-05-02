const RadioButton = (props) => {
  const {
    selected,
    handleChange,
    item,
    description,
    parentClassName,
    name,
    value,
  } = props;

  return (
    <div className={`font-nunito body-text-sm-medium mr-3 ${parentClassName}`}>
      <label className="flex gap-1">
        <input
          type="radio"
          name={name}
          value={value}
          className="cursor-pointer w-4 h-4 accent-yellow-700"
          checked={selected === item}
          onChange={handleChange}
        />
        {description}
      </label>
    </div>
  );
};

export default RadioButton;
