import instance from "./api";

export const fetchPaginatedData = async ({
  endpoint,
  params,
  isSearchMode = false,
  currentPage,
  setCurrentPage,
  setData,
  setTotalItems,
  setIsLoading,
  onError,
}) => {
  setIsLoading(true);

  const pageToFetch = isSearchMode ? 1 : currentPage;
  if (isSearchMode) {
    setCurrentPage(1);
  }

  try {
    const response = await instance.get(endpoint, {
      params: { ...params, page: pageToFetch },
    });
    const data = response.data.data;
    const pagination = response.data.pagination;

    if (
      !isSearchMode &&
      pagination.totalPages > 0 &&
      pageToFetch > pagination.totalPages
    ) {
      setCurrentPage(pagination.totalPages); // akan trigger ulang jika pakai useEffect
      return;
    }

    setData(data);
    setTotalItems(pagination.totalItems);
  } catch (error) {
    console.error(error);
    if (onError) onError(error);
  } finally {
    setIsLoading(false);
  }
};
