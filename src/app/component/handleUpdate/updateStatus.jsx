const HanldeUpdateStatus = (props) => {
  const { handleUpdate, setShowConfirmModalUpdate, text, confirmation } = props;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4 ">confirmation</h2>
          <p className="mb-4">
            {confirmation
              ? confirmation
              : `Are you sure you want to ${text} this data?`}
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={setShowConfirmModalUpdate}
              className="px-4 py-2 bg-red-400 rounded hover:bg-red-500"
            >
              No
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-300 rounded hover:bg-blue-400"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HanldeUpdateStatus;
