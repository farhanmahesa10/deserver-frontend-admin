const HanldeRemove = (props) => {
  const { handleRemove, setShowConfirmModal, text, confirmation } = props;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4 ">confirmation</h2>
          <p className="mb-4">
            {confirmation
              ? confirmation
              : "Are you sure you want to delete this data?"}{" "}
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={setShowConfirmModal}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {text ? text : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HanldeRemove;
