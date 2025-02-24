import classNames from "classnames";
import { React, Fragment, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import Swal from "sweetalert2";

function converterApp() {
  const [selectedOne, setSelectedOne] = useState([]);
  const [selectedTwo, setSelectedTwo] = useState([]);
  const [allList, setAllList] = useState([]);
  const [amountPay, setAmountPay] = useState("");
  const [amountReceive, setAmountReceive] = useState("");

  useEffect(() => {
    mapCurrencyData();
  }, []);

  async function getCurrencyData() {
    try {
      const response = await axios.get(
        "https://interview.switcheo.com/prices.json",
        {}
      );
      const currencies = await response.data;
      return currencies;
    } catch (err) {
      console.log(`Unable to fetch curriencies: ${err}`);
    }
  }

  function processData(currencyData) {
    const seenCurrencies = new Set();
    const currencyDataRemoveDuplicate = [];

    //Store unique currencyData to currencyDataRemoveDuplicate (Remove Duplicates)
    currencyData.forEach((item) => {
      if (!seenCurrencies.has(item.currency)) {
        seenCurrencies.add(item.currency);
        currencyDataRemoveDuplicate.push(item);
      }
    });

    // Filter out price that are undefined
    const currencyDataRemoveDuplicateWithPrices =
      currencyDataRemoveDuplicate.filter((item) => item.price !== undefined);

    // Add image link and index number
    const currencyDataRemoveDuplicateWithPricesAddLogo =
      currencyDataRemoveDuplicateWithPrices.map((item, index) => {
        (item.id = index + 1),
          (item.avatar = `https://raw.githubusercontent.com/Switcheo/token-icons/65c7313a57660dbd3244d8a4d090e0af647e6532/tokens/${item.currency}.svg?raw=true`);
        return item;
      });

    return currencyDataRemoveDuplicateWithPricesAddLogo;
  }

  async function mapCurrencyData() {
    const currencyData = await getCurrencyData();

    const filteredCurrencyData = processData(currencyData);

    // Set Default Value to the Selectors using first and second item
    setSelectedOne(filteredCurrencyData[0]);
    setSelectedTwo(filteredCurrencyData[1]);
    setAllList(filteredCurrencyData);
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {

      Swal.fire({
        title: "Are you sure you want to convert the currencies?",
        text:
          amountPay +
          " " +
          selectedOne.currency +
          " to " +
          amountReceive +
          " " +
          selectedTwo.currency,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, convert it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#0275d8",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Success",
            text: "You have successfully converted your currencies!",
            icon: "success",
            confirmButtonColor: "#0275d8",
          });
        }
      });
    } catch (err) {
      console.log(`Unable to fetch curriencies: ${err}`);
    }
  }

  function swapConversion() {
    setSelectedOne(selectedTwo);
    setSelectedTwo(selectedOne);
    amountPay != ""
      ? setAmountReceive(
          swapPriceAmount(amountPay, selectedTwo.price, selectedOne.price)
        )
      : setAmountReceive("");
  }

  function naiveRound(num, decimalPlaces = 0) {
      var p = Math.pow(10, decimalPlaces);
      return Math.round(num * p) / p;
  }

  function swapPriceAmount(amount, currPrice1, currPrice2) {
    return naiveRound((amount / currPrice1) * currPrice2, 4);
  }

  function conversationRate(curr1, curr2, currPrice1, currPrice2) {
    return "1 " + curr1 + " = " + naiveRound((1 / currPrice1) * currPrice2, 4) + " " + curr2;
  }

  function currentRate(curr) {
    return "1 " + curr.currency + " = $" + naiveRound(curr.price, 4);
  }

  return (
    <section className="border border-indigo-500/50 rounded-3xl pt-6 bg-white pb-6 px-6 shadow-2xl shadow-cyan-500/50">
      <h1 className="text-black text-2xl mb-10 font-semibold">
        Swap Currencies
      </h1>
      <form onSubmit={onSubmit}>

        <div className="">
          {/* Currency to swap */}
          <div className="p-4 bg-indigo-600 bg-opacity-25 rounded-2xl">
            <div className="mb-4">
              <Listbox
                value={selectedOne}
                onChange={(e) => {
                  setSelectedOne(e);

                  amountPay != ""
                    ? setAmountReceive(
                        swapPriceAmount(amountPay, e.price, selectedTwo.price)
                      )
                    : setAmountReceive("");
                }}
              >
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                      From
                    </Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                        <span className="flex items-center">
                          <img
                            src={selectedOne.avatar}
                            alt=""
                            className="h-5 w-5 flex-shrink-0 rounded-full"
                          />
                          <span className="ml-3 block truncate">
                            {selectedOne.currency}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {allList.map((item) => (
                            <Listbox.Option
                              key={item.id}
                              className={({ active }) =>
                                classNames(
                                  active
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-900",
                                  "relative cursor-default select-none py-2 pl-3 pr-9"
                                )
                              }
                              value={item}
                            >
                              {({ selectedOne, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <img
                                      src={item.avatar}
                                      alt=""
                                      className="h-5 w-5 flex-shrink-0 rounded-full"
                                    />
                                    <span
                                      className={classNames(
                                        selectedOne
                                          ? "font-semibold"
                                          : "font-normal",
                                        "ml-3 block truncate"
                                      )}
                                    >
                                      {item.currency}
                                    </span>
                                  </div>

                                  {selectedOne ? (
                                    <span
                                      className={classNames(
                                        active ? "text-white" : "text-indigo-600",
                                        "absolute inset-y-0 right-0 flex items-center pr-4"
                                      )}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>
            

            <div className="mx-auto mb-4">
              <div className="flex">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="amountPay"
                >
                  Amount to send
                </label>
                
              </div>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                id="amountPay"
                type="Number"
                value={amountPay}
                onChange={(e) => {
                  setAmountPay(e.target.value);
                  e.target.value != ""
                    ? setAmountReceive(
                        swapPriceAmount(
                          e.target.value,
                          selectedOne.price,
                          selectedTwo.price
                        )
                      )
                    : setAmountReceive("");
                }}
                placeholder="Enter Amount"
              />
            </div>
          </div>

          {/* swap conversion */}
          <div className="flex flex-row gap-9 items-center my-2">
            <div
              onClick={() => swapConversion()}
              className="border-4 border-blue-100 rounded-full p-4 mx-auto cursor-pointer hover:border-blue-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 17"
                aria-hidden="true"
                className="w-4 h-4 text-blue-500 miscellany___StyledIconSwap-sc-1r08bla-1 fZJuOo"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>

          {/* Currency to received */}
          <div className="p-4 bg-indigo-600 bg-opacity-25 mb-4 rounded-2xl">
            <div className="mb-4">
              <Listbox
                value={selectedTwo}
                onChange={(e) => {
                  setSelectedTwo(e);
                  amountPay != ""
                    ? setAmountReceive(
                        swapPriceAmount(amountPay, selectedOne.price, e.price)
                      )
                    : setAmountReceive("");
                }}
              >
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                      To
                    </Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                        <span className="flex items-center">
                          <img
                            src={selectedTwo.avatar}
                            alt=""
                            className="h-5 w-5 flex-shrink-0 rounded-full"
                          />
                          <span className="ml-3 block truncate">
                            {selectedTwo.currency}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {allList.map((item) => (
                            <Listbox.Option
                              key={item.id}
                              className={({ active }) =>
                                classNames(
                                  active
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-900",
                                  "relative cursor-default select-none py-2 pl-3 pr-9"
                                )
                              }
                              value={item}
                            >
                              {({ selectedTwo, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <img
                                      src={item.avatar}
                                      alt=""
                                      className="h-5 w-5 flex-shrink-0 rounded-full"
                                    />
                                    <span
                                      className={classNames(
                                        selectedTwo
                                          ? "font-semibold"
                                          : "font-normal",
                                        "ml-3 block truncate"
                                      )}
                                    >
                                      {item.currency}
                                    </span>
                                  </div>

                                  {selectedTwo ? (
                                    <span
                                      className={classNames(
                                        active ? "text-white" : "text-indigo-600",
                                        "absolute inset-y-0 right-0 flex items-center pr-4"
                                      )}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>
            
            <div className="mx-auto mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="amountReceive"
              >
                Amount to receive
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                id="amountReceive"
                type="Number"
                value={amountReceive}
                onChange={(e) => setAmountReceive(e.target.value)}
                placeholder="What you will receive"
                disabled
              />
            </div>
          </div>

        </div>
        

        {amountPay && selectedOne && selectedTwo ? (
          <div>
            <h1 className="font-bold">Current Rates:</h1>
            <h1>{currentRate(selectedOne)}</h1>
            <h1>{currentRate(selectedTwo)}</h1>

            <h1 className="font-bold mt-3">Reference Price:</h1>
            <h1>
              {conversationRate(
                selectedOne.currency,
                selectedTwo.currency,
                selectedOne.price,
                selectedTwo.price
              )}
            </h1>
          </div>
        ) : null}

        <div className="text-right">
          <button
            className={
              !amountPay
                ? "no-amount disabled cursor-not-allowed inline-flex justify-center py-3 px-5 border border-transparent shadow-sm text-md font-bold rounded-md text-white bg-gray-300"
                : "inline-flex justify-center py-3 px-5 border border-transparent shadow-sm text-md font-bold rounded-md text-white bg-blue-500 hover:bg-blue-600"
            }
            disabled={!amountPay}
          >
            CONFIRM SWAP
          </button>

          {!amountPay ? (
            <Tooltip anchorSelect=".no-amount" place="top">
              Please enter an amount you would like to convert
            </Tooltip>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export default converterApp;
