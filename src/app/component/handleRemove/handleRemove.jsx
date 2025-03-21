const HanldeRemove = (props) => {
  const { handleRemove, setShowConfirmModal } = props;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-center">Konfirmasi</h2>
          <p className="mb-4">Apakah kamu yakin ingin menghapus data ini?</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={setShowConfirmModal}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HanldeRemove;
