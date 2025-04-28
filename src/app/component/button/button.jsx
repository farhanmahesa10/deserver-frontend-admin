const ButtonCreateUpdate = (props) => {
  const { loadingButton, handleCancel } = props;
  return (
    <div className="flex gap-8 text-white justify-end">
      <button
        type={loadingButton ? "button" : "submit"}
        className={`${
          loadingButton ? "bg-gray-400" : "bg-primary50 border-primary50"
        }  body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md`}
      >
        {loadingButton ? "Loading..." : "Submit"}
      </button>
      <button
        type="button"
        className="bg-red-500 border-red-5bg-red-500 body-text-sm-bold font-nunitoSans w-[100px] p-2 rounded-md"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </div>
  );
};

export default ButtonCreateUpdate;
