import React from "react";
import AcceptOrder from "../button/acceptOrder";
import { FormatIdr } from "../utils/formatIdr";

const OrderPraActive = (props) => {
  const {
    orders = [],
    closeModalOrder,
    fetchDataPaginated,
    confirmUpdate,
  } = props;
  return (
    <>
      {orders &&
        orders
          .slice()
          .reverse()
          .map((item) => {
            console.log("ppppp");

            return (
              <div key={item.id} className="flex items-center w-full sm:w-auto">
                <div className="flex flex-col justify-between bg-white shadow-md rounded-lg p-3 w-[222px] border border-gray-300 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col gap-1 flex-grow">
                    <h2 className="text-xl font-bold text-gray-800 text-center">
                      {item.outlet_name}
                    </h2>

                    <div className="flex flex-col text-gray-700 text-sm">
                      <p>
                        <span className="font-semibold">Customer:</span>{" "}
                        {item.by_name}
                      </p>
                      <p>
                        <span className="font-semibold">Table Number:</span>{" "}
                        {item.Table.number_table}
                      </p>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-2 mt-1 max-h-[150px] overflow-y-auto custom-scrollbar-ramping">
                      <p className="font-semibold text-sm text-gray-800 mb-1">
                        Order:
                      </p>
                      {item.orderData.map((order) => (
                        <div key={order.title} className="mb-1">
                          <div className="flex justify-between text-sm">
                            <p>{order.title}</p>
                            <p>{FormatIdr(order.total_price)}</p>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.qty} x {FormatIdr(order.price)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between font-bold text-sm mt-2">
                      <p>Total</p>
                      <p>{FormatIdr(item.total_pay)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <AcceptOrder
                      createdAt={item.createdAt}
                      status={item.status}
                      handleAccept={() => {
                        confirmUpdate(item, "active");
                        closeModalOrder(item.id);
                        fetchDataPaginated(true);
                      }}
                    />
                    <button
                      onClick={() => confirmUpdate(item, "failed")}
                      className="bg-red-500 text-white text-sm rounded-lg py-2 w-full hover:bg-red-600 transition-colors duration-300"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
    </>
  );
};

export default OrderPraActive;
