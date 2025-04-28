import { IconSkeleton, SearchSkeleton } from "../skeleton/adminSkeleton";
import { useRouter } from "nextjs-toploader/app";

const InputSearch = (props) => {
  const router = useRouter();
  const {
    inputClassName,
    rightButton,
    rightButtonClassName,
    onRightButtonCLick,
    createData,
    linkCreate,
    role,
    inputLeft,
    typeLeft,
    placeholderLeft,
    idLeft,
    valueLeft,
    onchangeLeft,
    isLoading,
    ...rest
  } = props;

  return (
    <div
      className={`flex flex-wrap justify-between items-center lg:w-full gap-4 md:gap-6 w-full mb-6`}
    >
      <div className="flex flex-wrap gap-4">
        {inputLeft &&
          (isLoading ? (
            <SearchSkeleton />
          ) : (
            <div className="flex gap-3 items-center">
              <input
                type={typeLeft}
                placeholder={placeholderLeft}
                id={idLeft}
                value={valueLeft}
                onChange={onchangeLeft}
                className={`${
                  role === "admin" ? "block" : "hidden"
                } px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] w-[190px] md:w-[300px] text-gray-700 body-text-sm md:body-text-base font-poppins border border-gray-300 focus:outline-primary50 rounded-md shadow-sm`}
              />
            </div>
          ))}

        <div
          className={`${
            role == "admin" ? "flex" : "hidden"
          }  gap-3 items-center`}
        >
          {isLoading ? (
            <SearchSkeleton />
          ) : (
            <input
              className=" px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] w-[190px] md:w-[300px] text-gray-700 body-text-sm md:body-text-base font-poppins border border-gray-300 focus:outline-primary50 rounded-md shadow-sm"
              {...rest}
            />
          )}

          {rightButton &&
            (isLoading ? (
              <IconSkeleton />
            ) : (
              <button
                onClick={onRightButtonCLick}
                className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px] text-white bg-yellow-700 text-xl font-nunitoSans rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300"
              >
                {rightButton}
              </button>
            ))}
        </div>
      </div>

      {createData &&
        (isLoading ? (
          <IconSkeleton />
        ) : (
          <button
            className={` bg-yellow-700 text-white body-text-sm-bold font-nunitoSans px-4 py-2 md:px-5 md:py-3 rounded-md shadow-md hover:bg-yellow-700 transition-all duration-300`}
            onClick={() => router.push(linkCreate)}
          >
            {createData}
          </button>
        ))}
    </div>
  );
};

export default InputSearch;
