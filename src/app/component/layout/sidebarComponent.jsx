const SidebarComp = (props) => {
  const { handleRoute, roleAdmin, url, menuName, icon, route } = props;

  return (
    <>
      <button
        onClick={handleRoute}
        className={`${roleAdmin} ${
          url == route ? "bg-yellow-700 text-white" : "bg-gray-100"
        } flex items-center gap-2 body-text-sm-normal lg:body-text-lg-normal font-poppins lg:w-[195px] w-[150px] h-[44px] lg:h-[56px] rounded-lg px-4 py-3 cursor-pointer  hover:bg-yellow-700 hover:text-white hover:shadow-md transition duration-300`}
      >
        <div className="mb-1">{icon}</div>
        {menuName}
      </button>
    </>
  );
};

export default SidebarComp;
