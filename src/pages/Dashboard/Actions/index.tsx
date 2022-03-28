import * as React from 'react';

import {
  transactionServices,
  useGetAccountInfo,
  useGetPendingTransactions,
  refreshAccount,
  useGetNetworkConfig
} from '@elrondnetwork/dapp-core';
import {
  Address,
  AddressValue,
  ContractFunction,
  ProxyProvider,
  BytesValue,
  Query,
  TransactionPayload,
  GasLimit,
  NetworkConfig
} from '@elrondnetwork/erdjs';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { contractAddress } from 'config';

const Actions = () => {
  const account = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const { address } = account;
  const gasLimitMultiplier = 35;

  const [hasVin, setHasVin] = React.useState<boolean>();
  const [hasMeasureUnit, setHasMeasureUnit] = React.useState<boolean>();
  const /*transactionSessionId*/ [, setTransactionSessionId] = React.useState<
      string | null
    >(null);

  const [inputText, setInputText] = React.useState<string>();
  function handleChange(event: any) {
    setInputText(event.target.value);
    console.log(inputText);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const query_Vin = new Query({
      address: new Address(contractAddress),
      func: new ContractFunction('getVIN'),
      args: [new AddressValue(new Address(address))]
    });
    const proxy_Vin = new ProxyProvider(network.apiAddress);
    proxy_Vin
      .queryContract(query_Vin)
      .then(({ returnData }) => {
        const [encoded] = returnData;
        console.log(encoded);
        switch (encoded) {
          case undefined:
            setHasVin(false);
            break;
          case '':
            setHasVin(false);
            break;
          default: {
            setHasVin(true);
            break;
          }
        }
      })
      .catch((err) => {
        console.error('Unable to call VM query', err);
      });
    const query_measureUnit = new Query({
      address: new Address(contractAddress),
      func: new ContractFunction('getMeasureUnit'),
      args: [new AddressValue(new Address(address))]
    });
    const proxy_mesureUnit = new ProxyProvider(network.apiAddress);
    proxy_mesureUnit
      .queryContract(query_measureUnit)
      .then(({ returnData }) => {
        const [encoded] = returnData;
        console.log(encoded);
        switch (encoded) {
          case undefined:
            setHasMeasureUnit(false);
            break;
          case '':
            setHasMeasureUnit(false);
            break;
          default: {
            setHasMeasureUnit(true);
            break;
          }
        }
      })
      .catch((err) => {
        console.error('Unable to call VM query', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPendingTransactions]);

  const { sendTransactions } = transactionServices;

  const sendMileageTransaction = async () => {
    let hex = Number(inputText).toString(16);
    if (hex.length % 2 == 1) {
      hex = String('0' + hex);
    }
    const MileageTransactionPayload = TransactionPayload.contractCall()
      .setFunction(new ContractFunction('addMileage'))
      .setArgs([BytesValue.fromHex(hex)])
      .build();
    const estimatedGasLimit = new GasLimit(
      (new NetworkConfig().MinGasLimit.valueOf() +
        GasLimit.forTransfer(MileageTransactionPayload).valueOf()) *
        new GasLimit(gasLimitMultiplier).valueOf()
    );
    const mileageTransaction = {
      value: '0',
      data: new String('addMileage@' + hex),
      gasLimit: estimatedGasLimit,
      receiver: contractAddress
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: mileageTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Mileage transaction',
        errorMessage: 'An error has occured during addMileage',
        successMessage: 'Mileage transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const sendVinTransaction = async () => {
    const vinTransactionPayload = TransactionPayload.contractCall()
      .setFunction(new ContractFunction('addVIN'))
      .setArgs([BytesValue.fromUTF8(String(inputText))])
      .build();
    const estimatedGasLimit = new GasLimit(
      (new NetworkConfig().MinGasLimit.valueOf() +
        GasLimit.forTransfer(vinTransactionPayload).valueOf()) *
        new GasLimit(gasLimitMultiplier).valueOf()
    );
    const vinTransaction = {
      value: '0',
      data: new String(vinTransactionPayload),
      gasLimit: estimatedGasLimit,
      receiver: contractAddress
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: vinTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Vin transaction',
        errorMessage: 'An error has occured during Vin',
        successMessage: 'Vin transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const sendMeasureUnitTransaction = async () => {
    const measureUnitTransactionPayload = TransactionPayload.contractCall()
      .setFunction(new ContractFunction('addMeasureUnit'))
      .setArgs([BytesValue.fromUTF8(String(inputText))])
      .build();
    const estimatedGasLimit = new GasLimit(
      (new NetworkConfig().MinGasLimit.valueOf() +
        GasLimit.forTransfer(measureUnitTransactionPayload).valueOf()) *
        new GasLimit(gasLimitMultiplier).valueOf()
    );
    const measureUnitTransaction = {
      value: '0',
      data: new String(measureUnitTransactionPayload),
      gasLimit: estimatedGasLimit,
      receiver: contractAddress
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: measureUnitTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing MeasureUnit transaction',
        errorMessage: 'An error has occured during MeasureUnit',
        successMessage: 'MeasureUnit transaction successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  return (
    <div className='d-flex mt-4 justify-content-center'>
      {hasVin && hasMeasureUnit && !hasPendingTransactions ? (
        <div className='action-btn' onClick={sendMileageTransaction}>
          <button className='btn'>
            <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
          </button>
          <a href='/' className='text-white text-decoration-none'>
            addMileage
          </a>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column'>
            <div
              {...{
                className: 'action-btn not-allowed disabled'
              }}
            ></div>
          </div>
        </>
      )}
      {!hasVin && !hasPendingTransactions ? (
        <div className='d-flex flex-column'>
          <div className='action-btn' onClick={sendVinTransaction}>
            <button className='btn'>
              <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
            </button>
            <span className='text-white'>
              <a href='/' className='text-white text-decoration-none'>
                Add VIN
              </a>
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column'>
            <div
              {...{
                className: 'action-btn disabled'
              }}
            ></div>
          </div>
        </>
      )}
      {!hasMeasureUnit && !hasPendingTransactions ? (
        <div className='d-flex flex-column'>
          <div className='action-btn' onClick={sendMeasureUnitTransaction}>
            <button className='btn'>
              <FontAwesomeIcon icon={faArrowUp} className='text-primary' />
            </button>
            <span className='text-white'>
              <a href='/' className='text-white text-decoration-none'>
                Add Measure Unit
              </a>
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className='d-flex flex-column'>
            <div
              {...{
                className: 'action-btn disabled'
              }}
            ></div>
          </div>
        </>
      )}
      <div>
        <input onChange={handleChange}></input>
      </div>
    </div>
  );
};

export default Actions;
